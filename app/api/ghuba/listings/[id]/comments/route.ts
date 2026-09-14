/**
 * app/api/ghuba/listings/[id]/comments/route.ts
 *
 * GET /api/ghuba/listings/:id/comments - Retrieve paginated comments for a listing
 * POST /api/ghuba/listings/:id/comments - Post a comment
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { extractListingId } from "@/lib/ghuba-slug";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listingId = extractListingId(id);

    if (!listingId || !/^[0-9a-fA-F]{24}$/.test(listingId)) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "15", 10)), 50);

    const queryArgs: any = {
      where: {
        listingId,
        status: "VISIBLE",
      },
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profilePicture: true,
            role: true,
          },
        },
      },
    };

    if (cursor) {
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1;
    }

    const comments = await prisma.marketplaceListingComment.findMany(queryArgs);
    const totalCount = await prisma.marketplaceListingComment.count({
      where: { listingId, status: "VISIBLE" },
    });

    const hasMore = comments.length > limit;
    const pageItems = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore && pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;

    const formattedComments = pageItems.map((c) => ({
      id: c.id,
      listingId: c.listingId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: {
        id: c.user?.id || c.userId,
        name: c.user?.name || "Marketplace Shopper",
        avatar: c.user?.image || c.user?.profilePicture || null,
        role: c.user?.role || "USER",
      },
    }));

    return NextResponse.json({
      comments: formattedComments,
      nextCursor,
      hasMore,
      totalCount,
    });
  } catch (error: any) {
    console.error("[GET_COMMENTS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch comments", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to comment" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const listingId = extractListingId(id);

    if (!listingId || !/^[0-9a-fA-F]{24}$/.test(listingId)) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Comment cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    // Verify listing exists
    const listing = await prisma.marketplaceListings.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const newComment = await prisma.marketplaceListingComment.create({
      data: {
        listingId,
        userId,
        content,
        status: "VISIBLE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            profilePicture: true,
            role: true,
          },
        },
      },
    });

    const totalComments = await prisma.marketplaceListingComment.count({
      where: { listingId, status: "VISIBLE" },
    });

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: newComment.id,
          listingId: newComment.listingId,
          content: newComment.content,
          createdAt: newComment.createdAt.toISOString(),
          user: {
            id: newComment.user?.id || userId,
            name: newComment.user?.name || session?.user?.name || "You",
            avatar: newComment.user?.image || newComment.user?.profilePicture || session?.user?.image || null,
            role: newComment.user?.role || "USER",
          },
        },
        totalCount: totalComments,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST_COMMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to post comment", details: error?.message },
      { status: 500 }
    );
  }
}
