// app/api/admin/clients/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const clientId = params.id;
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

    // Map to your front-end shape if needed, or return the raw object
    return NextResponse.json({
      id: client.id,
      name: client.user.name,
      email: client.user.email,
      phoneNumber: client.user.phone,
      // These would normally be aggregated from orders:
      totalPurchases: 0,
      lastPurchaseDate: null,
      averageOrderValue: 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const clientId = params.id;
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }

  const body = await request.json();
  const { name, email, phoneNumber } = body;

  try {
    // First, look up the client to get their userId
    const existing = await prisma.client.findUnique({
      where: { id: clientId },
      select: { userId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Update the linked User record
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

export async function DELETE(_req: Request, { params }: Params) {
  const clientId = params.id;
  if (!clientId) {
    return NextResponse.json({ error: "Missing client id" }, { status: 400 });
  }

  try {
    // Delete the client profile
    await prisma.client.delete({ where: { id: clientId } });
    // (Optionally) delete the User record as well:
    // await prisma.user.delete({ where: { id: existing.userId } });

    return NextResponse.json({}, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
