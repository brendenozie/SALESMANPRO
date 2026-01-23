import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// GET: Fetch all books currently in DAMAGED status
const getMaintenanceList = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) return formatResponse(false, null, "Company ID required", 400);

  const damagedBooks = await prisma.libraryBook.findMany({
    where: { 
      companyId,
      status: "DAMAGED" 
    },
    include: {
      category: true,
      // Optional: Get the last issuance to see who reported the damage
      issuances: {
        take: 1,
        orderBy: { returnDate: 'desc' },
        include: { libraryMember: { include: { student: true, educator: { include: { user: true } } } } }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return formatResponse(true, damagedBooks, "Maintenance list retrieved", 200);
};

// PATCH: Mark a book as repaired
const repairBook = async (request: Request) => {
  const body = await request.json();
  const { bookId } = body;

  const updatedBook = await prisma.libraryBook.update({
    where: { id: bookId },
    data: { status: "AVAILABLE" }
  });

  return formatResponse(true, updatedBook, "Volume restored to circulation", 200);
};

export const GET = withApiHandler(getMaintenanceList, { requireAuth: true });
export const PATCH = withApiHandler(repairBook, { requireAuth: true });