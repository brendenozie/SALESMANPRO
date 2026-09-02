/**
 * lib/social/adapters/facebookAdapter.ts
 *
 * Official Facebook Pages Adapter via Meta Graph API v19+.
 * Supports:
 * - Connecting Facebook Pages via OAuth
 * - Publishing text posts, links, images, and videos
 * - Reading page post engagement metrics
 */

import { BaseSocialPlatformAdapter } from "./baseAdapter";
import {
  OAuthTokenResult,
  OAuthUrlParams,
  PlatformMetrics,
  PublishPostInput,
  PublishPostResult,
  SocialPlatform,
} from "../types";

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

export class FacebookPlatformAdapter extends BaseSocialPlatformAdapter {
  readonly platform: SocialPlatform = "FACEBOOK";

  /**
   * Generates official Meta OAuth URL for Facebook Pages.
   */
  getOAuthUrl(params: OAuthUrlParams, config?: { clientId?: string }): string {
    const clientId = config?.clientId || process.env.FACEBOOK_CLIENT_ID || process.env.META_APP_ID;
    if (!clientId) {
      throw new Error("Facebook App Client ID is not configured in environment or Super Admin settings");
    }

    const defaultScopes = [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "public_profile",
    ];
    const scopes = params.scopes?.length ? params.scopes : defaultScopes;

    const query = new URLSearchParams({
      client_id: clientId,
      redirect_uri: params.redirectUri,
      state: params.state,
      response_type: "code",
      scope: scopes.join(","),
    });

    return `https://www.facebook.com/v19.0/dialog/oauth?${query.toString()}`;
  }

  /**
   * Exchanges authorization code for User Access Token,
   * then fetches and returns all managed Facebook Pages with their Page Access Tokens.
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    config?: { clientId?: string; clientSecret?: string }
  ): Promise<OAuthTokenResult[]> {
    const clientId = config?.clientId || process.env.FACEBOOK_CLIENT_ID || process.env.META_APP_ID;
    const clientSecret = config?.clientSecret || process.env.FACEBOOK_CLIENT_SECRET || process.env.META_APP_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Facebook App Credentials (client ID / secret) are missing");
    }

    // 1. Exchange code for short-lived User Token
    const tokenUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }).toString();

    const tokenRes = await this.request(tokenUrl);
    if (tokenRes.status >= 400 || !tokenRes.data?.access_token) {
      throw new Error(tokenRes.data?.error?.message || "Failed to exchange Facebook code for access token");
    }

    const userAccessToken = tokenRes.data.access_token;

    // 2. Exchange for Long-lived User Token (60-day)
    const longLivedUrl = `${GRAPH_API_BASE}/oauth/access_token?` + new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: clientId,
      client_secret: clientSecret,
      fb_exchange_token: userAccessToken,
    }).toString();

    const longLivedRes = await this.request(longLivedUrl);
    const effectiveToken = longLivedRes.data?.access_token || userAccessToken;

    // 3. Fetch user's managed Facebook Pages (me/accounts)
    const accountsUrl = `${GRAPH_API_BASE}/me/accounts?` + new URLSearchParams({
      access_token: effectiveToken,
      fields: "id,name,category,access_token,tasks,picture{url}",
    }).toString();

    const accountsRes = await this.request(accountsUrl);
    if (accountsRes.status >= 400 || !accountsRes.data?.data) {
      throw new Error(accountsRes.data?.error?.message || "Failed to fetch managed Facebook Pages");
    }

    const pages = accountsRes.data.data;
    if (!Array.isArray(pages) || pages.length === 0) {
      throw new Error("No Facebook Pages found. You must be an admin of at least one Facebook Page to publish.");
    }

    // Return all pages as connectable social accounts
    return pages.map((page: any) => ({
      accessToken: page.access_token,
      platformAccountId: page.id,
      accountName: page.name,
      username: page.name,
      profileImageUrl: page.picture?.data?.url,
      accountType: "PAGE",
      scopes: ["pages_manage_posts", "pages_read_engagement"],
      metadata: {
        category: page.category,
        tasks: page.tasks,
      },
    }));
  }

  /**
   * Publishes content to the designated Facebook Page.
   */
  async publish(
    account: {
      platformAccountId: string;
      accessToken: string;
      metadata?: any;
    },
    input: PublishPostInput
  ): Promise<PublishPostResult> {
    const pageId = account.platformAccountId;
    const pageAccessToken = account.accessToken;

    let endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
    let body: Record<string, any> = {
      access_token: pageAccessToken,
      message: input.content,
    };

    if (input.linkUrl) {
      body.link = input.linkUrl;
    }

    // Video post
    if (input.mediaUrls?.length && (input.mediaUrls[0].endsWith(".mp4") || input.mediaUrls[0].includes("/video/"))) {
      endpoint = `${GRAPH_API_BASE}/${pageId}/videos`;
      body = {
        access_token: pageAccessToken,
        description: input.content,
        file_url: input.mediaUrls[0],
        title: input.title || undefined,
      };
    } else if (input.mediaUrls?.length) {
      // Photo post
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
      body = {
        access_token: pageAccessToken,
        caption: input.content,
        url: input.mediaUrls[0],
      };
    }

    const res = await this.request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status >= 400 || res.data?.error) {
      return {
        success: false,
        error: res.data?.error?.message || `Facebook publishing failed with status ${res.status}`,
        rawResponse: res.data,
      };
    }

    const postId = res.data?.id || res.data?.post_id;
    return {
      success: true,
      platformPostId: postId,
      platformPostUrl: postId ? `https://facebook.com/${postId}` : undefined,
      publishedAt: new Date(),
      rawResponse: res.data,
    };
  }

  /**
   * Fetches post engagement metrics from Meta Graph API.
   */
  async getMetrics(
    account: {
      platformAccountId: string;
      accessToken: string;
    },
    platformPostId: string
  ): Promise<PlatformMetrics> {
    const url = `${GRAPH_API_BASE}/${platformPostId}?` + new URLSearchParams({
      fields: "shares,likes.summary(true),comments.summary(true)",
      access_token: account.accessToken,
    }).toString();

    const res = await this.request(url);
    if (res.status >= 400 || !res.data) {
      return {};
    }

    const data = res.data;
    const likes = data.likes?.summary?.total_count ?? 0;
    const comments = data.comments?.summary?.total_count ?? 0;
    const shares = data.shares?.count ?? 0;

    return {
      likes,
      comments,
      shares,
      rawMetrics: data,
    };
  }
}

export const facebookAdapter = new FacebookPlatformAdapter();
