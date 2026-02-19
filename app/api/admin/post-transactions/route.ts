import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// app/api/transaction/route.ts
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

export const POST = withApiHandler(async (req: Request) => {
  const auth = await verifyAuth(req);
  if (!auth.success) {
    return formatResponse(false, null, auth.error, 401);
  }

  // Parse JSON body
  const {
    userId,
    subscriptionPlanId,
    amount,
    status,
    currency,
    startingAt,
    endingAt,
  } = await req.json();

  // Validate required fields
  if (!userId || amount === undefined || !currency || !status || !startingAt || !endingAt) {
    return formatResponse(
      false,
      null,
      "Missing required parameters: userId, amount, currency, status, startingAt, endingAt",
      400
    );
  }

  // Validate dates
  if (typeof startingAt !== "string" || typeof endingAt !== "string") {
    return formatResponse(false, null, "startingAt and endingAt must be ISO date strings", 400);
  }

  const startDate = new Date(startingAt);
  const endDate = new Date(endingAt);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return formatResponse(false, null, "Invalid date format for startingAt or endingAt", 400);
  }

  // Build transaction payload
  const transactionData: any = {
    amount,
    currency,
    status,
    user: { connect: { id: userId } },
    startingAt: startDate,
    endingAt: endDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (subscriptionPlanId) {
    transactionData.subscriptionPlan = { connect: { id: subscriptionPlanId } };
  }

  // Create transaction
  const transaction = await prisma.transaction.create({ data: transactionData });

  
    try { await cacheDel(`admin:post-transactions:${subscriptionPlanId || 'global'}:*`); } catch (e) {}
    return formatResponse(true, { transaction }, "Transaction created successfully", 201);
});
