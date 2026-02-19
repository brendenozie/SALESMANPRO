import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const bulkWaiverLogic = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId"); // Internal DB ID of the LibraryMember
  const companyId = searchParams.get("companyId");

  if (!memberId || !companyId) {
    return formatResponse(false, null, "Member ID and Company ID are required.", 400);
  }

  // Use a transaction to update all pending fines for this member
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update all fines linked to issuances belonging to this member
    const updateResult = await tx.libraryFine.updateMany({
      where: {
        status: "PENDING",
        issuance: {
          libraryMemberId: memberId,
          companyId: companyId
        }
      },
      data: {
        status: "PAID", // Or add a 'WAIVED' status to your enum if preferred
        reason: "Administrative Bulk Waiver",
        paidDate: new Date()
      }
    });

    return updateResult;
  });

  // Invalidate relevant caches if needed (e.g., member's fines)
    try { await cacheDel(`admin:libraryFines:${companyId || 'global'}:member:${memberId}`); } catch (e) {}

  return formatResponse(
    true, 
    { count: result.count }, 
    `${result.count} fines successfully waived for this member.`, 
    200
  );
};

export const PATCH = withApiHandler(bulkWaiverLogic, { requireAuth: true });