/**
 * app/api/super-admin/observability/workers/route.ts
 *
 * Background Workers and BullMQ Queue Management API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import { getAllQueueStatuses, retryFailedQueueJobs } from "@/lib/observability/queueMonitor";
import { getRedisHealth } from "@/lib/observability/redisMonitor";

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
    const [queues, redis] = await Promise.all([
      getAllQueueStatuses(),
      getRedisHealth(),
    ]);
    return NextResponse.json({ success: true, data: { queues, redis } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch queue and Redis telemetry" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const body = await req.json();
    const { queueName, action } = body;

    if (!queueName) {
      return NextResponse.json(
        { success: false, error: "queueName is required" },
        { status: 400 },
      );
    }

    if (action === "retry") {
      const result = await retryFailedQueueJobs(queueName);
      return NextResponse.json({
        success: true,
        message: `Successfully triggered retry for ${result.retried} failed jobs on ${queueName}`,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to execute queue operation" },
      { status: 500 },
    );
  }
}
