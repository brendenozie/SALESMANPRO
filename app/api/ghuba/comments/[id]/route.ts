/**
 * app/api/ghuba/comments/[id]/route.ts
 *
 * DELETE /api/ghuba/comments/:id - Delete a comment
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: "Invalid comment ID" }, { status: 400 });
    }

    const comment = await prisma.marketplaceListingComment.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            sellerId: true,
            companyId: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check authorization: author of comment, admin, or listing seller
    const isAuthor = comment.userId === userId;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
    const isSeller = comment.listing?.sellerId === userId;

    if (!isAuthor && !isAdmin && !isSeller) {
      return NextResponse.json(
        { error: "Forbidden: You are not authorized to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.marketplaceListingComment.delete({
      where: { id },
    });

    const totalComments = await prisma.marketplaceListingComment.count({
      where: { listingId: comment.listingId, status: "VISIBLE" },
    });

    return NextResponse.json({
      success: true,
      deletedId: id,
      listingId: comment.listingId,
      totalCount: totalComments,
    });
  } catch (error: any) {
    console.error("[DELETE_COMMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to delete comment", details: error?.message },
      { status: 500 }
    );
  }
}
