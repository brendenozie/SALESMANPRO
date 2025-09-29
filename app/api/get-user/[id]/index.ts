// app/api/users/[id]/route.ts
import { Prisma } from "@prisma/client";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

// ================= DELETE =================
async function deleteUser(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return formatResponse(true, { id: deletedUser.id }, "User deleted successfully");
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return formatResponse(false, null, error.message || "Error deleting user", 500);
  }
}

// ================= PUT =================
async function updateUser(request: Request, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { id } = params;
  const body = await request.json();
  const { question } = body;

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        question: question.question,
        answer: question.answer,
        status: question.status,
        audioUrl: question.audioUrl ?? null,
        audioWaveform: Array.isArray(question.audioWaveform)
          ? question.audioWaveform
          : Prisma.DbNull,
      },
    });

    return formatResponse(true, updatedBooking, "User updated successfully");
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return formatResponse(false, null, error.message || "Error updating user", 500);
  }
}

// ================= EXPORTS =================
export const DELETE = withApiHandler(deleteUser);
export const PUT = withApiHandler(updateUser);
