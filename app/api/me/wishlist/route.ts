/**
 * app/api/me/wishlist/route.ts
 *
 * GET /api/me/wishlist - Retrieve authenticated user's private wishlist items
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
