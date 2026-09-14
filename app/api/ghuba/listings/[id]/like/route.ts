/**
 * app/api/ghuba/listings/[id]/like/route.ts
 *
 * POST /api/ghuba/listings/:id/like - Like a marketplace listing
 * DELETE /api/ghuba/listings/:id/like - Remove like
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { extractListingId } from "@/lib/ghuba-slug";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to like listings" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const listingId = extractListingId(id);

    if (!listingId || !/^[0-9a-fA-F]{24}$/.test(listingId)) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    const listing = await prisma.marketplaceListings.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Atomic upsert to avoid duplicate likes race condition
    await prisma.marketplaceListingLike.upsert({
      where: {
        listingId_userId: {
          listingId,
          userId,
        },
      },
      create: {
        listingId,
        userId,
      },
      update: {},
    });

    const likesCount = await prisma.marketplaceListingLike.count({
      where: { listingId },
    });

    return NextResponse.json({
      success: true,
      liked: true,
      likesCount,
      listingId,
    });
  } catch (error: any) {
    console.error("[LIKE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to like listing", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to unlike listings" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const listingId = extractListingId(id);

    if (!listingId || !/^[0-9a-fA-F]{24}$/.test(listingId)) {
      return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
    }

    await prisma.marketplaceListingLike.deleteMany({
      where: {
        listingId,
        userId,
      },
    });

    const likesCount = await prisma.marketplaceListingLike.count({
      where: { listingId },
    });

    return NextResponse.json({
      success: true,
      liked: false,
      likesCount,
      listingId,
    });
  } catch (error: any) {
    console.error("[UNLIKE_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to unlike listing", details: error?.message },
      { status: 500 }
    );
  }
}
