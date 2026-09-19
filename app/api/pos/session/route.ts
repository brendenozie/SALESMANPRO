import { NextResponse } from "next/server";
import { getCurrentPOSSession } from "@/lib/pos/posSessionService";
import { formatResponse } from "@/lib/formatResponse";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const terminalId = searchParams.get("terminalId") || "T01";

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId query parameter", 400);
    }

    const session = await getCurrentPOSSession(companyId, terminalId);
    return formatResponse(true, session, "Active session retrieved", 200);
  } catch (error: any) {
    console.error("[POS_SESSION_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to get POS session", 500);
  }
}
