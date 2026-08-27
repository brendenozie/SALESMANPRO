/**
 * app/api/ai/generations/route.ts
 *
 * GET /api/ai/generations
 * Returns recent AI generation jobs for the tenant (images, videos, batch operations).
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { aiService } from "@/lib/ai/aiService";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);

    const capability = searchParams.get("capability") as any;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const data = await aiService.listGenerationJobs({
      companyId: auth.companyId,
      capability,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("[GET_AI_GENERATIONS_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch generation jobs" },
      { status: error.statusCode || 500 },
    );
  }
}
