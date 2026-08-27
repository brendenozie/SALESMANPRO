import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";


export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.expense.delete({
      where: { id },
    });

    try { await cacheDel(`admin:expenses:${id || 'global'}:*`); } catch (e) {}

    return formatResponse(true, null, "Expense deleted successfully", 200);
  } catch (error) {
    return formatResponse(false, null, "Failed to delete expense", 500);
  }
}