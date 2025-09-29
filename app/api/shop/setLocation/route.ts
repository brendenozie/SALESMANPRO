import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { rateLimit } from "@/lib/rate-limit";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// POST /api/location
async function handler(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  const ip = req.headers.get("x-forwarded-for") || "local";

  if (!rateLimit(ip)) {
    return formatResponse(false, null, "Too many requests", 429);
  }

  try {
    const { userId, latitude, longitude, address, description } = await req.json();

    if (!userId || !latitude || !longitude || !address) {
      return formatResponse(false, null, "All fields are required", 400);
    }

    const location = await prisma.location.upsert({
      where: { userId },
      update: { latitude, longitude, address, description },
      create: { userId, latitude, longitude, address, description },
    });

    return formatResponse(true, location, "Location updated successfully", 200);
  } catch (error: any) {
    console.error("Error updating location:", error);
    return formatResponse(false, null, "Server error updating location", 500, error.message);
  }
}

export const POST = withApiHandler(handler);
