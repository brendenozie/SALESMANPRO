"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withApiHandler = void 0;
const verifyAuth_1 = require("@/lib/verifyAuth");
const enforceRateLimit_1 = require("@/lib/hooks/enforceRateLimit");
const handlePrismaError_1 = require("@/lib/hooks/handlePrismaError");
const formatResponse_1 = require("@/lib/formatResponse");
const tenantScope_1 = require("@/lib/auth/tenantScope");
const idempotency_1 = require("@/lib/idempotency");
const crypto_1 = __importDefault(require("crypto"));
const server_1 = require("next/server");
/* -----------------------------------------
   GLOBAL CORS HEADERS (APPLIED TO ALL ROUTES)
------------------------------------------ */
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With, x-request-id, idempotency-key, x-idempotency-key",
};
/* -----------------------------------------
   Attach CORS headers, Correlation ID & Server-Timing
------------------------------------------ */
function applyHeadersAndTiming(response, durationMs, requestId, extraHeaders = {}) {
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
function withApiHandler(handler, options = {
    requireAuth: true,
    requireRateLimit: true,
    allowedRoles: [],
    timeoutMs: 15_000,
}) {
    const timeoutMs = options.timeoutMs ?? 15_000;
    return async (request, context = { params: {} }) => {
        const startTime = Date.now();
        const url = new URL(request.url);
        const requestPath = url.pathname;
        const requestId = request.headers.get("x-request-id") ||
            `req_${crypto_1.default.randomUUID().replace(/-/g, "")}`;
        context.requestId = requestId;
        const idempotencyKey = request.headers.get("idempotency-key") ||
            request.headers.get("x-idempotency-key");
        let lockAcquired = false;
        let lockTenantScope = "global";
        try {
            // --- OPTIONS (preflight) ---
            if (request.method === "OPTIONS") {
                return applyHeadersAndTiming(new Response(null, { status: 204 }), 0, requestId);
            }
            const isAdminRoute = requestPath.startsWith("/api/admin") ||
                requestPath.startsWith("/api/super-admin");
            const shouldRequireAuth = options.requireAuth ?? (isAdminRoute ? true : true);
            // --- Auth ---
            if (shouldRequireAuth) {
                const auth = await (0, verifyAuth_1.verifyAuth)(request);
                if (!auth.success || !auth.user) {
                    return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, auth.error || "Unauthorized: No valid session found", 401, undefined, requestId), Date.now() - startTime, requestId);
                }
                context = { ...context, user: auth.user };
            }
            // --- Rate Limiting (user-aware when authenticated) ---
            if (options.requireRateLimit !== false) {
                const limitResponse = (0, enforceRateLimit_1.enforceRateLimit)(request, context.user?.id);
                if (limitResponse) {
                    return applyHeadersAndTiming(limitResponse, Date.now() - startTime, requestId);
                }
            }
            // --- Role-based Access Control ---
            const effectiveAllowedRoles = options.allowedRoles ?? options.roles;
            if (effectiveAllowedRoles && effectiveAllowedRoles.length > 0) {
                const userRole = context.user?.role?.toLowerCase();
                const allowedRolesLower = effectiveAllowedRoles.map((role) => role.toLowerCase());
                if (!userRole || !allowedRolesLower.includes(userRole)) {
                    return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, "Forbidden: Insufficient role permissions", 403, undefined, requestId), Date.now() - startTime, requestId);
                }
            }
            else if (shouldRequireAuth &&
                requestPath.startsWith("/api/admin") &&
                context.user) {
                const { canAccessDashboard, isConsumerOnlyAccount } = await Promise.resolve().then(() => __importStar(require("@/lib/auth/authorization")));
                if (!canAccessDashboard(context.user) ||
                    isConsumerOnlyAccount(context.user)) {
                    return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, "Forbidden: Insufficient role permissions for administrative access", 403, undefined, requestId), Date.now() - startTime, requestId);
                }
            }
            // --- Tenant Isolation Resolution ---
            const shouldRequireTenant = options.requireTenant ??
                (requestPath.startsWith("/api/admin") &&
                    !requestPath.startsWith("/api/admin/setup"));
            if (shouldRequireTenant && context.user) {
                const queryCompanyId = url.searchParams.get("companyId");
                const tenantResolution = await (0, tenantScope_1.resolveAuthorizedCompany)(context.user, queryCompanyId);
                if (!tenantResolution.authorized) {
                    return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, tenantResolution.error || "Forbidden: Tenant access denied", tenantResolution.status || 403, undefined, requestId), Date.now() - startTime, requestId);
                }
                context.companyId = tenantResolution.companyId;
            }
            // --- Idempotency Guard (for Mutations) ---
            const isMutation = request.method === "POST" ||
                request.method === "PUT" ||
                request.method === "PATCH";
            if (options.requireIdempotency && !idempotencyKey && isMutation) {
                return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, "Idempotency-Key header is required for this mutation.", 400, undefined, requestId), Date.now() - startTime, requestId);
            }
            if (idempotencyKey && isMutation) {
                lockTenantScope =
                    context.companyId || context.user?.id || "global";
                const lockResult = await (0, idempotency_1.acquireIdempotencyLock)(idempotencyKey, lockTenantScope);
                if (lockResult.state === "COMPLETED") {
                    return applyHeadersAndTiming(server_1.NextResponse.json(lockResult.response.body, {
                        status: lockResult.response.status,
                    }), Date.now() - startTime, requestId, { "x-idempotent-replay": "true" });
                }
                if (lockResult.state === "IN_FLIGHT") {
                    return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, "A request with this idempotency key is currently processing. Please retry shortly.", 409, undefined, requestId), Date.now() - startTime, requestId);
                }
                lockAcquired = true;
            }
            // --- Contextual Params ---
            if (!context.params) {
                context.params = {};
            }
            // --- Ensure JSON Content-Type for non-GET requests ---
            if (request.method !== "GET" &&
                request.method !== "DELETE" &&
                request.method !== "OPTIONS") {
                const contentType = request.headers.get("Content-Type");
                if (!contentType || !contentType.includes("application/json")) {
                    return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, "Content-Type must be application/json", 415, undefined, requestId), Date.now() - startTime, requestId);
                }
            }
            // --- Handle Query Parameters ---
            const queryParams = {};
            url.searchParams.forEach((value, key) => {
                queryParams[key] = value;
            });
            context.params = { ...context.params, ...queryParams };
            // --- Execute Handler with Timeout Protection ---
            let timeoutId = null;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    reject(new Error(`API_TIMEOUT_${timeoutMs}MS`));
                }, timeoutMs);
            });
            const handlerPromise = handler(request, context);
            const response = await Promise.race([handlerPromise, timeoutPromise]);
            if (timeoutId)
                clearTimeout(timeoutId);
            // If mutation was successful and used idempotency key, cache the response for replays
            if (lockAcquired && idempotencyKey && response.status < 400) {
                try {
                    const cloned = response.clone();
                    const responseBody = await cloned.json();
                    await (0, idempotency_1.saveIdempotencyResponse)(idempotencyKey, lockTenantScope, response.status, responseBody);
                }
                catch { }
            }
            const duration = Date.now() - startTime;
            if (duration > 500 && process.env.NODE_ENV !== "production") {
                console.warn(`[SLOW_API_ROUTE][${requestId}] ${request.method} ${requestPath} completed in ${duration}ms (status: ${response.status})`);
            }
            return applyHeadersAndTiming(response, duration, requestId);
        }
        catch (error) {
            if (lockAcquired && idempotencyKey) {
                await (0, idempotency_1.releaseIdempotencyLock)(idempotencyKey, lockTenantScope);
            }
            const duration = Date.now() - startTime;
            if (error?.message?.startsWith("API_TIMEOUT")) {
                console.error(`[API_TIMEOUT][${requestId}] ${request.method} ${requestPath} exceeded ${timeoutMs}ms limit`);
                return applyHeadersAndTiming((0, formatResponse_1.formatResponse)(false, null, "Request timed out. Downstream operations took too long.", 504, undefined, requestId), duration, requestId);
            }
            return applyHeadersAndTiming((0, handlePrismaError_1.handlePrismaError)(error, requestId), duration, requestId);
        }
    };
}
exports.withApiHandler = withApiHandler;
