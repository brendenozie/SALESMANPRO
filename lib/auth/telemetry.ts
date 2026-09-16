// lib/auth/telemetry.ts
import { randomUUID } from "crypto";

export type AuthTelemetryStage =
  | "button_click"
  | "signin_invocation"
  | "request_start"
  | "signin_page_response"
  | "oauth_url_generation"
  | "google_callback_arrival"
  | "user_lookup_duration"
  | "account_linking_duration"
  | "jwt_callback_duration"
  | "session_callback_duration"
  | "redirect_callback_duration"
  | "handover_issue_duration"
  | "handover_consume_duration"
  | "target_validation_duration"
  | "final_redirect_completion";

export function generateCorrelationId(): string {
  try {
    return randomUUID().replace(/-/g, "").slice(0, 12);
  } catch {
    return Math.random().toString(36).substring(2, 14);
  }
}

export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string") return "";
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2) return "***";
  const user = parts[0];
  const domain = parts[1];
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : `${user[0] || "*"}***`;
  return `${maskedUser}@${domain}`;
}

export function sanitizeLogDetails(details: Record<string, any> = {}): Record<string, any> {
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = new Set([
    "password",
    "token",
    "auth_token",
    "secret",
    "access_token",
    "refresh_token",
    "id_token",
    "code",
    "state",
    "cookie",
    "cookieHeader",
  ]);

  for (const [key, val] of Object.entries(details)) {
    if (sensitiveKeys.has(key.toLowerCase()) || key.toLowerCase().includes("secret") || key.toLowerCase().includes("token")) {
      continue; // Never log secrets or tokens
    }
    if (key.toLowerCase() === "email") {
      sanitized[key] = maskEmail(String(val));
    } else if (typeof val === "object" && val !== null) {
      // Avoid nested deep objects or circular structures
      sanitized[key] = "[Object]";
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Production-safe structured auth telemetry log.
 * Format: [AUTH <correlationId>] stage=<stage> elapsedMs=<duration> key=value ...
 */
export function authLog(
  correlationId: string,
  stage: AuthTelemetryStage | string,
  elapsedMs?: number,
  details: Record<string, any> = {},
): void {
  const safeCId = correlationId || "unknown";
  const safeStage = stage || "unspecified";
  const elapsedPart = typeof elapsedMs === "number" ? ` elapsedMs=${Math.round(elapsedMs)}` : "";
  const safeDetails = sanitizeLogDetails(details);

  const detailEntries = Object.entries(safeDetails)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(" ");

  const detailString = detailEntries ? ` ${detailEntries}` : "";
  console.log(`[AUTH ${safeCId}] stage=${safeStage}${elapsedPart}${detailString}`);
}

/**
 * Creates an in-flight timer for measuring durations between stages.
 */
export function createAuthTimer(correlationId?: string) {
  const cId = correlationId || generateCorrelationId();
  const start = Date.now();
  let lastMark = start;

  return {
    correlationId: cId,
    mark(stage: AuthTelemetryStage | string, details?: Record<string, any>) {
      const now = Date.now();
      const stepDuration = now - lastMark;
      lastMark = now;
      authLog(cId, stage, stepDuration, details);
      return stepDuration;
    },
    total(stage: AuthTelemetryStage | string, details?: Record<string, any>) {
      const totalDuration = Date.now() - start;
      authLog(cId, stage, totalDuration, details);
      return totalDuration;
    },
  };
}
