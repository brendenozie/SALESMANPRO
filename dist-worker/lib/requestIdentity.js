"use strict";
/**
 * lib/requestIdentity.ts
 *
 * Request Identity & Trusted Proxy Header Resolver.
 *
 * Ensures accurate extraction of client IP, tenant host, and protocol
 * across both single-server Nginx and multi-server load balancers:
 * - Handles `X-Forwarded-Host`, `Host`, `X-Forwarded-Proto`, and `X-Forwarded-For`.
 * - Strips ports and normalizes hostnames.
 * - Distinguishes between secure (HTTPS) and unencrypted requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromSession = exports.isSecureRequest = exports.getTrustedProtocol = exports.getTrustedHost = exports.getClientIp = void 0;
/**
 * Extracts the real client IP address from request headers.
 */
function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        // Return first IP in X-Forwarded-For list
        return forwarded.split(",")[0].trim();
    }
    return req.headers.get("x-real-ip") ?? "unknown";
}
exports.getClientIp = getClientIp;
/**
 * Safely extracts and normalizes the target host from incoming headers.
 * Prioritizes `X-Forwarded-Host` (set by upstream load balancer or Nginx)
 * over the local `Host` header.
 */
function getTrustedHost(req) {
    const forwardedHost = req.headers.get("x-forwarded-host");
    const host = forwardedHost || req.headers.get("host") || "";
    // Strip any trailing port (e.g., "mysite.com:3000" -> "mysite.com")
    return host.split(":")[0].trim().toLowerCase();
}
exports.getTrustedHost = getTrustedHost;
/**
 * Determines whether the original client request was over HTTPS.
 */
function getTrustedProtocol(req) {
    const proto = req.headers.get("x-forwarded-proto") || "";
    if (proto.includes("https"))
        return "https";
    if (proto.includes("http"))
        return "http";
    const url = req.url;
    if (typeof url === "string" && url.startsWith("https:")) {
        return "https";
    }
    return process.env.NODE_ENV === "production" ? "https" : "http";
}
exports.getTrustedProtocol = getTrustedProtocol;
/**
 * Returns true if request arrived over TLS / HTTPS.
 */
function isSecureRequest(req) {
    return getTrustedProtocol(req) === "https";
}
exports.isSecureRequest = isSecureRequest;
/**
 * Extracts the user ID from a NextAuth JWT or session object.
 */
function getUserIdFromSession(session) {
    return session?.sub ?? session?.user?.id ?? null;
}
exports.getUserIdFromSession = getUserIdFromSession;
