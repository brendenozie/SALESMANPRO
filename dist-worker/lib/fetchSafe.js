"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithTimeout = void 0;
async function fetchWithTimeout(url, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        const text = await res.text();
        let json;
        try {
            json = JSON.parse(text);
        }
        catch {
            json = text;
        }
        return { ok: res.ok, status: res.status, data: json };
    }
    finally {
        clearTimeout(id);
    }
}
exports.fetchWithTimeout = fetchWithTimeout;
