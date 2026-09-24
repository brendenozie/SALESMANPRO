import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/admin/library/reservations/[id]
const updateResLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.libraryReservation.findUnique({
    where: { id },
  });
  if (!existing) {
    return formatResponse(false, null, "Reservation not found.", 404);
  }

  const updated = await prisma.libraryReservation.update({
    where: { id },
    data: {
      status: body.status || existing.status,
    },
  });

  return formatResponse(true, updated, "Reservation updated", 200);
};

export const PUT = withApiHandler(updateResLogic, { requireAuth: true });

// DELETE /api/admin/library/reservations/[id]
const deleteResLogic = async (request: Request, { params }: RouteParams) => {
  const { id } = await params;

  const existing = await prisma.libraryReservation.findUnique({
    where: { id },
  });
  if (!existing) {
    return formatResponse(false, null, "Reservation not found.", 404);
  }

  await prisma.libraryReservation.delete({
    where: { id },
  });

  return formatResponse(true, null, "Reservation removed", 200);
};

export const DELETE = withApiHandler(deleteResLogic, { requireAuth: true });
