/**
 * app/api/whatsapp/health/route.ts
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { redisConnection } from "@/lib/redis";
import { getWhatsAppWorkerHealth } from "@/lib/whatsapp/workerHealth";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<
    string,
    { status: "HEALTHY" | "UNHEALTHY" | "WARNING"; latencyMs?: number; message?: string }
  > = {};

  try {
    const dbStart = Date.now();
    await prisma.company.findFirst({ select: { id: true } });
    checks.database = { status: "HEALTHY", latencyMs: Date.now() - dbStart };
  } catch (dbError) {
    checks.database = {
      status: "UNHEALTHY",
      message: "Database ping failed",
    };
  }

  try {
    const redisStart = Date.now();
    const pong = await redisConnection.ping();
    checks.redis = {
      status: pong === "PONG" ? "HEALTHY" : "UNHEALTHY",
      latencyMs: Date.now() - redisStart,
    };
  } catch {
    checks.redis = { status: "UNHEALTHY", message: "Redis ping failed" };
  }

  checks.worker = await getWhatsAppWorkerHealth();

  const hasVerifyToken = Boolean(process.env.WHATSAPP_VERIFY_TOKEN);
  const hasAppSecret = Boolean(process.env.WHATSAPP_APP_SECRET);
  const hasAIKey = Boolean(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);
  const tenantAccounts = await prisma.whatsAppAccount.count({
    where: { isActive: true },
  }).catch(() => 0);

  checks.configuration = {
    status:
      hasVerifyToken && hasAIKey && (hasAppSecret || tenantAccounts > 0)
        ? "HEALTHY"
        : "WARNING",
    message: `Verify token configured: ${hasVerifyToken}. AI provider configured: ${hasAIKey}. Active WhatsApp accounts: ${tenantAccounts}.`,
  };

  const isHealthy =
    checks.database.status === "HEALTHY" &&
    checks.redis.status === "HEALTHY" &&
    checks.worker.status !== "UNHEALTHY";

  return NextResponse.json(
    {
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      checks,
    },
    {
      status: isHealthy ? 200 : 503,
    },
  );
}
