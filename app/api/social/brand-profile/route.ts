/**
 * app/api/social/brand-profile/route.ts
 *
 * Manages store-level brand voice, audience personas, banned words, and approval mode.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const profile = await socialService.getBrandProfile(auth.companyId);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("[GET /api/social/brand-profile] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch brand profile" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const profile = await socialService.upsertBrandProfile(auth.companyId, body);

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("[PUT /api/social/brand-profile] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update brand profile" },
      { status: error.statusCode || 500 }
    );
  }
}
