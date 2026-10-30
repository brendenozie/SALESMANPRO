import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";

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
 * POST /api/sync/acknowledge
 * Records that a client device has durably applied changes up to `ackedSequence`
 * and updates its pending/failed outbox telemetry and local DB health.
 */
export const POST = withApiHandler(async (req, context) => {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedCompanyId =
      body.companyId || req.headers.get("x-pos-company-id") || undefined;
    const deviceId = (
      body.deviceId ||
      req.headers.get("x-pos-device-id") ||
      ""
    ).trim();

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
          error: tenantScope.error || "Forbidden: Unauthorized tenant",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const companyId = tenantScope.companyId;
    const ackedSequence = Number(body.ackedSequence ?? body.cursor ?? 0);

    const updated = await prisma.registeredDevice.upsert({
      where: {
        companyId_deviceId: {
          companyId,
          deviceId,
        },
      },
      update: {
        lastAckedSequence: ackedSequence,
        lastSyncAt: new Date(),
        lastHeartbeatAt: new Date(),
        ...(body.pendingOutboxCount !== undefined
          ? { pendingOutboxCount: Number(body.pendingOutboxCount) }
          : {}),
        ...(body.failedOutboxCount !== undefined
          ? { failedOutboxCount: Number(body.failedOutboxCount) }
          : {}),
        ...(body.localDbHealth
          ? { localDbHealth: String(body.localDbHealth) }
          : {}),
        ...(body.diagnostics ? { diagnosticsJson: body.diagnostics } : {}),
      },
      create: {
        companyId,
        storeId: body.storeId || req.headers.get("x-pos-store-id") || null,
        deviceId,
        userId: context.user?.id || null,
        name: body.deviceName || `POS Terminal (${deviceId.slice(-6)})`,
        platform: (body.platform || "WEB").toUpperCase(),
        lastAckedSequence: ackedSequence,
        lastSyncAt: new Date(),
        lastHeartbeatAt: new Date(),
        pendingOutboxCount: Number(body.pendingOutboxCount || 0),
        failedOutboxCount: Number(body.failedOutboxCount || 0),
        localDbHealth: String(body.localDbHealth || "HEALTHY"),
        diagnosticsJson: body.diagnostics || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        deviceId: updated.deviceId,
        lastAckedSequence: updated.lastAckedSequence,
        lastSyncAt: updated.lastSyncAt,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_ACK_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to acknowledge sync" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

