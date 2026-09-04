/**
 * app/api/ai/workforce/metrics/route.ts
 *
 * Operational Telemetry & ROI Metrics for AI Workforce.
 * Returns:
 * - Active agent counts & health
 * - Tasks executed (completed, running, waiting approval, failed)
 * - Credits consumed & estimated time saved
 * - Escalations and pending human approvals
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { creditLedger } from "@/lib/ai/creditLedger";
import { AgentTaskStatus, AgentApprovalStatus } from "@/lib/ai/workforce/types";

export async function GET(req: NextRequest) {
  try {
    const auth = await resolveAIAuth(req);
    const isSuperAdmin = auth.role === "SUPER_ADMIN";

    const companyWhere = isSuperAdmin ? {} : { companyId: auth.companyId };

    const [
      totalTasks,
      completedTasks,
      pendingApprovals,
      runningTasks,
      failedTasks,
      activeAgents,
      escalationCount,
      creditBalance,
    ] = await Promise.all([
      prisma.aIAgentTask.count({ where: companyWhere }),
      prisma.aIAgentTask.count({ where: { ...companyWhere, status: AgentTaskStatus.COMPLETED } }),
      prisma.aIAgentApproval.count({ where: { ...companyWhere, status: AgentApprovalStatus.PENDING } }),
      prisma.aIAgentTask.count({ where: { ...companyWhere, status: AgentTaskStatus.RUNNING } }),
      prisma.aIAgentTask.count({ where: { ...companyWhere, status: AgentTaskStatus.FAILED } }),
      prisma.aIAgent.count({ where: { ...companyWhere, enabled: true } }),
      prisma.aIAgentEscalation.count({ where: { ...companyWhere, status: "OPEN" } }).catch(() => 0),
      auth.companyId ? creditLedger.getBalance(auth.companyId).catch(() => 0) : 0,
    ]);

    // Aggregate credit usage across all workforce tasks
    const taskCreditsAggregate = await prisma.aIAgentTask.aggregate({
      where: companyWhere,
      _sum: {
        creditsUsed: true,
      },
    });

    const totalCreditsUsed = taskCreditsAggregate._sum.creditsUsed || 0;

    // ROI estimation:
    // Average operational task handled by an AI agent saves ~8 minutes of human staff labor
    const estimatedMinutesSaved = completedTasks * 8;
    const hoursSaved = (estimatedMinutesSaved / 60).toFixed(1);

    // Recent task activity stream (last 5)
    const recentTasks = await prisma.aIAgentTask.findMany({
      where: companyWhere,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        agent: {
          select: {
            key: true,
            name: true,
            level: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalTasks,
        completedTasks,
        pendingApprovals,
        runningTasks,
        failedTasks,
        activeAgents,
        escalationCount,
        creditBalance,
        totalCreditsUsed,
        estimatedHoursSaved: Number(hoursSaved),
        successRatePercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
      },
      recentTasks,
    });
  } catch (error: any) {
    console.error("[WORKFORCE_METRICS_GET_ERROR]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve workforce metrics" },
      { status: error.statusCode || 500 },
    );
  }
}
