// app/api/subscription-plans/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =============== GET ===============
async function getSubscriptionPlans(request: Request) {
  const { searchParams } = new URL(request.url);

  const agentId = searchParams.get("agentId");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return formatResponse(false, null, "Invalid pagination parameters", 400);
  }

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.subscriptionPlan.count();

    return formatResponse(true, {
      total: totalCount,
      page,
      limit,
      plans,
    });
  } catch (error: any) {
    console.error("GET /api/subscription-plans error:", error);
    return formatResponse(
      false,
      null,
      error.message || "Error fetching subscription plans",
      500
    );
  }
}

export const GET = withApiHandler(getSubscriptionPlans);
