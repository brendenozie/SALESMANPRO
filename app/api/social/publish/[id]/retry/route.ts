/**
 * app/api/social/publish/[id]/retry/route.ts
 *
 * Retries a specific failed social publication without regenerating AI content.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;

    const result = await socialService.retryPublication(auth.companyId, id);

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (error: any) {
    console.error("[POST /api/social/publish/[id]/retry] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retry publication" },
      { status: error.statusCode || 500 }
    );
  }
}
