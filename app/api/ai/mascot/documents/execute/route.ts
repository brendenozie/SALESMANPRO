/**
 * app/api/ai/mascot/documents/execute/route.ts
 *
 * Scoped API endpoint for executing an approved document action into canonical store records.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotDocumentActionEngine } from "@/lib/ai/mascot/documentActionEngine";
import { DocumentActionType } from "@/lib/ai/mascot/documentTypes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { actionType, proposedRecord, companyId } = body;

    if (!actionType || !proposedRecord) {
      return NextResponse.json(
        { success: false, error: "actionType and proposedRecord are required" },
        { status: 400 }
      );
    }

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    const result = await MascotDocumentActionEngine.executeApprovedAction({
      actionType: actionType as DocumentActionType,
      companyId: context.companyId,
      storeSlug: context.storeSlug,
      userId: context.userId,
      userRole: context.userRole,
      proposedRecord,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[MASCOT_DOCUMENT_EXECUTE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute document action" },
      { status: 400 }
    );
  }
}
