import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { verifyRegisteredDeviceAccess } from "@/lib/sync/offlineGrantService";
import { pullSyncChanges } from "@/lib/sync/changeLogService";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id, X-Offline-Grant",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/sync/pull?cursor=<seq>&limit=<n>&storeId=<id>&companyId=<id>
 * Incremental change-log delta pull endpoint.
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
      null;
    const deviceId = (
      searchParams.get("deviceId") ||
      req.headers.get("x-pos-device-id") ||
      ""
    ).trim();
    const cursor = Number(searchParams.get("cursor") || 0);
    const limit = Number(searchParams.get("limit") || 200);

    const tenantScope = await resolveAuthorizedCompany(
      context.user,
      requestedCompanyId
    );
    if (!tenantScope.authorized || !tenantScope.companyId) {
      return NextResponse.json(
        {
          success: false,
          code: "TENANT_ISOLATION_VIOLATION",
          error: tenantScope.error || "Forbidden: Unauthorized store tenant",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const companyId = tenantScope.companyId;

    if (deviceId) {
      const accessCheck = await verifyRegisteredDeviceAccess({
        companyId,
        deviceId,
        offlineGrantToken: req.headers.get("x-offline-grant"),
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
    }

    const pullResult = await pullSyncChanges({
      companyId,
      storeId,
      cursor,
      limit,
      excludeDeviceId: deviceId || null,
    });

    return NextResponse.json(
      {
        success: true,
        protocolVersion: 1,
        ...pullResult,
        serverTime: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_PULL_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Pull synchronization failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

