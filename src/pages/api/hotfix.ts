import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../server/db/prismadb";
import { startOfDay, endOfDay, addDays,subDays  } from 'date-fns';

// Define your types
interface AverageCaloriesSummary {
  totalCalories: number;
  averageCalories: number;
}

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
 

  try {
    // Set the release date and end date for the selected challenges
        const today = startOfDay(new Date());
        const newReleaseDate = startOfDay(subDays(today, 90));
        const newEndDate = endOfDay(subDays(today, 60)); // Set the challenge to run for 30 days

    // Find all exercises where exerciseCategoryId is a string
    // Fetch exercises where exerciseCategoryId is still a string
      const exercises = await prisma.waterIntakeChallenges.findMany({
        // where: {
        //   exerciseCategoryId: {
        //     // Check if exerciseCategoryId is a string
        //     contains: ''
        //   },
        // },
      });

      if (exercises.length === 0) {
        return res.status(200).json({ message: 'No exercises found with string exerciseCategoryId' });
      }
    
    // Create an array of update promises
      const updatePromises = exercises.map((exercise) => {
        // const exerciseCategoryIdStr = exercise.exerciseCategoryId;

        return prisma.waterIntakeChallenges.updateMany({
          where: {
            id: exercise.id, // Use the correct field for where clause (change `_id` to `id` if needed)
          },
          data: {
                    releaseDate: newReleaseDate,
                    endDate: newEndDate,
                },
        });
      });

      // Execute all updates in parallel
      await Promise.all(updatePromises);

      // Respond with success
      return res.status(200).json({ message: 'ExerciseCategoryId fields updated successfully' });
    
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const getAverageCaloriesSummary = async (start: Date, end: Date): Promise<AverageCaloriesSummary> => {
  const caloriesFromDb = await prisma.exerciseActivity.findMany({
    where: {
      timestamp: {
        gte: start,
        lte: end,
      },
    },
    select: {
      acCalories: true,
    },
  });

  const totalCalories = caloriesFromDb.reduce((acc, activity) => acc + activity.acCalories, 0);
  const count = caloriesFromDb.length;
  const averageCalories = count > 0 ? totalCalories / count : 0;

  return {
    totalCalories,
    averageCalories,
  };
};
