"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = void 0;
function getClientIp(request) {
    const xForwardedFor = request.headers.get("x-forwarded-for");
    if (xForwardedFor) {
        return xForwardedFor.split(",")[0].trim();
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp)
        return realIp;
    return null;
}
exports.getClientIp = getClientIp;
