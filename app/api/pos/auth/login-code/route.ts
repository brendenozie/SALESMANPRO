import { NextResponse } from "next/server";
import { authenticatePOSOperator } from "@/lib/pos/posSessionService";
import { formatResponse } from "@/lib/formatResponse";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      companyId,
      loginCode,
      terminalId,
      openingBalance,
      closeOverdueSession,
      countedCash,
      closingBalance,
      notes,
    } = body;

    if (!companyId || !loginCode) {
      return formatResponse(
        false,
        null,
        "Missing required fields: companyId and loginCode",
        400
      );
    }

    const result = await authenticatePOSOperator({
      companyId,
      loginCode,
      terminalId: terminalId || "T01",
      openingBalance: openingBalance != null ? Number(openingBalance) : 0,
      closeOverdueSession: !!closeOverdueSession,
      countedCash: countedCash != null ? Number(countedCash) : undefined,
      closingBalance: closingBalance != null ? Number(closingBalance) : undefined,
      notes,
    });

    return formatResponse(true, result, "Operator authenticated successfully", 200);
  } catch (error: any) {
    console.error("[POS_LOGIN_ERROR]", error);
    const status = error.message?.includes("denied") || error.message?.includes("authorized")
      ? 403
      : error.message?.includes("Invalid")
      ? 401
      : 400;

    return formatResponse(false, null, error.message || "Authentication failed", status);
  }
}
