"use strict";
/**
 * lib/social/adapters/baseAdapter.ts
 *
 * Abstract base class for Social Media Platform Adapters.
 * Provides resilient fetch wrappers, error normalization, and standard contracts.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSocialPlatformAdapter = void 0;
class BaseSocialPlatformAdapter {
    async refreshToken(refreshToken, config) {
        throw new Error(`Token refresh not implemented for ${this.platform}`);
    }
    async getMetrics(account, platformPostId) {
        return {};
    }
    /**
     * Resilient HTTP fetch helper with timeouts and JSON parsing.
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout for media uploads
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            let data;
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                data = await response.json();
            }
            else {
                data = await response.text();
            }
            return { status: response.status, data };
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
exports.BaseSocialPlatformAdapter = BaseSocialPlatformAdapter;
