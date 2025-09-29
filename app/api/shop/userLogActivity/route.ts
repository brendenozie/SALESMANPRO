import prisma from "@/server/db/prismadb";
import { rateLimit } from "@/lib/rate-limit";
import { formatResponse } from "@/lib/formatResponse";
import { verifyAuth } from "@/lib/verifyAuth";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// Optional: Define allowed action types
const VALID_ACTIONS = ["view", "purchase", "favorite"];

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
    const { userId, productId, action } = await req.json();

    if (!userId || !productId || !action) {
      return formatResponse(false, null, "Missing userId, productId, or action", 400);
    }

    if (!VALID_ACTIONS.includes(action)) {
      return formatResponse(
        false,
        null,
        `Invalid action type. Allowed: ${VALID_ACTIONS.join(", ")}`,
        400
      );
    }

    const activity = await prisma.userActivity.create({
      data: { userId, productId, action },
    });

    return formatResponse(true, activity, "User activity logged successfully", 200);
  } catch (error: any) {
    console.error("Error logging user activity:", error);
    return formatResponse(false, null, "Internal Server Error", 500, error.message);
  }
}

export const POST = withApiHandler(handler);

export async function GET() {
  return formatResponse(false, null, "Method Not Allowed", 405);
}
