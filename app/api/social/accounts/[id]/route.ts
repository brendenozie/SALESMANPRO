/**
 * app/api/social/accounts/[id]/route.ts
 *
 * Disconnects or removes a social media account connection.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;

    const result = await socialService.disconnectAccount(auth.companyId, id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[DELETE /api/social/accounts/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to disconnect account" },
      { status: error.statusCode || 500 }
    );
  }
}
