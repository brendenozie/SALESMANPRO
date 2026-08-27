// ts
// app/api/communications/today/route.ts
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
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const communicationsToday = await prisma.communication.count({
      where: { createdAt: { gte: today } },
    });

    return formatResponse(true, { today: communicationsToday });
  } catch (error: any) {
    console.error("Error fetching today's communications:", error);
    return formatResponse(false, null, error.message || "Internal server error", 500);
  }
});

