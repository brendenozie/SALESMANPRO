/**
 * lib/observability/errorFingerprint.ts
 *
 * Stable error fingerprinting, sanitization, and aggregation.
 */

import crypto from "crypto";
import prisma from "@/server/db/prismadb";

export interface RecordErrorOptions {
  error: any;
  route?: string;
  tenantId?: string;
  requestId?: string;
  serverId?: string;
  severity?: "INFO" | "WARNING" | "CRITICAL";
}

/**
 * Normalizes error messages to remove specific IDs, ObjectIds, UUIDs, numbers,
 * and memory addresses, allowing recurring errors to share the same fingerprint.
 */
export function normalizeErrorMessage(msg: string): string {
  if (!msg) return "Unknown error";
  return msg
    .replace(/[0-9a-fA-F]{16,32}/g, ":id") // MongoDB ObjectIds / hex IDs
    .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi, ":uuid") // UUIDs
    .replace(/\b\d+\b/g, ":num") // Arbitrary numbers
    .replace(/0x[0-9a-fA-F]+/g, ":addr") // Memory addresses
    .replace(/(Bearer|key|secret|token|password)=["']?[^"'\s]+["']?/gi, "$1=[REDACTED]")
    .trim();
}

/**
 * Generates a stable 16-character SHA-256 fingerprint for an error.
 */
export function generateErrorFingerprint(error: any): {
  fingerprint: string;
  errorType: string;
  title: string;
  normalizedMessage: string;
  stack?: string;
} {
  const errorType =
    error?.name ||
    error?.constructor?.name ||
    (typeof error === "string" ? "Error" : "UnhandledException");

  const rawMessage = String(error?.message || error || "Unknown exception");
  const normalizedMessage = normalizeErrorMessage(rawMessage);

  // Extract topmost 2 stack frames if available, normalizing paths
  let topFrames = "";
  if (typeof error?.stack === "string") {
    const lines = error.stack.split("\n").slice(1, 4);
    topFrames = lines
      .map((l: string) => l.replace(/:\d+:\d+/g, "").trim())
      .join(" ");
  }

  const signature = `${errorType}:${normalizedMessage}:${topFrames}`;
  const hash = crypto
    .createHash("sha256")
    .update(signature)
    .digest("hex")
    .slice(0, 16);

  const title = `${errorType}: ${rawMessage.slice(0, 100)}`;

  return {
    fingerprint: hash,
    errorType,
    title,
    normalizedMessage,
    stack: error?.stack ? String(error.stack).slice(0, 4000) : undefined,
  };
}

/**
 * Records an error in the MonitoringError collection asynchronously.
 * Never throws or interrupts caller execution.
 */
export async function recordObservabilityError(opts: RecordErrorOptions): Promise<void> {
  try {
    const { fingerprint, errorType, title, normalizedMessage, stack } = generateErrorFingerprint(opts.error);
    const now = new Date();
    const serverId = opts.serverId || process.env.SERVER_ID || "server-01";
    const severity = opts.severity || "WARNING";

    const existing = await prisma.monitoringError.findUnique({
      where: { fingerprint },
      select: { id: true, count: true, affectedRoutes: true, affectedTenants: true, sampleRequestIds: true },
    });

    if (existing) {
      const updatedRoutes = opts.route && !existing.affectedRoutes.includes(opts.route)
        ? [...existing.affectedRoutes.slice(-20), opts.route]
        : existing.affectedRoutes;

      const updatedTenants = opts.tenantId && !existing.affectedTenants.includes(opts.tenantId)
        ? [...existing.affectedTenants.slice(-20), opts.tenantId]
        : existing.affectedTenants;

      const updatedRequests = opts.requestId && !existing.sampleRequestIds.includes(opts.requestId)
        ? [...existing.sampleRequestIds.slice(-10), opts.requestId]
        : existing.sampleRequestIds;

      await prisma.monitoringError.update({
        where: { fingerprint },
        data: {
          count: { increment: 1 },
          lastSeenAt: now,
          lastServerId: serverId,
          affectedRoutes: updatedRoutes,
          affectedTenants: updatedTenants,
          sampleRequestIds: updatedRequests,
        },
      });
    } else {
      await prisma.monitoringError.create({
        data: {
          fingerprint,
          title,
          message: normalizedMessage,
          errorType,
          status: "NEW",
          severity,
          stack: stack || null,
          firstSeenAt: now,
          lastSeenAt: now,
          count: 1,
          affectedRoutes: opts.route ? [opts.route] : [],
          affectedTenants: opts.tenantId ? [opts.tenantId] : [],
          sampleRequestIds: opts.requestId ? [opts.requestId] : [],
          lastServerId: serverId,
        },
      });
    }
  } catch (err: any) {
    // Non-fatal logging
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Observability] Failed to persist error record:", err.message);
    }
  }
}
