import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { page, userId} = req.query;

  if (req.method === "GET") {

    if (page === undefined) page = "0";

    let currentPage = parseInt(page.toString()) || 1;
    let skip = currentPage > 1 ? (currentPage - 1) * 20 : 0;

    // Determine the current day
    // let siku = new Date();
    // const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // let day = weekday[siku.getDay()];

    let userIdString = "";

  if(userId){
    userIdString  = Array.isArray(userId) ? userId[0] : userId; // Ensure userId is a string
    }
    
  if(!userIdString){
    return res.status(400).json({ message: 'Invalid date format provided' });
  }

    // Fetch the count and DailyPlans
    const [totalPlans, dailyPlans] = await prisma.$transaction([
      prisma.dailyPlan.count({
        where: {
          userId:userIdString
        },
      }),
      prisma.dailyPlan.findMany({
        skip: skip,
        take: 20,
        where: {
          userId:userIdString
        },
      }),
    ]);

    // Extract exercise IDs from the dailyPlans
    const exerciseIds = dailyPlans.flatMap(plan => plan.exerciseId);

    // Fetch all exercises in one query
    const exercises = await prisma.exercise.findMany({
      where: {
        id: {
          in: exerciseIds,
        },
      },
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
              breakSet:true,
              exSteps: true,
              exCalories: true,
              exHeartBeat: true,
              caloriesPerRep:true,
      },
    });

    // Create a map of exercises by ID for easy lookup
    const exerciseMap = exercises.reduce((acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    }, {} as Record<string, typeof exercises[0]>);

    // Attach exercises to their respective DailyPlans
    const dailyPlansWithExercises = dailyPlans.map(plan => ({
      ...plan,
      exercises: plan.exerciseId.map(id => exerciseMap[id] || null).filter(Boolean),
    }));

    // Calculate pagination details
    const totalPages = Math.ceil(totalPlans / 20);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const prevPage = currentPage > 1 ? currentPage - 1 : null;

    // Respond with the combined result
    res.json({
      InfoResponse: {
        count: totalPlans,
        next: nextPage,
        pages: totalPages,
        prev: prevPage,
      },
      results: dailyPlansWithExercises,
    });
  } else {
    return res.status(405).json({ message: `The HTTP ${req.method} method is not supported at this route.` });
  }
}
