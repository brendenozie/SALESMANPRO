import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current issuance to check dates
      const issuance = await tx.libraryIssuance.findUnique({
        where: { id },
      });

      if (!issuance) throw new Error("Record not found");

      const today = new Date();
      
      // 2. Update Issuance to RETURNED
      const updatedIssuance = await tx.libraryIssuance.update({
        where: { id },
        data: {
          status: 'RETURNED', // Ensure this matches your LibraryIssuanceStatus enum
          returnDate: today
        }
      });

      // 3. Make book available
      await tx.libraryBook.update({
        where: { id: issuance.bookId },
        data: { status: 'AVAILABLE' }
      });

      // 4. Optional: Auto-generate fine if overdue
      if (today > issuance.dueDate) {
        const diffTime = Math.abs(today.getTime() - issuance.dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        await tx.libraryFine.create({
          data: {
            issuanceId: id,
            amount: diffDays * 1.5, // e.g., $1.50 per day
            reason: `Late return: ${diffDays} days overdue`,
            status: 'PENDING'
          }
        });
      }

      return updatedIssuance;
    });

    // Invalidate relevant caches
    try { await cacheDel(`admin:issuance:${result.companyId || 'global'}:*`); } catch (e) {}

    return formatResponse(true, result, "Book returned successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error.message, 500);
  }
}