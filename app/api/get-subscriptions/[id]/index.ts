// app/api/exercise/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// ================= GET =================
async function getExercise(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters.", 400);
  }

  try {
    // const exercises = await prisma.exercise.findMany({
    //   where: { agentId: agentId || undefined },
    //   skip: offset,
    //   take: limit,
    // });

    // const totalCount = await prisma.exercise.count({
    //   where: { agentId: agentId || undefined },
    // });

    return formatResponse(true, {
      InfoResponse: {
        count: "totalCount",
        next: offset + limit < 0 ? offset + limit : null,
        pages: Math.ceil(10 / limit),
        prev: offset > 0 ? Math.max(offset - limit, 0) : null,
      },
      results: "exercises",
    });
  } catch (e: any) {
    console.error("GET /api/exercise error:", e);
    return formatResponse(false, null, e.message || "Internal server error", 500);
  }
}

// ================= DELETE =================
async function deleteExercise(request: Request) {
  const { searchParams } = new URL(request.url);
  const exerciseId = searchParams.get("id");

  if (!exerciseId) {
    return formatResponse(false, null, "Missing exerciseId", 400);
  }

  try {
  //   const exercise = await prisma.exercise.delete({
  //     where: { id: exerciseId },
  //   });

    return formatResponse(true, { id: "exercise.id" }, "Exercise deleted");
  } catch (e: any) {
    console.error("DELETE /api/exercise error:", e);
    return formatResponse(false, null, e.message || "Internal server error", 500);
  }
}

// ================= PUT =================
async function updateExercise(request: Request) {
  const body = await request.json();
  const { id, exerciseName, publicId, url, status } = body;

  if (!id) {
    return formatResponse(false, null, "Missing exercise ID", 400);
  }

  try {
    // const updatedExercise = await prisma.exercise.update({
    //   where: { id },
    //   data: {
    //     exName: exerciseName,
    //     publicId,
    //     url,
    //     status,
    //   },
    // });

    return formatResponse(true, null, "Exercise updated");
  } catch (e: any) {
    console.error("PUT /api/exercise error:", e);
    return formatResponse(false, null, e.message || "Internal server error", 500);
  }
}

export const GET = withApiHandler(getExercise);
export const DELETE = withApiHandler(deleteExercise);
export const PUT = withApiHandler(updateExercise);
