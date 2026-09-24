import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority, description, notes } = body;

    const existing = await prisma.hostelMaintenanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return formatResponse(false, null, "Ticket not found", 404);
    }

    const isResolved = status === "COMPLETED" || status === "RESOLVED";

    const updated = await prisma.hostelMaintenanceRequest.update({
      where: { id },
      data: {
        status: status || existing.status,
        priority: priority || existing.priority,
        description: description || existing.description,
        notes: notes !== undefined ? notes : existing.notes,
        resolvedDate: isResolved ? new Date() : existing.resolvedDate,
      },
      include: {
        room: {
          select: {
            roomNumber: true,
            block: { select: { name: true } }
          }
        },
        reporter: { select: { name: true } }
      }
    });

    try {
      await cacheDel(`tenant:*:maintenance:*`);
      await cacheDel(`admin:maintenance:*`);
    } catch (e) {}

    return formatResponse(true, updated, "Ticket updated successfully", 200);
  } catch (error: any) {
    console.error("[MAINTENANCE_PATCH_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update ticket", 500);
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.hostelMaintenanceRequest.findUnique({
      where: { id }
    });

    if (!existing) {
      return formatResponse(false, null, "Ticket not found", 404);
    }

    await prisma.hostelMaintenanceRequest.delete({
      where: { id }
    });

    try {
      await cacheDel(`tenant:*:maintenance:*`);
      await cacheDel(`admin:maintenance:*`);
    } catch (e) {}

    return formatResponse(true, null, "Ticket deleted successfully", 200);
  } catch (error: any) {
    console.error("[MAINTENANCE_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to delete ticket", 500);
  }
}
