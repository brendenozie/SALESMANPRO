import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

export async function PATCH(
  req: Request,
  { params }: { params: { shiftId: string } }
) {
  try {
    const { status } = await req.json(); // IN_PROGRESS or COMPLETED
    const { shiftId } = params;

    const updatedShift = await prisma.transportShift.update({
      where: { id: shiftId },
      data: { status },
      include: { vehicle: true }
    });

    // Side effect: Update vehicle status based on trip activity
    const vehicleStatus = status === "IN_PROGRESS" ? "ACTIVE" : "ACTIVE"; 
    // You could add a 'ON_ROUTE' status to TransportVehicleStatus if needed

    await prisma.transportVehicle.update({
      where: { id: updatedShift.vehicleId },
      data: { status: vehicleStatus }
    });

    return formatResponse(true, updatedShift, `Shift marked as ${status}`, 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}