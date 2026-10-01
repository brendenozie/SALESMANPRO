/**
 * app/api/ai/mascot/tasks/[id]/route.ts
 *
 * Scoped API endpoint for retrieving a single Mascot task detail and live status.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotTaskService } from "@/lib/ai/mascot/taskService";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get("companyId") || undefined;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId: companyIdParam,
    });

    const task = await MascotTaskService.getTaskById(
      taskId,
      context.companyId,
      context.isSuperAdmin
    );

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error("[MASCOT_TASK_GET_DETAIL_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch task" },
      { status: 400 }
    );
  }
}
