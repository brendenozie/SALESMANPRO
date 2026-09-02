/**
 * app/api/social/content/[id]/route.ts
 *
 * Fetches, updates, or deletes a specific social post and its publications.
 */

import { NextResponse } from "next/server";
import { resolveAIAuth } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;

    const post = await prisma.socialMediaPost.findFirst({
      where: { id, companyId: auth.companyId },
      include: {
        publications: {
          include: {
            socialAccount: {
              select: { id: true, platform: true, accountName: true, profileImageUrl: true },
            },
          },
        },
        product: true,
        campaign: true,
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error("[GET /api/social/content/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch post" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;
    const body = await req.json();

    const post = await prisma.socialMediaPost.findFirst({
      where: { id, companyId: auth.companyId },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    const updated = await prisma.socialMediaPost.update({
      where: { id },
      data: {
        content: body.content !== undefined ? body.content : undefined,
        title: body.title !== undefined ? body.title : undefined,
        mediaUrls: body.mediaUrls !== undefined ? body.mediaUrls : undefined,
        scheduledAt: body.scheduledAt !== undefined ? (body.scheduledAt ? new Date(body.scheduledAt) : null) : undefined,
        status: body.status !== undefined ? body.status : undefined,
        isApproved: body.isApproved !== undefined ? body.isApproved : undefined,
        platformAdaptations: body.platformAdaptations !== undefined ? body.platformAdaptations : undefined,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error("[PATCH /api/social/content/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update post" },
      { status: error.statusCode || 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = await resolveAIAuth(req);
    const { id } = await params;

    const post = await prisma.socialMediaPost.findFirst({
      where: { id, companyId: auth.companyId },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    await prisma.socialMediaPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[DELETE /api/social/content/[id]] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete post" },
      { status: error.statusCode || 500 }
    );
  }
}
