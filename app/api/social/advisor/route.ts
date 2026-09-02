/**
 * app/api/social/advisor/route.ts
 *
 * AI Marketing Advisor interactive queries. Synthesizes real store products,
 * publication history, and performance to deliver data-backed advice.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { marketingAdvisor } from "@/lib/social/marketingAdvisor";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json().catch(() => ({}));

    const advice = await marketingAdvisor.getAdvice({
      companyId: auth.companyId,
      question: body.question,
    });

    return NextResponse.json({
      success: true,
      advice,
    });
  } catch (error: any) {
    console.error("[POST /api/social/advisor] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query AI Marketing Advisor" },
      { status: error.statusCode || 500 }
    );
  }
}
