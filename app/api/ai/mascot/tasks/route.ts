/**
 * app/api/ai/mascot/tasks/route.ts
 *
 * Scoped API endpoint for listing and initiating Mascot Background AI Tasks.
 */

import { NextRequest, NextResponse } from "next/server";
import { MascotContextResolver } from "@/lib/ai/mascot/contextResolver";
import { MascotTaskService } from "@/lib/ai/mascot/taskService";
import { MascotTaskType, MascotTaskPriority, MascotTaskState } from "@/lib/ai/mascot/taskTypes";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get("companyId") || undefined;
    const statusParam = searchParams.get("status") as MascotTaskState | undefined;
    const taskTypeParam = searchParams.get("taskType") as MascotTaskType | undefined;
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId: companyIdParam,
    });

    const result = await MascotTaskService.getTasksForTenant(
      context.companyId,
      {
        status: statusParam,
        taskType: taskTypeParam,
        search,
        limit,
        offset,
      },
      context.isSuperAdmin
    );

    return NextResponse.json({
      success: true,
      tasks: result.tasks,
      total: result.total,
    });
  } catch (error: any) {
    console.error("[MASCOT_TASKS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tasks" },
      { status: error.message?.includes("Authentication") ? 401 : 400 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId,
      taskType,
      title,
      description,
      priority,
      requiresApproval,
      approvalDetails,
      subtasks,
      input = {},
      creditCost,
    } = body;

    const { context } = await MascotContextResolver.resolveContext({
      req,
      companyId,
    });

    if (!taskType || !title) {
      return NextResponse.json(
        { success: false, error: "taskType and title are required" },
        { status: 400 }
      );
    }

    const task = await MascotTaskService.createTask({
      companyId: context.companyId,
      storeSlug: context.storeSlug,
      userId: context.userId,
      userRole: context.userRole,
      taskType: taskType as MascotTaskType,
      title,
      description,
      priority: (priority as MascotTaskPriority) || 2,
      requiresApproval: !!requiresApproval,
      approvalDetails,
      subtasks,
      input,
      creditCost: creditCost ?? 10,
    });

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error("[MASCOT_TASKS_POST_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create task" },
      { status: error.message?.includes("Authentication") ? 401 : 400 }
    );
  }
}
