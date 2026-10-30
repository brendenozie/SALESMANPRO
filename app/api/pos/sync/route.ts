import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { verifyRegisteredDeviceAccess } from "@/lib/sync/offlineGrantService";
import { processSyncOperationsBatch } from "@/lib/sync/syncCommandProcessor";
import { getHeadSequence } from "@/lib/sync/changeLogService";
import type { SyncBatchRequest, SyncBatchResponse } from "@/types/pos-offline";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id, X-Offline-Grant, Idempotency-Key",
};

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export const POST = withApiHandler(async (req, context) => {
  try {
    const body: SyncBatchRequest & { storeId?: string; offlineGrantToken?: string } =
      await req.json();
    const deviceId =
      body.deviceId || req.headers.get("x-pos-device-id") || "";
    const requestedCompanyId =
      body.companyId || req.headers.get("x-pos-company-id") || undefined;
    const storeId =
      body.storeId || req.headers.get("x-pos-store-id") || null;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "X-POS-Device-Id / deviceId is required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 1. Strict Server-Side Tenant Isolation Check
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
            "Forbidden: Device or user is not authorized for the requested store tenant.",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const authoritativeCompanyId = tenantScope.companyId;

    // Verify no individual operation attempts cross-tenant spoofing
    const operations = Array.isArray(body.operations) ? body.operations : [];
    for (const op of operations) {
      if (op.companyId && op.companyId !== authoritativeCompanyId) {
        return NextResponse.json(
          {
            success: false,
            code: "TENANT_ISOLATION_VIOLATION",
            error: `Operation ${op.operationId} targets unauthorized companyId ${op.companyId}.`,
          },
          { status: 403, headers: CORS_HEADERS }
        );
      }
    }

    // 2. Verify Registered Device & Offline Grant Status
    const offlineGrantToken =
      body.offlineGrantToken || req.headers.get("x-offline-grant") || null;
    const deviceCheck = await verifyRegisteredDeviceAccess({
      companyId: authoritativeCompanyId,
      deviceId,
      offlineGrantToken,
    });
    if (!deviceCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: deviceCheck.code || "DEVICE_REVOKED",
          error: deviceCheck.reason || "Device access denied",
        },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    if (operations.length === 0) {
      const { headSequence } = await getHeadSequence(authoritativeCompanyId);
      return NextResponse.json(
        {
          success: true,
          batchId: body.batchId || "EMPTY",
          results: [],
          serverRevision: headSequence || Date.now(),
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // 3. Process Operations Idempotently
    const processed = await processSyncOperationsBatch({
      companyId: authoritativeCompanyId,
      storeId,
      deviceId,
      actorUserId: context.user?.id || null,
      operations: operations as any,
    });

    const { headSequence } = await getHeadSequence(authoritativeCompanyId);

    const responsePayload: SyncBatchResponse = {
      success: true,
      batchId: body.batchId || "BATCH-DEFAULT",
      results: processed.results.map((r) => ({
        operationId: r.operationId,
        status: r.status === "CONFLICT" ? "CONFLICT" : r.status === "FAILED" ? "FAILED" : "SUCCESS",
        serverEntityId: r.serverEntityId,
        trackingNumber: r.trackingNumber,
        alreadyExists: r.alreadyExists,
        remapping: r.remapping,
        error: r.error,
        warnings: r.warnings,
      })) as any,
      serverRevision: headSequence || Date.now(),
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err: any) {
    console.error("[POS_SYNC_ENDPOINT_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal sync error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
