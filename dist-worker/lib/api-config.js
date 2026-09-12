"use strict";
/**
 * Canonical API configuration for SalesmanPro.
 * Ensures that client-side requests are ALWAYS same-origin relative (`/api`),
 * preventing cross-origin CORS issues and avoiding Private Network Access (PNA)
 * attempts against `localhost` or `127.0.0.1`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApiBaseUrl = exports.API_BASE_URL = void 0;
exports.API_BASE_URL = "/api";
function getApiBaseUrl() {
    if (typeof window !== "undefined") {
        return exports.API_BASE_URL;
    }
    if (process.env.INTERNAL_API_URL) {
        return process.env.INTERNAL_API_URL.replace(/\/$/, "");
    }
    return exports.API_BASE_URL;
}
exports.getApiBaseUrl = getApiBaseUrl;
exports.default = getApiBaseUrl;
