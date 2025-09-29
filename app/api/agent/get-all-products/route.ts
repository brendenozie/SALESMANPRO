typescript
// app/api/daily-plans/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// GET -> Fetch paginated daily plans with exercise details
async function getDailyPlans(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  const { searchParams } = new URL(req.url);

  let page = parseInt(searchParams.get("page") || "1", 10);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  if (isNaN(page) || page <= 0) {
    page = 1;
  }

  const pageSize = 20;
  const skip = page > 1 ? (page - 1) * pageSize : 0;

  try {
    // Count + fetch in one transaction
    const [totalPlans, dailyPlans] = await prisma.$transaction([
      prisma.dailyPlan.count({
        where: { userId },
      }),
      prisma.dailyPlan.findMany({
        skip,
        take: pageSize,
        where: { userId },
      }),
    ]);

    // Gather all exercise IDs
    const exerciseIds = dailyPlans.flatMap((plan) => plan.exerciseId);

    // Fetch related exercises
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: {
        id: true,
        exName: true,
        exDesc: true,
        exPic: true,
        exVideo: true,
        exDuration: true,
        status: true,
        exerciseCategoryId: true,
        reps: true,
        sets: true,
        breakSet: true,
        exSteps: true,
        exCalories: true,
        exHeartBeat: true,
        caloriesPerRep: true,
      },
    });

    // Map exercises by ID
    const exerciseMap = exercises.reduce<Record<string, typeof exercises[0]>>(
      (acc, exercise) => {
        acc[exercise.id] = exercise;
        return acc;
      },
      {}
    );

    // Attach exercises to each daily plan
    const dailyPlansWithExercises = dailyPlans.map((plan) => ({
      ...plan,
      exercises: plan.exerciseId
        .map((id) => exerciseMap[id] || null)
        .filter(Boolean),
    }));

    // Pagination details
    const totalPages = Math.ceil(totalPlans / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return formatResponse(
      true,
      {
        InfoResponse: {
          count: totalPlans,
          next: nextPage,
          pages: totalPages,
          prev: prevPage,
        },
        results: dailyPlansWithExercises,
      },
      "Daily plans fetched successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching daily plans:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(getDailyPlans);

