"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdFromSession = exports.getClientIp = void 0;
function getClientIp(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded)
        return forwarded.split(",")[0].trim();
    return req.headers.get("x-real-ip") ?? "unknown";
}
exports.getClientIp = getClientIp;
function getUserIdFromSession(session) {
    return session?.sub ?? session?.user?.id ?? null;
}
exports.getUserIdFromSession = getUserIdFromSession;
