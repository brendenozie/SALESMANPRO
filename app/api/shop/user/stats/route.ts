import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");

    const session = await getServerSession(authOptions());
    const effectiveUserId = queryUserId || session?.user?.id;

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: {
        id: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          body: { orders: 0, points: 0, visits: 0, recentOrders: [] },
          data: { orders: 0, points: 0, visits: 0, recentOrders: [] },
        },
        { status: 200 }
      );
    }

    const orderWhere: any = {
      OR: [
        { consumerId: user.id },
        ...(user.email ? [{ email: user.email }] : []),
        ...(user.phone ? [{ phone: user.phone }] : []),
      ],
    };

    const [orderCount, recentOrdersRaw] = await Promise.all([
      prisma.customerOrder.count({ where: orderWhere }).catch(() => 0),
      prisma.customerOrder
        .findMany({
          where: orderWhere,
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                marketplaceListing: true,
              },
            },
          },
        })
        .catch(() => []),
    ]);

    const recentOrders = recentOrdersRaw.map((ord: any) => {
      const firstItem = ord.items?.[0];
      const itemName =
        firstItem?.marketplaceListing?.title ||
        firstItem?.title ||
        `Order #${ord.id.slice(-6)}`;
      const extraItems = ord.items?.length > 1 ? ` (+${ord.items.length - 1} more)` : "";

      return {
        id: ord.id,
        item: `${itemName}${extraItems}`,
        date: ord.createdAt
          ? new Date(ord.createdAt).toISOString().split("T")[0]
          : "Recent",
        status: ord.status || ord.paymentStatus || "Processing",
      };
    });

    // Dynamic points calculation: 100 base points for signup + 50 points per order
    const points = 100 + orderCount * 50;

    // Estimate visits/engagement based on profile age and activity
    const daysSinceJoin = user.createdAt
      ? Math.max(1, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
      : 1;
    const visits = Math.max(orderCount * 4 + daysSinceJoin, 3);

    const statsData = {
      orders: orderCount,
      points,
      visits,
      recentOrders,
    };

    return NextResponse.json({
      success: true,
      body: statsData,
      data: statsData,
      ...statsData,
    });
  } catch (error: any) {
    console.error("GET /api/shop/user/stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user stats",
        body: { orders: 0, points: 0, visits: 0, recentOrders: [] },
        data: { orders: 0, points: 0, visits: 0, recentOrders: [] },
      },
      { status: 500 }
    );
  }
}
