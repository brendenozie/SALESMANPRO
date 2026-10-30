import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { getHeadSequence } from "@/lib/sync/changeLogService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/sync/status
 * Returns registered devices, synchronization lag, pending/failed counts,
 * conflict summaries, and store offline policy for the Sync Center and Admin Console.
 */
export const GET = withApiHandler(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const requestedCompanyId =
      searchParams.get("companyId") ||
      req.headers.get("x-pos-company-id") ||
      undefined;
    const storeId =
      searchParams.get("storeId") ||
      req.headers.get("x-pos-store-id") ||
      undefined;

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

    const [devices, seqInfo, openConflictsCount, companySettings] =
      await Promise.all([
        prisma.registeredDevice.findMany({
          where: {
            companyId,
            ...(storeId ? { storeId } : {}),
          },
          orderBy: { updatedAt: "desc" },
        }),
        getHeadSequence(companyId),
        prisma.syncConflictRecord.count({
          where: {
            companyId,
            status: "OPEN",
          },
        }),
        prisma.companySettings
          .findUnique({ where: { companyId } })
          .catch(() => null),
      ]);

    const nowMs = Date.now();
    const enrichedDevices = devices.map((d) => {
      const lastSeenMs = d.lastHeartbeatAt
        ? new Date(d.lastHeartbeatAt).getTime()
        : 0;
      const isOnline = lastSeenMs > 0 && nowMs - lastSeenMs < 120_000;
      const grantExpired = d.offlineGrantExpiresAt
        ? new Date(d.offlineGrantExpiresAt).getTime() <= nowMs
        : false;

      return {
        ...d,
        connectionStatus:
          d.status === "REVOKED"
            ? "REVOKED"
            : isOnline
            ? "ONLINE"
            : "OFFLINE",
        grantExpired,
        sequenceLag: Math.max(
          0,
          seqInfo.headSequence - (d.lastAckedSequence || 0)
        ),
      };
    });

    return NextResponse.json(
      {
        success: true,
        protocolVersion: 1,
        companyId,
        headSequence: seqInfo.headSequence,
        minRetainedSequence: seqInfo.minRetainedSequence,
        openConflictsCount,
        policy: {
          offlineInventoryPolicy:
            companySettings?.offlineInventoryPolicy || "CONTROLLED",
          offlineGrantTtlHours: companySettings?.offlineGrantTtlHours || 168,
          offlineAllowanceBuffer: companySettings?.offlineAllowanceBuffer ?? 5,
        },
        devices: enrichedDevices,
        serverTime: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_STATUS_GET_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch sync status" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

/**
 * PATCH /api/sync/status
 * Allows authorized store managers/admins to:
 * - Revoke or restore a registered device (`action: "REVOKE_DEVICE" | "RESTORE_DEVICE"`)
 * - Update store offline inventory policy (`action: "UPDATE_POLICY"`)
 * - Allocate offline stock to a device (`action: "ALLOCATE_STOCK"`)
 */
export const PATCH = withApiHandler(async (req, context) => {
  try {
    const body = await req.json();
    const tenantScope = await resolveAuthorizedCompany(
      context.user,
      body.companyId || req.headers.get("x-pos-company-id") || undefined
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
    const action = (body.action || "").toUpperCase();

    if (action === "REVOKE_DEVICE") {
      if (!body.deviceId) {
        return NextResponse.json(
          { success: false, error: "deviceId is required" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      const updated = await prisma.registeredDevice.update({
        where: {
          companyId_deviceId: {
            companyId,
            deviceId: body.deviceId,
          },
        },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
          revokedBy: context.user?.id || null,
          revokeReason:
            body.reason || "Revoked by store administrator from Sync Console",
          offlineGrantExpiresAt: new Date(0),
        },
      });
      return NextResponse.json(
        { success: true, device: updated },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    if (action === "RESTORE_DEVICE") {
      if (!body.deviceId) {
        return NextResponse.json(
          { success: false, error: "deviceId is required" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      const updated = await prisma.registeredDevice.update({
        where: {
          companyId_deviceId: {
            companyId,
            deviceId: body.deviceId,
          },
        },
        data: {
          status: "ACTIVE",
          revokedAt: null,
          revokedBy: null,
          revokeReason: null,
        },
      });
      return NextResponse.json(
        { success: true, device: updated },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    if (action === "UPDATE_POLICY") {
      const policy = (body.offlineInventoryPolicy || "CONTROLLED").toUpperCase();
      const validPolicy =
        policy === "STRICT" || policy === "FLEXIBLE" ? policy : "CONTROLLED";
      const ttlHours = Math.max(
        1,
        Math.min(720, Number(body.offlineGrantTtlHours || 168))
      );
      const allowanceBuffer = Math.max(
        0,
        Number(body.offlineAllowanceBuffer ?? 5)
      );

      const settings = await prisma.companySettings.upsert({
        where: { companyId },
        update: {
          offlineInventoryPolicy: validPolicy,
          offlineGrantTtlHours: ttlHours,
          offlineAllowanceBuffer: allowanceBuffer,
        },
        create: {
          companyId,
          offlineInventoryPolicy: validPolicy,
          offlineGrantTtlHours: ttlHours,
          offlineAllowanceBuffer: allowanceBuffer,
        },
      });

      return NextResponse.json(
        { success: true, settings },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_STATUS_PATCH_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update sync status" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

