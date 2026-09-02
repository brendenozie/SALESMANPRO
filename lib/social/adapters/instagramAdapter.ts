/**
 * lib/social/adapters/instagramAdapter.ts
 *
 * Official Instagram Graph API Adapter for Professional (Business / Creator) accounts.
 * Supports:
 * - Single image posts
 * - Instagram Reels & video posts
 * - Multi-image carousels
 * - Two-step container creation & publishing workflow
 * - Engagement insights
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

export class InstagramPlatformAdapter extends BaseSocialPlatformAdapter {
  readonly platform: SocialPlatform = "INSTAGRAM";

  /**
   * Generates official OAuth URL for Instagram Business publishing via Meta.
   */
  getOAuthUrl(params: OAuthUrlParams, config?: { clientId?: string }): string {
    const clientId = config?.clientId || process.env.INSTAGRAM_CLIENT_ID || process.env.META_APP_ID;
    if (!clientId) {
      throw new Error("Instagram / Meta Client ID is not configured");
    }

    const defaultScopes = [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
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
   * Exchanges code for access token and resolves linked Instagram Professional Accounts.
   */
  async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    config?: { clientId?: string; clientSecret?: string }
  ): Promise<OAuthTokenResult[]> {
    const clientId = config?.clientId || process.env.INSTAGRAM_CLIENT_ID || process.env.META_APP_ID;
    const clientSecret = config?.clientSecret || process.env.INSTAGRAM_CLIENT_SECRET || process.env.META_APP_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Instagram / Meta App Credentials (client ID / secret) are missing");
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
      throw new Error(tokenRes.data?.error?.message || "Failed to exchange Instagram code for access token");
    }

    const userToken = tokenRes.data.access_token;

    // 2. Fetch Facebook Pages and look up linked Instagram Business Accounts
    const pagesUrl = `${GRAPH_API_BASE}/me/accounts?` + new URLSearchParams({
      access_token: userToken,
      fields: "id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}",
    }).toString();

    const pagesRes = await this.request(pagesUrl);
    if (pagesRes.status >= 400 || !pagesRes.data?.data) {
      throw new Error(pagesRes.data?.error?.message || "Failed to fetch Facebook Pages to locate Instagram Business accounts");
    }

    const results: OAuthTokenResult[] = [];
    for (const page of pagesRes.data.data) {
      if (page.instagram_business_account?.id) {
        const ig = page.instagram_business_account;
        results.push({
          accessToken: page.access_token, // Page token has authority to publish to linked IG account
          platformAccountId: ig.id,
          accountName: ig.name || ig.username || page.name,
          username: ig.username,
          profileImageUrl: ig.profile_picture_url,
          accountType: "BUSINESS",
          scopes: ["instagram_basic", "instagram_content_publish"],
          metadata: {
            linkedFacebookPageId: page.id,
            linkedFacebookPageName: page.name,
          },
        });
      }
    }

    if (results.length === 0) {
      throw new Error(
        "No Instagram Professional (Business/Creator) Account found linked to your Facebook Pages. " +
        "Please ensure your Instagram account is switched to a Professional account and connected to a Facebook Page."
      );
    }

    return results;
  }

  /**
   * Publishes an image, carousel, or reel to Instagram via the official 2-step Container API.
   */
  async publish(
    account: {
      platformAccountId: string;
      accessToken: string;
      metadata?: any;
    },
    input: PublishPostInput
  ): Promise<PublishPostResult> {
    const igUserId = account.platformAccountId;
    const accessToken = account.accessToken;
    const mediaUrls = input.mediaUrls || [];

    if (mediaUrls.length === 0) {
      return {
        success: false,
        error: "Instagram requires at least one media asset (image or video) to publish a post.",
      };
    }

    const isVideo = mediaUrls[0].endsWith(".mp4") || mediaUrls[0].includes("/video/");

    try {
      let containerId: string;

      // STEP 1: CREATE MEDIA CONTAINER
      if (isVideo) {
        // Reel / Video Container
        const containerRes = await this.request(`${GRAPH_API_BASE}/${igUserId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: accessToken,
            media_type: "REELS",
            video_url: mediaUrls[0],
            caption: input.content,
            share_to_feed: true,
          }),
        });

        if (containerRes.status >= 400 || !containerRes.data?.id) {
          throw new Error(containerRes.data?.error?.message || "Failed to create Instagram Reel container");
        }
        containerId = containerRes.data.id;

        // Poll until video processing status is FINISHED (up to 60s)
        await this.pollContainerStatus(containerId, accessToken);
      } else if (mediaUrls.length > 1) {
        // Carousel Container
        const childContainerIds: string[] = [];
        for (const url of mediaUrls.slice(0, 10)) {
          const childRes = await this.request(`${GRAPH_API_BASE}/${igUserId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: accessToken,
              is_carousel_item: true,
              image_url: url,
            }),
          });
          if (childRes.data?.id) childContainerIds.push(childRes.data.id);
        }

        const carouselRes = await this.request(`${GRAPH_API_BASE}/${igUserId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: accessToken,
            media_type: "CAROUSEL",
            children: childContainerIds,
            caption: input.content,
          }),
        });

        if (carouselRes.status >= 400 || !carouselRes.data?.id) {
          throw new Error(carouselRes.data?.error?.message || "Failed to create Instagram Carousel container");
        }
        containerId = carouselRes.data.id;
      } else {
        // Single Image Container
        const containerRes = await this.request(`${GRAPH_API_BASE}/${igUserId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: accessToken,
            image_url: mediaUrls[0],
            caption: input.content,
          }),
        });

        if (containerRes.status >= 400 || !containerRes.data?.id) {
          throw new Error(containerRes.data?.error?.message || "Failed to create Instagram Photo container");
        }
        containerId = containerRes.data.id;
      }

      // STEP 2: PUBLISH MEDIA CONTAINER
      const publishRes = await this.request(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: accessToken,
          creation_id: containerId,
        }),
      });

      if (publishRes.status >= 400 || !publishRes.data?.id) {
        throw new Error(publishRes.data?.error?.message || "Failed to publish Instagram media container");
      }

      const mediaId = publishRes.data.id;
      return {
        success: true,
        platformPostId: mediaId,
        platformPostUrl: `https://www.instagram.com/p/${mediaId}/`,
        publishedAt: new Date(),
        rawResponse: publishRes.data,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Unknown error occurred while publishing to Instagram",
      };
    }
  }

  /**
   * Helper: Polls Instagram container status until FINISHED or ERROR.
   */
  private async pollContainerStatus(containerId: string, accessToken: string, maxAttempts = 12): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s between checks

      const statusRes = await this.request(`${GRAPH_API_BASE}/${containerId}?` + new URLSearchParams({
        fields: "status_code",
        access_token: accessToken,
      }).toString());

      const statusCode = statusRes.data?.status_code;
      if (statusCode === "FINISHED") {
        return;
      }
      if (statusCode === "ERROR" || statusCode === "EXPIRED") {
        throw new Error(`Instagram media processing failed with status: ${statusCode}`);
      }
    }
    // Proceed optimistically if still in_progress after polling limit
  }

  /**
   * Fetches Instagram post engagement insights.
   */
  async getMetrics(
    account: {
      platformAccountId: string;
      accessToken: string;
    },
    platformPostId: string
  ): Promise<PlatformMetrics> {
    const url = `${GRAPH_API_BASE}/${platformPostId}?` + new URLSearchParams({
      fields: "like_count,comments_count",
      access_token: account.accessToken,
    }).toString();

    const res = await this.request(url);
    if (res.status >= 400 || !res.data) {
      return {};
    }

    return {
      likes: res.data.like_count ?? 0,
      comments: res.data.comments_count ?? 0,
      rawMetrics: res.data,
    };
  }
}

export const instagramAdapter = new InstagramPlatformAdapter();
