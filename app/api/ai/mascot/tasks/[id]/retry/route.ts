/**
 * app/api/ai/mascot/tasks/[id]/retry/route.ts
 *
 * Retries an eligible failed or expired task.
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

    const updatedTask = await MascotTaskService.retryTask(
      taskId,
      context.userId,
      context.companyId
    );

    return NextResponse.json({
      success: true,
      task: updatedTask,
      message: "Task retry queued successfully.",
    });
  } catch (error: any) {
    console.error("[MASCOT_TASK_RETRY_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retry task" },
      { status: 400 }
    );
  }
}
