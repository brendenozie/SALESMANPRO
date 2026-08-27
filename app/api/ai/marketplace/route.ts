/**
 * app/api/ai/marketplace/route.ts
 *
 * POST /api/ai/marketplace
 * Dedicated AI actions for multi-vendor marketplace listings and moderation.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { marketplaceAI } from "@/lib/ai/marketplaceAI";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const { action = "LISTING", ...params } = body;

    const context = {
      companyId: auth.companyId,
      userId: auth.userId,
      source: "WEB" as const,
    };

    let result: any;

    switch (action.toUpperCase()) {
      case "LISTING":
        result = await marketplaceAI.generateListing(params, context);
        break;

      case "COMPLIANCE":
        result = await marketplaceAI.reviewListingCompliance(params as any, context);
        break;

      default:
        return NextResponse.json({ success: false, error: `Unsupported marketplace action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[POST_MARKETPLACE_AI_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Marketplace AI generation failed",
        code: error.code || "GENERATION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
