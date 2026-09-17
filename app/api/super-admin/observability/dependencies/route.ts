/**
 * app/api/super-admin/observability/dependencies/route.ts
 *
 * External API & Dependency Health Status API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { probeExternalServices } from "@/lib/observability/serviceMonitor";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const dependencies = await probeExternalServices();
    return NextResponse.json({ success: true, data: { dependencies } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to probe external dependencies" },
      { status: 500 },
    );
  }
}
