// app/api/admin/clients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "";
  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  try {
    // 1) Fetch clients + user info
    const clients = await prisma.client.findMany({
      where: { companyId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    // 2) For each client, load their orders and compute stats
    const enriched = await Promise.all(
      clients.map(async (c) => {
        const orders = await prisma.customerOrder.findMany({
          where: { companyId, consumerId: c.userId },
          select: { totalPrice: true, createdAt: true },
        });

        const totalPurchases = orders.reduce((sum, o) => sum + o.totalPrice, 0);
        const averageOrderValue = orders.length
          ? totalPurchases / orders.length
          : 0;
        const lastPurchaseDate = orders.length
          ? new Date(
              Math.max(...orders.map((o) => o.createdAt!.getTime()))
            ).toISOString()
          : null;

        return {
          id: c.id,
          name: c.user.name,
          email: c.user.email,
          phoneNumber: c.user.phone,
          totalPurchases,
          averageOrderValue,
          lastPurchaseDate,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (err: any) {
    console.error("GET /api/admin/clients error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phoneNumber, companyId } = body;

  if (!companyId || !email) {
    return NextResponse.json(
      { error: "companyId and email are required" },
      { status: 400 }
    );
  }

  try {
    // 1) Create User
    const user = await prisma.user.create({
      data: { name, email, phone: phoneNumber },
    });

    // 2) Create Client profile
    const client = await prisma.client.create({
      data: { companyId, userId: user.id },
    });

    // No orders yet, so stats are zero/null
    return NextResponse.json(
      {
        id: client.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phone,
        totalPurchases: 0,
        averageOrderValue: 0,
        lastPurchaseDate: null,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/clients error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
