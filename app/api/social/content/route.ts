/**
 * app/api/social/content/route.ts
 *
 * Lists social posts and supports manual post creation.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import { socialService } from "@/lib/social/socialService";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") as any;
    const platform = searchParams.get("platform") as any;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await socialService.getPosts(auth.companyId, {
      status,
      platform,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("[GET /api/social/content] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch social posts" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await resolveAIAuth(req);
    const body = await req.json();

    const {
      content,
      title,
      targetPlatforms,
      contentType = "TEXT",
      mediaUrls = [],
      linkUrl,
      callToAction,
      scheduledAt,
      productId,
      campaignId,
      approvalMode = "MANUAL",
    } = body;

    if (!content || !targetPlatforms?.length) {
      return NextResponse.json(
        { success: false, error: "Content and at least one target platform are required." },
        { status: 400 }
      );
    }

    const post = await prisma.socialMediaPost.create({
      data: {
        companyId: auth.companyId,
        content,
        title,
        targetPlatforms,
        contentType,
        mediaUrls,
        linkUrl,
        callToAction,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        productId: productId || undefined,
        campaignId: campaignId || undefined,
        approvalMode,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
      },
    });

    // Create publication records for connected accounts
    const connectedAccounts = await prisma.socialAccount.findMany({
      where: {
        companyId: auth.companyId,
        platform: { in: targetPlatforms },
        status: "CONNECTED",
      },
    });

    for (const platform of targetPlatforms) {
      const account = connectedAccounts.find((a) => a.platform === platform);
      if (account) {
        await prisma.socialPublication.create({
          data: {
            companyId: auth.companyId,
            postId: post.id,
            socialAccountId: account.id,
            platform,
            status: scheduledAt ? "SCHEDULED" : "SCHEDULED",
            scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error: any) {
    console.error("[POST /api/social/content] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create post" },
      { status: error.statusCode || 500 }
    );
  }
}
