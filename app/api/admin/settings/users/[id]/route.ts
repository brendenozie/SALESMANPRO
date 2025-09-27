// app/api/settings/users/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// PUT /api/settings/users/[id] - Update user
async function updateUser(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  if (!id) return formatResponse(false, null, "User ID is required", 400);

  try {
    const body = await req.json();
    const { name, email, role, status } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, role, status },
    });

    return formatResponse(true, updatedUser, "User updated successfully", 200);
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return formatResponse(false, null, "Failed to update user", 500);
  }
}

// DELETE /api/settings/users/[id] - Delete user
async function deleteUser(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  if (!id) return formatResponse(false, null, "User ID is required", 400);

  try {
    await prisma.user.delete({
      where: { id },
    });

    return formatResponse(true, null, "User deleted successfully", 200);
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return formatResponse(false, null, "Failed to delete user", 500);
  }
}

// Export handlers wrapped with withApiHandler
export const PUT = withApiHandler(updateUser);
export const DELETE = withApiHandler(deleteUser);
