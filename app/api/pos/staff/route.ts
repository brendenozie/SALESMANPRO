import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import {
  listCompanyPOSStaff,
  updateStaffPOSCode,
  listActiveCompanyPOSSessions,
  forceClosePOSSession,
} from "@/lib/pos/posStaffService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const view = searchParams.get("view"); // "staff" or "sessions"

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId parameter", 400);
    }

    if (view === "sessions") {
      const sessions = await listActiveCompanyPOSSessions(companyId);
      return formatResponse(true, sessions, "Active POS sessions retrieved", 200);
    }

    const staff = await listCompanyPOSStaff(companyId);
    return formatResponse(true, staff, "POS staff retrieved", 200);
  } catch (error: any) {
    console.error("[POS_STAFF_GET_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to get POS staff", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, action } = body;

    if (!companyId) {
      return formatResponse(false, null, "Missing companyId", 400);
    }

    if (action === "FORCE_CLOSE") {
      const { sessionId, adminName } = body;
      if (!sessionId) {
        return formatResponse(false, null, "Missing sessionId", 400);
      }
      const closed = await forceClosePOSSession(companyId, sessionId, adminName);
      return formatResponse(true, closed, "Session terminated successfully", 200);
    }

    // Default action: UPDATE_CODE or toggle status
    const { staffProfileId, code, posRole, posPermissions, isPosActive } = body;
    if (!staffProfileId) {
      return formatResponse(false, null, "Missing staffProfileId", 400);
    }

    const result = await updateStaffPOSCode({
      companyId,
      staffProfileId,
      code,
      posRole,
      posPermissions,
      isPosActive,
    });

    return formatResponse(true, result, "Staff POS credentials updated successfully", 200);
  } catch (error: any) {
    console.error("[POS_STAFF_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update staff credentials", 400);
  }
}
