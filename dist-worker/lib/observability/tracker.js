"use strict";
/**
 * lib/observability/tracker.ts
 *
 * Ultra-low overhead request telemetry tracker with in-memory buffering,
 * smart sampling, slow-request trapping, and asynchronous batch persistence.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiveTrafficSummary = exports.flushPendingWrites = exports.trackRequest = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const errorFingerprint_1 = require("./errorFingerprint");
const MAX_IN_MEMORY_STREAM = 150;
const SLOW_REQUEST_THRESHOLD_MS = 1000; // 1s threshold for API/SSR
const SLOW_PAGE_THRESHOLD_MS = 2000;
const FLUSH_INTERVAL_MS = 10000; // 10s batch flush
const SAMPLE_RATE = 0.1; // Record 10% of normal fast requests in DB
// In-memory circular buffer for live dashboard stream
const liveRequestBuffer = [];
// In-memory write buffer for batched DB persistence
let pendingDbWrites = [];
let flushTimer = null;
// Real-time rolling counters for requests and errors
const rollingMetrics = {
    totalRequests1m: 0,
    totalErrors1m: 0,
    latencySamples1m: [],
    routeCounts1m: new Map(),
    tenantCounts1m: new Map(),
    hostnameCounts1m: new Map(),
    statusCodeCounts1m: new Map(),
    lastResetTime: Date.now(),
};
/**
 * Resets 1-minute rolling metrics window if expired
 */
function checkRollingWindow() {
    const now = Date.now();
    if (now - rollingMetrics.lastResetTime > 60000) {
        rollingMetrics.totalRequests1m = 0;
        rollingMetrics.totalErrors1m = 0;
        rollingMetrics.latencySamples1m = [];
        rollingMetrics.routeCounts1m.clear();
        rollingMetrics.tenantCounts1m.clear();
        rollingMetrics.hostnameCounts1m.clear();
        rollingMetrics.statusCodeCounts1m.clear();
        rollingMetrics.lastResetTime = now;
    }
}
/**
 * Categorizes User-Agent strings safely
 */
function categorizeUserAgent(ua) {
    if (!ua)
        return "unknown";
    const lower = ua.toLowerCase();
    if (lower.includes("bot") || lower.includes("crawler") || lower.includes("spider") || lower.includes("curl") || lower.includes("postman")) {
        return "bot";
    }
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone") || lower.includes("ipad")) {
        return "mobile";
    }
    return "desktop";
}
/**
 * Anonymizes client IP addresses using SHA-256 slice
 */
function hashIp(ip) {
    if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1")
        return undefined;
    try {
        const crypto = require("crypto");
        return crypto.createHash("sha256").update(ip + (process.env.NEXTAUTH_SECRET || "salt")).digest("hex").slice(0, 16);
    }
    catch {
        return undefined;
    }
}
/**
 * Tracks an HTTP request execution.
 * Completely non-blocking: updates in-memory circular buffer and schedules batch DB write.
 */
