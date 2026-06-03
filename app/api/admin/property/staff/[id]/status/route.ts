import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

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
      return formatResponse(false, null, "Invalid status value", 400);
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

    return formatResponse(true, updatedStaff, "Staff status updated successfully", 200);
  } catch (error: any) {
    console.error("[STAFF_STATUS_PATCH]", error);
    return formatResponse(false, null, "Failed to update status", 500);
  }
}