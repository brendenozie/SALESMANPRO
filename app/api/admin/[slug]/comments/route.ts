/**
 * app/api/admin/[slug]/comments/route.ts
 *
 * GET /api/admin/:slug/comments - List comments for the tenant store/listing with moderation filters
 * PATCH /api/admin/:slug/comments - Moderate a comment (approve, hide, restore, delete)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { resolveAuthorizedCompany } from "@/lib/auth/tenantScope";
import { findCompanyCached } from "@/lib/company-fetcher";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const { slug } = await params;
    const company = await findCompanyCached(slug, "api");
    if (!company) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const authRes = await resolveAuthorizedCompany(user, company.id);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // ALL, PENDING, APPROVED, HIDDEN, REPORTED
    const listingId = searchParams.get("listingId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where: any = {
      listing: {
        companyId: company.id,
      },
    };

    if (listingId) {
      where.listingId = listingId;
    }

    if (statusFilter && statusFilter !== "ALL") {
      where.moderationStatus = statusFilter;
    }

    const [comments, total] = await Promise.all([
      prisma.marketplaceListingComment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, image: true, email: true },
          },
          listing: {
            select: { id: true, name: true, images: true },
          },
        },
      }),
      prisma.marketplaceListingComment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      comments: comments.map((c) => ({
        id: c.id,
        listingId: c.listingId,
        listingName: c.listing?.name || "Product",
        content: c.content,
        moderationStatus: c.moderationStatus,
        reportCount: c.reportCount,
        reports: c.reports,
        createdAt: c.createdAt.toISOString(),
        author: {
          id: c.user?.id || c.userId,
          name: c.user?.name || "Anonymous",
          email: c.user?.email || null,
          image: c.user?.image || null,
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("[ADMIN_GET_COMMENTS_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    const { slug } = await params;
    const company = await findCompanyCached(slug, "api");
    if (!company) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const authRes = await resolveAuthorizedCompany(user, company.id);
    if (!authRes.authorized) {
      return NextResponse.json({ error: authRes.error }, { status: authRes.status });
    }

    const body = await request.json();
    const { commentId, action } = body; // action: "APPROVE", "HIDE", "DELETE"

    if (!commentId || !action) {
      return NextResponse.json({ error: "commentId and action required" }, { status: 400 });
    }

    const comment = await prisma.marketplaceListingComment.findUnique({
      where: { id: commentId },
      include: { listing: { select: { companyId: true } } },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify comment belongs to authorized company
    if (comment.listing.companyId !== company.id && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not your store's listing" }, { status: 403 });
    }

    let nextStatus = comment.status;
    let nextModerationStatus = comment.moderationStatus;

    if (action === "APPROVE") {
      nextModerationStatus = "APPROVED";
      nextStatus = "VISIBLE";
    } else if (action === "HIDE") {
      nextModerationStatus = "HIDDEN";
      nextStatus = "HIDDEN";
    } else if (action === "DELETE") {
      nextStatus = "DELETED";
      nextModerationStatus = "HIDDEN";
    }

    const updated = await prisma.marketplaceListingComment.update({
      where: { id: commentId },
      data: {
        status: nextStatus,
        moderationStatus: nextModerationStatus,
      },
    });

    return NextResponse.json({
      success: true,
      comment: {
        id: updated.id,
        status: updated.status,
        moderationStatus: updated.moderationStatus,
      },
    });
  } catch (error: any) {
    console.error("[ADMIN_MODERATE_COMMENT_ERROR]", error);
    return NextResponse.json({ error: "Failed to moderate comment" }, { status: 500 });
  }
}
