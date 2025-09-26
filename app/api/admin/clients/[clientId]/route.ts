// app/api/admin/clients/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

interface Params {
  context:{
    params: { id: string };
  }
}

async function getClient(_req: Request,  context : {
    params: { id: string };
  }) {
  const clientId = context.params.id;
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: client.id,
      name: client.user.name,
      email: client.user.email,
      phoneNumber: client.user.phone,
      totalPurchases: 0, // could be aggregated later
      lastPurchaseDate: null,
      averageOrderValue: 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function updateClient(request: Request, context : {
    params: { id: string };
  }) {
  const clientId = context.params.id;
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }

  const body = await request.json();
  const { name, email, phoneNumber } = body;

  try {
    const existing = await prisma.client.findUnique({
      where: { id: clientId },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: existing.userId },
      data: {
        name,
        email,
        phone: phoneNumber,
      },
    });

    return NextResponse.json({
      id: clientId,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phone,
      totalPurchases: 0,
      lastPurchaseDate: null,
      averageOrderValue: 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function deleteClient(_req: Request, context : {
    params: { id: string };
  }) {
  const clientId = context.params.id;
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }

  try {
    await prisma.client.delete({ where: { id: clientId } });
    return NextResponse.json({}, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const GET = withApiHandler(getClient, { requireAuth: true });
export const PATCH = withApiHandler(updateClient, { requireAuth: true });
export const DELETE = withApiHandler(deleteClient, { requireAuth: true });
