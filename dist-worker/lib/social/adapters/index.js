"use strict";
/**
 * lib/social/adapters/index.ts
 *
 * Central Registry of Social Platform Adapters for SalesmanPro.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialRegistry = exports.socialPlatformRegistry = exports.SocialPlatformRegistry = exports.youtubeAdapter = exports.tiktokAdapter = exports.instagramAdapter = exports.facebookAdapter = void 0;
const facebookAdapter_1 = require("./facebookAdapter");
Object.defineProperty(exports, "facebookAdapter", { enumerable: true, get: function () { return facebookAdapter_1.facebookAdapter; } });
const instagramAdapter_1 = require("./instagramAdapter");
Object.defineProperty(exports, "instagramAdapter", { enumerable: true, get: function () { return instagramAdapter_1.instagramAdapter; } });
const tiktokAdapter_1 = require("./tiktokAdapter");
Object.defineProperty(exports, "tiktokAdapter", { enumerable: true, get: function () { return tiktokAdapter_1.tiktokAdapter; } });
const youtubeAdapter_1 = require("./youtubeAdapter");
Object.defineProperty(exports, "youtubeAdapter", { enumerable: true, get: function () { return youtubeAdapter_1.youtubeAdapter; } });
class SocialPlatformRegistry {
    adapters = new Map();
    constructor() {
        this.registerAdapter(facebookAdapter_1.facebookAdapter);
        this.registerAdapter(instagramAdapter_1.instagramAdapter);
        this.registerAdapter(tiktokAdapter_1.tiktokAdapter);
        this.registerAdapter(youtubeAdapter_1.youtubeAdapter);
    }
    registerAdapter(adapter) {
        this.adapters.set(adapter.platform, adapter);
    }
    getAdapter(platform) {
        const adapter = this.adapters.get(platform);
        if (!adapter) {
            throw new Error(`Unsupported or unconfigured social platform adapter: ${platform}`);
        }
        return adapter;
    }
    hasAdapter(platform) {
        return this.adapters.has(platform);
    }
    getAvailablePlatforms() {
        return Array.from(this.adapters.keys());
    }
}
exports.SocialPlatformRegistry = SocialPlatformRegistry;
exports.socialPlatformRegistry = new SocialPlatformRegistry();
exports.socialRegistry = exports.socialPlatformRegistry;
