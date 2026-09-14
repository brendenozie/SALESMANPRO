import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const tab = searchParams.get("tab") || "orders";

    const session = await getServerSession(authOptions());
    const effectiveUserId = queryUserId || session?.user?.id;

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated", body: [] },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      select: { id: true, email: true, phone: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, body: [], data: [] });
    }

    let items: any[] = [];

    switch (tab) {
      case "orders": {
        const ordersRaw = await prisma.customerOrder.findMany({
          where: {
            OR: [
              { consumerId: user.id },
              ...(user.email ? [{ email: user.email }] : []),
              ...(user.phone ? [{ phone: user.phone }] : []),
            ],
          },
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: {
                marketplaceListing: true,
              },
            },
          },
        });

        items = ordersRaw.map((ord: any) => {
          const firstItem = ord.items?.[0];
          const title =
            firstItem?.marketplaceListing?.title ||
            firstItem?.title ||
            `Order #${ord.id.slice(-6)}`;
          const itemCount = ord.items?.length || 1;
          const image =
            firstItem?.marketplaceListing?.mediaUrls?.[0] ||
            firstItem?.marketplaceListing?.featuredImage ||
            null;

          return {
            id: ord.id,
            title: itemCount > 1 ? `${title} (+${itemCount - 1} more)` : title,
            subtitle: `Order placed on ${
              ord.createdAt
                ? new Date(ord.createdAt).toLocaleDateString()
                : "Recent"
            }`,
            status: ord.status || ord.paymentStatus || "Processing",
            amount: ord.totalAmount || ord.totalPrice || 0,
            date: ord.createdAt
              ? new Date(ord.createdAt).toISOString().split("T")[0]
              : "",
            image,
            trackingNumber: ord.transactionReference || ord.id,
          };
        });
        break;
      }

      case "wishlist": {
        const wishlists = await prisma.wishlist.findMany({
          where: { userId: user.id },
          include: {
            WishlistItem: {
              include: {
                marketplaceListings: true,
                product: true,
              },
              take: 20,
            },
          },
        });

        const allItems = wishlists.flatMap((w) => w.WishlistItem);
        items = allItems.map((item: any) => {
          const listing = item.marketplaceListings || item.product;
          return {
            id: item.id,
            title: listing?.title || listing?.name || "Wishlist Item",
            subtitle: listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : "Price upon request",
            status: "Saved",
            image: listing?.mediaUrls?.[0] || listing?.featuredImage || listing?.images?.[0] || null,
            date: item.addedAt ? new Date(item.addedAt).toISOString().split("T")[0] : "",
            linkUrl: listing?.slug ? `/site/ghuba/product/${listing.slug}` : undefined,
          };
        });
        break;
      }

      case "recent": {
        const recents = await prisma.recentlyViewed.findMany({
          where: { userId: user.id },
          take: 15,
          orderBy: { viewedAt: "desc" },
          include: {
            marketplaceListings: true,
            product: true,
          },
        });

        items = recents.map((item: any) => {
          const listing = item.marketplaceListings || item.product;
          return {
            id: item.id,
            title: listing?.title || listing?.name || "Viewed Item",
            subtitle: listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : "Marketplace",
            status: "Viewed",
            image: listing?.mediaUrls?.[0] || listing?.featuredImage || null,
            date: item.viewedAt ? new Date(item.viewedAt).toISOString().split("T")[0] : "",
          };
        });
        break;
      }

      case "saved": {
        // Fetch liked marketplace listings
        const likes = await prisma.marketplaceListingLike.findMany({
          where: { userId: user.id },
          take: 20,
          include: {
            marketplaceListing: true,
          },
        }).catch(() => []);

        items = likes.map((like: any) => {
          const listing = like.marketplaceListing;
          return {
            id: like.id,
            title: listing?.title || "Saved Listing",
            subtitle: listing?.price ? `KES ${Number(listing.price).toLocaleString()}` : "Saved",
            status: "Bookmarked",
            image: listing?.mediaUrls?.[0] || listing?.featuredImage || null,
            date: like.createdAt ? new Date(like.createdAt).toISOString().split("T")[0] : "",
          };
        });
        break;
      }

      case "downloads": {
        // Digital downloads or receipts from completed orders
        const completedOrders = await prisma.customerOrder.findMany({
          where: {
            OR: [
              { consumerId: user.id },
              ...(user.email ? [{ email: user.email }] : []),
            ],
            paymentStatus: "COMPLETED",
          },
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        }).catch(() => []);

        items = completedOrders.map((ord: any) => ({
          id: ord.id,
          title: `Receipt #${ord.id.slice(-6)}.pdf`,
          subtitle: `Order completed • KES ${(ord.totalAmount || 0).toLocaleString()}`,
          status: "Available",
          date: ord.createdAt ? new Date(ord.createdAt).toISOString().split("T")[0] : "",
        }));
        break;
      }

      default:
        items = [];
    }

    return NextResponse.json({
      success: true,
      body: items,
      data: items,
    });
  } catch (error: any) {
    console.error("GET /api/shop/activity error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch activity", body: [], data: [] },
      { status: 500 }
    );
  }
}
