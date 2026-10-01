/**
 * app/api/ai/mascot/tasks/[id]/reject/route.ts
 *
 * Rejects a task awaiting approval and refunds reserved credits.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotTaskService } from "@/lib/ai/mascot/taskService";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await req.json().catch(() => ({}));
    const { companyId, reason = "Rejected by reviewer" } = body;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    const updatedTask = await MascotTaskService.rejectTask(
      taskId,
      context.userId,
      context.companyId,
      reason
    );

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Task rejected. Reserved credits have been refunded.",
    });
  } catch (error: any) {
    console.error("[MASCOT_TASK_REJECT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reject task" },
      { status: 400 }
    );
  }
}
