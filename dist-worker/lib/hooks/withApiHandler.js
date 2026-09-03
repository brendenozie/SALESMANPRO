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
Object.defineProperty(exports, "__esModule", { value: true });
exports.withApiHandler = void 0;
const verifyAuth_1 = require("@/lib/verifyAuth");
const enforceRateLimit_1 = require("@/lib/hooks/enforceRateLimit");
const handlePrismaError_1 = require("@/lib/hooks/handlePrismaError");
const formatResponse_1 = require("@/lib/formatResponse");
/* -----------------------------------------
   GLOBAL CORS HEADERS (APPLIED TO ALL ROUTES)
------------------------------------------ */
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};
/* -----------------------------------------
   Attach CORS headers & Server-Timing
------------------------------------------ */
function applyCorsAndTiming(response, durationMs) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    response.headers.set("Server-Timing", `total;dur=${durationMs.toFixed(1)}`);
    return response;
}
/* -----------------------------------------
          MAIN HANDLER WRAPPER
------------------------------------------ */
function withApiHandler(handler, options = { requireAuth: true, requireRateLimit: true, allowedRoles: [], timeoutMs: 15_000 }) {
    const timeoutMs = options.timeoutMs ?? 15_000;
    return async (request, context) => {
        const startTime = Date.now();
        const url = new URL(request.url);
        const requestPath = url.pathname;
        try {
            // --- OPTIONS (preflight) ---
            if (request.method === "OPTIONS") {
                return applyCorsAndTiming(new Response(null, { status: 204 }), 0);
            }
            // --- Auth ---
            if (options.requireAuth) {
                const auth = await (0, verifyAuth_1.verifyAuth)(request);
                if (!auth.success || !auth.user) {
                    return applyCorsAndTiming((0, formatResponse_1.formatResponse)(false, null, auth.error || "Unauthorized", 401), Date.now() - startTime);
                }
                context = { ...context, user: auth.user };
            }
            // --- Rate Limiting (user-aware when authenticated) ---
            if (options.requireRateLimit) {
                const limitResponse = (0, enforceRateLimit_1.enforceRateLimit)(request, context.user?.id);
                if (limitResponse)
                    return applyCorsAndTiming(limitResponse, Date.now() - startTime);
            }
            // --- Role-based Access Control ---
            if (options.allowedRoles && options.allowedRoles.length > 0) {
                const userRole = context.user?.role?.toLowerCase();
                const allowedRolesLower = options.allowedRoles.map((role) => role.toLowerCase());
                if (!userRole || !allowedRolesLower.includes(userRole)) {
                    return applyCorsAndTiming((0, formatResponse_1.formatResponse)(false, null, "Forbidden: Insufficient role", 403), Date.now() - startTime);
                }
            }
            else if (options.requireAuth !== false &&
                requestPath.startsWith("/api/admin") &&
                context.user) {
                const { canAccessDashboard, isConsumerOnlyAccount } = await Promise.resolve().then(() => __importStar(require("@/lib/auth/authorization")));
                if (!canAccessDashboard(context.user) || isConsumerOnlyAccount(context.user)) {
                    return applyCorsAndTiming((0, formatResponse_1.formatResponse)(false, null, "Forbidden: Insufficient role", 403), Date.now() - startTime);
                }
            }
            // --- Contextual Params ---
            if (!context.params) {
                context.params = {};
            }
            // --- Ensure JSON Content-Type for non-GET requests ---
            if (request.method !== "GET" && request.method !== "OPTIONS") {
                const contentType = request.headers.get("Content-Type");
                if (!contentType || !contentType.includes("application/json")) {
                    return applyCorsAndTiming((0, formatResponse_1.formatResponse)(false, null, "Content-Type must be application/json", 415), Date.now() - startTime);
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
            const duration = Date.now() - startTime;
            if (duration > 500 && process.env.NODE_ENV !== "production") {
                console.warn(`[SLOW_API_ROUTE] ${request.method} ${requestPath} completed in ${duration}ms (status: ${response.status})`);
            }
            return applyCorsAndTiming(response, duration);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            if (error?.message?.startsWith("API_TIMEOUT")) {
                console.error(`[API_TIMEOUT] ${request.method} ${requestPath} exceeded ${timeoutMs}ms limit`);
                return applyCorsAndTiming((0, formatResponse_1.formatResponse)(false, null, "Request timed out. Downstream operations took too long.", 504), duration);
            }
            return applyCorsAndTiming((0, handlePrismaError_1.handlePrismaError)(error), duration);
        }
    };
}
exports.withApiHandler = withApiHandler;
