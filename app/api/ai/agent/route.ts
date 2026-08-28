/**
 * app/api/ai/agent/route.ts
 *
 * POST /api/ai/agent
 * Executes multi-tenant AI agents (Sales Assistant, Support Specialist, Marketing Advisor, Business Analyst)
 * using bounded domain tools and authoritative credit ledger deductions.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { agentRunner } from "@/lib/ai/agents/agentRunner";

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      prompt,
      agentRole = "SALES_ASSISTANT",
      conversationHistory,
      modelId,
      idempotencyKey,
    } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    const result = await agentRunner.run(
      {
        prompt,
        agentRole,
        conversationHistory,
        modelId,
      },
      {
        companyId: auth.companyId,
        userId: auth.userId,
        source: "WEB",
        feature: `agent_${agentRole.toLowerCase()}`,
        idempotencyKey,
      },
    );

    return NextResponse.json({
      success: true,
      data: result,
      reply: result.reply,
      model: result.model,
      creditsConsumed: result.creditsConsumed,
    });
  } catch (error: any) {
    console.error("[POST_AI_AGENT_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Agent execution failed",
        code: error.code || "AGENT_EXECUTION_FAILED",
      },
      { status: error.statusCode || 500 },
    );
  }
}
