/**
 * app/api/super-admin/withdrawals/[id]/reject/route.ts
 *
 * Super Admin Action: Reject a store settlement withdrawal request.
 * Automatically releases reserved balance back into store's available balance in ledger.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { rejectWithdrawalRequest } from "@/lib/payments/ledgerService";
import { formatResponse } from "@/lib/formatResponse";
import { NotificationService } from "@/lib/notifications/notificationService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success || !auth.user) {
      return formatResponse(false, null, auth.error || "Unauthorized", 401);
    }

    const role = (auth.user.role || "").toUpperCase();
    if (role !== "SUPER_ADMIN") {
      return formatResponse(
        false,
        null,
        "Forbidden: Super Admin access required",
        403
      );
    }

    const { id } = await params;
    if (!id) {
      return formatResponse(false, null, "Missing withdrawal ID", 400);
    }

    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return formatResponse(
        false,
        null,
        "A clear rejection reason is mandatory when declining a withdrawal request",
        400
      );
    }

    const result = await rejectWithdrawalRequest(id, auth.user.id, reason.trim());

    // Notify Store Admin
    try {
      await NotificationService.publishEvent({
        title: "Settlement Withdrawal Rejected",
        message: `Your withdrawal request ${result.withdrawal.reference} was rejected. Reason: ${reason}. Reserved funds of KES ${result.withdrawal.amount.toLocaleString(
          "en-KE",
          { minimumFractionDigits: 2 }
        )} have been returned to your available balance.`,
        eventType: "WITHDRAWAL_REJECTED",
        severity: "WARNING",
        companyId: result.withdrawal.companyId,
        actionUrl: `/admin/store/payments?tab=withdrawals`,
        resourceType: "WithdrawalRequest",
        resourceId: result.withdrawal.id,
        recipientPolicy: {
          type: "COMPANY_ADMINS",
        },
      });
    } catch (notifErr) {
      console.warn("[NOTIFICATION_DISPATCH_WARNING]", notifErr);
    }

    return formatResponse(
      true,
      result,
      `Withdrawal request ${result.withdrawal.reference} was rejected and reserved funds were restored to store balance`
    );
  } catch (error: any) {
    console.error("[WITHDRAWAL_REJECT_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to reject withdrawal request",
      400
    );
  }
}
