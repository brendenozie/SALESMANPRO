import { NextRequest } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { requireSuperAdmin } from "@/lib/ai/authHelper";

export async function GET(req: NextRequest) {
  try {
    await requireSuperAdmin(req);

    const [totalSent, totalFailed, totalQueued, recentLogs, scopeStats] = await Promise.all([
      prisma.emailDeliveryLog.count({ where: { status: "SENT" } }),
      prisma.emailDeliveryLog.count({ where: { status: "FAILED" } }),
      prisma.emailDeliveryLog.count({ where: { status: "QUEUED" } }),
      prisma.emailDeliveryLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: {
          company: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.emailDeliveryLog.groupBy({
        by: ["scope"],
        _count: { id: true },
      }),
    ]);

    const formattedLogs = recentLogs.map((log) => ({
      id: log.id,
      scope: log.scope,
      companyId: log.companyId,
      companyName: log.company?.name || null,
      recipient: log.recipient,
      template: log.template,
      provider: log.provider,
      fromAddress: log.fromAddress,
      status: log.status,
      providerMessageId: log.providerMessageId,
      error: log.error,
      attempts: log.attempts,
      createdAt: log.createdAt.toISOString(),
      sentAt: log.sentAt?.toISOString() || null,
    }));

    return formatResponse(
      true,
      {
        metrics: {
          totalSent,
          totalFailed,
          totalQueued,
          totalProcessed: totalSent + totalFailed,
          successRate: totalSent + totalFailed > 0
            ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
            : 100,
        },
        scopeBreakdown: scopeStats.reduce((acc, curr) => {
          acc[curr.scope] = curr._count.id;
          return acc;
        }, {} as Record<string, number>),
        recentLogs: formattedLogs,
      },
      "Super admin email metrics fetched successfully",
      200
    );
  } catch (err: any) {
    console.error("[SuperAdmin Email Overview] GET error:", err);
    return formatResponse(false, null, err.message || "Failed to fetch platform metrics", err.statusCode || 500);
  }
}
