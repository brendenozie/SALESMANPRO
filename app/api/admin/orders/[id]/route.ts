// app/api/seller/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path if needed
import { OrderStatus } from "@prisma/client";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const orderItemId = params.id;
  const { status, riderId } = await req.json();

  try {
    // Example update logic (Prisma, Mongo, etc.)
    await prisma.orderItem.update({
      where: { id: orderItemId },
      data: {
        ...(typeof riderId !== "undefined" && { riderId }),
        order: { update: { status } }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update order." }, { status: 500 });
  }
}
