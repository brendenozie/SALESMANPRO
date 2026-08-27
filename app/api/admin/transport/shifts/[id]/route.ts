import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status } = body; // IN_PROGRESS, COMPLETED, etc.

    const updatedShift = await prisma.transportShift.update({
      where: { id: params.id },
      data: { status },
    });

    // Optional: If status is COMPLETED, you could trigger a vehicle status update here
    if (status === "COMPLETED") {
      await prisma.transportVehicle.update({
        where: { id: updatedShift.vehicleId },
        data: { status: "ACTIVE" } // Ensure vehicle is marked as available
      });
    }

    
    try { await cacheDel(`admin:shifts:${'global' || 'global'}:*`); } catch (e) {}
    return formatResponse(true, updatedShift, `Shift marked as ${status}`, 200);
  } catch (error) {
    return formatResponse(false, null, "Update failed", 500);
  }
}