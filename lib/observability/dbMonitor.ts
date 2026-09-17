/**
 * lib/observability/dbMonitor.ts
 *
 * MongoDB & Prisma Database Health Inspector.
 * Measures database round-trip latency, collection statistics, and integrates
 * with the backup subsystem to verify backup freshness.
 */

import prisma from "@/server/db/prismadb";
import { DatabaseHealthSummary } from "./types";

/**
 * Checks MongoDB database connectivity and measures query latency
 */
export async function getDatabaseHealth(): Promise<DatabaseHealthSummary> {
  const start = Date.now();
  let status: "ONLINE" | "DEGRADED" | "OFFLINE" = "OFFLINE";
  let pingLatencyMs = 0;
  let isPrimary = true;
  let dbName = "salesmanpro";

  try {
    // Run admin ping command
    const pingResult = await Promise.race([
      (prisma as any).$runCommandRaw({ ping: 1 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("MongoDB ping timeout")), 3000)),
    ]);

    pingLatencyMs = Date.now() - start;
    status = pingLatencyMs > 200 ? "DEGRADED" : "ONLINE";
  } catch (err: any) {
    pingLatencyMs = Date.now() - start;
    status = "OFFLINE";
  }

  // Sample primary collection counts
  const collections: { name: string; estimatedCount: number }[] = [];
  if (status !== "OFFLINE") {
    try {
      const [users, companies, products, orders, payments, messages] = await Promise.all([
        prisma.user.count().catch(() => 0),
        prisma.company.count().catch(() => 0),
        prisma.product.count().catch(() => 0),
        prisma.customerOrder.count().catch(() => 0),
        prisma.payment.count().catch(() => 0),
        prisma.whatsAppMessage.count().catch(() => 0),
      ]);

      collections.push(
        { name: "User", estimatedCount: users },
        { name: "Company", estimatedCount: companies },
        { name: "Product", estimatedCount: products },
        { name: "CustomerOrder", estimatedCount: orders },
        { name: "Payment", estimatedCount: payments },
        { name: "WhatsAppMessage", estimatedCount: messages },
      );
    } catch {}
  }

  // Check last backup status from DatabaseBackup table
  let lastSuccessfulBackup: any = null;
  let lastFailedBackup: any = null;

  try {
    const success = await prisma.databaseBackup.findFirst({
      where: { status: { in: ["COMPLETED", "VERIFIED"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, sizeBytes: true, status: true },
    });

    if (success) {
      lastSuccessfulBackup = {
        id: success.id,
        createdAt: success.createdAt.toISOString(),
        byteSize: Number(success.sizeBytes || 0),
        status: success.status,
      };
    }

    const failed = await prisma.databaseBackup.findFirst({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, failureReason: true },
    });

    if (failed) {
      lastFailedBackup = {
        id: failed.id,
        createdAt: failed.createdAt.toISOString(),
        error: failed.failureReason || "Backup execution failure",
      };
    }
  } catch {}

  // Slow requests in DB
  let slowQueriesCount = 0;
  try {
    slowQueriesCount = await prisma.monitoringRequest.count({
      where: {
        isSlow: true,
        timestamp: { gte: new Date(Date.now() - 3600000) },
      },
    });
  } catch {}

  return {
    status,
    pingLatencyMs,
    isPrimary,
    databaseName: dbName,
    totalCollections: collections.length,
    collections,
    lastSuccessfulBackup,
    lastFailedBackup,
    slowQueriesCount,
  };
}
