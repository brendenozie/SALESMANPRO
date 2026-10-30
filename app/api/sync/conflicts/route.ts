import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-POS-Device-Id, X-POS-Company-Id, X-POS-Store-Id",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/sync/conflicts
 * Lists synchronization and inventory reconciliation conflicts for a tenant.
 */
export const GET = withApiHandler(async (req, context) => {
  try {
    const { searchParams } = new URL(req.url);
    const requestedCompanyId =
      searchParams.get("companyId") ||
      req.headers.get("x-pos-company-id") ||
      undefined;
    const statusFilter = searchParams.get("status") || undefined;
    const deviceIdFilter = searchParams.get("deviceId") || undefined;

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

    const conflicts = await prisma.syncConflictRecord.findMany({
      where: {
        companyId,
        ...(statusFilter && statusFilter !== "ALL"
          ? { status: statusFilter }
          : {}),
        ...(deviceIdFilter ? { deviceId: deviceIdFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(
      {
        success: true,
        conflicts,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[SYNC_CONFLICTS_GET_ERROR]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch conflicts" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

