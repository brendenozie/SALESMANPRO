/**
 * app/api/ai/mascot/tasks/[id]/resume/route.ts
 *
 * Resumes a paused background task.
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

    const updatedTask = await MascotTaskService.resumeTask(
      taskId,
      context.userId,
      context.companyId
    );

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Task resumed and re-queued successfully.",
    });
  } catch (error: any) {
    console.error("[MASCOT_TASK_RESUME_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to resume task" },
      { status: 400 }
    );
  }
}
