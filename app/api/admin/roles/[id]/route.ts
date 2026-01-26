// app/api/users/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// PUT /api/users/[id]
// Handles updating an existing user
async function handlePUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { companyId, ...userData } = await request.json();

    if (!id) {
      return formatResponse(false, null, "User ID is required", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return formatResponse(false, null, "User not found", 404);
    }

    let updateData: any = { ...userData };

    if (companyId) {
      updateData.company = { connect: { id: companyId } };
    } else {
      updateData.company = { disconnect: true };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return formatResponse(true, updatedUser, "User updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return formatResponse(false, null, error.message || "Failed to update user", 500);
  }
}

// DELETE /api/users/[id]
// Handles deleting a user
async function handleDELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return formatResponse(false, null, "User ID is required", 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return formatResponse(false, null, "User not found", 404);
    }

    await prisma.user.delete({ where: { id } });

    return formatResponse(true, null, "User deleted successfully", 204);
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return formatResponse(false, null, error.message || "Failed to delete user", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const PUT = withApiHandler(handlePUT);
export const DELETE = withApiHandler(handleDELETE);