function trackRequest(input) {
    try {
        checkRollingWindow();
        const isSlow = input.route.startsWith("/api")
            ? input.durationMs >= SLOW_REQUEST_THRESHOLD_MS
            : input.durationMs >= SLOW_PAGE_THRESHOLD_MS;
        const isError = input.statusCode >= 400;
        const serverId = input.serverId || process.env.SERVER_ID || "server-01";
        const timestamp = new Date().toISOString();
        const userAgentCategory = categorizeUserAgent(input.userAgent);
        const summary = {
            requestId: input.requestId,
            timestamp,
            method: input.method.toUpperCase(),
            route: input.route,
            hostname: input.hostname || "salesmanpro.site",
            tenantId: input.tenantId,
            statusCode: input.statusCode,
            durationMs: Math.round(input.durationMs * 10) / 10,
            authDurationMs: input.authDurationMs ? Math.round(input.authDurationMs * 10) / 10 : undefined,
            dbDurationMs: input.dbDurationMs ? Math.round(input.dbDurationMs * 10) / 10 : undefined,
            externalDurationMs: input.externalDurationMs ? Math.round(input.externalDurationMs * 10) / 10 : undefined,
            isSlow,
            isError,
            errorMessage: input.errorMessage,
            userRole: input.userRole,
            userAgentCategory,
            serverId,
        };
        // 1. Update in-memory live stream (FIFO buffer)
        liveRequestBuffer.unshift(summary);
        if (liveRequestBuffer.length > MAX_IN_MEMORY_STREAM) {
            liveRequestBuffer.pop();
        }
        // 2. Update rolling metrics
        rollingMetrics.totalRequests1m++;
        if (isError)
            rollingMetrics.totalErrors1m++;
        rollingMetrics.latencySamples1m.push(summary.durationMs);
        const routeStat = rollingMetrics.routeCounts1m.get(input.route) || { count: 0, totalMs: 0 };
        routeStat.count++;
        routeStat.totalMs += summary.durationMs;
        rollingMetrics.routeCounts1m.set(input.route, routeStat);
        if (input.tenantId) {
            rollingMetrics.tenantCounts1m.set(input.tenantId, (rollingMetrics.tenantCounts1m.get(input.tenantId) || 0) + 1);
        }
        if (input.hostname) {
            rollingMetrics.hostnameCounts1m.set(input.hostname, (rollingMetrics.hostnameCounts1m.get(input.hostname) || 0) + 1);
        }
        rollingMetrics.statusCodeCounts1m.set(input.statusCode, (rollingMetrics.statusCodeCounts1m.get(input.statusCode) || 0) + 1);
        // 3. If an error occurred with an error message, record to error fingerprinting
        if (isError && input.errorMessage) {
            (0, errorFingerprint_1.recordObservabilityError)({
                error: new Error(input.errorMessage),
                route: input.route,
                tenantId: input.tenantId,
                requestId: input.requestId,
                serverId,
                severity: input.statusCode >= 500 ? "CRITICAL" : "WARNING",
            }).catch(() => { });
        }
        // 4. Determine if this record should be persisted to MongoDB
        // ALWAYS persist slow requests and errors; sample normal fast traffic
        const shouldPersist = isSlow || isError || Math.random() < SAMPLE_RATE;
        if (shouldPersist) {
            pendingDbWrites.push({
                requestId: input.requestId,
                timestamp: new Date(),
                method: summary.method,
                route: summary.route,
                rawPath: input.rawPath || summary.route,
                hostname: summary.hostname,
                tenantId: summary.tenantId || null,
                statusCode: summary.statusCode,
                durationMs: summary.durationMs,
                authDurationMs: summary.authDurationMs || null,
                dbDurationMs: summary.dbDurationMs || null,
                externalDurationMs: summary.externalDurationMs || null,
                isSlow,
                isError,
                errorMessage: input.errorMessage ? input.errorMessage.slice(0, 1000) : null,
                errorStack: input.errorStack ? input.errorStack.slice(0, 2000) : null,
                userRole: input.userRole || null,
                ipHash: hashIp(input.ip) || null,
                userAgentCategory,
                serverId,
            });
            // Trigger flush if batch size exceeds 50
            if (pendingDbWrites.length >= 50) {
                flushPendingWrites();
            }
            else {
                scheduleFlush();
            }
        }
    }
    catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[Observability] Track request error:", err.message);
        }
    }
}
exports.trackRequest = trackRequest;
function scheduleFlush() {
    if (!flushTimer) {
        flushTimer = setTimeout(() => {
            flushTimer = null;
            flushPendingWrites();
        }, FLUSH_INTERVAL_MS);
    }
}
/**
 * Flushes pending DB writes in a single batch
 */
async function flushPendingWrites() {
    if (pendingDbWrites.length === 0)
        return;
    const batch = pendingDbWrites;
    pendingDbWrites = [];
    try {
        await prismadb_1.default.monitoringRequest.createMany({
            data: batch,
        });
    }
    catch (err) {
        if (process.env.NODE_ENV !== "production") {
            console.warn("[Observability] Batch DB flush warning:", err.message);
        }
    }
}
exports.flushPendingWrites = flushPendingWrites;
/**
 * Calculates a percentile from an array of numbers
 */
function calculatePercentile(numbers, p) {
    if (numbers.length === 0)
        return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return Math.round(sorted[Math.max(0, Math.min(index, sorted.length - 1))] * 10) / 10;
}
/**
 * Returns current real-time traffic summary for dashboard queries
 */
function getLiveTrafficSummary() {
    checkRollingWindow();
    const samples = rollingMetrics.latencySamples1m;
    const avgLatency = samples.length > 0
        ? Math.round((samples.reduce((a, b) => a + b, 0) / samples.length) * 10) / 10
        : 0;
    const topRoutes = Array.from(rollingMetrics.routeCounts1m.entries())
        .map(([route, s]) => ({
        route,
        count: s.count,
        avgDurationMs: Math.round((s.totalMs / s.count) * 10) / 10,
    }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const topTenants = Array.from(rollingMetrics.tenantCounts1m.entries())
        .map(([tenantId, count]) => ({ tenantId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const topHostnames = Array.from(rollingMetrics.hostnameCounts1m.entries())
        .map(([hostname, count]) => ({ hostname, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const topStatusCodes = Array.from(rollingMetrics.statusCodeCounts1m.entries())
        .map(([statusCode, count]) => ({ statusCode, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const totalReq = rollingMetrics.totalRequests1m;
    const errorRate = totalReq > 0
        ? Math.round((rollingMetrics.totalErrors1m / totalReq) * 1000) / 10
        : 0;
    return {
        totalRequests: totalReq,
        requestsPerMinute: totalReq,
        requestsPerSecond: Math.round((totalReq / 60) * 10) / 10,
        averageLatencyMs: avgLatency,
        p95LatencyMs: calculatePercentile(samples, 95),
        p99LatencyMs: calculatePercentile(samples, 99),
        errorRatePercent: errorRate,
        slowRequestCount: samples.filter((s) => s >= SLOW_REQUEST_THRESHOLD_MS).length,
        topRoutes,
        topTenants,
        topHostnames,
        topStatusCodes,
        recentRequests: [...liveRequestBuffer],
    };
}
exports.getLiveTrafficSummary = getLiveTrafficSummary;
