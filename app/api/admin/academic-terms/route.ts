import prisma from "@/server/db/prismadb";
import { cacheDel } from "@/lib/cache";
import { formatResponse } from "@/lib/formatResponse";
import { NextResponse } from "next/server";

// PATCH: Update existing term
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    
    const updatedTerm = await prisma.term.update({
      where: { id: params.id },
      data: {
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        termNumber: body.termNumber ? parseInt(body.termNumber) : undefined,
        // If the body contains companyId, ensure we're targeting the right one
        // companyId: body.companyId 
      },
    });

    // Invalidate the cache so the frontend sees the changes immediately
    await cacheDel(`admin:terms:${updatedTerm.companyId}:all`);

    return formatResponse(true, updatedTerm, "Term updated successfully", 200);
  } catch (error: any) {
    console.error("[TERM_PATCH_ERROR]:", error);
    return formatResponse(false, null, error.message || "Update failed", 500);
  }
}

// DELETE: Remove a term
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // We delete the term and return its data to know which company cache to clear
    const term = await prisma.term.delete({
      where: { id: params.id },
    });

    // Clear cache for this company's terms
    await cacheDel(`admin:terms:${term.companyId}:all`);

    return formatResponse(true, term, "Term deleted successfully", 200);
  } catch (error: any) {
    console.error("[TERM_DELETE_ERROR]:", error);
    return formatResponse(false, null, error.message || "Delete failed", 500);
  }
}