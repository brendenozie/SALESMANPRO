// app/api/addresses/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { authOptions } from "@/lib/auth";


async function GETHandler(req: Request, context : any) {
  const userId = context?.params?.userId;

  const addresses = await prisma.address.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(addresses);
}

async function POSTHandler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json();
  const { label, street, city, postal, country, isDefault } = body;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: (session.user as any).id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const addr = await prisma.address.create({
    data: {
      userId: (session.user as any).id,
      label,
      street,
      city,
      postal,
      country,
      isDefault: !!isDefault,
    },
  });
  return NextResponse.json(addr);
}

export async function PUTHandler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const body = await req.json();
  const { id, label, street, city, postal, country, isDefault } = body;

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: (session.user as any).id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.updateMany({
    where: { id, userId: (session.user as any).id },
    data: { label, street, city, postal, country, isDefault: !!isDefault },
  });
  return NextResponse.json({ updated: updated.count });
}

export async function DELETEHandler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.address.deleteMany({ where: { id, userId: (session.user as any).id } });
  return NextResponse.json({ success: true });
}


export const GET = withApiHandler(GETHandler);
export const POST = withApiHandler(POSTHandler);
export const PUT = withApiHandler(PUTHandler);
export const DELETE = withApiHandler(DELETEHandler);