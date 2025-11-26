// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { authOptions } from "@/lib/auth";

async function GETHandler(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const id = params.id;
  const order = await prisma.customerOrder.findFirst({
    where: { id, consumerId: (session.user as any).id },
    include: { items: { include: { marketplaceListing: true } } },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export const GET = withApiHandler(GETHandler);