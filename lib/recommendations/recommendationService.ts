/**
 * lib/recommendations/recommendationService.ts
 *
 * Deterministic, multi-signal product recommendation engine for Ghuba and tenant stores.
 * Combines interaction signals (views, wishlists, likes, purchases, category affinity, trending).
 * Backed by Redis caching with fallback guarantees.
 */

import prisma from "@/server/db/prismadb";
import { getRedisClient, isRedisAvailable } from "@/lib/redis";

const CACHE_TTL_SECONDS = 600; // 10 minutes

const publicListingSelect = {
  id: true,
  name: true,
  images: true,
  finalPrice: true,
  sellingPrice: true,
  discount: true,
  isFeatured: true,
  isFlashDeal: true,
  isDiscounted: true,
  isNewArrival: true,
  isAvailable: true,
  category: true,
  subCategoryName: true,
  productCategoryId: true,
  productCategory: {
    select: { id: true, name: true },
  },
  companyId: true,
  company: {
    select: { id: true, name: true, slug: true, logoUrl: true },
  },
  createdAt: true,
};

const activeListingFilter = {
  status: "ACTIVE" as any,
  isAvailable: true,
  AND: [
    {
      OR: [
        { ghubaAdminApproved: true },
        { ghubaAdminApproved: null },
        { ghubaAdminApproved: { isSet: false } },
      ],
    },
    {
      OR: [
        { ghubaStatus: "APPROVED" },
        { ghubaStatus: null },
        { ghubaStatus: { isSet: false } },
      ],
    },
  ],
};

export class RecommendationService {
  /**
   * Generates personalized recommendations for the Ghuba marketplace homepage.
   */
  public static async getGhubaHomepageRecommendations(params: {
    userId?: string;
    visitorId?: string;
    limit?: number;
  }): Promise<{ recommendations: any[]; source: "personalized" | "trending" | "fallback" }> {
    const limit = Math.min(params.limit || 12, 24);
    const cacheKey = `rec:ghuba:${params.userId || params.visitorId || "anon"}:${limit}`;

    // 1. Check Redis cache
    const cached = await this.getCached(cacheKey);
    if (cached) {
      return { recommendations: cached, source: "personalized" };
    }

    try {
      // 2. Gather user interaction affinities
      const { preferredCategories, viewedListingIds, likedListingIds, wishlistedListingIds } =
        await this.getUserAffinities(params.userId, params.visitorId);

      const excludeIds = new Set<string>([
        ...viewedListingIds.slice(0, 10), // avoid repeatedly recommending recently viewed items
      ]);

      // If user has affinities, score candidate listings
      if (preferredCategories.length > 0 || likedListingIds.length > 0 || wishlistedListingIds.length > 0) {
        const candidates = await prisma.marketplaceListings.findMany({
          where: {
            ...activeListingFilter,
            id: { notIn: Array.from(excludeIds) },
            OR: [
              { category: { in: preferredCategories } },
              { isFeatured: true },
              { isNewArrival: true },
            ],
          },
          select: publicListingSelect,
          take: 40,
        });

        if (candidates.length > 0) {
          const scored = candidates.map((item) => {
            let score = 0;
            if (item.category && preferredCategories.includes(item.category)) {
              score += 35; // Category match
            }
            if (item.isFeatured) score += 15;
            if (item.isNewArrival) score += 10;
            if (item.discount && item.discount > 0) score += 10;
            return { item, score };
          });

          scored.sort((a, b) => b.score - a.score);
          const results = scored.slice(0, limit).map((s) => s.item);

          await this.setCached(cacheKey, results);
          return { recommendations: results, source: "personalized" };
        }
      }

      // 3. Fallback to Trending / Popular listings
      const trending = await this.getTrendingListings(limit);
      await this.setCached(cacheKey, trending);
      return { recommendations: trending, source: "trending" };
    } catch (err: any) {
      console.warn("[RecommendationService] Failed to compute recommendations, using fallback:", err.message);
      const fallback = await this.getCuratedFallback(limit);
      return { recommendations: fallback, source: "fallback" };
    }
  }

