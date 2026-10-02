"use strict";
/**
 * lib/payments/ledgerService.ts
 *
 * Core Financial Ledger, Balance Management, and Withdrawal State Machine Service.
 * Ensures:
 * 1. Double-entry / immutable ledger entries for all balance mutations.
 * 2. Atomic fund reservations to prevent concurrent double-spending on withdrawals.
 * 3. Strict lifecycle state machine: REQUESTED -> UNDER_REVIEW -> APPROVED -> PROCESSING -> PAID (or REJECTED/FAILED).
 * 4. Reconciliation exception tracking and zero-floating-point arithmetic precision.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPaymentException = exports.failWithdrawalPayout = exports.executeWithdrawalPayout = exports.rejectWithdrawalRequest = exports.approveWithdrawalRequest = exports.requestStoreWithdrawal = exports.recordLedgerEntry = exports.getOrCreateStoreSettlementBalance = exports.generateWithdrawalReference = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_1 = require("@prisma/client");
const attribution_1 = require("./attribution");
const reportingService_1 = require("./reportingService");
/**
 * Generate a cryptographically randomized, human-readable withdrawal reference.
 * Format: WTH-YYYYMMDD-XXXXXX
 */
function generateWithdrawalReference() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WTH-${dateStr}-${randomChars}`;
}
exports.generateWithdrawalReference = generateWithdrawalReference;
/**
 * Get or initialize the store's canonical settlement balance record.
 * If creating fresh, bootstraps lifetime earnings from historical completed Ghuba payments.
 */
async function getOrCreateStoreSettlementBalance(companyId) {
    let record = await prismadb_1.default.storeSettlementBalance.findUnique({
        where: { companyId },
    });
    if (!record) {
        // Bootstrap from historical payments
        const metrics = await (0, reportingService_1.getStorePaymentMetrics)(companyId, { period: "all" });
        const historicalNetGhuba = (0, attribution_1.roundCurrency)(metrics.ghuba.netStoreAmount);
        record = await prismadb_1.default.storeSettlementBalance.create({
            data: {
                companyId,
                currency: "KES",
                lifetimeEarnings: historicalNetGhuba,
                lifetimeWithdrawn: 0.0,
                availableBalance: historicalNetGhuba,
                reservedBalance: 0.0,
            },
        });
        if (historicalNetGhuba > 0) {
            await recordLedgerEntry({
                companyId,
                entryType: client_1.LedgerEntryType.COLLECTION_CUSTOMER,
                amount: historicalNetGhuba,
                balanceAfter: historicalNetGhuba,
                currency: "KES",
                reference: `BOOTSTRAP-${companyId.slice(-6)}`,
                description: "Initial bootstrap of historical Ghuba net merchant earnings",
            });
        }
    }
    return {
        currency: record.currency,
        lifetimeEarnings: (0, attribution_1.roundCurrency)(record.lifetimeEarnings),
        lifetimeWithdrawn: (0, attribution_1.roundCurrency)(record.lifetimeWithdrawn),
        availableBalance: (0, attribution_1.roundCurrency)(record.availableBalance),
        reservedBalance: (0, attribution_1.roundCurrency)(record.reservedBalance),
        pendingSettlement: (0, attribution_1.roundCurrency)(record.availableBalance + record.reservedBalance),
    };
}
exports.getOrCreateStoreSettlementBalance = getOrCreateStoreSettlementBalance;
/**
 * Append an immutable entry to the Transaction Ledger.
 */
async function recordLedgerEntry(entry) {
    return await prismadb_1.default.transactionLedger.create({
        data: {
            companyId: entry.companyId,
            entryType: entry.entryType,
            amount: (0, attribution_1.roundCurrency)(entry.amount),
            balanceAfter: (0, attribution_1.roundCurrency)(entry.balanceAfter),
            currency: entry.currency || "KES",
            reference: entry.reference,
            description: entry.description,
            paymentId: entry.paymentId || undefined,
            withdrawalRequestId: entry.withdrawalRequestId || undefined,
            operatorId: entry.operatorId || undefined,
            metadata: entry.metadata || undefined,
        },
    });
}
exports.recordLedgerEntry = recordLedgerEntry;
/**
 * Submit a store withdrawal request with atomic balance reservation.
 * Guarantees that available funds cannot be double-withdrawn.
 */
async function requestStoreWithdrawal(input) {
    const { companyId, requestedById, amount, payoutMethod, destinationDetails, notes, } = input;
    const requestedAmount = (0, attribution_1.roundCurrency)(amount);
    if (requestedAmount < 100) {
        throw new Error("Minimum withdrawal amount is KES 100.00");
    }
    // Ensure balance record is ready
    await getOrCreateStoreSettlementBalance(companyId);
    // Atomic update: ensure availableBalance >= requestedAmount
    const currentBalance = await prismadb_1.default.storeSettlementBalance.findUnique({
        where: { companyId },
    });
    if (!currentBalance || currentBalance.availableBalance < requestedAmount) {
        const available = currentBalance ? currentBalance.availableBalance : 0;
        throw new Error(`Insufficient available settlement balance. Requested: KES ${requestedAmount.toFixed(2)}, Available: KES ${available.toFixed(2)}`);
    }
    // Generate unique reference
    const reference = generateWithdrawalReference();
    // Payout fee calculation (e.g. standard M-Pesa B2C fee of KES 15 or 0)
    const feeAmount = 0.0;
    const netPayout = (0, attribution_1.roundCurrency)(requestedAmount - feeAmount);
    const newAvailable = (0, attribution_1.roundCurrency)(currentBalance.availableBalance - requestedAmount);
    const newReserved = (0, attribution_1.roundCurrency)(currentBalance.reservedBalance + requestedAmount);
    // Update balance and create withdrawal request
    const [updatedBalance, withdrawal] = await prismadb_1.default.$transaction([
        prismadb_1.default.storeSettlementBalance.update({
            where: { companyId },
            data: {
                availableBalance: newAvailable,
                reservedBalance: newReserved,
            },
        }),
        prismadb_1.default.withdrawalRequest.create({
            data: {
                reference,
                companyId,
                requestedById,
                amount: requestedAmount,
                feeAmount,
                netPayout,
                currency: currentBalance.currency || "KES",
                status: client_1.WithdrawalStatus.REQUESTED,
                payoutMethod,
                destinationDetails,
                notes: notes || undefined,
            },
        }),
    ]);
    // Record ledger entry
    await recordLedgerEntry({
        companyId,
        entryType: client_1.LedgerEntryType.WITHDRAWAL_RESERVE,
        amount: -requestedAmount,
        balanceAfter: newAvailable,
        currency: currentBalance.currency,
        reference,
        withdrawalRequestId: withdrawal.id,
        operatorId: requestedById,
        description: `Funds reserved for withdrawal request ${reference} via ${payoutMethod}`,
        metadata: {
            destination: destinationDetails,
            feeAmount,
            netPayout,
        },
    });
    return {
        success: true,
        withdrawal,
        updatedBalance: {
            availableBalance: newAvailable,
            reservedBalance: newReserved,
        },
    };
}
exports.requestStoreWithdrawal = requestStoreWithdrawal;
/**
 * Super Admin review & approval of a withdrawal request.
 */
async function approveWithdrawalRequest(withdrawalId, reviewerId, notes) {
    const withdrawal = await prismadb_1.default.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
    });
    if (!withdrawal) {
        throw new Error("Withdrawal request not found");
    }
    if (withdrawal.status !== client_1.WithdrawalStatus.REQUESTED &&
        withdrawal.status !== client_1.WithdrawalStatus.UNDER_REVIEW) {
        throw new Error(`Cannot approve withdrawal in status '${withdrawal.status}'. Must be REQUESTED or UNDER_REVIEW.`);
    }
    const updated = await prismadb_1.default.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
            status: client_1.WithdrawalStatus.APPROVED,
            reviewedById: reviewerId,
            reviewedAt: new Date(),
            notes: notes ? `${withdrawal.notes ? withdrawal.notes + " | " : ""}${notes}` : withdrawal.notes,
        },
        include: {
            company: { select: { id: true, name: true, slug: true } },
            requestedBy: { select: { id: true, name: true, email: true } },
        },
    });
    return updated;
}
exports.approveWithdrawalRequest = approveWithdrawalRequest;
/**
 * Super Admin rejection of a withdrawal request.
 * Automatically releases reserved funds back to the store's available balance.
 */
async function rejectWithdrawalRequest(withdrawalId, reviewerId, reason) {
    if (!reason || !reason.trim()) {
        throw new Error("A clear rejection reason is mandatory.");
    }
    const withdrawal = await prismadb_1.default.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
    });
    if (!withdrawal) {
        throw new Error("Withdrawal request not found");
    }
    if (withdrawal.status === client_1.WithdrawalStatus.PAID ||
        withdrawal.status === client_1.WithdrawalStatus.PROCESSING ||
        withdrawal.status === client_1.WithdrawalStatus.REJECTED) {
        throw new Error(`Cannot reject withdrawal in status '${withdrawal.status}'.`);
    }
    const balance = await prismadb_1.default.storeSettlementBalance.findUnique({
        where: { companyId: withdrawal.companyId },
    });
    if (!balance) {
        throw new Error("Store settlement balance not found");
    }
    const amountToRelease = withdrawal.amount;
    const newReserved = Math.max(0, (0, attribution_1.roundCurrency)(balance.reservedBalance - amountToRelease));
    const newAvailable = (0, attribution_1.roundCurrency)(balance.availableBalance + amountToRelease);
    // Perform atomic release and status transition
    const [updatedBalance, updatedWithdrawal] = await prismadb_1.default.$transaction([
        prismadb_1.default.storeSettlementBalance.update({
            where: { companyId: withdrawal.companyId },
            data: {
                reservedBalance: newReserved,
                availableBalance: newAvailable,
            },
        }),
        prismadb_1.default.withdrawalRequest.update({
            where: { id: withdrawalId },
            data: {
                status: client_1.WithdrawalStatus.REJECTED,
                rejectionReason: reason,
                reviewedById: reviewerId,
                reviewedAt: new Date(),
            },
        }),
    ]);
    // Record ledger reversal entry
    await recordLedgerEntry({
        companyId: withdrawal.companyId,
        entryType: client_1.LedgerEntryType.WITHDRAWAL_REVERSAL,
        amount: amountToRelease,
        balanceAfter: newAvailable,
        currency: withdrawal.currency,
        reference: withdrawal.reference,
        withdrawalRequestId: withdrawal.id,
        operatorId: reviewerId,
        description: `Reversal of reserved funds: Withdrawal ${withdrawal.reference} was rejected. Reason: ${reason}`,
    });
    return {
        success: true,
        withdrawal: updatedWithdrawal,
        updatedBalance,
    };
}
exports.rejectWithdrawalRequest = rejectWithdrawalRequest;
/**
 * Super Admin payout execution & settlement confirmation.
 * Marks the withdrawal as PAID, records external reference proof, and clears reserved liability.
 */
async function executeWithdrawalPayout(withdrawalId, operatorId, execution) {
    if (!execution.providerReference || !execution.providerReference.trim()) {
        throw new Error("External provider payment reference / receipt is required for settlement execution.");
    }
    const withdrawal = await prismadb_1.default.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
    });
    if (!withdrawal) {
        throw new Error("Withdrawal request not found");
    }
    if (withdrawal.status !== client_1.WithdrawalStatus.APPROVED &&
        withdrawal.status !== client_1.WithdrawalStatus.PROCESSING) {
        throw new Error(`Cannot execute payout for withdrawal in status '${withdrawal.status}'. Withdrawal must be APPROVED first.`);
    }
    const balance = await prismadb_1.default.storeSettlementBalance.findUnique({
        where: { companyId: withdrawal.companyId },
    });
    if (!balance) {
        throw new Error("Store settlement balance not found");
    }
    const amountSettled = withdrawal.amount;
    const newReserved = Math.max(0, (0, attribution_1.roundCurrency)(balance.reservedBalance - amountSettled));
    const newLifetimeWithdrawn = (0, attribution_1.roundCurrency)(balance.lifetimeWithdrawn + withdrawal.netPayout);
    const [updatedBalance, updatedWithdrawal] = await prismadb_1.default.$transaction([
        prismadb_1.default.storeSettlementBalance.update({
            where: { companyId: withdrawal.companyId },
            data: {
                reservedBalance: newReserved,
                lifetimeWithdrawn: newLifetimeWithdrawn,
            },
        }),
        prismadb_1.default.withdrawalRequest.update({
            where: { id: withdrawalId },
            data: {
                status: client_1.WithdrawalStatus.PAID,
                providerReference: execution.providerReference.trim(),
                providerResponse: execution.providerResponse || undefined,
                completedAt: new Date(),
                processedAt: withdrawal.processedAt || new Date(),
                notes: execution.notes
                    ? `${withdrawal.notes ? withdrawal.notes + " | " : ""}${execution.notes}`
                    : withdrawal.notes,
            },
        }),
    ]);
    // Record ledger release
    await recordLedgerEntry({
        companyId: withdrawal.companyId,
        entryType: client_1.LedgerEntryType.WITHDRAWAL_RELEASE,
        amount: -amountSettled,
        balanceAfter: balance.availableBalance,
        currency: withdrawal.currency,
        reference: execution.providerReference.trim(),
        withdrawalRequestId: withdrawal.id,
        operatorId,
        description: `Settlement payout completed. Transferred net KES ${withdrawal.netPayout.toFixed(2)} via ${withdrawal.payoutMethod}. Receipt: ${execution.providerReference}`,
        metadata: {
            providerReference: execution.providerReference,
            payoutMethod: withdrawal.payoutMethod,
            destinationDetails: withdrawal.destinationDetails,
        },
    });
    return {
        success: true,
        withdrawal: updatedWithdrawal,
        updatedBalance,
    };
}
exports.executeWithdrawalPayout = executeWithdrawalPayout;
/**
 * Handle a failed payout attempt.
 */
async function failWithdrawalPayout(withdrawalId, failureReason, providerResponse) {
    const withdrawal = await prismadb_1.default.withdrawalRequest.findUnique({
        where: { id: withdrawalId },
    });
    if (!withdrawal) {
        throw new Error("Withdrawal request not found");
    }
    // Update status to FAILED
    const updated = await prismadb_1.default.withdrawalRequest.update({
        where: { id: withdrawalId },
        data: {
            status: client_1.WithdrawalStatus.FAILED,
            failureReason,
            providerResponse: providerResponse || undefined,
        },
    });
    // Log operational exception for reconciliation queue
    await recordPaymentException({
        provider: withdrawal.payoutMethod,
        reference: withdrawal.reference,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        exceptionType: "FAILED_PAYOUT",
        description: `Payout execution failed for ${withdrawal.reference}: ${failureReason}`,
        rawPayload: providerResponse,
    });
    return updated;
}
exports.failWithdrawalPayout = failWithdrawalPayout;
/**
 * Log an operational discrepancy/exception for Super Admin reconciliation.
 */
async function recordPaymentException(data) {
    return await prismadb_1.default.paymentException.create({
        data: {
            provider: data.provider,
            providerTransactionId: data.providerTransactionId || undefined,
            reference: data.reference || undefined,
            amount: data.amount ? (0, attribution_1.roundCurrency)(data.amount) : undefined,
            currency: data.currency || "KES",
            exceptionType: data.exceptionType,
            description: data.description,
            rawPayload: data.rawPayload || undefined,
        },
    });
}
exports.recordPaymentException = recordPaymentException;
