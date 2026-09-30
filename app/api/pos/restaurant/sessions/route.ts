import { NextResponse } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import {
  openTableSession,
  updateTableSession,
  closeTableSession,
} from "@/lib/pos/restaurantService";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, tableId, openedById, guestCount, serviceMode, notes } = body;

    if (!companyId || !tableId || !openedById) {
      return formatResponse(
        false,
        null,
        "companyId, tableId, and openedById are required",
        400
      );
    }

    const session = await openTableSession({
      companyId,
      tableId,
      openedById,
      guestCount,
      serviceMode,
      notes,
    });

    return formatResponse(true, session, "Table session opened", 201);
  } catch (error: any) {
    console.error("[TABLE_SESSION_POST_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to open table session", 500);
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { companyId, sessionId, guestCount, notes } = body;

    if (!companyId || !sessionId) {
      return formatResponse(false, null, "companyId and sessionId are required", 400);
    }

    const session = await updateTableSession({
      companyId,
      sessionId,
      guestCount,
      notes,
    });

    return formatResponse(true, session, "Table session updated", 200);
  } catch (error: any) {
    console.error("[TABLE_SESSION_PUT_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to update table session", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    const sessionId = searchParams.get("sessionId");

    if (!companyId || !sessionId) {
      return formatResponse(false, null, "companyId and sessionId are required", 400);
    }

    const result = await closeTableSession(companyId, sessionId);
    return formatResponse(true, result, "Table session closed", 200);
  } catch (error: any) {
    console.error("[TABLE_SESSION_DELETE_ERROR]", error);
    return formatResponse(false, null, error.message || "Failed to close table session", 500);
  }
}
