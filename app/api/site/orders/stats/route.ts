// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { authOptions } from "@/lib/auth";

async function GETHandler(req: Request) {
   const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const id = (session.user as any).id;

  const totalOrders = await prisma.customerOrder.count({
    where: { consumerId: id }
  });

  const pending = await prisma.customerOrder.count({
    where: { consumerId: id, status: "PENDING" }
  });

  const spentData = await prisma.customerOrder.aggregate({
    where: { consumerId: id, status: "COMPLETED" },
    _sum: { totalFinalPrice: true }
  });

  return NextResponse.json({
    totalOrders,
    pending,
    spentThisMonth: spentData._sum.totalFinalPrice ?? 0
  });
}

export const GET = withApiHandler(GETHandler);