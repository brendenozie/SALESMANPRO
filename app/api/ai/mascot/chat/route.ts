/**
 * app/api/ai/mascot/chat/route.ts
 *
 * Natural Language Chat API for SalesmanPro AI Mascot.
 * Processes user text/voice queries, orchestrates role-based capability resolution,
 * executes canonical operations, and enforces Human-in-the-loop approvals.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotTaskPlanner } from "@/lib/ai/mascot/taskPlanner";
import { MascotActionEngine } from "@/lib/ai/mascot/actionEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, companyId, currentPath, isVoice } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "A message string is required." },
        { status: 400 },
      );
    }

    // 1. Resolve authentic context and authorized capabilities
    const { context, authorizedCapabilities, suggestedActions } =
      await MascotContextResolver.resolveContext({
        req,
        companyId,
        currentPath,
      });

    // 2. Verify Mascot is enabled for this store
    if (!context.mascotEnabled) {
      return NextResponse.json({
        success: true,
        reply: "The AI Business Mascot is currently turned off for this store. An administrator can enable it under Settings → AI Assistant → Mascot.",
        state: "unavailable",
      });
    }

    // 3. Plan task & parse intent within tenant permissions
    const planned = await MascotTaskPlanner.planTask(
      message,
      context,
      authorizedCapabilities,
    );

    // 4. If action requires approval and is not approved, return approval card
    if (planned.requiresApproval && planned.actionCard) {
      // Save approval ticket to database
      const result = await MascotActionEngine.executeAction({
        capability: planned.capability,
        entities: planned.entities,
        context,
        approved: false,
      });

      return NextResponse.json({
        success: true,
        reply: result.summary,
        state: "needs_approval",
        actionCard: result.actionCard || planned.actionCard,
        suggestedActions,
        creditCost: planned.creditCost,
      });
    }

    // 5. Execute safe action or prepare preview
    const result = await MascotActionEngine.executeAction({
      capability: planned.capability,
      entities: planned.entities,
      context,
      approved: true, // Safe reads or safe writes do not require approval
    });

    return NextResponse.json({
      success: true,
      reply: result.summary,
      state: result.success ? "success" : "error",
      data: result.data,
      deepLinks: result.deepLinks,
      actionCard: result.actionCard || planned.actionCard,
      suggestedActions,
      creditsConsumed: result.creditsConsumed || planned.creditCost,
      creditBalance: Math.max(0, context.aiCreditBalance - (result.creditsConsumed || planned.creditCost)),
    });
  } catch (error: any) {
    console.error("[MASCOT_CHAT_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        reply: error.message || "An error occurred while processing your request.",
        error: error.message,
        state: "error",
      },
      { status: error.message?.includes("Authentication") ? 401 : 400 },
    );
  }
}
