/**
 * lib/payments/riderLedger.ts
 *
 * Authoritative Rider Financial Ledger & Payout System for SalesmanPro On-Demand Delivery.
 * Manages:
 * - Immutable earning ledger records (RiderEarning)
 * - Platform commission deductions
 * - Wallet balance accounting
 * - Payout request validation & M-Pesa settlement integration
 * - Financial reporting & dispute holds
 */

import prisma from "@/server/db/prismadb";

export interface CreditEarningPayload {
  riderProfileId: string;
  assignmentId: string;
  deliveryRequestId?: string;
  orderId?: string;
  storeId?: string;
  grossAmount: number;
  platformCommission: number;
  netAmount: number;
  paymentType?: string;
}

export interface RequestPayoutPayload {
  riderProfileId: string;
  amount: number;
  payoutMethod?: "MPESA" | "BANK";
  destinationAccount: string;
}

export class RiderLedgerService {
  /**
   * Credits a completed delivery to the rider's ledger.
   * Runs in a transaction to guarantee ledger record creation and wallet credit consistency.
   */
  public static async creditEarning(payload: CreditEarningPayload) {
    const {
      riderProfileId,
      assignmentId,
      deliveryRequestId,
      orderId,
      storeId,
      grossAmount,
      platformCommission,
      netAmount,
      paymentType = "GHUBA_ESCROW",
    } = payload;

    // Check if an earning has already been recorded for this assignment to prevent duplicate credits
    const existing = await prisma.riderEarning.findFirst({
      where: { assignmentId },
    });

    if (existing) {
      console.warn(`[RIDER_LEDGER] Earning already credited for assignment ${assignmentId}`);
      return existing;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create immutable ledger entry
      const earning = await tx.riderEarning.create({
        data: {
          riderProfileId,
          assignmentId,
          deliveryRequestId,
          orderId,
          storeId,
          grossAmount,
          platformCommission,
          netAmount,
          paymentType,
          status: "EARNED",
        },
      });

      // 2. Update rider wallet balance and total earnings based on payment type
      if (paymentType === "CASH_ON_PICKUP" || paymentType === "CASH_ON_DELIVERY") {
        // Rider collected full gross amount in cash from store or customer.
        // Ghuba's 4% transaction cost is debited from rider's wallet balance.
        await tx.riderProfile.update({
          where: { id: riderProfileId },
          data: {
            walletBalance: { decrement: platformCommission },
            totalEarnings: { increment: netAmount },
          },
        });
      } else {
        // GHUBA_ESCROW: Store deposited the delivery fee with Ghuba upfront.
        // Release escrow and credit net rider earnings directly into rider's wallet.
        await tx.riderProfile.update({
          where: { id: riderProfileId },
          data: {
            walletBalance: { increment: netAmount },
            totalEarnings: { increment: netAmount },
          },
        });

        if (deliveryRequestId) {
          await tx.deliveryRequest.update({
            where: { id: deliveryRequestId },
            data: { escrowStatus: "RELEASED_TO_RIDER" },
          });
          await tx.deliveryAssignment.update({
            where: { id: assignmentId },
            data: { escrowStatus: "RELEASED_TO_RIDER" },
          });
        }
      }

      return earning;
    });
  }

  /**
   * Submits a withdrawal / payout request from the rider's active wallet balance.
   */
  public static async requestPayout(payload: RequestPayoutPayload) {
    const { riderProfileId, amount, payoutMethod = "MPESA", destinationAccount } = payload;

    const MIN_PAYOUT_AMOUNT = 100.0; // KSH 100 minimum payout

    if (amount < MIN_PAYOUT_AMOUNT) {
      throw new Error(`Minimum payout withdrawal amount is KSH ${MIN_PAYOUT_AMOUNT}.`);
    }

    const rider = await prisma.riderProfile.findUnique({
      where: { id: riderProfileId },
      select: { walletBalance: true, verificationStatus: true, phone: true },
    });

    if (!rider) {
      throw new Error("Rider profile not found.");
    }

    if (rider.verificationStatus !== "APPROVED") {
      throw new Error("Only verified riders can request earnings payouts.");
    }

    if (rider.walletBalance < amount) {
      throw new Error(
        `Insufficient wallet balance. Available: KSH ${rider.walletBalance.toLocaleString()}, Requested: KSH ${amount.toLocaleString()}`
      );
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Deduct requested amount from wallet balance
      await tx.riderProfile.update({
        where: { id: riderProfileId },
        data: {
          walletBalance: { decrement: amount },
        },
      });

      // 2. Create pending payout transaction
      const payout = await tx.riderPayout.create({
        data: {
          riderProfileId,
          amount,
          payoutMethod,
          destinationAccount: destinationAccount || rider.phone,
          status: "PENDING",
        },
      });

      return payout;
    });
  }

  /**
   * Settles a payout (e.g. after M-Pesa B2C callback or Admin Approval).
   */
  public static async settlePayout(
    payoutId: string,
    success: boolean,
    transactionReference?: string,
    gatewayResponse?: any,
    failureReason?: string
  ) {
    const payout = await prisma.riderPayout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new Error(`Payout ${payoutId} not found.`);
    }

    if (payout.status !== "PENDING" && payout.status !== "PROCESSING") {
      throw new Error(`Payout ${payoutId} is already in ${payout.status} state.`);
    }

    if (success) {
      return await prisma.riderPayout.update({
        where: { id: payoutId },
        data: {
          status: "COMPLETED",
          transactionReference: transactionReference || null,
          gatewayResponse: gatewayResponse || null,
          processedAt: new Date(),
        },
      });
    } else {
      // Payout failed: Refund the amount back to rider's wallet
      return await prisma.$transaction(async (tx) => {
        await tx.riderProfile.update({
          where: { id: payout.riderProfileId },
          data: {
            walletBalance: { increment: payout.amount },
          },
        });

        return await tx.riderPayout.update({
          where: { id: payoutId },
          data: {
            status: "FAILED",
            failureReason: failureReason || "Payment provider declined transaction",
            processedAt: new Date(),
          },
        });
      });
    }
  }

  /**
   * Retrieves full earnings & payout summary for a rider.
   */
  public static async getRiderFinancialSummary(riderProfileId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [rider, todayEarnings, weekEarnings, pendingPayouts, recentEarnings, recentPayouts] =
      await Promise.all([
        prisma.riderProfile.findUnique({
          where: { id: riderProfileId },
          select: {
            walletBalance: true,
            totalEarnings: true,
            totalCompletedDeliveries: true,
            payoutMethod: true,
            mpesaPhone: true,
          },
        }),
        prisma.riderEarning.aggregate({
          where: {
            riderProfileId,
            createdAt: { gte: startOfToday },
          },
          _sum: { netAmount: true },
          _count: { id: true },
        }),
        prisma.riderEarning.aggregate({
          where: {
            riderProfileId,
            createdAt: { gte: startOfWeek },
          },
          _sum: { netAmount: true },
        }),
        prisma.riderPayout.aggregate({
          where: {
            riderProfileId,
            status: "PENDING",
          },
          _sum: { amount: true },
        }),
        prisma.riderEarning.findMany({
          where: { riderProfileId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.riderPayout.findMany({
          where: { riderProfileId },
          orderBy: { requestedAt: "desc" },
          take: 10,
        }),
      ]);

    return {
      walletBalance: rider?.walletBalance ?? 0,
      totalEarnings: rider?.totalEarnings ?? 0,
      totalCompletedDeliveries: rider?.totalCompletedDeliveries ?? 0,
      todayEarnings: todayEarnings._sum.netAmount ?? 0,
      todayJobs: todayEarnings._count.id ?? 0,
      weekEarnings: weekEarnings._sum.netAmount ?? 0,
      pendingPayoutsAmount: pendingPayouts._sum.amount ?? 0,
      defaultPayoutMethod: rider?.payoutMethod ?? "MPESA",
      defaultMpesaPhone: rider?.mpesaPhone,
      recentEarnings,
      recentPayouts,
    };
  }
}

export const creditRiderEarning = RiderLedgerService.creditEarning;
