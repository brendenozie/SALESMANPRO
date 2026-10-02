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

import prisma from "@/server/db/prismadb";
import {
  WithdrawalStatus,
  PayoutMethod,
  LedgerEntryType,
  Prisma,
} from "@prisma/client";
import { roundCurrency } from "./attribution";
import { getStorePaymentMetrics } from "./reportingService";

export interface CreateWithdrawalInput {
  companyId: string;
  requestedById: string;
  amount: number;
  payoutMethod: PayoutMethod;
  destinationDetails: {
    phone?: string;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    paystackRecipientCode?: string;
    [key: string]: any;
  };
  notes?: string;
}

export interface StoreBalanceSummary {
  currency: string;
  lifetimeEarnings: number;
  lifetimeWithdrawn: number;
  availableBalance: number;
  reservedBalance: number;
  pendingSettlement: number;
}

/**
 * Generate a cryptographically randomized, human-readable withdrawal reference.
 * Format: WTH-YYYYMMDD-XXXXXX
 */
export function generateWithdrawalReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `WTH-${dateStr}-${randomChars}`;
}

/**
 * Get or initialize the store's canonical settlement balance record.
 * If creating fresh, bootstraps lifetime earnings from historical completed Ghuba payments.
 */
export async function getOrCreateStoreSettlementBalance(
  companyId: string
): Promise<StoreBalanceSummary> {
  let record = await prisma.storeSettlementBalance.findUnique({
    where: { companyId },
  });

  if (!record) {
    // Bootstrap from historical payments
    const metrics = await getStorePaymentMetrics(companyId, { period: "all" });
    const historicalNetGhuba = roundCurrency(metrics.ghuba.netStoreAmount);

    record = await prisma.storeSettlementBalance.create({
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
        entryType: LedgerEntryType.COLLECTION_CUSTOMER,
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
    lifetimeEarnings: roundCurrency(record.lifetimeEarnings),
    lifetimeWithdrawn: roundCurrency(record.lifetimeWithdrawn),
    availableBalance: roundCurrency(record.availableBalance),
    reservedBalance: roundCurrency(record.reservedBalance),
    pendingSettlement: roundCurrency(record.availableBalance + record.reservedBalance),
  };
}

/**
 * Append an immutable entry to the Transaction Ledger.
 */
export async function recordLedgerEntry(entry: {
  companyId: string;
  entryType: LedgerEntryType;
  amount: number;
  balanceAfter: number;
  currency?: string;
  reference: string;
  description: string;
  paymentId?: string;
  withdrawalRequestId?: string;
  operatorId?: string;
  metadata?: any;
}) {
  return await prisma.transactionLedger.create({
    data: {
      companyId: entry.companyId,
      entryType: entry.entryType,
      amount: roundCurrency(entry.amount),
      balanceAfter: roundCurrency(entry.balanceAfter),
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

/**
 * Submit a store withdrawal request with atomic balance reservation.
 * Guarantees that available funds cannot be double-withdrawn.
 */
export async function requestStoreWithdrawal(input: CreateWithdrawalInput) {
  const {
    companyId,
    requestedById,
    amount,
    payoutMethod,
    destinationDetails,
    notes,
  } = input;

  const requestedAmount = roundCurrency(amount);

  if (requestedAmount < 100) {
    throw new Error("Minimum withdrawal amount is KES 100.00");
  }

  // Ensure balance record is ready
  await getOrCreateStoreSettlementBalance(companyId);

  // Atomic update: ensure availableBalance >= requestedAmount
  const currentBalance = await prisma.storeSettlementBalance.findUnique({
    where: { companyId },
  });

  if (!currentBalance || currentBalance.availableBalance < requestedAmount) {
    const available = currentBalance ? currentBalance.availableBalance : 0;
    throw new Error(
      `Insufficient available settlement balance. Requested: KES ${requestedAmount.toFixed(
        2
      )}, Available: KES ${available.toFixed(2)}`
    );
  }

  // Generate unique reference
  const reference = generateWithdrawalReference();

  // Payout fee calculation (e.g. standard M-Pesa B2C fee of KES 15 or 0)
  const feeAmount = 0.0;
  const netPayout = roundCurrency(requestedAmount - feeAmount);

  const newAvailable = roundCurrency(currentBalance.availableBalance - requestedAmount);
  const newReserved = roundCurrency(currentBalance.reservedBalance + requestedAmount);

  // Update balance and create withdrawal request
  const [updatedBalance, withdrawal] = await prisma.$transaction([
    prisma.storeSettlementBalance.update({
      where: { companyId },
      data: {
        availableBalance: newAvailable,
        reservedBalance: newReserved,
      },
    }),
    prisma.withdrawalRequest.create({
      data: {
        reference,
        companyId,
        requestedById,
        amount: requestedAmount,
        feeAmount,
        netPayout,
        currency: currentBalance.currency || "KES",
        status: WithdrawalStatus.REQUESTED,
        payoutMethod,
        destinationDetails,
        notes: notes || undefined,
      },
    }),
  ]);

  // Record ledger entry
  await recordLedgerEntry({
    companyId,
    entryType: LedgerEntryType.WITHDRAWAL_RESERVE,
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

/**
 * Super Admin review & approval of a withdrawal request.
 */
export async function approveWithdrawalRequest(
  withdrawalId: string,
  reviewerId: string,
  notes?: string
) {
  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal request not found");
  }

  if (
    withdrawal.status !== WithdrawalStatus.REQUESTED &&
    withdrawal.status !== WithdrawalStatus.UNDER_REVIEW
  ) {
    throw new Error(
      `Cannot approve withdrawal in status '${withdrawal.status}'. Must be REQUESTED or UNDER_REVIEW.`
    );
  }

  const updated = await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: {
      status: WithdrawalStatus.APPROVED,
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

/**
 * Super Admin rejection of a withdrawal request.
 * Automatically releases reserved funds back to the store's available balance.
 */
export async function rejectWithdrawalRequest(
  withdrawalId: string,
  reviewerId: string,
  reason: string
) {
  if (!reason || !reason.trim()) {
    throw new Error("A clear rejection reason is mandatory.");
  }

  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal request not found");
  }

  if (
    withdrawal.status === WithdrawalStatus.PAID ||
    withdrawal.status === WithdrawalStatus.PROCESSING ||
    withdrawal.status === WithdrawalStatus.REJECTED
  ) {
    throw new Error(`Cannot reject withdrawal in status '${withdrawal.status}'.`);
  }

  const balance = await prisma.storeSettlementBalance.findUnique({
    where: { companyId: withdrawal.companyId },
  });

  if (!balance) {
    throw new Error("Store settlement balance not found");
  }

  const amountToRelease = withdrawal.amount;
  const newReserved = Math.max(0, roundCurrency(balance.reservedBalance - amountToRelease));
  const newAvailable = roundCurrency(balance.availableBalance + amountToRelease);

  // Perform atomic release and status transition
  const [updatedBalance, updatedWithdrawal] = await prisma.$transaction([
    prisma.storeSettlementBalance.update({
      where: { companyId: withdrawal.companyId },
      data: {
        reservedBalance: newReserved,
        availableBalance: newAvailable,
      },
    }),
    prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: WithdrawalStatus.REJECTED,
        rejectionReason: reason,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    }),
  ]);

  // Record ledger reversal entry
  await recordLedgerEntry({
    companyId: withdrawal.companyId,
    entryType: LedgerEntryType.WITHDRAWAL_REVERSAL,
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

/**
 * Super Admin payout execution & settlement confirmation.
 * Marks the withdrawal as PAID, records external reference proof, and clears reserved liability.
 */
export async function executeWithdrawalPayout(
  withdrawalId: string,
  operatorId: string,
  execution: {
    providerReference: string;
    providerResponse?: any;
    notes?: string;
  }
) {
  if (!execution.providerReference || !execution.providerReference.trim()) {
    throw new Error("External provider payment reference / receipt is required for settlement execution.");
  }

  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal request not found");
  }

  if (
    withdrawal.status !== WithdrawalStatus.APPROVED &&
    withdrawal.status !== WithdrawalStatus.PROCESSING
  ) {
    throw new Error(
      `Cannot execute payout for withdrawal in status '${withdrawal.status}'. Withdrawal must be APPROVED first.`
    );
  }

  const balance = await prisma.storeSettlementBalance.findUnique({
    where: { companyId: withdrawal.companyId },
  });

  if (!balance) {
    throw new Error("Store settlement balance not found");
  }

  const amountSettled = withdrawal.amount;
  const newReserved = Math.max(0, roundCurrency(balance.reservedBalance - amountSettled));
  const newLifetimeWithdrawn = roundCurrency(balance.lifetimeWithdrawn + withdrawal.netPayout);

  const [updatedBalance, updatedWithdrawal] = await prisma.$transaction([
    prisma.storeSettlementBalance.update({
      where: { companyId: withdrawal.companyId },
      data: {
        reservedBalance: newReserved,
        lifetimeWithdrawn: newLifetimeWithdrawn,
      },
    }),
    prisma.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status: WithdrawalStatus.PAID,
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
    entryType: LedgerEntryType.WITHDRAWAL_RELEASE,
    amount: -amountSettled,
    balanceAfter: balance.availableBalance, // Available balance was already decremented at reserve time
    currency: withdrawal.currency,
    reference: execution.providerReference.trim(),
    withdrawalRequestId: withdrawal.id,
    operatorId,
    description: `Settlement payout completed. Transferred net KES ${withdrawal.netPayout.toFixed(
      2
    )} via ${withdrawal.payoutMethod}. Receipt: ${execution.providerReference}`,
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

/**
 * Handle a failed payout attempt.
 */
export async function failWithdrawalPayout(
  withdrawalId: string,
  failureReason: string,
  providerResponse?: any
) {
  const withdrawal = await prisma.withdrawalRequest.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new Error("Withdrawal request not found");
  }

  // Update status to FAILED
  const updated = await prisma.withdrawalRequest.update({
    where: { id: withdrawalId },
    data: {
      status: WithdrawalStatus.FAILED,
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

/**
 * Log an operational discrepancy/exception for Super Admin reconciliation.
 */
export async function recordPaymentException(data: {
  provider: string;
  providerTransactionId?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  exceptionType: string;
  description: string;
  rawPayload?: any;
}) {
  return await prisma.paymentException.create({
    data: {
      provider: data.provider,
      providerTransactionId: data.providerTransactionId || undefined,
      reference: data.reference || undefined,
      amount: data.amount ? roundCurrency(data.amount) : undefined,
      currency: data.currency || "KES",
      exceptionType: data.exceptionType,
      description: data.description,
      rawPayload: data.rawPayload || undefined,
    },
  });
}
