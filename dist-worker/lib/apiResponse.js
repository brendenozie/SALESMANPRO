"use strict";
// ---------------------------
// GLOBAL CORS HEADERS
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonResponse = exports.OPTIONS = void 0;
const server_1 = require("next/server");
// ---------------------------
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, cache-control, x-api-key, X-Requested-With",
};
function withCors(json, status = 200, extraHeaders = {}) {
    return new server_1.NextResponse(JSON.stringify(json), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS,
            ...extraHeaders,
        },
    });
}
// ---------------------------
// OPTIONS (PRE-FLIGHT)
// ---------------------------
function OPTIONS() {
    return new server_1.NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
    });
}
exports.OPTIONS = OPTIONS;
function jsonResponse(data, status = 200) {
    return withCors(data, status);
}
exports.jsonResponse = jsonResponse;
