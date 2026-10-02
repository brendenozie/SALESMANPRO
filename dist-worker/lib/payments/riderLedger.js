"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creditRiderEarning = exports.RiderLedgerService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
class RiderLedgerService {
    /**
     * Credits a completed delivery to the rider's ledger.
     * Runs in a transaction to guarantee ledger record creation and wallet credit consistency.
     */
    static async creditEarning(payload) {
        const { riderProfileId, assignmentId, deliveryRequestId, orderId, storeId, grossAmount, platformCommission, netAmount, paymentType = "GHUBA_ESCROW", } = payload;
        // Check if an earning has already been recorded for this assignment to prevent duplicate credits
        const existing = await prismadb_1.default.riderEarning.findFirst({
            where: { assignmentId },
        });
        if (existing) {
            console.warn(`[RIDER_LEDGER] Earning already credited for assignment ${assignmentId}`);
            return existing;
        }
        return await prismadb_1.default.$transaction(async (tx) => {
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
            }
            else {
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
    static async requestPayout(payload) {
        const { riderProfileId, amount, payoutMethod = "MPESA", destinationAccount } = payload;
        const MIN_PAYOUT_AMOUNT = 100.0; // KSH 100 minimum payout
        if (amount < MIN_PAYOUT_AMOUNT) {
            throw new Error(`Minimum payout withdrawal amount is KSH ${MIN_PAYOUT_AMOUNT}.`);
        }
        const rider = await prismadb_1.default.riderProfile.findUnique({
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
            throw new Error(`Insufficient wallet balance. Available: KSH ${rider.walletBalance.toLocaleString()}, Requested: KSH ${amount.toLocaleString()}`);
        }
        return await prismadb_1.default.$transaction(async (tx) => {
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
    static async settlePayout(payoutId, success, transactionReference, gatewayResponse, failureReason) {
        const payout = await prismadb_1.default.riderPayout.findUnique({
            where: { id: payoutId },
        });
        if (!payout) {
            throw new Error(`Payout ${payoutId} not found.`);
        }
        if (payout.status !== "PENDING" && payout.status !== "PROCESSING") {
            throw new Error(`Payout ${payoutId} is already in ${payout.status} state.`);
        }
        if (success) {
            return await prismadb_1.default.riderPayout.update({
                where: { id: payoutId },
                data: {
                    status: "COMPLETED",
                    transactionReference: transactionReference || null,
                    gatewayResponse: gatewayResponse || null,
                    processedAt: new Date(),
                },
            });
        }
        else {
            // Payout failed: Refund the amount back to rider's wallet
            return await prismadb_1.default.$transaction(async (tx) => {
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
    static async getRiderFinancialSummary(riderProfileId) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const [rider, todayEarnings, weekEarnings, pendingPayouts, recentEarnings, recentPayouts] = await Promise.all([
            prismadb_1.default.riderProfile.findUnique({
                where: { id: riderProfileId },
                select: {
                    walletBalance: true,
                    totalEarnings: true,
                    totalCompletedDeliveries: true,
                    payoutMethod: true,
                    mpesaPhone: true,
                },
            }),
            prismadb_1.default.riderEarning.aggregate({
                where: {
                    riderProfileId,
                    createdAt: { gte: startOfToday },
                },
                _sum: { netAmount: true },
                _count: { id: true },
            }),
            prismadb_1.default.riderEarning.aggregate({
                where: {
                    riderProfileId,
                    createdAt: { gte: startOfWeek },
                },
                _sum: { netAmount: true },
            }),
            prismadb_1.default.riderPayout.aggregate({
                where: {
                    riderProfileId,
                    status: "PENDING",
                },
                _sum: { amount: true },
            }),
            prismadb_1.default.riderEarning.findMany({
                where: { riderProfileId },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            prismadb_1.default.riderPayout.findMany({
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
exports.RiderLedgerService = RiderLedgerService;
exports.creditRiderEarning = RiderLedgerService.creditEarning;
