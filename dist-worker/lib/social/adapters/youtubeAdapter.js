"use strict";
/**
 * lib/social/adapters/youtubeAdapter.ts
 *
 * Official YouTube Data API v3 Adapter.
 * Supports:
 * - Google OAuth 2.0 with YouTube upload scopes
 * - YouTube Videos & YouTube Shorts publishing
 * - Video title, description, tags, category, and privacy settings
 * - Resumable video upload pipeline
 * - YouTube video statistics & analytics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeAdapter = exports.YouTubePlatformAdapter = void 0;
const baseAdapter_1 = require("./baseAdapter");
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const GOOGLE_OAUTH_BASE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
class YouTubePlatformAdapter extends baseAdapter_1.BaseSocialPlatformAdapter {
    platform = "YOUTUBE";
    /**
     * Generates official Google OAuth 2.0 URL for YouTube Channel management.
     */
    getOAuthUrl(params, config) {
        const clientId = config?.clientId || process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
        if (!clientId) {
            throw new Error("Google / YouTube Client ID is not configured");
        }
        const defaultScopes = [
            "https://www.googleapis.com/auth/youtube.upload",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/userinfo.profile",
        ];
        const scopes = params.scopes?.length ? params.scopes : defaultScopes;
        const query = new URLSearchParams({
            client_id: clientId,
            redirect_uri: params.redirectUri,
            response_type: "code",
            scope: scopes.join(" "),
            access_type: "offline",
            prompt: "consent",
            state: params.state,
        });
        return `${GOOGLE_OAUTH_BASE}?${query.toString()}`;
    }
    /**
     * Exchanges authorization code for Google/YouTube access and refresh tokens,
     * then fetches Channel details.
     */
    async exchangeCodeForToken(code, redirectUri, config) {
        const clientId = config?.clientId || process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = config?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new Error("Google / YouTube Credentials (client ID / secret) are missing");
        }
        // 1. Exchange code for tokens
        const tokenRes = await this.request(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }).toString(),
        });
        if (tokenRes.status >= 400 || !tokenRes.data?.access_token) {
            throw new Error(tokenRes.data?.error_description || "Failed to exchange Google code for YouTube access token");
        }
        const { access_token, refresh_token, expires_in } = tokenRes.data;
        // 2. Fetch User Channel details
        const channelRes = await this.request(`${YOUTUBE_API_BASE}/channels?part=snippet,statistics&mine=true`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const channels = channelRes.data?.items;
        if (!Array.isArray(channels) || channels.length === 0) {
            throw new Error("No YouTube Channel found for this Google account. Please create a YouTube channel first.");
        }
        const channel = channels[0];
        return [
            {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresInSeconds: expires_in,
                platformAccountId: channel.id,
                accountName: channel.snippet?.title || "YouTube Channel",
                username: channel.snippet?.customUrl || channel.snippet?.title,
                profileImageUrl: channel.snippet?.thumbnails?.default?.url,
                accountType: "CHANNEL",
                scopes: [
                    "https://www.googleapis.com/auth/youtube.upload",
                    "https://www.googleapis.com/auth/youtube.readonly",
                ],
                metadata: {
                    subscriberCount: channel.statistics?.subscriberCount,
                    videoCount: channel.statistics?.videoCount,
                },
            },
        ];
    }
    /**
     * Refreshes expired Google access token using the stored refresh token.
     */
    async refreshToken(refreshToken, config) {
        const clientId = config?.clientId || process.env.GOOGLE_CLIENT_ID || process.env.YOUTUBE_CLIENT_ID;
        const clientSecret = config?.clientSecret || process.env.GOOGLE_CLIENT_SECRET || process.env.YOUTUBE_CLIENT_SECRET;
        const res = await this.request(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId || "",
                client_secret: clientSecret || "",
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }).toString(),
        });
        if (res.status >= 400 || !res.data?.access_token) {
            throw new Error("Failed to refresh YouTube access token");
        }
        return {
            accessToken: res.data.access_token,
            expiresInSeconds: res.data.expires_in,
        };
    }
    /**
     * Publishes video / Short to YouTube via official Resumable Upload protocol.
     */
    async publish(account, input) {
        const mediaUrls = input.mediaUrls || [];
        if (mediaUrls.length === 0) {
            return {
                success: false,
                error: "YouTube requires a video media URL to publish.",
            };
        }
        const videoUrl = mediaUrls[0];
        const accessToken = account.accessToken;
        try {
            const isShort = input.aspectRatio === "9:16" || input.content.includes("#Shorts");
            const title = input.title || (isShort ? `${input.content.slice(0, 50)} #Shorts` : input.content.slice(0, 90));
            const description = isShort && !input.content.includes("#Shorts")
                ? `${input.content}\n\n#Shorts #SalesmanPro`
                : input.content;
            // STEP 1: Fetch source video stream/buffer
            const videoFetch = await fetch(videoUrl);
            if (!videoFetch.ok) {
                throw new Error(`Failed to download source video from ${videoUrl}`);
            }
            const videoBuffer = Buffer.from(await videoFetch.arrayBuffer());
            const videoSizeBytes = videoBuffer.byteLength;
            // STEP 2: Initiate Resumable Upload Session
            const initUrl = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";
            const initRes = await fetch(initUrl, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json; charset=UTF-8",
                    "X-Upload-Content-Length": videoSizeBytes.toString(),
                    "X-Upload-Content-Type": "video/mp4",
                },
                body: JSON.stringify({
                    snippet: {
                        title,
                        description,
                        tags: input.hashtags || ["SalesmanPro", "Products"],
                        categoryId: "22", // People & Blogs / General
                    },
                    status: {
                        privacyStatus: input.platformSpecificOptions?.privacyStatus || "public",
                        selfDeclaredMadeForKids: false,
                    },
                }),
            });
            if (!initRes.ok) {
                const errText = await initRes.text();
                throw new Error(`YouTube resumable upload initialization failed: ${errText}`);
            }
            const uploadLocation = initRes.headers.get("location");
            if (!uploadLocation) {
                throw new Error("YouTube did not return a resumable upload location URL");
            }
            // STEP 3: Stream Video Buffer to Upload URL
            const uploadRes = await fetch(uploadLocation, {
                method: "PUT",
                headers: {
                    "Content-Length": videoSizeBytes.toString(),
                    "Content-Type": "video/mp4",
                },
                body: videoBuffer,
            });
            if (!uploadRes.ok) {
                const uploadErr = await uploadRes.text();
                throw new Error(`YouTube binary upload failed: ${uploadErr}`);
            }
            const result = await uploadRes.json();
            const videoId = result.id;
            return {
                success: true,
                platformPostId: videoId,
                platformPostUrl: isShort
                    ? `https://www.youtube.com/shorts/${videoId}`
                    : `https://www.youtube.com/watch?v=${videoId}`,
                publishedAt: new Date(),
                rawResponse: result,
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message || "Failed to publish video to YouTube",
            };
        }
    }
    /**
     * Fetches video performance metrics (views, likes, comments).
     */
    async getMetrics(account, platformPostId) {
        const url = `${YOUTUBE_API_BASE}/videos?part=statistics&id=${platformPostId}`;
        const res = await this.request(url, {
            headers: { Authorization: `Bearer ${account.accessToken}` },
        });
        const stats = res.data?.items?.[0]?.statistics;
        if (!stats)
            return {};
        return {
            views: parseInt(stats.viewCount || "0", 10),
            likes: parseInt(stats.likeCount || "0", 10),
            comments: parseInt(stats.commentCount || "0", 10),
            rawMetrics: stats,
        };
    }
}
exports.YouTubePlatformAdapter = YouTubePlatformAdapter;
exports.youtubeAdapter = new YouTubePlatformAdapter();
