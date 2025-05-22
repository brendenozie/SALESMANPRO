import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

import { OrderStatus } from "@prisma/client";

export default async function GET( req : Request ) {
  // const { page = 1, limit = 5, status = 'all', search = '' } = req.query;
  const { searchParams } = new URL(req.url);

  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }


  const currentPage = page;
  const itemsPerPage = limit;

  const skip = (currentPage - 1) * itemsPerPage;
  const take = itemsPerPage;

  try {
    const where: any = {
      AND: [
       status !== 'all' ? { status: status as OrderStatus } : {},
        search ? { client: { name: { contains: search as string, mode: 'insensitive' } } } : {},
      ],
    };

    const [orders, totalOrders] = await prisma.$transaction([
      prisma.customerOrder.findMany({
        where,
        // include: {
        //   // client: true,
        //   product: true,
        // },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customerOrder.count({ where }),
    ]);

    const totalRevenue = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
    });

    const pendingRevenue = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'PENDING' },
    });

    const completedRevenue = await prisma.customerOrder.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'COMPLETED' },
    });

    // Monthly revenue calculation
    const ordersForMonthlyRevenue = await prisma.customerOrder.findMany({
      select: { createdAt: true, totalPrice: true },
    });

    const monthlyRevenue = Array(12).fill(0);
    
    ordersForMonthlyRevenue.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      monthlyRevenue[month] += order.totalPrice;
    });

    const allOrders = {
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / itemsPerPage),
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      pendingRevenue: pendingRevenue._sum.totalPrice || 0,
      completedRevenue: completedRevenue._sum.totalPrice || 0,
      monthlyRevenue,
    };

    console.log('Fetched orders:', allOrders);

    NextResponse.json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    NextResponse.json({ error: 'Failed to fetch orders' });
  }
};

