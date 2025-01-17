import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../server/db/prismadb";

// Define the API route
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  const { category, focusArea, level, query } = req.query;

  try {
    // Create filters based on provided query parameters
    const filters: any = {};

    // Filter by category if provided
    if (category && category !== 'All') {
      filters.exerciseCategoryId = category.toString();
    }

    // Filter by focus area if provided
    if (focusArea && focusArea !== 'All') {
      filters.focuseArea = { has: focusArea.toString() }; // Assuming focusArea is an array
    }

    // Filter by level if provided
    if (level && level !== 'All') {
      filters.level = level.toString();
    }

    // Filter by search query if provided
    if (query) {
      filters.OR = [
        { exName: { contains: query.toString(), mode: 'insensitive' } },
        { exDesc: { contains: query.toString(), mode: 'insensitive' } }
      ];
    }

    // Fetch filtered exercises from the database
    const exercises = await prisma.exercise.findMany({
      where: filters,
      select: {
        id: true,
        exName: true,
        exDuration: true,
        exDesc: true,
        exPic: true,
        exVideo: true,
        status: true,
        reps: true,
        sets: true,
        breakSet: true,
        exerciseCategoryId: true,
        exSteps: true,
        exCalories: true,
        exHeartBeat: true,
        focusArea: true,
        type: true,
        level: true,
      },
    });

    res.status(200).json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
