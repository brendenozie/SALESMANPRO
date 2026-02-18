import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { isOnDuty } = body;

    // Validate that isOnDuty is a boolean
    if (typeof isOnDuty !== "boolean") {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedStaff = await prisma.hostelStaff.update({
      where: { id },
      data: { isOnDuty },
      select: {
        id: true,
        name: true,
        isOnDuty: true,
      },
    });

    return NextResponse.json(updatedStaff);
  } catch (error: any) {
    console.error("[STAFF_STATUS_PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}