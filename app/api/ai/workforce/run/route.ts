/**
 * app/api/ai/workforce/run/route.ts
 *
 * Dispatch endpoint for running AI Workforce tasks.
 * Supports:
 * - Synchronous execution (immediate response with tool traces & reasoning)
 * - Asynchronous execution (enqueued in BullMQ for background worker execution)
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { WorkforceOrchestrator } from "@/lib/ai/workforce/orchestrator";
import { enqueueWorkforceTask } from "@/lib/ai/workforce/queue";
import { WorkforceAgentRegistry } from "@/lib/ai/workforce/agentRegistry";
import { AgentRunInput, WorkforceExecutionContext, AgentWorkforceLevel } from "@/lib/ai/workforce/types";

const orchestrator = new WorkforceOrchestrator();

export async function POST(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      agentKey,
      prompt,
      conversationHistory,
      parameters,
      priority,
      async: isAsync = false,
      channel = "WEB",
    } = body;

    if (!agentKey || !prompt) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: 'agentKey' and 'prompt'." },
        { status: 400 },
      );
    }

    const agentDef = WorkforceAgentRegistry.getAgent(agentKey);
    if (!agentDef) {
      return NextResponse.json(
        { success: false, error: `Agent '${agentKey}' is not registered.` },
        { status: 404 },
      );
    }

    // Platform or Marketplace agents require Super Admin
    if (agentDef.level !== AgentWorkforceLevel.STORE && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "Super Admin privileges required to execute Platform or Marketplace agents." },
        { status: 403 },
      );
    }

    const runInput: AgentRunInput = {
      agentKey,
      prompt,
      conversationHistory,
      parameters,
      channel,
      priority,
    };

    const context: WorkforceExecutionContext = {
      companyId: agentDef.level === AgentWorkforceLevel.STORE ? auth.companyId : undefined,
      companyName: auth.companyName,
      userId: auth.userId,
      userRole: auth.role,
      level: agentDef.level,
      traceId: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channel,
    };

    // If async requested or long-running background task
    if (isAsync) {
      const { jobId } = await enqueueWorkforceTask(runInput, context);
      return NextResponse.json({
        success: true,
        queued: true,
        jobId,
        message: `Task for ${agentDef.name} queued successfully in BullMQ.`,
      });
    }

    // Synchronous execution
    const result = await orchestrator.execute(runInput, context);

    return NextResponse.json({
      success: true,
      queued: false,
      result,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_RUN_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute agent task" },
      { status: error.statusCode || 500 },
    );
  }
}
