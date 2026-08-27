import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/admin/[adminSlug]/users/[userId]/route.ts
import prisma from "@/server/db/prismadb";
import { NextResponse } from "next/server";

import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// DELETE /api/admin/[adminSlug]/users/[userId]
// Deletes a specific user by ID
async function handleDELETE(request: Request, { params }: { params: { adminSlug: string; userId: string } }) {
  


  const { adminSlug, userId } = params;

  try {
    // 1. Verify company existence
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    // 2. Verify user existence and ownership
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });

    if (!userToDelete || userToDelete.companyId !== company.id) {
      return formatResponse(false, null, "User not found or does not belong to this company", 404);
    }

    // 3. Delete the user (cascade deletes handled in schema)
    await prisma.user.delete({ where: { id: userId } });

    
    try { await cacheDel(`admin:travel-users:${companyId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, null, "User deleted successfully");
  } catch (error: any) {
    console.error(`Error deleting user ${userId}:`, error);
    if (error.code === "P2025") {
      return formatResponse(false, null, "User not found", 404);
    }
    return formatResponse(false, null, error.message || "Failed to delete user", 500);
  }
}

// Export the DELETE handler wrapped with withApiHandler
export const DELETE = withApiHandler(handleDELETE);
