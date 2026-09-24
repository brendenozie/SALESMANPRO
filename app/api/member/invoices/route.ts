import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    // Fetch customer orders for this user
    const orders = await prisma.customerOrder.findMany({
      where: {
        userId,
        ...(companyId ? { companyId } : {}),
      },
      include: {
        orderItems: {
          select: {
            id: true,
            title: true,
            price: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      orderNumber: o.id.slice(-6).toUpperCase(),
      totalAmount: o.totalAmount,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      items: o.orderItems,
    }));

    return NextResponse.json({ success: true, invoices: formatted });
  } catch (error: any) {
    console.error("Failed to fetch member invoices:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
