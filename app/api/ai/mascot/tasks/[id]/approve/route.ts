/**
 * app/api/ai/mascot/tasks/[id]/approve/route.ts
 *
 * Approves a paused/awaiting-approval background task.
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
    const { companyId } = body;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    const updatedTask = await MascotTaskService.approveTask(
      taskId,
      context.userId,
      context.companyId,
      context.userRole
    );

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Task approved successfully. Execution has been queued.",
    });
  } catch (error: any) {
    console.error("[MASCOT_TASK_APPROVE_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to approve task" },
      { status: 400 }
    );
  }
}
