
// app/api/tasks/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const GET = withApiHandler(async (req: Request) => {

  try {
    // Example: fetch all tasks, ordered by dueTime ascending
    const tasks = await prisma.task.findMany({
      orderBy: { dueTime: "asc" },
    });

    return formatResponse(true, tasks);
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return formatResponse(false, null, error.message || "Internal server error", 500);
  }
});

