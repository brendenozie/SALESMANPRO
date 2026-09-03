/**
 * app/api/health/route.ts
 *
 * Health Check Probes for Single-Server PM2 and Multi-Server Load Balancers.
 *
 * Endpoints:
 * - GET /api/health                   -> Full health summary
 * - GET /api/health?type=liveness    -> Lightweight 200 OK process alive probe
 * - GET /api/health?type=readiness   -> Validates MongoDB & Redis connectivity
 */

import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import redisConnection, { isRedisAvailable } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  // 1. Lightweight Liveness Probe
  if (type === "liveness" || type === "live") {
    return NextResponse.json(
      { status: "ALIVE", timestamp: new Date().toISOString() },
      { status: 200 },
    );
  }

  // 2. Readiness Probe (validates database and cache connectivity)
  let mongoOk = false;
  let mongoLatencyMs = 0;
  let mongoError: string | null = null;

  const mongoStart = Date.now();
  try {
    // Run lightweight admin ping command on MongoDB
    await (prisma as any).$runCommandRaw({ ping: 1 });
    mongoOk = true;
    mongoLatencyMs = Date.now() - mongoStart;
  } catch (err: any) {
    mongoError = err.message;
    mongoLatencyMs = Date.now() - mongoStart;
  }

  // Test Redis connectivity
  let redisOk = false;
  let redisLatencyMs = 0;
  let redisError: string | null = null;

  const redisStart = Date.now();
  try {
    if (isRedisAvailable()) {
      const pong = await redisConnection.ping();
      redisOk = pong === "PONG";
      redisLatencyMs = Date.now() - redisStart;
    } else {
      redisError = "Redis not connected or reconnecting";
    }
  } catch (err: any) {
    redisError = err.message;
    redisLatencyMs = Date.now() - redisStart;
  }

  const isReady = mongoOk; // MongoDB is mandatory for serving production traffic
  const httpStatus = isReady ? 200 : 503;

  const responsePayload = {
    status: isReady ? "HEALTHY" : "DEGRADED",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    serverId: process.env.SERVER_ID || "node-1",
    services: {
      mongodb: {
        status: mongoOk ? "CONNECTED" : "FAILED",
        latencyMs: mongoLatencyMs,
        ...(mongoError ? { error: mongoError } : {}),
      },
      redis: {
        status: redisOk ? "CONNECTED" : "DISCONNECTED",
        latencyMs: redisLatencyMs,
        ...(redisError ? { error: redisError } : {}),
      },
    },
  };

  return NextResponse.json(responsePayload, { status: httpStatus });
}
