/**
 * app/api/admin/withdrawals/route.ts
 *
 * Store Withdrawal Management API.
 * Allows authorized store owners, company admins, and finance managers to:
 * 1. View their eligible settlement balance and withdrawal history.
 * 2. Submit formal withdrawal requests with atomic balance reservation.
 * Strictly enforces tenant isolation and server-side balance verification.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { canAccessCompanyAdmin } from "@/lib/auth/authorization";
import prisma from "@/server/db/prismadb";
import {
  getOrCreateStoreSettlementBalance,
  requestStoreWithdrawal,
} from "@/lib/payments/ledgerService";
import { formatResponse } from "@/lib/formatResponse";
import { NotificationService } from "@/lib/notifications/notificationService";
import { PayoutMethod } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return formatResponse(false, null, "Missing required companyId", 400);
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true, name: true, slug: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: auth.user.id },
      select: { companyId: true },
    });

    const isAuthorized =
      auth.user.role === "SUPER_ADMIN" ||
      canAccessCompanyAdmin({
        user: {
          id: auth.user.id,
          role: auth.user.role,
          companyId: auth.user.companyId,
          emailVerified: auth.user.emailVerified,
          isActive: auth.user.isActive,
        },
        company: { id: company.id, userId: company.userId },
        staffCompanyId: staff?.companyId,
      });

    if (!isAuthorized) {
      return formatResponse(
        false,
        null,
        "Forbidden: Access denied to store withdrawal operations",
        403
      );
    }

    // 1. Fetch live balance summary
    const balance = await getOrCreateStoreSettlementBalance(company.id);

    // 2. Fetch withdrawal requests
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      include: {
        requestedBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
      },
      take: 50,
    });

    // 3. Fetch recent ledger entries
    const ledgerEntries = await prisma.transactionLedger.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    return formatResponse(
      true,
      {
        company: { id: company.id, name: company.name, slug: company.slug },
        balance,
        withdrawals,
        ledgerEntries,
      },
      "Store withdrawal data retrieved successfully"
    );
  } catch (error: any) {
    console.error("[STORE_WITHDRAWALS_GET_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to fetch withdrawal details",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    const body = await request.json().catch(() => ({}));
    const { companyId, amount, payoutMethod, destinationDetails, notes } = body;

    if (!companyId || !amount) {
      return formatResponse(
        false,
        null,
        "companyId and withdrawal amount are required",
        400
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return formatResponse(
        false,
        null,
        "Withdrawal amount must be a positive number",
        400
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, userId: true, name: true },
    });

    if (!company) {
      return formatResponse(false, null, "Company not found", 404);
    }

    const staff = await prisma.staffProfile.findUnique({
      where: { userId: auth.user.id },
      select: { companyId: true },
    });

    const isAuthorized =
      auth.user.role === "SUPER_ADMIN" ||
      canAccessCompanyAdmin({
        user: {
          id: auth.user.id,
          role: auth.user.role,
          companyId: auth.user.companyId,
          emailVerified: auth.user.emailVerified,
          isActive: auth.user.isActive,
        },
        company: { id: company.id, userId: company.userId },
        staffCompanyId: staff?.companyId,
      });

    if (!isAuthorized) {
      return formatResponse(
        false,
        null,
        "Forbidden: You cannot submit withdrawal requests for this store",
        403
      );
    }

    // Validate payout method
    let resolvedMethod = PayoutMethod.MPESA_B2C;
    if (payoutMethod) {
      const upper = String(payoutMethod).toUpperCase();
      if (upper.includes("BANK")) resolvedMethod = PayoutMethod.BANK_TRANSFER;
      else if (upper.includes("PAYSTACK")) resolvedMethod = PayoutMethod.PAYSTACK_TRANSFER;
      else if (upper.includes("MANUAL")) resolvedMethod = PayoutMethod.MANUAL_EFT;
    }

    // Validate destination details based on method
    if (!destinationDetails || typeof destinationDetails !== "object") {
      return formatResponse(
        false,
        null,
        "Payout destination details (phone, bank, etc.) are required",
        400
      );
    }

    if (resolvedMethod === PayoutMethod.MPESA_B2C && !destinationDetails.phone) {
      return formatResponse(
        false,
        null,
        "A valid M-Pesa phone number is required for mobile payout",
        400
      );
    }

    if (
      resolvedMethod === PayoutMethod.BANK_TRANSFER &&
      (!destinationDetails.accountNumber || !destinationDetails.bankName)
    ) {
      return formatResponse(
        false,
        null,
        "Bank name and account number are required for bank transfer payout",
        400
      );
    }

    // Execute atomic reservation
    const result = await requestStoreWithdrawal({
      companyId: company.id,
      requestedById: auth.user.id,
      amount: parsedAmount,
      payoutMethod: resolvedMethod,
      destinationDetails,
      notes,
    });

    // Notify Super Admins of new withdrawal request
    try {
      await NotificationService.publishEvent({
        title: "New Settlement Withdrawal Request",
        message: `${company.name} submitted a withdrawal request for KES ${parsedAmount.toLocaleString(
          "en-KE",
          { minimumFractionDigits: 2 }
        )} via ${resolvedMethod}. Reference: ${result.withdrawal.reference}`,
        eventType: "WITHDRAWAL_REQUESTED",
        severity: "INFO",
        companyId: company.id,
        actionUrl: "/super-admin/payments?tab=withdrawals",
        resourceType: "WithdrawalRequest",
        resourceId: result.withdrawal.id,
        recipientPolicy: {
          type: "SUPER_ADMINS",
        },
      });
    } catch (notifErr) {
      console.warn("[NOTIFICATION_DISPATCH_WARNING]", notifErr);
    }

    return formatResponse(
      true,
      result,
      "Withdrawal request submitted successfully",
      201
    );
  } catch (error: any) {
    console.error("[STORE_WITHDRAWAL_POST_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to submit withdrawal request",
      400
    );
  }
}
