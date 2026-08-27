// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { authOptions } from "@/lib/auth";

async function GETHandler() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  return NextResponse.json(user);
}

async function POSTHandler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json();
  const { name, image } = body;

  const updated = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name, image },
  });

  return NextResponse.json(updated);
}

export const GET = withApiHandler(GETHandler);
export const POST = withApiHandler(POSTHandler);