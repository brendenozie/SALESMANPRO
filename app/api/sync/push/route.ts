import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { verifyRegisteredDeviceAccess } from "@/lib/sync/offlineGrantService";
import { processSyncOperationsBatch } from "@/lib/sync/syncCommandProcessor";
import { getHeadSequence } from "@/lib/sync/changeLogService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id, X-Offline-Grant, Idempotency-Key",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/sync/push
 * Unified idempotent batch push endpoint for Android, Windows Desktop, and Web POS.
 */
export const POST = withApiHandler(async (req, context) => {
  try {
    const body = await req.json();
    const deviceId = (
      body.deviceId ||
      req.headers.get("x-pos-device-id") ||
      ""
    ).trim();
    const requestedCompanyId =
      body.companyId || req.headers.get("x-pos-company-id") || undefined;
    const storeId =
      body.storeId || req.headers.get("x-pos-store-id") || null;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "deviceId is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const tenantScope = await resolveAuthorizedCompany(
      context.user,
      requestedCompanyId
    );
    if (!tenantScope.authorized || !tenantScope.companyId) {
      return NextResponse.json(
        {
          success: false,
          code: "TENANT_ISOLATION_VIOLATION",
          error:
            tenantScope.error ||
            "Forbidden: Caller is not authorized for the target store tenant",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const companyId = tenantScope.companyId;
    const operations = Array.isArray(body.operations) ? body.operations : [];

    // Enforce strict tenant isolation on every operation in the batch
    for (const op of operations) {
      if (op.companyId && op.companyId !== companyId) {
        await prisma.syncConflictRecord
          .create({
            data: {
              companyId,
              storeId,
              deviceId,
              operationId: op.operationId || "SPOOF_ATTEMPT",
              entityType: op.entityType || "UNKNOWN",
              conflictType: "UNAUTHORIZED_DEVICE",
              severity: "CRITICAL",
              status: "OPEN",
              clientPayload: {
                attemptedCompanyId: op.companyId,
                authenticatedCompanyId: companyId,
              },
              details: `Security alert: Device ${deviceId} attempted to push operation ${op.operationId} for foreign tenant ${op.companyId}.`,
            },
          })
          .catch(() => null);

        return NextResponse.json(
          {
            success: false,
            code: "TENANT_ISOLATION_VIOLATION",
            error: `Cross-tenant operation rejected for operationId=${op.operationId}`,
          },
          { status: 403, headers: CORS_HEADERS }
        );
      }
    }

    const offlineGrantToken =
      body.offlineGrantToken || req.headers.get("x-offline-grant") || null;
    const accessCheck = await verifyRegisteredDeviceAccess({
      companyId,
      deviceId,
      offlineGrantToken,
    });
    if (!accessCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: accessCheck.code || "DEVICE_REVOKED",
          error: accessCheck.reason || "Device access denied",
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const processed = await processSyncOperationsBatch({
      companyId,
      storeId,
      deviceId,
      actorUserId: context.user?.id || null,
      offlinePolicy:
        (accessCheck.device?.offlineStockPolicy as any) || undefined,
      operations,
    });

    const { headSequence } = await getHeadSequence(companyId);

    // Update device sync heartbeat
    await prisma.registeredDevice
      .updateMany({
        where: { companyId, deviceId },
        data: {
          lastHeartbeatAt: new Date(),
          lastSyncAt: new Date(),
        },
      })
      .catch(() => null);

    return NextResponse.json(
      {
        success: true,
        protocolVersion: 1,
        batchId: body.batchId || `batch_${Date.now()}`,
        results: processed.results,
        remappings: processed.remappings,
        headSequence,
        serverRevision: headSequence,
        serverTime: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_PUSH_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Push synchronization failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

