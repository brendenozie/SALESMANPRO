// app/api/seller/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path if needed
import { OrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const companyId = searchParams.get("companyId") || "63f7c9e2d91b1b2a5e80b007";
  const search = searchParams.get("search") || "";

  if (isNaN(limit) || isNaN(offset) || isNaN(page) || limit <= 0 || offset < 0) {
    return NextResponse.json({ message: "Invalid pagination parameters." }, { status: 400 });
  }

  const currentPage = page;
  const itemsPerPage = limit;
  const skip = (currentPage - 1) * itemsPerPage;

  if (!companyId) {
    return NextResponse.json({ error: "companyId is required" }, { status: 400 });
  }

  try {
    const whereFilter: any = {
      marketplaceListing: {
        companyId: companyId,
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {})
      }
    };

    const [orderItems, totalOrderItems] = await prisma.$transaction([
      prisma.orderItem.findMany({
        where: whereFilter,
        include: {
          marketplaceListing: true,
        },
        skip,
        take: itemsPerPage,
        orderBy: { order: { createdAt: 'desc' } },
      }),
      prisma.orderItem.count({ where: whereFilter }),
    ]);

    const totalRevenueAgg = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        marketplaceListing: { companyId },
      },
    });

    const pendingRevenueAgg = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        marketplaceListing: { companyId },
        order: { status: OrderStatus.PENDING },
      },
    });

    const completedRevenueAgg = await prisma.orderItem.aggregate({
      _sum: { price: true },
      where: {
        marketplaceListing: { companyId },
        order: { status: OrderStatus.COMPLETED },
      },
    });

    const orderItemsForMonthly = await prisma.orderItem.findMany({
      select: {
        order: { select: { createdAt: true } },
        price: true,
      },
      where: {
        marketplaceListing: { companyId },
      },
    });

    const monthlyRevenue = Array(12).fill(0);
    orderItemsForMonthly.forEach((item) => {
      const month = new Date(item.order.createdAt).getMonth();
      monthlyRevenue[month] += item.price;
    });

    return NextResponse.json({
      orderItems,
      totalOrderItems,
      totalPages: Math.ceil(totalOrderItems / itemsPerPage),
      totalRevenue: totalRevenueAgg._sum.price || 0,
      pendingRevenue: pendingRevenueAgg._sum.price || 0,
      completedRevenue: completedRevenueAgg._sum.price || 0,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error fetching order items:", error);
    return NextResponse.json({ error: "Failed to fetch order items" }, { status: 500 });
  }
}
