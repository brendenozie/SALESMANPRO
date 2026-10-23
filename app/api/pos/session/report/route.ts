import { NextRequest } from "next/server";
import { generateShiftReportData } from "@/lib/pos/posReportService";
import { endPOSSession } from "@/lib/pos/posSessionService";
import { formatResponse } from "@/lib/formatResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/session/report
 * Retrieve Shift X-Report or preview Z-Report data
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const companyId = searchParams.get("companyId");
    const rawType = (searchParams.get("type") || "X_REPORT").toUpperCase();
    const countedCashStr = searchParams.get("countedCash");

    if (!sessionId || !companyId) {
      return formatResponse(false, null, "sessionId and companyId are required", 400);
    }

    const reportType = rawType.includes("Z") ? "Z_REPORT" : "X_REPORT";
    const countedCash = countedCashStr != null ? parseFloat(countedCashStr) : undefined;

    const reportData = await generateShiftReportData(sessionId, companyId, reportType, {
      countedCash,
    });

    return formatResponse(true, reportData, `${reportType} generated successfully`, 200);
  } catch (error: any) {
    console.error("[POS_REPORT_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to generate report", 500);
  }
}

/**
 * POST /api/pos/session/report
 * Authoritatively close the shift, calculate financial totals, and return the official Z-Report
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, companyId, countedCash, closingBalance, notes } = body;

    if (!sessionId || !companyId) {
      return formatResponse(false, null, "sessionId and companyId are required", 400);
    }

    const actualCountedCash =
      countedCash != null ? Number(countedCash) : closingBalance != null ? Number(closingBalance) : undefined;

    // 1. Authoritatively close the session
    const closedSession = await endPOSSession(
      sessionId,
      companyId,
      actualCountedCash,
      actualCountedCash,
      notes
    );

    // 2. Generate the official Z-Report record
    const zReport = await generateShiftReportData(sessionId, companyId, "Z_REPORT", {
      countedCash: actualCountedCash,
      notes,
    });

    return formatResponse(
      true,
      { session: closedSession, report: zReport },
      "Shift closed and Z-Report generated successfully",
      200
    );
  } catch (error: any) {
    console.error("[POS_REPORT_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to close shift and generate Z-Report", 500);
  }
}
