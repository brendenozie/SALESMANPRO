/**
 * app/api/super-admin/withdrawals/[id]/execute/route.ts
 *
 * Super Admin Action: Execute / Confirm Payout Disbursement.
 * Validates payout confirmation reference, releases reserved liability,
 * marks withdrawal status as PAID, and registers immutable ledger completion.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { executeWithdrawalPayout } from "@/lib/payments/ledgerService";
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
    const { providerReference, notes, providerResponse } = body;

    if (!providerReference || !providerReference.trim()) {
      return formatResponse(
        false,
        null,
        "External payment reference / transfer receipt code is required to execute settlement payout",
        400
      );
    }

    const result = await executeWithdrawalPayout(id, auth.user.id, {
      providerReference: providerReference.trim(),
      notes,
      providerResponse,
    });

    // Notify Store Admin
    try {
      await NotificationService.publishEvent({
        title: "Settlement Payout Completed",
        message: `Settlement payout for request ${result.withdrawal.reference} (KES ${result.withdrawal.netPayout.toLocaleString(
          "en-KE",
          { minimumFractionDigits: 2 }
        )}) has been sent. Transaction Receipt: ${providerReference.trim()}`,
        eventType: "WITHDRAWAL_PAID",
        severity: "INFO",
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
      `Payout for withdrawal ${result.withdrawal.reference} confirmed successfully with reference ${providerReference}`
    );
  } catch (error: any) {
    console.error("[WITHDRAWAL_EXECUTE_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to execute payout disbursement",
      400
    );
  }
}
