import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// app/api/admin/library/issuance/return-scan/route.ts

export const GET = withApiHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  
  // Calculate date 24 hours ago
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cacheKey = `admin:return-scan:${companyId || 'global'}:all`;

  try {
    const cached = await cacheGet(cacheKey);
    if (cached) return formatResponse(true, cached, "Fetched (Cached)", 200);
  } catch (e) {}

  const history = await prisma.libraryIssuance.findMany({
    where: {
      // companyId,
      status: "RETURNED",
      returnDate: { gte: last24Hours }
    },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } }
        }
      }
    },
    orderBy: { returnDate: 'desc' }
  });

  try {
    if (history) {
      await cacheSet(cacheKey, history, 60);
    }
  } catch (e) {}

  const formatted = history.map(h => ({
    book: h.book.title,
    user: h.libraryMember?.student 
      ? `${h.libraryMember.student.firstName} ${h.libraryMember.student.lastName}`
      : h.libraryMember?.educator?.user?.name || "Member",
    time: h.returnDate,
    status: "Restored"
  }));

  return formatResponse(true, formatted, "History retrieved", 200);
}, { requireAuth: true });

const returnScanLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const returnDate = new Date();
  const isDamaged = searchParams.get("isDamaged") === "true";
  const { identifier } = await request.json();

  if (!companyId || !identifier) {
    return formatResponse(false, null, "Missing required parameters", 400);
  }

  const cacheKey = `admin:issuance:${companyId || 'global'}:all`;
  
  // 1. Find an active issuance by either Book Identifier (ISBN/Code) OR Member ID
  const activeIssuance = await prisma.libraryIssuance.findFirst({
    where: {
      companyId,
      status: "ACTIVE",
      OR: [
        { book: { isbn: identifier } }, // Assuming your book model has a unique 'identifier' or 'isbn'
        { libraryMember: { memberId: identifier } }
      ]
    },
    include: {
      book: true,
      libraryMember: {
        include: {
          student: true,
          educator: { include: { user: true } }
        }
      }
    }
  });

  if (!activeIssuance) {
    return formatResponse(false, null, "No active issuance found for this ID", 404);
  }

  // 2. Process the return transaction
  
  const updatedData = await prisma.$transaction(async (tx) => {

    // 1. Update Issuance
    const issuance = await tx.libraryIssuance.update({
      where: { id: activeIssuance.id },
      data: { 
          status: "RETURNED", 
          returnDate 
      }
    });

    // 2. Update Book Condition
    await tx.libraryBook.update({
      where: { id: activeIssuance.bookId },
      data: { 
          status: isDamaged ? "DAMAGED" : "AVAILABLE" 
      }
    });

    // 3. Auto-Fine for Damage
    if (isDamaged) {
      await tx.libraryFine.create({
        data: {
          issuanceId: activeIssuance.id,
          amount: 25.00, // Standard damage fee
          reason: "Physical damage reported during return",
          status: "PENDING"
        }
      });
    }
    
    // Mark record as returned
    // const issuance = await tx.libraryIssuance.update({
    //   where: { id: activeIssuance.id },
    //   data: {
    //     status: "RETURNED",
    //     returnDate: new Date()
    //   }
    // });

    // Make book available again
    // await tx.libraryBook.update({
    //   where: { id: activeIssuance.bookId },
    //   data: { status: "AVAILABLE" }
    // });

    return issuance;
  });
  
  // Invalidate relevant caches
  try { await cacheDel(cacheKey); } catch (e) {}

  // 3. Construct response for the 'Live Feed'
  const memberName = activeIssuance.libraryMember?.student 
    ? `${activeIssuance.libraryMember.student.firstName} ${activeIssuance.libraryMember.student.lastName}`
    : activeIssuance.libraryMember?.educator?.user?.name || "Member";

  return formatResponse(true, {
    bookTitle: activeIssuance.book.title,
    memberName: memberName,
    returnId: updatedData.id
  }, "Volume successfully restored", 200);
};

export const POST = withApiHandler(returnScanLogic, { requireAuth: true });