// app/api/admin/clients/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function listClients(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") || "";

  if (!companyId) {
    return formatResponse(false, null, "Missing companyId", 400);
  }

  try {
    const clients = await prisma.client.findMany({
      where: { companyId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    const enriched = await Promise.all(
      clients.map(async (c) => {
        const orders = await prisma.customerOrder.findMany({
          where: { companyId, consumerId: c.userId },
          select: { totalPrice: true, createdAt: true },
        });

        const totalPurchases = orders.reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);
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

    return formatResponse(true, enriched, "Clients fetched successfully");
  } catch (err) {
    console.error("GET /api/admin/clients error:", err);
    return formatResponse(false, null, err, 500);
  }
}

async function createClient(request: Request) {
  const body = await request.json();
  const { name, email, phoneNumber, companyId } = body;

  if (!companyId || !email) {
    return NextResponse.json(
      { error: "companyId and email are required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.create({
      data: { name, email, phone: phoneNumber },
    });

    const client = await prisma.client.create({
      data: { companyId, userId: user.id },
    });

    return formatResponse(true, 
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
  } catch (err) {
    console.error("POST /api/admin/clients error:", err);
    return formatResponse(false, null, err, 500);
  }
}

export const GET = withApiHandler(listClients, { requireAuth: true });
export const POST = withApiHandler(createClient, { requireAuth: true });
