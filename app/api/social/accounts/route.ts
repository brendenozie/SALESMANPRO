/**
 * app/api/social/accounts/route.ts
 *
 * Lists connected social media accounts for the authenticated tenant.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const accounts = await socialService.getConnectedAccounts(auth.companyId);

    return NextResponse.json({
      success: true,
      accounts,
      companyId: auth.companyId,
    });
  } catch (error: any) {
    console.error("[GET /api/social/accounts] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch connected social accounts",
      },
      { status: error.statusCode || 500 }
    );
  }
}
