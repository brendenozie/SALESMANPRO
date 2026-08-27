import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { authOptions } from "@/lib/auth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function GETHandler() {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const history = await prisma.customerOrder.findMany({
    where: {
      consumerId: (session.user as any).id,
      status: "COMPLETED",
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(history);
}

export const GET = withApiHandler(GETHandler);
