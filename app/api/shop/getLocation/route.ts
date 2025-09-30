// app/api/location/route.ts
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyAuth } from "@/lib/verifyAuth";

// GET /api/location?userId=&agentId=
async function getLocation(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const agentId = searchParams.get("agentId");

    if (!userId) {
      return formatResponse(false, null, "Missing required parameter: userId", 400);
    }

    // Optional: filter by agentId if needed
    // const whereClause: any = { userId };
    // if (agentId) whereClause.agentId = agentId;

    const location = await prisma.location.findFirst({
      where: { userId: String(userId) },
    });

    if (!location) {
      return formatResponse(false, null, "Location not found", 404);
    }

    return formatResponse(true, location);
  } catch (error: any) {
    console.error("Error fetching location:", error);
    return formatResponse(false, null, "Server error fetching location", 500);
  }
}

export const GET = withApiHandler(getLocation);
