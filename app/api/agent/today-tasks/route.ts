ts
// app/api/tasks/today/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";

export const GET = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  try {
    // Define today's and tomorrow's UTC boundaries
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(today.getUTCDate() + 1);

    // Fetch tasks due today only
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: today,    // Start of today
          lt: tomorrow,  // Before tomorrow
        },
      },
      orderBy: { dueTime: "asc" },
    });

    return formatResponse(true, tasks);
  } catch (error: any) {
    console.error("Error fetching today's tasks:", error);
    return formatResponse(false, null, error.message || "Internal server error", 500);
  }
});

