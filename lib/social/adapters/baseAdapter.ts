/**
 * lib/social/adapters/baseAdapter.ts
 *
 * Abstract base class for Social Media Platform Adapters.
 * Provides resilient fetch wrappers, error normalization, and standard contracts.
 */

import {
  ISocialPlatformAdapter,
  OAuthTokenResult,
  OAuthUrlParams,
  PlatformMetrics,
  PublishPostInput,
  PublishPostResult,
  SocialPlatform,
} from "../types";

export abstract class BaseSocialPlatformAdapter implements ISocialPlatformAdapter {
  abstract readonly platform: SocialPlatform;

  abstract getOAuthUrl(params: OAuthUrlParams, config?: any): string;

  abstract exchangeCodeForToken(
    code: string,
    redirectUri: string,
    config?: any
  ): Promise<OAuthTokenResult[]>;

  abstract publish(
    account: {
      platformAccountId: string;
      accessToken: string;
      metadata?: any;
    },
    input: PublishPostInput
  ): Promise<PublishPostResult>;

  async refreshToken?(
    refreshToken: string,
    config?: any
  ): Promise<Partial<OAuthTokenResult>> {
    throw new Error(`Token refresh not implemented for ${this.platform}`);
  }

  async getMetrics?(
    account: {
      platformAccountId: string;
      accessToken: string;
    },
    platformPostId: string
  ): Promise<PlatformMetrics> {
    return {};
  }

  /**
   * Resilient HTTP fetch helper with timeouts and JSON parsing.
   */
  protected async request<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ status: number; data: T }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout for media uploads

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      let data: any;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return { status: response.status, data };
    } finally {
      clearTimeout(timeout);
    }
  }
}