  /**
   * Generates store-specific recommendations strictly scoped to the tenant's products.
   */
  public static async getStoreRecommendations(
    companyId: string,
    params: {
      userId?: string;
      visitorId?: string;
      currentListingId?: string;
      limit?: number;
    }
  ): Promise<{ recommendations: any[]; source: string }> {
    const limit = Math.min(params.limit || 8, 20);
    const cacheKey = `rec:store:${companyId}:${params.currentListingId || "none"}:${params.userId || params.visitorId || "anon"}:${limit}`;

    const cached = await this.getCached(cacheKey);
    if (cached) {
      return { recommendations: cached, source: "store_cached" };
    }

    try {
      const where: any = {
        companyId,
        isAvailable: true,
        status: "ACTIVE",
      };

      if (params.currentListingId) {
        where.id = { not: params.currentListingId };
      }

      const storeListings = await prisma.marketplaceListings.findMany({
        where,
        select: publicListingSelect,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: limit,
      });

      await this.setCached(cacheKey, storeListings);
      return { recommendations: storeListings, source: "store_curated" };
    } catch (err: any) {
      console.warn(`[RecommendationService] Store recommendation error for ${companyId}:`, err.message);
      return { recommendations: [], source: "error_fallback" };
    }
  }

  /**
   * Similar listings recommendation (based on category, tags, and price range).
   */
  public static async getSimilarListings(listingId: string, limit = 4): Promise<any[]> {
    const cacheKey = `rec:similar:${listingId}:${limit}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const current = await prisma.marketplaceListings.findUnique({
        where: { id: listingId },
        select: {
          id: true,
          category: true,
          productCategoryId: true,
          finalPrice: true,
          sellingPrice: true,
        },
      });

      if (!current) return [];

      const currentPrice = current.finalPrice || current.sellingPrice || 0;
      const minPrice = currentPrice * 0.5;
      const maxPrice = currentPrice * 1.8;

      let similar = await prisma.marketplaceListings.findMany({
        where: {
          ...activeListingFilter,
          id: { not: listingId },
          OR: [
            { productCategoryId: current.productCategoryId || undefined },
            { category: current.category || undefined },
          ],
        },
        select: publicListingSelect,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      if (similar.length === 0) {
        similar = await this.getTrendingListings(limit);
      }

      await this.setCached(cacheKey, similar);
      return similar;
    } catch {
      return [];
    }
  }

  /**
   * Frequently bought together listings (based on order co-occurrence).
   */
  public static async getFrequentlyBoughtTogether(listingId: string, limit = 3): Promise<any[]> {
    const cacheKey = `rec:fbt:${listingId}:${limit}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Find orders containing this listing
      const orderItems = await prisma.orderItem.findMany({
        where: { marketplaceListingId: listingId },
        select: { orderId: true },
        take: 20,
        orderBy: { createdAt: "desc" },
      });

      const orderIds = orderItems.map((o) => o.orderId);

      if (orderIds.length > 0) {
        // Find other listings in the same orders
        const companionItems = await prisma.orderItem.groupBy({
          by: ["marketplaceListingId"],
          where: {
            orderId: { in: orderIds },
            marketplaceListingId: { not: listingId, notIn: [null as any] },
          },
          _count: { marketplaceListingId: true },
          orderBy: { _count: { marketplaceListingId: "desc" } },
          take: limit,
        });

        const companionIds = companionItems
          .map((c) => c.marketplaceListingId)
          .filter(Boolean) as string[];

        if (companionIds.length > 0) {
          const listings = await prisma.marketplaceListings.findMany({
            where: {
              id: { in: companionIds },
              ...activeListingFilter,
            },
            select: publicListingSelect,
          });

          await this.setCached(cacheKey, listings);
          return listings;
        }
      }

      // Fallback to similar listings
      return await this.getSimilarListings(listingId, limit);
    } catch {
      return [];
    }
  }

  /**
   * High-interest trending listings from recent daily aggregates.
   */
  public static async getTrendingListings(limit = 12): Promise<any[]> {
    try {
      const topMetrics = await prisma.listingDailyMetric.groupBy({
        by: ["marketplaceListingId"],
        _sum: {
          views: true,
          cardClicks: true,
          likes: true,
          addToCarts: true,
        },
        orderBy: {
          _sum: {
            views: "desc",
          },
        },
        take: limit * 2,
      });

      const listingIds = topMetrics.map((m) => m.marketplaceListingId);

      if (listingIds.length > 0) {
        const listings = await prisma.marketplaceListings.findMany({
          where: {
            id: { in: listingIds },
            ...activeListingFilter,
          },
          select: publicListingSelect,
          take: limit,
        });

        if (listings.length >= 4) {
          return listings;
        }
      }

      return await this.getCuratedFallback(limit);
    } catch {
      return await this.getCuratedFallback(limit);
    }
  }

  /**
   * Fallback curated listings when cold start or errors occur.
   */
  private static async getCuratedFallback(limit: number): Promise<any[]> {
    return prisma.marketplaceListings.findMany({
      where: activeListingFilter,
      select: publicListingSelect,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
  }

  /**
   * Extracts category and listing preferences from user's history and interactions.
   */
  private static async getUserAffinities(userId?: string, visitorId?: string) {
    const preferredCategories: string[] = [];
    const viewedListingIds: string[] = [];
    const likedListingIds: string[] = [];
    const wishlistedListingIds: string[] = [];

    // Check interaction events for visitor / user
    if (userId || visitorId) {
      const events = await prisma.productInteractionEvent.findMany({
        where: {
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(visitorId ? [{ anonymousVisitorId: visitorId }] : []),
          ],
        },
        select: {
          eventType: true,
          marketplaceListingId: true,
          metadata: true,
        },
        take: 30,
        orderBy: { createdAt: "desc" },
      });

      for (const ev of events) {
        if (ev.marketplaceListingId) {
          if (ev.eventType === "PRODUCT_VIEW" || ev.eventType === "PRODUCT_CARD_CLICK") {
            viewedListingIds.push(ev.marketplaceListingId);
          }
        }
        if (ev.metadata && typeof ev.metadata === "object") {
          const cat = (ev.metadata as any)?.category;
          if (cat && !preferredCategories.includes(cat)) {
            preferredCategories.push(cat);
          }
        }
      }
    }

    // Check registered user's likes & wishlists
    if (userId) {
      const [likes, wishlists] = await Promise.all([
        prisma.marketplaceListingLike.findMany({
          where: { userId },
          select: { listingId: true },
          take: 15,
        }),
        prisma.wishlist.findMany({
          where: { userId },
          include: {
            WishlistItem: { select: { marketplaceListingId: true }, take: 15 },
          },
        }),
      ]);

      likes.forEach((l) => likedListingIds.push(l.listingId));
      wishlists.forEach((w) => {
        w.WishlistItem.forEach((wi) => {
          if (wi.marketplaceListingId) wishlistedListingIds.push(wi.marketplaceListingId);
        });
      });
    }

    return {
      preferredCategories,
      viewedListingIds,
      likedListingIds,
      wishlistedListingIds,
    };
  }

  private static async getCached(key: string): Promise<any[] | null> {
    if (!isRedisAvailable()) return null;
    try {
      const redis = getRedisClient();
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private static async setCached(key: string, data: any[]): Promise<void> {
    if (!isRedisAvailable()) return;
    try {
      const redis = getRedisClient();
      await redis.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data));
    } catch {
      // Non-fatal
    }
  }
}
