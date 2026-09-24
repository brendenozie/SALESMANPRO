/**
 * app/api/me/wishlist/route.ts
 *
 * GET /api/me/wishlist - Retrieve authenticated user's private wishlist items
 * POST /api/me/wishlist - Save a property/listing to wishlist
 * DELETE /api/me/wishlist - Remove a property/listing from wishlist
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/server/db/prismadb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ wishlistItems: [] });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        WishlistItem: {
          include: {
            marketplaceListings: {
              select: {
                id: true,
                name: true,
                images: true,
                finalPrice: true,
                sellingPrice: true,
                discount: true,
                isAvailable: true,
                category: true,
                area: true,
                bedrooms: true,
                bathrooms: true,
                locationName: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const allItems = wishlists.flatMap((w) => w.WishlistItem || []);

    const formatted = allItems
      .filter((item) => item.marketplaceListings)
      .map((item) => ({
        id: item.id,
        wishlistId: item.wishlistId,
        listingId: item.marketplaceListingId,
        addedAt: item.addedAt.toISOString(),
        listing: item.marketplaceListings,
      }));

    return NextResponse.json({
      success: true,
      wishlistItems: formatted,
    });
  } catch (error: any) {
    console.error("[GET_MY_WISHLIST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist", details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required to bookmark properties" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, productId } = body;

    if (!listingId && !productId) {
      return NextResponse.json(
        { error: "listingId or productId is required" },
        { status: 400 }
      );
    }

    // Find or create default wishlist for this user
    let wishlist = await prisma.wishlist.findFirst({
      where: { userId, name: "Saved Properties" }
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.findFirst({
        where: { userId }
      });
    }

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          name: "Saved Properties",
        }
      });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        ...(listingId ? { marketplaceListingId: listingId } : { productId: productId! }),
      }
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Property is already saved in your bookmarks",
        item: existing,
      });
    }

    const newItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        ...(listingId ? { marketplaceListingId: listingId } : { productId: productId! }),
      },
      include: {
        marketplaceListings: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Property saved successfully",
      item: newItem,
    }, { status: 201 });
  } catch (error: any) {
    console.error("[POST_MY_WISHLIST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to save property", details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    const itemId = searchParams.get("itemId");

    if (!listingId && !itemId) {
      return NextResponse.json(
        { error: "listingId or itemId required" },
        { status: 400 }
      );
    }

    // Find user's wishlists
    const userWishlists = await prisma.wishlist.findMany({
      where: { userId },
      select: { id: true }
    });
    const wishlistIds = userWishlists.map(w => w.id);

    if (itemId) {
      await prisma.wishlistItem.deleteMany({
        where: {
          id: itemId,
          wishlistId: { in: wishlistIds },
        }
      });
    } else if (listingId) {
      await prisma.wishlistItem.deleteMany({
        where: {
          marketplaceListingId: listingId,
          wishlistId: { in: wishlistIds },
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Property removed from bookmarks",
    });
  } catch (error: any) {
    console.error("[DELETE_MY_WISHLIST_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to remove property", details: error?.message },
      { status: 500 }
    );
  }
}
