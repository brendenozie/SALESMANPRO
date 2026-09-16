/**
 * app/api/ghuba/listings/[id]/save/route.ts
 *
 * POST /api/ghuba/listings/:id/save - Save / bookmark a listing to user's wishlist
 * DELETE /api/ghuba/listings/:id/save - Remove saved listing
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";
import { extractListingId } from "@/lib/ghuba-slug";
import { enqueueTelemetryBatch } from "@/lib/analytics/queue/analyticsQueue";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to save listings" },
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
      select: { id: true, productId: true, companyId: true },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Find or create default Wishlist for user
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          name: "Ghuba Saved Items",
        },
      });
    }

    // Check if item already exists in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        marketplaceListingId: listingId,
      },
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          marketplaceListingId: listingId,
          productId: listing.productId || undefined,
        },
      });
    }

    const savesCount = await prisma.wishlistItem.count({
      where: { marketplaceListingId: listingId },
    });

    // Asynchronously record interaction event
    enqueueTelemetryBatch([
      {
        eventType: "PRODUCT_WISHLIST_ADD",
        marketplaceListingId: listingId,
        productId: listing.productId || undefined,
        companyId: listing.companyId || undefined,
        userId,
        channel: "GHUBA",
      },
    ]);

    return NextResponse.json({
      success: true,
      saved: true,
      savesCount,
      listingId,
    });
  } catch (error: any) {
    console.error("[SAVE_LISTING_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save listing", details: error?.message },
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
        { error: "Authentication required to unsave listings" },
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
      select: { id: true, productId: true, companyId: true },
    });

    const userWishlists = await prisma.wishlist.findMany({
      where: { userId },
      select: { id: true },
    });

    const wishlistIds = userWishlists.map((w) => w.id);

    if (wishlistIds.length > 0) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: { in: wishlistIds },
          marketplaceListingId: listingId,
        },
      });
    }

    const savesCount = await prisma.wishlistItem.count({
      where: { marketplaceListingId: listingId },
    });

    if (listing) {
      enqueueTelemetryBatch([
        {
          eventType: "PRODUCT_WISHLIST_REMOVE",
          marketplaceListingId: listingId,
          productId: listing.productId || undefined,
          companyId: listing.companyId || undefined,
          userId,
          channel: "GHUBA",
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      saved: false,
      savesCount,
      listingId,
    });
  } catch (error: any) {
    console.error("[UNSAVE_LISTING_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to unsave listing", details: error?.message },
      { status: 500 }
    );
  }
}
