/**
 * app/api/whatsapp/health/route.ts
 *
 * WhatsApp AI health check and diagnostics endpoint.
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { redisConnection } from "@/lib/redis";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: "HEALTHY" | "UNHEALTHY" | "WARNING"; latencyMs?: number; message?: string }> = {};

  // 1. Database Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "HEALTHY", latencyMs: Date.now() - dbStart };
  } catch (dbError) {
    checks.database = {
      status: "UNHEALTHY",
      message: dbError instanceof Error ? dbError.message : "Database ping failed",
    };
  }

  // 2. Redis Check
  try {
    const redisStart = Date.now();
    const pong = await redisConnection.ping();
    checks.redis = {
      status: pong === "PONG" ? "HEALTHY" : "UNHEALTHY",
      latencyMs: Date.now() - redisStart,
    };
  } catch (redisError) {
    checks.redis = {
      status: "UNHEALTHY",
      message: redisError instanceof Error ? redisError.message : "Redis ping failed",
    };
  }

  // 3. Environment Config Check
  const hasVerifyToken = Boolean(process.env.WHATSAPP_VERIFY_TOKEN);
  const hasAccessToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasPhoneNumberId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasAIKey = Boolean(process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY);

  checks.configuration = {
    status: hasVerifyToken && hasAccessToken && hasPhoneNumberId && hasAIKey ? "HEALTHY" : "WARNING",
    message: `VerifyToken: ${hasVerifyToken}, AccessToken: ${hasAccessToken}, PhoneNumberId: ${hasPhoneNumberId}, AIProvider: ${hasAIKey}`,
  };

  const isHealthy = checks.database.status === "HEALTHY" && checks.redis.status === "HEALTHY";

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
