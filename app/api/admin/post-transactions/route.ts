import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed

// POST /api/transaction
export async function POST(req: Request) {
  try {
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
    if (
      !userId ||
      amount === undefined ||
      !currency ||
      !status ||
      !startingAt ||
      !endingAt
    ) {
      return NextResponse.json(
        { message: "Missing required parameters: userId, amount, currency, status, startingAt, endingAt" },
        { status: 400 }
      );
    }

    // Parse dates
    if (typeof startingAt !== "string" || typeof endingAt !== "string") {
      return NextResponse.json(
        { message: "startingAt and endingAt must be ISO date strings" },
        { status: 400 }
      );
    }
    const startDate = new Date(startingAt);
    const endDate = new Date(endingAt);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid date format for startingAt or endingAt" },
        { status: 400 }
      );
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
    // const transaction = await prisma.transaction.create({ data: transactionData });

    return NextResponse.json(
    //   { message: "Transaction created successfully", transaction },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { message: "Internal server error creating transaction", error: error.message },
      { status: 500 }
    );
  }
}
