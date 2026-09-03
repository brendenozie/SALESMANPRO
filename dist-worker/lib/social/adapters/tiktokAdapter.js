"use strict";
/**
 * lib/social/adapters/tiktokAdapter.ts
 *
 * Official TikTok Content Posting API v2 Adapter.
 * Supports:
 * - TikTok OAuth v2 authorization & token exchange
 * - Direct video publishing / PULL_FROM_URL video initialization
 * - Caption, hashtags, and privacy level options
 * - Publishing status polling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiktokAdapter = exports.TikTokPlatformAdapter = void 0;
const baseAdapter_1 = require("./baseAdapter");
const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2";
class TikTokPlatformAdapter extends baseAdapter_1.BaseSocialPlatformAdapter {
    platform = "TIKTOK";
    /**
     * Generates official TikTok v2 OAuth Authorization URL.
     */
    getOAuthUrl(params, config) {
        const clientKey = config?.clientKey || config?.clientId || process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_APP_ID;
        if (!clientKey) {
            throw new Error("TikTok Client Key is not configured");
        }
        const defaultScopes = ["user.info.basic", "video.publish", "video.upload"];
        const scopes = params.scopes?.length ? params.scopes : defaultScopes;
        const query = new URLSearchParams({
            client_key: clientKey,
            scope: scopes.join(","),
            response_type: "code",
            redirect_uri: params.redirectUri,
            state: params.state,
        });
        return `https://www.tiktok.com/v2/auth/authorize/?${query.toString()}`;
    }
    /**
     * Exchanges code for TikTok access & refresh tokens and user profile.
     */
    async exchangeCodeForToken(code, redirectUri, config) {
        const clientKey = config?.clientKey || process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_APP_ID;
        const clientSecret = config?.clientSecret || process.env.TIKTOK_CLIENT_SECRET || process.env.TIKTOK_APP_SECRET;
        if (!clientKey || !clientSecret) {
            throw new Error("TikTok Credentials (client key / secret) are missing");
        }
        // 1. Exchange code for tokens
        const tokenRes = await this.request(`${TIKTOK_API_BASE}/oauth/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_key: clientKey,
                client_secret: clientSecret,
                code,
                grant_type: "authorization_code",
                redirect_uri: redirectUri,
            }).toString(),
        });
        if (tokenRes.status >= 400 || !tokenRes.data?.access_token) {
            const errDetail = tokenRes.data?.error_description || tokenRes.data?.message;
            throw new Error(errDetail || "Failed to exchange TikTok authorization code for access token");
        }
        const { access_token, refresh_token, expires_in, open_id } = tokenRes.data;
        // 2. Fetch User Profile
        const profileRes = await this.request(`${TIKTOK_API_BASE}/user/info/?fields=open_id,display_name,avatar_url`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const user = profileRes.data?.data?.user;
        return [
            {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresInSeconds: expires_in,
                platformAccountId: open_id || user?.open_id || "tiktok_account",
                accountName: user?.display_name || "TikTok Account",
                username: user?.display_name,
                profileImageUrl: user?.avatar_url,
                accountType: "CREATOR",
                scopes: ["user.info.basic", "video.publish"],
            },
        ];
    }
    /**
     * Publishes video to TikTok via official Content Posting API v2.
     */
    async publish(account, input) {
        const mediaUrls = input.mediaUrls || [];
        if (mediaUrls.length === 0) {
            return {
                success: false,
                error: "TikTok requires a video URL to publish a post.",
            };
        }
        const videoUrl = mediaUrls[0];
        const accessToken = account.accessToken;
        try {
            // 1. Initialize Direct Video Publishing via PULL_FROM_URL
            const initRes = await this.request(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    post_info: {
                        title: input.content.substring(0, 2200),
                        privacy_level: input.platformSpecificOptions?.privacyLevel || "PUBLIC_TO_EVERYONE",
                        disable_duet: false,
                        disable_comment: false,
                        disable_stitch: false,
                        video_cover_timestamp_ms: 1000,
                    },
                    source_info: {
                        source: "PULL_FROM_URL",
                        video_url: videoUrl,
                    },
                }),
            });
            if (initRes.status >= 400 || initRes.data?.error?.code !== "ok") {
                const errorMsg = initRes.data?.error?.message || `TikTok video init failed with code ${initRes.data?.error?.code}`;
                throw new Error(errorMsg);
            }
            const publishId = initRes.data?.data?.publish_id;
            return {
                success: true,
                platformPostId: publishId,
                platformPostUrl: `https://www.tiktok.com`,
                publishedAt: new Date(),
                rawResponse: initRes.data,
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || "Failed to publish video to TikTok",
            };
        }
    }
    /**
     * Checks publishing status for an initialized TikTok publish job.
     */
    async checkPublishStatus(accessToken, publishId) {
        const res = await this.request(`${TIKTOK_API_BASE}/post/publish/status/fetch/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ publish_id: publishId }),
        });
        return res.data?.data?.status || "PROCESSING";
    }
}
exports.TikTokPlatformAdapter = TikTokPlatformAdapter;
exports.tiktokAdapter = new TikTokPlatformAdapter();
