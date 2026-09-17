/**
 * lib/observability/retention.ts
 *
 * Observability Data Retention and Metric Rollup Aggregator.
 * Purges raw request traces past retention limits while preserving rolled-up aggregates.
 */

import prisma from "@/server/db/prismadb";

const RAW_REQUEST_RETENTION_DAYS = 7;
const AGGREGATE_RETENTION_DAYS = 90;

/**
 * Runs historical metric rollups and applies retention cleanup
 */
export async function runRetentionCleanup(): Promise<{
  purgedRequestsCount: number;
  rolledUpAggregates: number;
}> {
  let purgedRequestsCount = 0;
  let rolledUpAggregates = 0;

  try {
    const rawCutoff = new Date(Date.now() - RAW_REQUEST_RETENTION_DAYS * 24 * 60 * 60 * 1000);

    // 1. Roll up past hour of requests into an aggregate bucket before purging
    const oneHourAgo = new Date(Date.now() - 3600000);
    const twoHoursAgo = new Date(Date.now() - 7200000);

    const requests = await prisma.monitoringRequest.findMany({
      where: {
        timestamp: { gte: twoHoursAgo, lt: oneHourAgo },
      },
      select: { durationMs: true, isError: true, serverId: true },
    });

    if (requests.length > 0) {
      const count = requests.length;
      const totalDuration = requests.reduce((acc, r) => acc + r.durationMs, 0);
      const avg = totalDuration / count;
      const sortedDurations = requests.map((r) => r.durationMs).sort((a, b) => a - b);
      const p95 = sortedDurations[Math.floor(sortedDurations.length * 0.95)] || avg;
      const p99 = sortedDurations[Math.floor(sortedDurations.length * 0.99)] || avg;
      const min = sortedDurations[0] || 0;
      const max = sortedDurations[sortedDurations.length - 1] || 0;
      const serverId = requests[0]?.serverId || "server-01";

      const bucketStart = new Date(twoHoursAgo);
      bucketStart.setMinutes(0, 0, 0);

      await prisma.monitoringMetricAggregate.upsert({
        where: {
          serverId_metricType_period_bucketStart: {
            serverId,
            metricType: "duration_ms",
            period: "hour",
            bucketStart,
          },
        },
        create: {
          serverId,
          metricType: "duration_ms",
          period: "hour",
          bucketStart,
          count,
          avg: Math.round(avg * 10) / 10,
          min,
          max,
          p95: Math.round(p95 * 10) / 10,
          p99: Math.round(p99 * 10) / 10,
        },
        update: {
          count,
          avg: Math.round(avg * 10) / 10,
          min,
          max,
          p95: Math.round(p95 * 10) / 10,
          p99: Math.round(p99 * 10) / 10,
        },
      });

      rolledUpAggregates++;
    }

    // 2. Delete raw requests older than retention cutoff (keeping slow requests up to 14 days)
    const deleteResult = await prisma.monitoringRequest.deleteMany({
      where: {
        timestamp: { lt: rawCutoff },
        isSlow: false,
      },
    });

    purgedRequestsCount = deleteResult.count;

    // 3. Delete old aggregates older than 90 days
    const aggregateCutoff = new Date(Date.now() - AGGREGATE_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    await prisma.monitoringMetricAggregate.deleteMany({
      where: {
        bucketStart: { lt: aggregateCutoff },
      },
    });
  } catch (err: any) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Observability] Retention cleanup warning:", err.message);
    }
  }

  return { purgedRequestsCount, rolledUpAggregates };
}
