/**
 * app/api/ai/workforce/tasks/[id]/route.ts
 *
 * Inspect task details, complete step-by-step executions, tool calls, and cancellation.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AgentTaskStatus } from "@/lib/ai/workforce/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;

    const task = await prisma.aIAgentTask.findUnique({
      where: { id },
      include: {
        agent: true,
        executions: {
          orderBy: { stepNumber: "asc" },
        },
        approvals: true,
      },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    // Tenant boundary check
    if (task.companyId && task.companyId !== auth.companyId && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized access to task." }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_TASK_GET_BY_ID_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve task details" },
      { status: error.statusCode || 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;

    const task = await prisma.aIAgentTask.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }

    if (task.companyId && task.companyId !== auth.companyId && auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
    }

    if (task.status === AgentTaskStatus.RUNNING || task.status === AgentTaskStatus.QUEUED) {
      const updated = await prisma.aIAgentTask.update({
        where: { id },
        data: {
          status: AgentTaskStatus.CANCELLED,
          failureReason: "Cancelled by user",
          completedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, task: updated });
    }

    return NextResponse.json({ success: false, error: `Cannot cancel task in status '${task.status}'` }, { status: 400 });
  } catch (error: any) {
    console.error("[WORKFORCE_TASK_CANCEL_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel task" },
      { status: error.statusCode || 500 },
    );
  }
}
