import { verifyAuth, VerifiedUser } from "@/lib/verifyAuth";
import { enforceRateLimit } from "@/lib/hooks/enforceRateLimit";
import { handlePrismaError } from "@/lib/hooks/handlePrismaError";
import { formatResponse } from "@/lib/formatResponse";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import {
  acquireIdempotencyLock,
  saveIdempotencyResponse,
  releaseIdempotencyLock,
} from "@/lib/idempotency";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { trackRequest } from "@/lib/observability/tracker";

export type HandlerContext = {
  params: any;
  user?: VerifiedUser;
  companyId?: string;
  requestId?: string;
};

export type HandlerFn = (
  request: any,
  context: HandlerContext,
) => Promise<Response>;

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireTenant?: boolean; // When true, validates tenant ownership and injects context.companyId
  requireRateLimit?: boolean;
  requireIdempotency?: boolean; // When true, mandates Idempotency-Key header on mutations
  allowedRoles?: string[]; // Optional: Restrict access to specific roles
  roles?: string[]; // Alias for allowedRoles
  timeoutMs?: number; // Optional request timeout (default: 15,000ms)
}

/* -----------------------------------------
   GLOBAL CORS HEADERS (APPLIED TO ALL ROUTES)
------------------------------------------ */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With, x-request-id, idempotency-key, x-idempotency-key",
};

/* -----------------------------------------
   Attach CORS headers, Correlation ID & Server-Timing
------------------------------------------ */
function applyHeadersAndTiming(
  response: Response,
  durationMs: number,
  requestId: string,
  extraHeaders: Record<string, string> = {},
) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  Object.entries(extraHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  response.headers.set("Server-Timing", `total;dur=${durationMs.toFixed(1)}`);
  response.headers.set("x-request-id", requestId);
  return response;
}

