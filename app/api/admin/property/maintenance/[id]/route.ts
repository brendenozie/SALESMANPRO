import { cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { HostelMaintenanceRequestStatus, HostelMaintenanceRequestPriority } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return formatResponse(false, null, "Ticket ID is required", 400);
  }

  const ticket = await prisma.hostelMaintenanceRequest.findUnique({
    where: { id },
    include: {
      room: {
        include: {
          block: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      },
    },
  });

  if (!ticket) {
    return formatResponse(false, null, "Maintenance ticket not found", 404);
  }

  return formatResponse(true, ticket, "Maintenance ticket fetched successfully", 200);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return formatResponse(false, null, "Ticket ID is required", 400);
  }

  const existing = await prisma.hostelMaintenanceRequest.findUnique({
    where: { id },
    include: { room: { include: { block: true } } },
  });

  if (!existing) {
    return formatResponse(false, null, "Maintenance ticket not found", 404);
  }

  const body = await req.json();
  const { status, priority, notes, description, category } = body;

  const updateData: any = {};
  if (status) {
    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return formatResponse(false, null, `Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
    }
    updateData.status = status as HostelMaintenanceRequestStatus;
    if (status === "COMPLETED" && !existing.resolvedDate) {
      updateData.resolvedDate = new Date();
    }
  }

  if (priority) {
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    if (!validPriorities.includes(priority)) {
      return formatResponse(false, null, `Invalid priority. Must be one of: ${validPriorities.join(", ")}`, 400);
    }
    updateData.priority = priority as HostelMaintenanceRequestPriority;
  }

  if (notes !== undefined) updateData.notes = notes;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;

  const updatedTicket = await prisma.hostelMaintenanceRequest.update({
    where: { id },
    data: updateData,
    include: {
      room: {
        include: { block: true },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  try {
    const companyId = existing.room?.block?.companyId;
    if (companyId) {
      await cacheDel(`tenant:${companyId}:maintenance:*`);
      await cacheDel(`admin:maintenance:*`);
    }
  } catch (e) {}

  return formatResponse(true, updatedTicket, "Maintenance ticket updated successfully", 200);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id) {
    return formatResponse(false, null, "Ticket ID is required", 400);
  }

  const existing = await prisma.hostelMaintenanceRequest.findUnique({
    where: { id },
    include: { room: { include: { block: true } } },
  });

  if (!existing) {
    return formatResponse(false, null, "Maintenance ticket not found", 404);
  }

  await prisma.hostelMaintenanceRequest.delete({
    where: { id },
  });

  try {
    const companyId = existing.room?.block?.companyId;
    if (companyId) {
      await cacheDel(`tenant:${companyId}:maintenance:*`);
      await cacheDel(`admin:maintenance:*`);
    }
  } catch (e) {}

  return formatResponse(true, null, "Maintenance ticket deleted successfully", 200);
}
