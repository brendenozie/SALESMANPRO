/**
 * lib/social/socialService.ts
 *
 * Core Social Media Platform Service Layer for SalesmanPro.
 * Coordinates social accounts, OAuth credentials, content strategy generation,
 * approval workflows, publishing pipelines, retries, and analytics.
 */

import prisma from "@/server/db/prismadb";
import { socialCrypto } from "./socialCrypto";
import { socialPlatformRegistry } from "./adapters";
import { contentStrategyEngine } from "./contentStrategyEngine";
import {
  GenerateSocialContentInput,
  PublishPostResult,
  SocialPlatform,
  SocialPostStatus,
} from "./types";
import { AIPlatformError } from "@/lib/ai/types";
import { socialJobQueue } from "./queue/socialQueue";

export class SocialService {
  /**
   * Retrieves all connected social accounts for a tenant company.
   * Tokens are NEVER included in client responses.
   */
  public async getConnectedAccounts(companyId: string) {
    if (!companyId) throw new Error("companyId is required");

    const accounts = await prisma.socialAccount.findMany({
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
  public async saveConnectedAccount(params: {
    companyId: string;
    platform: SocialPlatform;
    platformAccountId: string;
    accountName: string;
    username?: string;
    profileImageUrl?: string;
    accountType?: string;
    accessToken: string;
    refreshToken?: string;
    expiresInSeconds?: number;
    scopes: string[];
    metadata?: any;
  }) {
    const {
      companyId,
      platform,
      platformAccountId,
      accountName,
      username,
      profileImageUrl,
      accountType,
      accessToken,
      refreshToken,
      expiresInSeconds,
      scopes,
      metadata,
    } = params;

    const accessBundle = socialCrypto.encryptToken(accessToken);
    const refreshBundle = refreshToken ? socialCrypto.encryptToken(refreshToken) : null;

    const tokenExpiresAt = expiresInSeconds
      ? new Date(Date.now() + expiresInSeconds * 1000)
      : null;

    const account = await prisma.socialAccount.upsert({
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
  public async disconnectAccount(companyId: string, accountId: string) {
    const account = await prisma.socialAccount.findFirst({
      where: { id: accountId, companyId },
    });

    if (!account) {
      throw new Error("Social account not found or unauthorized");
    }

    await prisma.socialAccount.delete({
      where: { id: accountId },
    });

    return { success: true };
  }

  /**
   * Generates tailored social content using the AI Content Strategy Engine,
   * stores the post, and initializes per-platform publication tracking.
   */
  public async generateAndCreatePost(input: GenerateSocialContentInput & { scheduledAt?: Date; userId?: string }) {
    const { companyId, scheduledAt, userId, ...strategyInput } = input;

    // 1. Generate multi-platform copy & adaptations
    const strategyResult = await contentStrategyEngine.generatePost({
      ...strategyInput,
      companyId,
    });

    // 2. Fetch Brand Profile for default approval mode
    const brandProfile = await prisma.socialBrandProfile.findUnique({
      where: { companyId },
    });

    const isAutoApproval = brandProfile?.approvalMode === "AUTOMATIC";
    const initialStatus: SocialPostStatus = scheduledAt
      ? "SCHEDULED"
      : isAutoApproval
      ? "READY"
      : "DRAFT";

    // 3. Extract media URLs
    const mediaUrls: string[] = [];
    if (strategyResult.generatedMedia?.length) {
      mediaUrls.push(...strategyResult.generatedMedia.map((m) => m.url));
    }

    // 4. Create central SocialMediaPost
    const post = await prisma.socialMediaPost.create({
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
        platformAdaptations: strategyResult.adaptations as any,
        metadata: {
          recommendedBestTime: strategyResult.recommendedBestTime,
          creditsConsumed: strategyResult.creditsConsumed,
        },
      },
    });

    // 5. Connect or match available social accounts for target platforms
    const connectedAccounts = await prisma.socialAccount.findMany({
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
        await prisma.socialPublication.create({
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
      await socialJobQueue.add(
        "PUBLISH_SCHEDULED_POST",
        { companyId, postId: post.id },
        { delay: delayMs, jobId: `post_${post.id}` }
      );
    }

    return {
      post,
      strategyResult,
    };
  }

  /**
   * Publishes an approved post immediately to all target platforms.
   */
  public async publishNow(companyId: string, postId: string) {
    const post = await prisma.socialMediaPost.findFirst({
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

    await prisma.socialMediaPost.update({
      where: { id: postId },
      data: { status: "PUBLISHING" },
    });

    const results: Record<string, PublishPostResult> = {};
    let anySuccess = false;
    let anyFailure = false;

    for (const pub of post.publications) {
      const { socialAccount, platform } = pub;

      try {
        await prisma.socialPublication.update({
          where: { id: pub.id },
          data: { status: "PUBLISHING", lastAttemptAt: new Date() },
        });

        // Decrypt social token safely
        const accessToken = socialCrypto.decryptToken({
          encrypted: socialAccount.accessTokenEncrypted,
          iv: socialAccount.accessTokenIv,
          tag: socialAccount.accessTokenTag,
        });

        const adapter = socialPlatformRegistry.getAdapter(platform);
        const adaptations = (post.platformAdaptations as any)?.[platform];

        const pubResult = await adapter.publish(
          {
            platformAccountId: socialAccount.platformAccountId,
            accessToken,
            metadata: socialAccount.metadata,
          },
          {
            content: adaptations?.caption || post.content,
            title: adaptations?.title || post.title || undefined,
            linkUrl: post.linkUrl || undefined,
            mediaUrls: post.mediaUrls,
            hashtags: adaptations?.hashtags || post.hashtags,
            aspectRatio: adaptations?.aspectRatio,
          }
        );

        results[platform] = pubResult;

        if (pubResult.success) {
          anySuccess = true;
          await prisma.socialPublication.update({
            where: { id: pub.id },
            data: {
              status: "PUBLISHED",
              platformPostId: pubResult.platformPostId,
              platformPostUrl: pubResult.platformPostUrl,
              publishedAt: pubResult.publishedAt || new Date(),
              error: null,
            },
          });
        } else {
          anyFailure = true;
          await prisma.socialPublication.update({
            where: { id: pub.id },
            data: {
              status: "FAILED",
              error: pubResult.error,
              retryCount: { increment: 1 },
            },
          });
        }
      } catch (err: any) {
        anyFailure = true;
        results[platform] = { success: false, error: err.message };
        await prisma.socialPublication.update({
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
    const finalStatus: SocialPostStatus =
      anySuccess && !anyFailure
        ? "PUBLISHED"
        : anySuccess && anyFailure
        ? "PUBLISHED" // partially published
        : "FAILED";

    await prisma.socialMediaPost.update({
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
  public async retryPublication(companyId: string, publicationId: string) {
    const pub = await prisma.socialPublication.findFirst({
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

    const accessToken = socialCrypto.decryptToken({
      encrypted: socialAccount.accessTokenEncrypted,
      iv: socialAccount.accessTokenIv,
      tag: socialAccount.accessTokenTag,
    });

    const adapter = socialPlatformRegistry.getAdapter(platform);
    const adaptations = (post.platformAdaptations as any)?.[platform];

    const pubResult = await adapter.publish(
      {
        platformAccountId: socialAccount.platformAccountId,
        accessToken,
        metadata: socialAccount.metadata,
      },
      {
        content: adaptations?.caption || post.content,
        title: adaptations?.title || post.title || undefined,
        linkUrl: post.linkUrl || undefined,
        mediaUrls: post.mediaUrls,
        hashtags: adaptations?.hashtags || post.hashtags,
        aspectRatio: adaptations?.aspectRatio,
      }
    );

    if (pubResult.success) {
      await prisma.socialPublication.update({
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
      const remainingFailed = await prisma.socialPublication.count({
        where: { postId: post.id, status: { not: "PUBLISHED" } },
      });

      if (remainingFailed === 0) {
        await prisma.socialMediaPost.update({
          where: { id: post.id },
          data: { status: "PUBLISHED" },
        });
      }
    } else {
      await prisma.socialPublication.update({
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
  public async approvePost(companyId: string, postId: string, userId: string) {
    const post = await prisma.socialMediaPost.findFirst({
      where: { id: postId, companyId },
    });

    if (!post) throw new Error("Post not found");

    return prisma.socialMediaPost.update({
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
  public async getPosts(companyId: string, options: {
    status?: SocialPostStatus;
    platform?: SocialPlatform;
    page?: number;
    limit?: number;
  } = {}) {
    const { status, platform, page = 1, limit = 20 } = options;

    const where: any = { companyId };
    if (status) where.status = status;
    if (platform) where.targetPlatforms = { has: platform };

    const [posts, total] = await Promise.all([
      prisma.socialMediaPost.findMany({
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
      prisma.socialMediaPost.count({ where }),
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
  public async getBrandProfile(companyId: string) {
    return prisma.socialBrandProfile.findUnique({
      where: { companyId },
    });
  }

  /**
   * Upserts brand voice and audience profile.
   */
  public async upsertBrandProfile(companyId: string, data: {
    brandVoice?: string;
    tone?: string;
    preferredLanguage?: string;
    targetAudience?: any;
    bannedWords?: string[];
    preferredCtas?: string[];
    defaultHashtags?: string[];
    approvalMode?: "AUTOMATIC" | "MANUAL";
    postingSchedulePreset?: any;
  }) {
    return prisma.socialBrandProfile.upsert({
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
  public async getAggregatedAnalytics(companyId: string) {
    const [totalPosts, publishedCount, scheduledCount, failedCount, publications] = await Promise.all([
      prisma.socialMediaPost.count({ where: { companyId } }),
      prisma.socialMediaPost.count({ where: { companyId, status: "PUBLISHED" } }),
      prisma.socialMediaPost.count({ where: { companyId, status: "SCHEDULED" } }),
      prisma.socialMediaPost.count({ where: { companyId, status: "FAILED" } }),
      prisma.socialPublication.findMany({
        where: { companyId, status: "PUBLISHED" },
        select: { platform: true, analytics: true },
      }),
    ]);

    let totalImpressions = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    const platformDistribution: Record<string, number> = {};

    for (const pub of publications) {
      platformDistribution[pub.platform] = (platformDistribution[pub.platform] || 0) + 1;
      const an = (pub.analytics as any) || {};
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

export const socialService = new SocialService();
