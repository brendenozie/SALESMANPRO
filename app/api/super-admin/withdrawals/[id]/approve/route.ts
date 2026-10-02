/**
 * app/api/super-admin/withdrawals/[id]/approve/route.ts
 *
 * Super Admin Action: Approve a store settlement withdrawal request.
 * Transitions status from REQUESTED/UNDER_REVIEW to APPROVED.
 */

import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/verifyAuth";
import { approveWithdrawalRequest } from "@/lib/payments/ledgerService";
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
    const { notes } = body;

    const updated = await approveWithdrawalRequest(id, auth.user.id, notes);

    // Notify Store Admin
    try {
      await NotificationService.publishEvent({
        title: "Settlement Withdrawal Approved",
        message: `Your withdrawal request ${updated.reference} for KES ${updated.netPayout.toLocaleString(
          "en-KE",
          { minimumFractionDigits: 2 }
        )} has been approved and is queued for payout execution.`,
        eventType: "WITHDRAWAL_APPROVED",
        severity: "INFO",
        companyId: updated.companyId,
        actionUrl: `/admin/${updated.company?.slug || "store"}/payments?tab=withdrawals`,
        resourceType: "WithdrawalRequest",
        resourceId: updated.id,
        recipientPolicy: {
          type: "COMPANY_ADMINS",
        },
      });
    } catch (notifErr) {
      console.warn("[NOTIFICATION_DISPATCH_WARNING]", notifErr);
    }

    return formatResponse(
      true,
      updated,
      `Withdrawal request ${updated.reference} approved successfully`
    );
  } catch (error: any) {
    console.error("[WITHDRAWAL_APPROVE_ERROR]", error);
    return formatResponse(
      false,
      null,
      error.message || "Failed to approve withdrawal request",
      400
    );
  }
}
