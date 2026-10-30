import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { applyAuthoritativeStockMovement } from "@/lib/inventory/stockMovementLedger";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/sync/resolve-conflict
 * Resolves a `SyncConflictRecord` with an audited manager decision:
 * - `APPROVED_VARIANCE`: Accepts the physical oversell variance (keeps stock at 0 or adjusts if `adjustmentDelta` provided).
 * - `RESOLVED_SERVER`: Keeps server state.
 * - `RESOLVED_CLIENT`: Applies client state or stock adjustment.
 * - `DISMISSED`: Marks informational conflict reviewed.
 */
export const POST = withApiHandler(async (req, context) => {
  try {
    const body = await req.json();
    const {
      conflictId,
      companyId: requestedCompanyId,
      resolution,
      resolutionNotes,
      stockAdjustmentDelta,
    } = body;

    if (!conflictId) {
      return NextResponse.json(
        { success: false, error: "conflictId is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const tenantScope = await resolveAuthorizedCompany(
      context.user,
      requestedCompanyId || req.headers.get("x-pos-company-id")
    );
    if (!tenantScope.authorized || !tenantScope.companyId) {
      return NextResponse.json(
        {
          success: false,
          code: "TENANT_ISOLATION_VIOLATION",
          error: tenantScope.error || "Forbidden: Unauthorized tenant",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const companyId = tenantScope.companyId;

    const existing = await prisma.syncConflictRecord.findFirst({
      where: {
        id: conflictId,
        companyId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Conflict record not found in this store" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const normalizedResolution = (
      resolution || "APPROVED_VARIANCE"
    ).toUpperCase();

    if (
      stockAdjustmentDelta !== undefined &&
      Number(stockAdjustmentDelta) !== 0 &&
      existing.entityId
    ) {
      const clientPayload = (existing.clientPayload as any) || {};
      await applyAuthoritativeStockMovement({
        companyId,
        storeId: existing.storeId,
        deviceId: "ADMIN_RECONCILIATION",
        operationId: `reconcile_${conflictId}_${Date.now()}`,
        marketplaceListingId: clientPayload.marketplaceListingId || null,
        productId: existing.entityId,
        delta: Number(stockAdjustmentDelta),
        movementType: "STOCK_ADJUSTMENT",
        reason:
          resolutionNotes ||
          `Manager conflict resolution for ${existing.conflictType}`,
        actorId: context.user?.id || null,
      });
    }

    const updated = await prisma.syncConflictRecord.update({
      where: { id: existing.id },
      data: {
        status: normalizedResolution,
        resolvedById: context.user?.id || null,
        resolvedAt: new Date(),
        resolutionNotes:
          resolutionNotes || `Resolved as ${normalizedResolution}`,
      },
    });

    if (existing.status === "OPEN" && existing.deviceId) {
      await prisma.registeredDevice
        .updateMany({
          where: {
            companyId,
            deviceId: existing.deviceId,
            conflictCount: { gt: 0 },
          },
          data: {
            conflictCount: { decrement: 1 },
          },
        })
        .catch(() => null);
    }

    return NextResponse.json(
      {
        success: true,
        conflict: updated,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_RESOLVE_CONFLICT_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resolve conflict" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

