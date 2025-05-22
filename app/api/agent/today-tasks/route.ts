import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Define today's and tomorrow's UTC date boundaries
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1); // Start of tomorrow

    // Fetch tasks due today
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: today.toISOString(), // Start of today
          lt: tomorrow.toISOString(), // Start of tomorrow
        },
      },
      orderBy: { dueTime: "asc" }, // Order by time
    });

    // Respond with the tasks
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
