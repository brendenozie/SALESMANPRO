import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path if needed
import { OrderStatus } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderItemId = params.id;

  const { searchParams } = new URL(req.url);

  const riderId = searchParams.get("riderId");
  const status = searchParams.get("status");

  if (!orderItemId || !status) {
    return NextResponse.json({ error: "Missing order ID or status" }, { status: 400 });
  }

  try {
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        ...(typeof riderId !== "undefined" && riderId ? { riderId }: {}),
        order: { update: { status: status as OrderStatus } },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/admin/orders/[id]] Update failed →", error);
    return NextResponse.json({ success: false, message: "Failed to update order." }, { status: 500 });
  }
}
