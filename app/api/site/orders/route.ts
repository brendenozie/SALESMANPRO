// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { authOptions } from "@/lib/auth";

async function GETHandler() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const orders = await prisma.customerOrder.findMany({
    where: { consumerId: (session.user as any).id },
    include: { items: { include: { marketplaceListing: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export const GET = withApiHandler(GETHandler);