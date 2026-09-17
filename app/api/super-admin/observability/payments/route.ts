/**
 * app/api/super-admin/observability/payments/route.ts
 *
 * Payment Gateway & Webhook Reliability Telemetry API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const past7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalPayments, successfulPayments, failedPayments, recentPayments, webhookRequests] =
      await Promise.all([
        prisma.payment.count({ where: { createdAt: { gte: past7d } } }).catch(() => 0),
        prisma.payment.count({
          where: {
            createdAt: { gte: past7d },
            status: { in: ["SUCCESS", "PAID", "COMPLETED"] },
          },
        }).catch(() => 0),
        prisma.payment.count({
          where: {
            createdAt: { gte: past7d },
            status: { in: ["FAILED", "REJECTED", "CANCELLED"] },
          },
        }).catch(() => 0),
        prisma.payment.findMany({
          orderBy: { createdAt: "desc" },
          take: 15,
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            updatedAt: true,
          },
        }).catch(() => []),
        prisma.monitoringRequest.findMany({
          where: {
            route: { contains: "webhook" },
            timestamp: { gte: past7d },
          },
          orderBy: { timestamp: "desc" },
          take: 20,
        }).catch(() => []),
      ]);

    const failureRate =
      totalPayments > 0
        ? Math.round((failedPayments / totalPayments) * 1000) / 10
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalPayments7d: totalPayments,
          successfulPayments7d: successfulPayments,
          failedPayments7d: failedPayments,
          failureRatePercent: failureRate,
          webhookEventsTracked: webhookRequests.length,
        },
        recentPayments: recentPayments.map((p) => ({
          ...p,
          createdAt: p.createdAt?.toISOString() || null,
          updatedAt: p.updatedAt?.toISOString() || null,
        })),
        recentWebhooks: webhookRequests.map((w) => ({
          requestId: w.requestId,
          timestamp: w.timestamp.toISOString(),
          route: w.route,
          statusCode: w.statusCode,
          durationMs: w.durationMs,
          isError: w.isError,
          errorMessage: w.errorMessage,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch payment telemetry" },
      { status: 500 },
    );
  }
}
