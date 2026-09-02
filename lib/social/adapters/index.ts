/**
 * lib/social/adapters/index.ts
 *
 * Central Registry of Social Platform Adapters for SalesmanPro.
 */

import { ISocialPlatformAdapter, SocialPlatform } from "../types";
import { facebookAdapter } from "./facebookAdapter";
import { instagramAdapter } from "./instagramAdapter";
import { tiktokAdapter } from "./tiktokAdapter";
import { youtubeAdapter } from "./youtubeAdapter";

export {
  facebookAdapter,
  instagramAdapter,
  tiktokAdapter,
  youtubeAdapter,
};

export class SocialPlatformRegistry {
  private adapters: Map<SocialPlatform, ISocialPlatformAdapter> = new Map();

  constructor() {
    this.registerAdapter(facebookAdapter);
    this.registerAdapter(instagramAdapter);
    this.registerAdapter(tiktokAdapter);
    this.registerAdapter(youtubeAdapter);
  }

  public registerAdapter(adapter: ISocialPlatformAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  public getAdapter(platform: SocialPlatform): ISocialPlatformAdapter {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`Unsupported or unconfigured social platform adapter: ${platform}`);
    }
    return adapter;
  }

  public hasAdapter(platform: SocialPlatform): boolean {
    return this.adapters.has(platform);
  }

  public getAvailablePlatforms(): SocialPlatform[] {
    return Array.from(this.adapters.keys());
  }
}

export const socialPlatformRegistry = new SocialPlatformRegistry();
export const socialRegistry = socialPlatformRegistry;
