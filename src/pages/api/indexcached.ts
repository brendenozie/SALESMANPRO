import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../server/db/prismadb";
import Redis from 'redis';

// Initialize Redis client
const redisClient = Redis.createClient();
const CACHE_TTL = 60; // Cache time-to-live in seconds

// Utility function to generate cache key based on query parameters
const generateCacheKey = (queryParams: any) => {
  return `exercise_${JSON.stringify(queryParams)}`;
};

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { category, focusArea, level, query, page } = req.query;

    let currentPage = page ? Number(page) : 1;
    let skip = currentPage > 1 ? (currentPage - 1) * 5 : 0;

    // Create filters based on provided query parameters
    const filters: any = {};

    if (category && category !== 'All') {
      filters.exerciseCategoryId = category.toString();
    }
    if (focusArea && focusArea !== 'All') {
      filters.focusArea = { has: focusArea.toString() };
    }
    if (level && level !== 'All') {
      filters.level = level.toString();
    }
    if (query) {
      filters.OR = [
        { exName: { contains: query.toString(), mode: 'insensitive' } },
        { exDesc: { contains: query.toString(), mode: 'insensitive' } }
      ];
    }

    // Generate a cache key based on query parameters
    const cacheKey = generateCacheKey({ category, focusArea, level, query, page });

    // Check cache
    // redisClient.get(cacheKey, async (err, cachedData) => {
    //   if (cachedData) {
    //     // Return cached response
    //     return res.status(200).json(JSON.parse(cachedData));
    //   }

    //   try {
    //     const results = await prisma.$transaction([
    //       prisma.exercise.count({ where: filters }),
    //       prisma.exercise.findMany({
    //         skip: skip,
    //         take: 5,
    //         where: filters,
    //       }),
    //     ]);

    //     // Prepare response data
    //     const responseData = {
    //       InfoResponse: {
    //         count: results[0] ?? 0,
    //         next: currentPage * 5 >= results[0] ? 0 : currentPage + 1,
    //         pages: Math.ceil(results[0] / 5),
    //         prev: currentPage > 1 ? currentPage - 1 : 0
    //       },
    //       results: results[1]
    //     };

    //     // Cache the response data
    //     redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(responseData));

    //     return res.status(200).json(responseData);
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //     return res.status(500).json({ error: 'Failed to fetch data' });
    //   }
    // });
  } else {
    return res.status(405).json({
      error: `The HTTP ${req.method} method is not supported at this route.`
    });
  }
}
