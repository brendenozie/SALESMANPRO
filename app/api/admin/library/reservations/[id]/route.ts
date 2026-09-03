import { buildTenantCacheKey, cacheDel, cacheGet, cacheSet } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";


// PATCH: Update reservation status (CANCELLED / FULFILLED)
export const PATCH = withApiHandler(async (request: Request, { params }: any) => {
  const { id } = params;
  const { status } = await request.json();

  const reservation = await prisma.libraryReservation.findUnique({
    where: { id },
    include: { book: true }
  });

  if (!reservation) return formatResponse(false, null, "Reservation not found", 404);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.libraryReservation.update({
      where: { id },
      data: { status }
    });

    // If cancelled, and no other pending reservations, make book available
    if (status === "CANCELLED" || status === "EXPIRED") {
      const otherHold = await tx.libraryReservation.findFirst({
        where: { bookId: reservation.bookId, status: "PENDING", NOT: { id } }
      });

      if (!otherHold) {
        await tx.libraryBook.update({
          where: { id: reservation.bookId },
          data: { status: "AVAILABLE" }
        });
      }
    }

    return res;
  });

  // Invalidate cache for reservations list
  try {
    await cacheDel(`tenant:${reservation.companyId}:libraryReservations:*`);
    await cacheDel(`admin:libraryReservations:*`);
  } catch (e) {}

  return formatResponse(true, updated, `Reservation marked as ${status}`, 200);
}, { requireAuth: true });