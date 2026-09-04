/**
 * app/api/ai/workforce/tasks/route.ts
 *
 * Query tasks executed by the AI Workforce.
 * - Store Admins can query tasks for their specific store.
 * - Super Admins can query tasks across all stores and platform agents.
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { AgentTaskStatus } from "@/lib/ai/workforce/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") as AgentTaskStatus | null;
    const agentId = searchParams.get("agentId");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    const isSuperAdmin = auth.role === "SUPER_ADMIN";

    const where: any = {};

    if (!isSuperAdmin) {
      where.companyId = auth.companyId;
    } else {
      const companyId = searchParams.get("companyId");
      if (companyId) where.companyId = companyId;
    }

    if (status) where.status = status;
    if (agentId) where.agentId = agentId;

    const [tasks, total] = await Promise.all([
      prisma.aIAgentTask.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          agent: {
            select: {
              key: true,
              name: true,
              level: true,
            },
          },
          approvals: {
            select: {
              id: true,
              status: true,
              actionType: true,
              title: true,
            },
          },
        },
      }),
      prisma.aIAgentTask.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[WORKFORCE_TASKS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to query tasks" },
      { status: error.statusCode || 500 },
    );
  }
}