/* -----------------------------------------
          MAIN HANDLER WRAPPER
------------------------------------------ */
export function withApiHandler(
  handler: HandlerFn,
  options: ApiHandlerOptions = {
    requireAuth: true,
    requireRateLimit: true,
    allowedRoles: [],
    timeoutMs: 15_000,
  },
): HandlerFn {
  const timeoutMs = options.timeoutMs ?? 15_000;

  return async (request: Request, context: HandlerContext = { params: {} }) => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const requestPath = url.pathname;

    const requestId =
      request.headers.get("x-request-id") ||
      `req_${crypto.randomUUID().replace(/-/g, "")}`;

    context.requestId = requestId;

    const idempotencyKey =
      request.headers.get("idempotency-key") ||
      request.headers.get("x-idempotency-key");

    let lockAcquired = false;
    let lockTenantScope = "global";

    const sendResponse = (
      response: Response,
      durationMs: number,
      reqId: string = requestId,
      extraHeaders: Record<string, string> = {},
      errorObj?: any,
    ) => {
      if (request.method !== "OPTIONS" && !requestPath.startsWith("/api/super-admin/observability")) {
        try {
          trackRequest({
            requestId: reqId,
            method: request.method,
            route: requestPath,
            statusCode: response.status,
            durationMs,
            hostname: url.hostname,
            tenantId: context.companyId,
            userRole: context.user?.role,
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
            userAgent: request.headers.get("user-agent") || undefined,
            errorMessage: errorObj?.message,
            errorStack: errorObj?.stack,
          });
        } catch {}
      }
      return applyHeadersAndTiming(response, durationMs, reqId, extraHeaders);
    };

    try {
      // --- OPTIONS (preflight) ---
      if (request.method === "OPTIONS") {
        return applyHeadersAndTiming(
          new Response(null, { status: 204 }),
          0,
          requestId,
        );
      }

      const isAdminRoute =
        requestPath.startsWith("/api/admin") ||
        requestPath.startsWith("/api/super-admin");

      const shouldRequireAuth =
        options.requireAuth ?? (isAdminRoute ? true : true);

      // --- Auth ---
      if (shouldRequireAuth) {
        const auth = await verifyAuth(request);

        if (!auth.success || !auth.user) {
          return sendResponse(
            formatResponse(
              false,
              null,
              auth.error || "Unauthorized: No valid session found",
              401,
              undefined,
              requestId,
            ),
            Date.now() - startTime,
            requestId,
          );
        }

        context = { ...context, user: auth.user };
      }

      // --- Rate Limiting (user-aware when authenticated) ---
      if (options.requireRateLimit !== false) {
        const limitResponse = enforceRateLimit(request, context.user?.id);
        if (limitResponse) {
          return sendResponse(
            limitResponse,
            Date.now() - startTime,
            requestId,
          );
        }
      }

      // --- Role-based Access Control ---
      const effectiveAllowedRoles = options.allowedRoles ?? options.roles;
      if (effectiveAllowedRoles && effectiveAllowedRoles.length > 0) {
        const userRole = context.user?.role?.toLowerCase();
        const allowedRolesLower = effectiveAllowedRoles.map((role) =>
          role.toLowerCase(),
        );

        if (!userRole || !allowedRolesLower.includes(userRole)) {
          return sendResponse(
            formatResponse(
              false,
              null,
              "Forbidden: Insufficient role permissions",
              403,
              undefined,
              requestId,
            ),
            Date.now() - startTime,
            requestId,
          );
        }
      } else if (
        shouldRequireAuth &&
        requestPath.startsWith("/api/admin") &&
        context.user
      ) {
        const { canAccessDashboard, isConsumerOnlyAccount } = await import(
          "@/lib/auth/authorization"
        );
        if (
          !canAccessDashboard(context.user) ||
          isConsumerOnlyAccount(context.user)
        ) {
          return sendResponse(
            formatResponse(
              false,
              null,
              "Forbidden: Insufficient role permissions for administrative access",
              403,
              undefined,
              requestId,
            ),
            Date.now() - startTime,
            requestId,
          );
        }
      }

      // --- Tenant Isolation Resolution ---
      const shouldRequireTenant =
        options.requireTenant ??
        (requestPath.startsWith("/api/admin") &&
          !requestPath.startsWith("/api/admin/setup"));

      if (shouldRequireTenant && context.user) {
        const queryCompanyId = url.searchParams.get("companyId");
        const tenantResolution = await resolveAuthorizedCompany(
          context.user,
          queryCompanyId,
        );

        if (!tenantResolution.authorized) {
          return sendResponse(
            formatResponse(
              false,
              null,
              tenantResolution.error || "Forbidden: Tenant access denied",
              tenantResolution.status || 403,
              undefined,
              requestId,
            ),
            Date.now() - startTime,
            requestId,
          );
        }

        context.companyId = tenantResolution.companyId;
      }

      // --- Idempotency Guard (for Mutations) ---
      const isMutation =
        request.method === "POST" ||
        request.method === "PUT" ||
        request.method === "PATCH";

      if (options.requireIdempotency && !idempotencyKey && isMutation) {
        return sendResponse(
          formatResponse(
            false,
            null,
            "Idempotency-Key header is required for this mutation.",
            400,
            undefined,
            requestId,
          ),
          Date.now() - startTime,
          requestId,
        );
      }

      if (idempotencyKey && isMutation) {
        lockTenantScope =
          context.companyId || context.user?.id || "global";

        const lockResult = await acquireIdempotencyLock(
          idempotencyKey,
          lockTenantScope,
        );

        if (lockResult.state === "COMPLETED") {
          return sendResponse(
            NextResponse.json(lockResult.response.body, {
              status: lockResult.response.status,
            }),
            Date.now() - startTime,
            requestId,
            { "x-idempotent-replay": "true" },
          );
        }

        if (lockResult.state === "IN_FLIGHT") {
          return sendResponse(
            formatResponse(
              false,
              null,
              "A request with this idempotency key is currently processing. Please retry shortly.",
              409,
              undefined,
              requestId,
            ),
            Date.now() - startTime,
            requestId,
          );
        }

        lockAcquired = true;
      }

      // --- Contextual Params ---
      if (!context.params) {
        context.params = {};
      } else if (typeof context.params?.then === "function" || context.params instanceof Promise) {
        context.params = await context.params;
      }

      // --- Ensure JSON Content-Type for non-GET requests ---
      if (
        request.method !== "GET" &&
        request.method !== "DELETE" &&
        request.method !== "OPTIONS"
      ) {
        const contentType = request.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
          return sendResponse(
            formatResponse(
              false,
              null,
              "Content-Type must be application/json",
              415,
              undefined,
              requestId,
            ),
            Date.now() - startTime,
            requestId,
          );
        }
      }

      // --- Handle Query Parameters ---
      const queryParams: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        queryParams[key] = value;
      });
      context.params = { ...context.params, ...queryParams };

      // --- Execute Handler with Timeout Protection ---
      let timeoutId: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise<Response>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`API_TIMEOUT_${timeoutMs}MS`));
        }, timeoutMs);
      });

      const handlerPromise = handler(request, context);

      const response = await Promise.race([handlerPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      // If mutation was successful and used idempotency key, cache the response for replays
      if (lockAcquired && idempotencyKey && response.status < 400) {
        try {
          const cloned = response.clone();
          const responseBody = await cloned.json();
          await saveIdempotencyResponse(
            idempotencyKey,
            lockTenantScope,
            response.status,
            responseBody,
          );
        } catch {}
      }

      const duration = Date.now() - startTime;
      if (duration > 500 && process.env.NODE_ENV !== "production") {
        console.warn(
          `[SLOW_API_ROUTE][${requestId}] ${request.method} ${requestPath} completed in ${duration}ms (status: ${response.status})`,
        );
      }

      return sendResponse(response, duration, requestId);
    } catch (error: any) {
      if (lockAcquired && idempotencyKey) {
        await releaseIdempotencyLock(idempotencyKey, lockTenantScope);
      }

      const duration = Date.now() - startTime;
      if (error?.message?.startsWith("API_TIMEOUT")) {
        console.error(
          `[API_TIMEOUT][${requestId}] ${request.method} ${requestPath} exceeded ${timeoutMs}ms limit`,
        );
        return sendResponse(
          formatResponse(
            false,
            null,
            "Request timed out. Downstream operations took too long.",
            504,
            undefined,
            requestId,
          ),
          duration,
          requestId,
          {},
          error,
        );
      }
      return sendResponse(
        handlePrismaError(error, requestId),
        duration,
        requestId,
        {},
        error,
      );
    }
  };
}
