/**
 * app/api/ai/mascot/tasks/[id]/cancel/route.ts
 *
 * Cancels a running or queued background task.
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
    const { companyId, reason = "Cancelled by user" } = body;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    const updatedTask = await MascotTaskService.cancelTask(
      taskId,
      context.userId,
      context.companyId,
      reason
    );

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Task cancelled successfully.",
    });
  } catch (error: any) {
    console.error("[MASCOT_TASK_CANCEL_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel task" },
      { status: 400 }
    );
  }
}
