"use strict";
/**
 * lib/social/socialService.ts
 *
 * Core Social Media Platform Service Layer for SalesmanPro.
 * Coordinates social accounts, OAuth credentials, content strategy generation,
 * approval workflows, publishing pipelines, retries, and analytics.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialService = exports.SocialService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const socialCrypto_1 = require("./socialCrypto");
const adapters_1 = require("./adapters");
const contentStrategyEngine_1 = require("./contentStrategyEngine");
const socialQueue_1 = require("./queue/socialQueue");
class SocialService {
    /**
     * Retrieves all connected social accounts for a tenant company.
     * Tokens are NEVER included in client responses.
     */
    async getConnectedAccounts(companyId) {
        if (!companyId)
            throw new Error("companyId is required");
        const accounts = await prismadb_1.default.socialAccount.findMany({
            where: { companyId },
            select: {
                id: true,
                companyId: true,
                platform: true,
                platformAccountId: true,
                accountName: true,
                username: true,
                profileImageUrl: true,
                accountType: true,
                scopes: true,
                status: true,
                lastSyncAt: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        return accounts;
    }
    /**
     * Saves or updates a connected social account with securely encrypted tokens.
     */
    async saveConnectedAccount(params) {
        const { companyId, platform, platformAccountId, accountName, username, profileImageUrl, accountType, accessToken, refreshToken, expiresInSeconds, scopes, metadata, } = params;
        const accessBundle = socialCrypto_1.socialCrypto.encryptToken(accessToken);
        const refreshBundle = refreshToken ? socialCrypto_1.socialCrypto.encryptToken(refreshToken) : null;
        const tokenExpiresAt = expiresInSeconds
            ? new Date(Date.now() + expiresInSeconds * 1000)
            : null;
        const account = await prismadb_1.default.socialAccount.upsert({
            where: {
                companyId_platform_platformAccountId: {
                    companyId,
                    platform,
                    platformAccountId,
                },
            },
            update: {
                accountName,
                username,
                profileImageUrl,
                accountType,
                accessTokenEncrypted: accessBundle.encrypted,
                accessTokenIv: accessBundle.iv,
                accessTokenTag: accessBundle.tag,
                refreshTokenEncrypted: refreshBundle?.encrypted,
                refreshTokenIv: refreshBundle?.iv,
                refreshTokenTag: refreshBundle?.tag,
                tokenExpiresAt,
                scopes,
                status: "CONNECTED",
                lastSyncAt: new Date(),
                metadata,
            },
            create: {
                companyId,
                platform,
                platformAccountId,
                accountName,
                username,
                profileImageUrl,
                accountType,
                accessTokenEncrypted: accessBundle.encrypted,
                accessTokenIv: accessBundle.iv,
                accessTokenTag: accessBundle.tag,
                refreshTokenEncrypted: refreshBundle?.encrypted,
                refreshTokenIv: refreshBundle?.iv,
                refreshTokenTag: refreshBundle?.tag,
                tokenExpiresAt,
                scopes,
                status: "CONNECTED",
                lastSyncAt: new Date(),
                metadata,
            },
        });
        return account;
    }
    /**
     * Disconnects and removes a social account.
     */
    async disconnectAccount(companyId, accountId) {
        const account = await prismadb_1.default.socialAccount.findFirst({
            where: { id: accountId, companyId },
        });
        if (!account) {
            throw new Error("Social account not found or unauthorized");
        }
        await prismadb_1.default.socialAccount.delete({
            where: { id: accountId },
        });
        return { success: true };
    }
    /**
     * Generates tailored social content using the AI Content Strategy Engine,
     * stores the post, and initializes per-platform publication tracking.
     */
    async generateAndCreatePost(input) {
        const { companyId, scheduledAt, userId, ...strategyInput } = input;
        // 1. Generate multi-platform copy & adaptations
        const strategyResult = await contentStrategyEngine_1.contentStrategyEngine.generatePost({
            ...strategyInput,
            companyId,
        });
        // 2. Fetch Brand Profile for default approval mode
        const brandProfile = await prismadb_1.default.socialBrandProfile.findUnique({
            where: { companyId },
        });
        const isAutoApproval = brandProfile?.approvalMode === "AUTOMATIC";
        const initialStatus = scheduledAt
            ? "SCHEDULED"
            : isAutoApproval
                ? "READY"
                : "DRAFT";
        // 3. Extract media URLs
        const mediaUrls = [];
        if (strategyResult.generatedMedia?.length) {
            mediaUrls.push(...strategyResult.generatedMedia.map((m) => m.url));
        }
        // 4. Create central SocialMediaPost
        const post = await prismadb_1.default.socialMediaPost.create({
            data: {
                companyId,
                campaignId: input.campaignId || undefined,
                productId: input.productId || undefined,
                content: strategyResult.primaryCopy,
                hashtags: strategyResult.hashtags,
                targetPlatforms: input.targetPlatforms,
                contentType: input.contentType,
                status: initialStatus,
                mediaUrls,
                callToAction: strategyResult.callToAction,
                scheduledAt: scheduledAt || undefined,
                approvalMode: isAutoApproval ? "AUTOMATIC" : "MANUAL",
                isApproved: isAutoApproval,
                approvedByUserId: isAutoApproval ? userId : undefined,
                platformAdaptations: strategyResult.adaptations,
                metadata: {
                    recommendedBestTime: strategyResult.recommendedBestTime,
                    creditsConsumed: strategyResult.creditsConsumed,
                },
            },
        });
        // 5. Connect or match available social accounts for target platforms
        const connectedAccounts = await prismadb_1.default.socialAccount.findMany({
            where: {
                companyId,
                platform: { in: input.targetPlatforms },
                status: "CONNECTED",
            },
        });
        // 6. Initialize independent SocialPublication records per platform
        for (const platform of input.targetPlatforms) {
            const account = connectedAccounts.find((a) => a.platform === platform);
            if (account) {
                await prismadb_1.default.socialPublication.create({
                    data: {
                        companyId,
                        postId: post.id,
                        socialAccountId: account.id,
                        platform,
                        status: scheduledAt ? "SCHEDULED" : "SCHEDULED",
                        scheduledAt: scheduledAt || new Date(),
                    },
                });
            }
        }
        // 7. If scheduled and BullMQ is active, queue job
        if (scheduledAt) {
            const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());
            await socialQueue_1.socialJobQueue.add("PUBLISH_SCHEDULED_POST", { companyId, postId: post.id }, { delay: delayMs, jobId: `post_${post.id}` });
        }
        return {
            post,
            strategyResult,
        };
    }
    /**
     * Publishes an approved post immediately to all target platforms.
     */
    async publishNow(companyId, postId) {
        const post = await prismadb_1.default.socialMediaPost.findFirst({
            where: { id: postId, companyId },
            include: {
                publications: {
                    include: { socialAccount: true },
                },
            },
        });
        if (!post) {
            throw new Error("Post not found");
        }
        await prismadb_1.default.socialMediaPost.update({
            where: { id: postId },
            data: { status: "PUBLISHING" },
        });
        const results = {};
        let anySuccess = false;
        let anyFailure = false;
        for (const pub of post.publications) {
            const { socialAccount, platform } = pub;
            try {
                await prismadb_1.default.socialPublication.update({
                    where: { id: pub.id },
                    data: { status: "PUBLISHING", lastAttemptAt: new Date() },
                });
                // Decrypt social token safely
                const accessToken = socialCrypto_1.socialCrypto.decryptToken({
                    encrypted: socialAccount.accessTokenEncrypted,
                    iv: socialAccount.accessTokenIv,
                    tag: socialAccount.accessTokenTag,
                });
                const adapter = adapters_1.socialPlatformRegistry.getAdapter(platform);
                const adaptations = post.platformAdaptations?.[platform];
                const pubResult = await adapter.publish({
                    platformAccountId: socialAccount.platformAccountId,
                    accessToken,
                    metadata: socialAccount.metadata,
                }, {
                    content: adaptations?.caption || post.content,
                    title: adaptations?.title || post.title || undefined,
                    linkUrl: post.linkUrl || undefined,
                    mediaUrls: post.mediaUrls,
                    hashtags: adaptations?.hashtags || post.hashtags,
                    aspectRatio: adaptations?.aspectRatio,
                });
                results[platform] = pubResult;
                if (pubResult.success) {
                    anySuccess = true;
                    await prismadb_1.default.socialPublication.update({
                        where: { id: pub.id },
                        data: {
                            status: "PUBLISHED",
                            platformPostId: pubResult.platformPostId,
                            platformPostUrl: pubResult.platformPostUrl,
                            publishedAt: pubResult.publishedAt || new Date(),
                            error: null,
                        },
                    });
                }
                else {
                    anyFailure = true;
                    await prismadb_1.default.socialPublication.update({
                        where: { id: pub.id },
                        data: {
                            status: "FAILED",
                            error: pubResult.error,
                            retryCount: { increment: 1 },
                        },
                    });
                }
            }
            catch (err) {
                anyFailure = true;
                results[platform] = { success: false, error: err.message };
                await prismadb_1.default.socialPublication.update({
                    where: { id: pub.id },
                    data: {
                        status: "FAILED",
                        error: err.message,
                        retryCount: { increment: 1 },
                    },
                });
            }
        }
        // Update overall post status
        const finalStatus = anySuccess && !anyFailure
            ? "PUBLISHED"
            : anySuccess && anyFailure
                ? "PUBLISHED" // partially published
                : "FAILED";
        await prismadb_1.default.socialMediaPost.update({
            where: { id: postId },
            data: {
                status: finalStatus,
                publishedAt: anySuccess ? new Date() : undefined,
            },
        });
        return {
            success: anySuccess,
            results,
            finalStatus,
        };
    }
    /**
     * Retries publishing for a specific failed publication without regenerating AI content.
     */
    async retryPublication(companyId, publicationId) {
        const pub = await prismadb_1.default.socialPublication.findFirst({
            where: { id: publicationId, companyId },
            include: {
                post: true,
                socialAccount: true,
            },
        });
        if (!pub) {
            throw new Error("Publication record not found");
        }
        const { post, socialAccount, platform } = pub;
        const accessToken = socialCrypto_1.socialCrypto.decryptToken({
            encrypted: socialAccount.accessTokenEncrypted,
            iv: socialAccount.accessTokenIv,
            tag: socialAccount.accessTokenTag,
        });
        const adapter = adapters_1.socialPlatformRegistry.getAdapter(platform);
        const adaptations = post.platformAdaptations?.[platform];
        const pubResult = await adapter.publish({
            platformAccountId: socialAccount.platformAccountId,
            accessToken,
            metadata: socialAccount.metadata,
        }, {
            content: adaptations?.caption || post.content,
            title: adaptations?.title || post.title || undefined,
            linkUrl: post.linkUrl || undefined,
            mediaUrls: post.mediaUrls,
            hashtags: adaptations?.hashtags || post.hashtags,
            aspectRatio: adaptations?.aspectRatio,
        });
        if (pubResult.success) {
            await prismadb_1.default.socialPublication.update({
                where: { id: pub.id },
                data: {
                    status: "PUBLISHED",
                    platformPostId: pubResult.platformPostId,
                    platformPostUrl: pubResult.platformPostUrl,
                    publishedAt: new Date(),
                    error: null,
                },
            });
            // If all publications are now published, update parent post
            const remainingFailed = await prismadb_1.default.socialPublication.count({
                where: { postId: post.id, status: { not: "PUBLISHED" } },
            });
            if (remainingFailed === 0) {
                await prismadb_1.default.socialMediaPost.update({
                    where: { id: post.id },
                    data: { status: "PUBLISHED" },
                });
            }
        }
        else {
            await prismadb_1.default.socialPublication.update({
                where: { id: pub.id },
                data: {
                    status: "FAILED",
                    error: pubResult.error,
                    retryCount: { increment: 1 },
                    lastAttemptAt: new Date(),
                },
            });
        }
        return pubResult;
    }
    /**
     * Approves a draft post.
     */
    async approvePost(companyId, postId, userId) {
        const post = await prismadb_1.default.socialMediaPost.findFirst({
            where: { id: postId, companyId },
        });
        if (!post)
            throw new Error("Post not found");
        return prismadb_1.default.socialMediaPost.update({
            where: { id: postId },
            data: {
                isApproved: true,
                approvedByUserId: userId,
                status: post.scheduledAt ? "SCHEDULED" : "READY",
            },
        });
    }
    /**
     * Fetches posts with filtering.
     */
    async getPosts(companyId, options = {}) {
        const { status, platform, page = 1, limit = 20 } = options;
        const where = { companyId };
        if (status)
            where.status = status;
        if (platform)
            where.targetPlatforms = { has: platform };
        const [posts, total] = await Promise.all([
            prismadb_1.default.socialMediaPost.findMany({
                where,
                include: {
                    publications: {
                        include: {
                            socialAccount: {
                                select: { id: true, platform: true, accountName: true, profileImageUrl: true },
                            },
                        },
                    },
                    product: {
                        select: { id: true, name: true, category: true, images: true },
                    },
                    campaign: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prismadb_1.default.socialMediaPost.count({ where }),
        ]);
        return {
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    /**
     * Gets brand profile for the store.
     */
    async getBrandProfile(companyId) {
        return prismadb_1.default.socialBrandProfile.findUnique({
            where: { companyId },
        });
    }
    /**
     * Upserts brand voice and audience profile.
     */
    async upsertBrandProfile(companyId, data) {
        return prismadb_1.default.socialBrandProfile.upsert({
            where: { companyId },
            update: data,
            create: {
                companyId,
                ...data,
            },
        });
    }
    /**
     * Aggregates live and stored analytics across all platforms.
     */
    async getAggregatedAnalytics(companyId) {
        const [totalPosts, publishedCount, scheduledCount, failedCount, publications] = await Promise.all([
            prismadb_1.default.socialMediaPost.count({ where: { companyId } }),
            prismadb_1.default.socialMediaPost.count({ where: { companyId, status: "PUBLISHED" } }),
            prismadb_1.default.socialMediaPost.count({ where: { companyId, status: "SCHEDULED" } }),
            prismadb_1.default.socialMediaPost.count({ where: { companyId, status: "FAILED" } }),
            prismadb_1.default.socialPublication.findMany({
                where: { companyId, status: "PUBLISHED" },
                select: { platform: true, analytics: true },
            }),
        ]);
        let totalImpressions = 0;
        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;
        const platformDistribution = {};
        for (const pub of publications) {
            platformDistribution[pub.platform] = (platformDistribution[pub.platform] || 0) + 1;
            const an = pub.analytics || {};
            totalImpressions += an.impressions || an.views || 0;
            totalLikes += an.likes || 0;
            totalComments += an.comments || 0;
            totalShares += an.shares || 0;
        }
        return {
            totalPosts,
            publishedCount,
            scheduledCount,
            failedCount,
            totalImpressions,
            totalLikes,
            totalComments,
            totalShares,
            platformDistribution,
        };
    }
}
exports.SocialService = SocialService;
exports.socialService = new SocialService();
