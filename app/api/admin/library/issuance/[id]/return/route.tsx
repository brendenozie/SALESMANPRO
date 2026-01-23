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

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}