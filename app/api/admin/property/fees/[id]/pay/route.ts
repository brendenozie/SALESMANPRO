import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { cacheDel } from "@/lib/cache";

const processPayment = async (
  req: Request,
  context: { params: { id: string }; user?: any },
) => {
  const { id: feeId } = context.params;
  const companyId = context.user?.companyId;
  const body = await req.json();

  // The actual amount handed to you by the student
  const paymentAmount = Number(body.amount);

  if (!paymentAmount || paymentAmount <= 0) {
    return NextResponse.json(
      { message: "Invalid payment amount" },
      { status: 400 },
    );
  }

  // 1. Fetch the existing invoice and the member's current balance
  const fee = await prisma.hostelFee.findUnique({
    where: { id: feeId, companyId },
    include: { hostelMember: true },
  });

  if (!fee) {
    return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
  }

  if (fee.status === "PAID") {
    return NextResponse.json(
      { message: "This invoice is already fully paid." },
      { status: 400 },
    );
  }

  // 2. Calculate the math
  const amountOwed = fee.totalAmount - fee.amountPaid;

  let newFeeAmountPaid = fee.amountPaid + paymentAmount;
  let newFeeStatus: "OVERDUE" | "PARTIAL" | "PENDING" | "PAID" = fee.status;
  let excessToWallet = 0;

  // Scenario A: They overpaid (Advance payment for future months)
  if (paymentAmount > amountOwed) {
    newFeeAmountPaid = fee.totalAmount; // Max out this invoice
    newFeeStatus = "PAID";
    excessToWallet = paymentAmount - amountOwed; // The rest goes to the wallet
  }
  // Scenario B: They paid exactly what they owed
  else if (paymentAmount === amountOwed) {
    newFeeStatus = "PAID";
  }
  // Scenario C: Partial payment
  else {
    newFeeStatus = "PARTIAL";
  }

  // 3. Execute the Prisma Transaction (All or Nothing)
  try {
    const transactionOperations = [];

    // Operation 1: Update the invoice
    transactionOperations.push(
      prisma.hostelFee.update({
        where: { id: feeId },
        data: {
          amountPaid: newFeeAmountPaid,
          status: newFeeStatus,
        },
      }),
    );

    // Operation 2: If there is excess money, add it to the wallet
    if (excessToWallet > 0) {
      transactionOperations.push(
        prisma.hostelMember.update({
          where: { id: fee.hostelMemberId },
          data: {
            accountBalance: { increment: excessToWallet },
          },
        }),
      );
    }

    // Run the transaction
    const [updatedFee] = await prisma.$transaction(transactionOperations);

    // 4. Clean up caches so the UI updates instantly
    try {
      await cacheDel(`admin:fee:${feeId}`);
      await cacheDel(`admin:fees:${companyId}:*`);
    } catch (e) {}

    return NextResponse.json(
      {
        message: "Payment processed successfully",
        data: { updatedFee, addedToWallet: excessToWallet },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Payment Transaction Failed:", error);
    return NextResponse.json(
      { message: "Transaction failed. No changes were made." },
      { status: 500 },
    );
  }
};

export const POST = withApiHandler(processPayment, {
  requireAuth: true,
  requireRateLimit: true,
});
