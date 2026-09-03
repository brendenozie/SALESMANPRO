"use strict";
// /lib/hooks/enforceRateLimit.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceRateLimit = void 0;
const rate_limit_1 = require("@/lib/rate-limit");
const formatResponse_1 = require("../formatResponse");
function enforceRateLimit(request, userIdentifier) {
    const forwardedFor = request.headers.get("x-forwarded-for") ?? "unknown";
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "local";
    const identifier = userIdentifier ? `user:${userIdentifier}` : `ip:${ip}`;
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();
    let tier = "standard";
    if (pathname.includes("/auth") || pathname.includes("/login") || pathname.includes("/register")) {
        tier = "auth";
    }
    else if (pathname.includes("/checkout") || pathname.includes("/payments") || pathname.includes("/mpesa")) {
        tier = "checkout";
    }
    else if (pathname.includes("/search")) {
        tier = "search";
    }
    const { limit, windowMs } = rate_limit_1.TIER_LIMITS[tier];
    const success = (0, rate_limit_1.rateLimit)(`${identifier}:${tier}`, limit, windowMs);
    if (!success) {
        return (0, formatResponse_1.formatResponse)(false, null, "Too many requests, please slow down.", 429);
    }
    return null; // allowed
}
exports.enforceRateLimit = enforceRateLimit;
