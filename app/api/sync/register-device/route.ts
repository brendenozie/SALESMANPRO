import { NextResponse } from "next/server";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import {
  issueDeviceOfflineGrant,
  getProvisionedStaffPinDigests,
} from "@/lib/sync/offlineGrantService";
import { getHeadSequence } from "@/lib/sync/changeLogService";

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
 * POST /api/sync/register-device
 * Registers or renews a POS terminal (Android, Desktop WPF, or Web), issues a signed
 * time-limited Offline Authorization Grant, and provisions store staff PIN digests.
 */
export const POST = withApiHandler(async (req, context) => {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedCompanyId =
      body.companyId || req.headers.get("x-pos-company-id") || undefined;
    const storeId =
      body.storeId || req.headers.get("x-pos-store-id") || null;
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
          error: tenantScope.error || "Forbidden: Unauthorized store tenant",
        },
        { status: tenantScope.status || 403, headers: CORS_HEADERS }
      );
    }

    const companyId = tenantScope.companyId;
    const userId = context.user?.id || "";

    const { grant, registeredDevice } = await issueDeviceOfflineGrant({
      companyId,
      storeId,
      deviceId,
      deviceName: body.deviceName || body.name || null,
      platform: body.platform || req.headers.get("x-client-platform") || "WEB",
      appVersion: body.appVersion || "2.4.0",
      protocolVersion: Number(body.protocolVersion || 1),
      userId,
      role: context.user?.role || "CASHIER",
      customPosPermissions: Array.isArray(body.posPermissions)
        ? body.posPermissions
        : [],
    });

    const [staffPinDigests, seqInfo] = await Promise.all([
      getProvisionedStaffPinDigests(companyId),
      getHeadSequence(companyId),
    ]);

    return NextResponse.json(
      {
        success: true,
        protocolVersion: 1,
        device: registeredDevice,
        offlineGrant: grant,
        staffPinDigests,
        headSequence: seqInfo.headSequence,
        serverTime: new Date().toISOString(),
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    const isRevoked = err.message?.toLowerCase().includes("revoked");
    return NextResponse.json(
      {
        success: false,
        code: isRevoked ? "DEVICE_REVOKED" : "REGISTRATION_FAILED",
        error: err.message || "Failed to register device",
      },
      { status: isRevoked ? 403 : 500, headers: CORS_HEADERS }
    );
  }
});

