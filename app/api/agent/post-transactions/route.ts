typescript
// app/api/post/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { verifyAuth } from "@/lib/verifyAuth";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function handleTransaction(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);

  if (req.method !== "POST") {
    return formatResponse(false, null, "Method not allowed", 405);
  }

  try {
    const body = await req.json();
    const {
      userId,
      subscriptionPlanId,
      amount,
      status,
      currency,
      startingAt,
      endingAt,
    } = body;

    if (
      !userId ||
      amount === undefined ||
      !currency ||
      !status ||
      !startingAt ||
      !endingAt
    ) {
      return formatResponse(
        false,
        null,
        "Please provide required parameters",
        400
      );
    }

    if (typeof startingAt !== "string" || typeof endingAt !== "string") {
      return formatResponse(
        false,
        null,
        "Please provide startingAt and endingAt as strings",
        400
      );
    }

    const tareheStart = new Date(startingAt);
    const tareheEnd = new Date(endingAt);

    if (isNaN(tareheStart.getTime()) || isNaN(tareheEnd.getTime())) {
      return formatResponse(false, null, "Invalid date format", 400);
    }

    const transactionData: any = {
      amount,
      currency,
      status, // TODO: update after payment confirmation
      user: { connect: { id: userId } },
      startingAt: tareheStart,
      endingAt: tareheEnd,
    };

    if (subscriptionPlanId) {
      transactionData.subscriptionPlan = { connect: { id: subscriptionPlanId } };
    }

    // Uncomment when ready to persist:
    // const transaction = await prisma.transaction.create({
    //   data: transactionData,
    // });

    return formatResponse(
      true,
      transactionData,
      "Transaction created successfully (mocked)",
      201
    );
  } catch (error: any) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export const POST = withApiHandler(handleTransaction);

