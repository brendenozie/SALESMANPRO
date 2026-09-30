import { NextResponse } from "next/server";
import { endPOSSession } from "@/lib/pos/posSessionService";
import { formatResponse } from "@/lib/formatResponse";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { sessionId, companyId, countedCash, closingBalance, notes } = body;

    if (!sessionId || !companyId) {
      return formatResponse(
        false,
        null,
        "Missing required fields: sessionId and companyId",
        400
      );
    }

    const session = await endPOSSession(
      sessionId,
      companyId,
      countedCash != null ? Number(countedCash) : (closingBalance != null ? Number(closingBalance) : undefined),
      closingBalance != null ? Number(closingBalance) : undefined,
      notes
    );

    return formatResponse(true, session, "POS session closed successfully", 200);
  } catch (error: any) {
    console.error("[POS_SESSION_END_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to end POS session", 400);
  }
}
