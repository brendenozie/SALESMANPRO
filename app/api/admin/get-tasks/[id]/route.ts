import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method not allowed" });
  }

  try {
    // Define today's and tomorrow's UTC date boundaries
    // const today = new Date();
    // today.setUTCHours(0, 0, 0, 0); // Start of today
    // const tomorrow = new Date(today);
    // tomorrow.setUTCDate(today.getUTCDate() + 1); // Start of tomorrow

    // Fetch tasks due today
    // Fetch tasks due today
    const amaId = req.query.id as string
    const { searchParams } = new URL(req.url);
    
      const agentId = searchParams.get("agentId");
      const limit = parseInt(searchParams.get("limit") || "10", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);
    
      if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
        return NextResponse.json(
          { message: "Invalid pagination parameters." },
          { status: 400 }
        );
      }
    
      
    const tasks = await prisma.task.findFirst({
      where: {
        id: amaId,
      },
      // orderBy: { dueTime: "asc" }, // Order by time
    });

    // Respond with the tasks
    res.status(200).json(tasks);

    // Respond with the tasks
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    NextResponse.json({ message: "Internal server error" });
  }
}
