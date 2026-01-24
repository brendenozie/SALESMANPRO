import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

/**
 * GET: Fetch all active reservations for a company
 */
const getReservationsLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const reservations = await prisma.libraryReservation.findMany({
    where: {
      book: { companyId }
    },
    include: {
      book: { select: { title: true, isbn: true, status: true } },
      libraryMember: {
        include: {
          student: { select: { firstName: true, lastName: true } },
          educator: { include: { user: { select: { name: true } } } }
        }
      }
    },
    orderBy: { createdAt: 'asc' } // First come, first served
  });

  return formatResponse(true, reservations, "Reservation queue retrieved", 200);
};

/**
 * POST: Create a new reservation
 */
const postReservationLogic = async (request: Request) => {
  const body = await request.json();
  const { libraryMemberId, bookId, expiryDate, companyId } = body;

  // 1. Validate book availability (optional: allow reserving even if checked out)
  const book = await prisma.libraryBook.findUnique({ where: { id: bookId } });
  if (!book) return formatResponse(false, null, "Book not found", 404);

  // 2. Create reservation and update book status
  const reservation = await prisma.$transaction(async (tx) => {
    const res = await tx.libraryReservation.create({
      data: {
        libraryMemberId,
        bookId,
        expiryDate: new Date(expiryDate),
        status: "PENDING"
      }
    });

    // If book is available, mark it as RESERVED so no one else grabs it
    if (book.status === "AVAILABLE") {
      await tx.libraryBook.update({
        where: { id: bookId },
        data: { status: "RESERVED" }
      });
    }

    return res;
  });

  return formatResponse(true, reservation, "Hold placed on volume", 201);
};

// Add to your existing POST logic in route.ts
const postReservation = async (request: Request) => {
  const { bookId, libraryMemberId, expiryDate, companyId } = await request.json();

  const newReservation = await prisma.libraryReservation.create({
    data: {
      bookId,
      libraryMemberId,
      expiryDate: new Date(expiryDate),
      status: "PENDING",
    },
    include: {
      book: true,
      libraryMember: { include: { student: true, educator: { include: { user: true } } } }
    }
  });

  return formatResponse(true, newReservation, "Reservation created", 201);
};

export const GET = withApiHandler(getReservationsLogic, { requireAuth: true });
export const POST = withApiHandler(postReservationLogic, { requireAuth: true });