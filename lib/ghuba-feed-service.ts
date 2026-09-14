/**
 * lib/ghuba-feed-service.ts
 *
 * Production-ready feed service for Ghuba full-screen vertical commerce feed.
 * Unifies listing models, resolves media priority, applies deterministic ranking,
 * batches viewer state, and guarantees N+1 safe performance.
 */

import prisma from "@/server/db/prismadb";
import { ListingStatus } from "@prisma/client";
import { resolveProductType, withCapabilities } from "./ghuba-product-type";
import { getListingPublicUrl } from "./ghuba-slug";

export type FeedListingType = "ECOMMERCE" | "SERVICE" | "PROPERTY" | "AUTO";

export interface MediaVariantUrls {
  thumbnail: string;
  feed: string;
  full: string;
}

export interface EnrichedFeedImage {
  url: string;
  variants?: MediaVariantUrls;
  width?: number;
  height?: number;
  blurDataUrl?: string;
}

export interface EnrichedFeedVideo {
  url: string;
  posterUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  status?: "READY" | "PROCESSING" | "FAILED";
}

export interface GhubaFeedMedia {
  primaryType: "VIDEO" | "IMAGE" | "GALLERY";
  status: "READY" | "PROCESSING" | "FAILED";
  videos: string[];
  images: string[];
  poster: string; // Guaranteed non-empty CDN/fallback URL (never undefined)
  thumbnail: string; // Guaranteed non-empty thumbnail URL
  videoDetails?: EnrichedFeedVideo[];
  imageDetails?: EnrichedFeedImage[];
}

export interface GhubaFeedItem {
  id: string;
  listingId: string;
  publicUrl: string;
  type: FeedListingType;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  currency: string;
  location?: string;
  category?: string;
  subCategory?: string;
  seller: {
    id: string;
    name: string;
    slug?: string;
    logoUrl?: string;
    isVerified: boolean;
  };
  media: GhubaFeedMedia;
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount: number;
  };
  viewerState: {
    liked: boolean;
    saved: boolean;
  };
  commerce: {
    canAddToCart: boolean;
    canBuyNow: boolean;
    canBook: boolean;
    canEnquire: boolean;
  };
  score?: number;
  createdAt: string;
}

export interface GetFeedOptions {
  cursor?: string | null;
  limit?: number;
  category?: string | null;
  type?: FeedListingType | null;
  userId?: string | null;
}

export interface GhubaFeedResponse {
  items: GhubaFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Normalizes raw JSON media values into sanitized HTTP(S) URL strings.
 */
export function normalizeMediaList(rawList: any): string[] {
  if (!rawList) return [];
  const list = Array.isArray(rawList) ? rawList : [rawList];
  const urls: string[] = [];

  for (const item of list) {
    if (typeof item === "string" && item.trim().length > 0) {
      const clean = item.trim();
      if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
        urls.push(clean);
      }
    } else if (item && typeof item === "object") {
      const candidate = item.url || item.secure_url || item.src || item.path || item.cdnUrl;
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        urls.push(candidate.trim());
      }
    }
  }

  return urls;
}

/**
 * Parses raw JSON media items into structured, enriched media details.
 * Supports either (rawVideos, rawImages) or a single combined media list.
 */
export function parseDetailedMediaList(
  rawVideosOrList: any,
  rawImages?: any
): {
  images: EnrichedFeedImage[];
  videos: EnrichedFeedVideo[];
} {
  const images: EnrichedFeedImage[] = [];
  const videos: EnrichedFeedVideo[] = [];

  const parseVideoItem = (item: any) => {
    if (!item) return;
    if (typeof item === "string") {
      const clean = item.trim();
      if (clean.length > 0) {
        videos.push({ url: clean, posterUrl: "", status: "READY" });
      }
    } else if (typeof item === "object") {
      const url = (item.url || item.secure_url || item.src || item.path || item.cdnUrl || "").trim();
      if (url) {
        videos.push({
          url,
          posterUrl: item.posterUrl || item.poster || item.thumbnailUrl || "",
          width: item.width,
          height: item.height,
          duration: item.duration,
          status: item.status || "READY",
        });
      }
    }
  };

  const parseImageItem = (item: any) => {
    if (!item) return;
    if (typeof item === "string") {
      const clean = item.trim();
      if (clean.length > 0) {
        images.push({ url: clean });
      }
    } else if (typeof item === "object") {
      const url = (item.url || item.secure_url || item.src || item.path || item.cdnUrl || "").trim();
      if (url) {
        images.push({
          url,
          variants: item.variants,
          width: item.width,
          height: item.height,
          blurDataUrl: item.blurDataUrl,
        });
      }
    }
  };

  if (rawImages !== undefined) {
    const videoList = Array.isArray(rawVideosOrList) ? rawVideosOrList : rawVideosOrList ? [rawVideosOrList] : [];
    videoList.forEach(parseVideoItem);
    const imageList = Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : [];
    imageList.forEach(parseImageItem);
  } else {
    // Single list passed: discern by type property or extension
    const list = Array.isArray(rawVideosOrList) ? rawVideosOrList : rawVideosOrList ? [rawVideosOrList] : [];
    for (const item of list) {
      if (!item) continue;
      if (typeof item === "string") {
        const clean = item.trim();
        if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.includes("/videos/")) {
          videos.push({ url: clean, posterUrl: "", status: "READY" });
        } else {
          images.push({ url: clean });
        }
      } else if (typeof item === "object") {
        const url = (item.url || item.secure_url || item.src || item.path || item.cdnUrl || "").trim();
        if (item.type === "video" || url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("/videos/")) {
          videos.push({
            url,
            posterUrl: item.posterUrl || item.poster || item.thumbnailUrl || "",
            width: item.width,
            height: item.height,
            duration: item.duration,
            status: item.status || "READY",
          });
        } else {
          images.push({
            url,
            variants: item.variants,
            width: item.width,
            height: item.height,
            blurDataUrl: item.blurDataUrl,
          });
        }
      }
    }
  }

  return { images, videos };
}

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&q=80";

/**
 * Resolves media according to the strict Media Priority Rule:
 * 1. READY VIDEO (Guaranteed poster frame; if video is PROCESSING or FAILED, fallback to IMAGE)
 * 2. MULTI-IMAGE GALLERY
 * 3. SINGLE READY IMAGE
 * 4. FALLBACK LISTING IMAGE
 * 5. BRANDED PLACEHOLDER
 */
export function resolveFeedMedia(rawVideos: any, rawImages: any): GhubaFeedMedia {
  const videoUrls = normalizeMediaList(rawVideos);
  const imageUrls = normalizeMediaList(rawImages);

  const { videos: structuredVideos, images: structuredImages } = parseDetailedMediaList(
    rawVideos,
    rawImages
  );

  // Guarantee high-quality poster frame:
  // 1. Explicit video posterUrl
  // 2. First image's feed variant URL
  // 3. First image URL
  // 4. Default branded commerce image
  const firstImageVariant = structuredImages[0]?.variants?.feed || structuredImages[0]?.url || imageUrls[0];
  const explicitVideoPoster = structuredVideos[0]?.posterUrl;
  const guaranteedPoster = explicitVideoPoster && explicitVideoPoster.length > 0
    ? explicitVideoPoster
    : firstImageVariant || DEFAULT_FALLBACK_IMAGE;

  const guaranteedThumbnail = structuredImages[0]?.variants?.thumbnail || guaranteedPoster;

  // Filter videos for readiness: only READY videos can be served as primary VIDEO
  const activeVideo = structuredVideos[0];
  const isVideoReady = !activeVideo || activeVideo.status === undefined || activeVideo.status === "READY";
  const hasValidVideo = videoUrls.length > 0 && isVideoReady;

  if (hasValidVideo) {
    return {
      primaryType: "VIDEO",
      status: "READY",
      videos: videoUrls,
      images: imageUrls.length > 0 ? imageUrls : [guaranteedPoster],
      poster: guaranteedPoster,
      thumbnail: guaranteedThumbnail,
      videoDetails: structuredVideos.length > 0 ? structuredVideos : [{
        url: videoUrls[0],
        posterUrl: guaranteedPoster,
        status: "READY",
      }],
      imageDetails: structuredImages,
    };
  }

  // Gallery priority when multiple images exist
  if (imageUrls.length > 1) {
    return {
      primaryType: "GALLERY",
      status: "READY",
      videos: [],
      images: imageUrls,
      poster: guaranteedPoster,
      thumbnail: guaranteedThumbnail,
      imageDetails: structuredImages,
    };
  }

  // Single image
  if (imageUrls.length === 1) {
    return {
      primaryType: "IMAGE",
      status: "READY",
      videos: [],
      images: imageUrls,
      poster: guaranteedPoster,
      thumbnail: guaranteedThumbnail,
      imageDetails: structuredImages,
    };
  }

  // Fallback image
  return {
    primaryType: "IMAGE",
    status: "READY",
    videos: [],
    images: [DEFAULT_FALLBACK_IMAGE],
    poster: DEFAULT_FALLBACK_IMAGE,
    thumbnail: DEFAULT_FALLBACK_IMAGE,
    imageDetails: [{ url: DEFAULT_FALLBACK_IMAGE }],
  };
}

/**
 * Calculates deterministic ranking score for a listing.
 */
export function calculateFeedScore(
  listing: any,
  likesCount: number = 0,
  commentsCount: number = 0,
  savesCount: number = 0
): number {
  let score = 50;

  // Freshness boost: listings created within the last 30 days receive up to 30 points
  const createdAtTime = listing.createdAt ? new Date(listing.createdAt).getTime() : 0;
  const now = Date.now();
  const ageInHours = Math.max(0, (now - createdAtTime) / (1000 * 60 * 60));
  const freshnessPoints = Math.max(0, 30 - ageInHours * 0.05);
  score += freshnessPoints;

  // Video priority boost: video content gets a primary discoverability boost
  const videoUrls = normalizeMediaList(listing.videos);
  if (videoUrls.length > 0) {
    score += 35;
  }

  // Engagement points
  score += Math.min(40, likesCount * 3 + commentsCount * 5 + savesCount * 4);

  // Deals / Promotional boosts
  if (listing.isFlashDeal) score += 20;
  if (listing.isFeatured) score += 15;
  if (listing.isDiscounted || (listing.discount && listing.discount > 0)) score += 10;
  if (listing.isNewArrival) score += 10;

  // High-value seller boost
  if (listing.company?.logoUrl) score += 5;

  return Math.round(score * 10) / 10;
}

const listingSelectFields = {
  id: true,
  name: true,
  description: true,
  longDescription: true,
  sellingPrice: true,
  finalPrice: true,
  discount: true,
  images: true,
  videos: true,
  isFeatured: true,
  isFlashDeal: true,
  isDiscounted: true,
  isNewArrival: true,
  brand: true,
  productCategoryId: true,
  category: true,
  subCategoryName: true,
  subCategory: true,
  make: true,
  model: true,
  bedrooms: true,
  duration: true,
  locationName: true,
  companyId: true,
  createdAt: true,
  company: {
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
    },
  },
  productCategory: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

/**
 * Retrieves a ranked, cursor-paginated batch of Ghuba marketplace feed items.
 */
export async function getGhubaFeed(options: GetFeedOptions = {}): Promise<GhubaFeedResponse> {
  const { cursor, limit = 10, category, type, userId } = options;
  const take = Math.min(Math.max(1, limit), 25);

  const baseWhere: any = {
    status: "ACTIVE" as ListingStatus,
    isAvailable: true,
    ghubaAdminApproved: true,
    ghubaStatus: "APPROVED",
  };

  if (category && category.trim().length > 0 && category.toLowerCase() !== "all") {
    baseWhere.OR = [
      { category: { equals: category, mode: "insensitive" } },
      { subCategoryName: { equals: category, mode: "insensitive" } },
      { productCategory: { name: { equals: category, mode: "insensitive" } } },
    ];
  }

  // Decode cursor: format is "[createdAtISO]_[id]"
  let cursorCreatedAt: Date | undefined;
  let cursorId: string | undefined;

  if (cursor && cursor.includes("_")) {
    const parts = cursor.split("_");
    const dateStr = parts[0];
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      cursorCreatedAt = parsedDate;
      cursorId = parts[1];
    }
  }

  // Retrieve eligible listings
  const queryArgs: any = {
    where: baseWhere,
    take: take + 1, // Look ahead for hasMore
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: listingSelectFields,
  };

  if (cursorId && cursorCreatedAt) {
    queryArgs.cursor = { id: cursorId };
    queryArgs.skip = 1;
  }

  const rawListings = await prisma.marketplaceListings.findMany(queryArgs);

  const hasMore = rawListings.length > take;
  const pageListings = hasMore ? rawListings.slice(0, take) : rawListings;

  if (pageListings.length === 0) {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }

  const listingIds = pageListings.map((l) => l.id);

  // 1. Batch lookup likes count
  const likesGroup = await prisma.marketplaceListingLike.groupBy({
    by: ["listingId"],
    where: { listingId: { in: listingIds } },
    _count: { _all: true },
  });
  const likesCountMap = new Map<string, number>();
  for (const item of likesGroup) {
    likesCountMap.set(item.listingId, item._count._all);
  }

  // 2. Batch lookup comments count
  const commentsGroup = await prisma.marketplaceListingComment.groupBy({
    by: ["listingId"],
    where: { listingId: { in: listingIds }, status: "VISIBLE" },
    _count: { _all: true },
  });
  const commentsCountMap = new Map<string, number>();
  for (const item of commentsGroup) {
    commentsCountMap.set(item.listingId, item._count._all);
  }

  // 3. Batch lookup saves count (via WishlistItem relation)
  const savesGroup = await prisma.wishlistItem.groupBy({
    by: ["marketplaceListingId"],
    where: { marketplaceListingId: { in: listingIds } },
    _count: { _all: true },
  });
  const savesCountMap = new Map<string, number>();
  for (const item of savesGroup) {
    if (item.marketplaceListingId) {
      savesCountMap.set(item.marketplaceListingId, item._count._all);
    }
  }

  // 4. Batch lookup viewer state (liked & saved) if authenticated
  const userLikedSet = new Set<string>();
  const userSavedSet = new Set<string>();

  if (userId) {
    const [userLikes, userSaves] = await Promise.all([
      prisma.marketplaceListingLike.findMany({
        where: {
          userId,
          listingId: { in: listingIds },
        },
        select: { listingId: true },
      }),
      prisma.wishlistItem.findMany({
        where: {
          marketplaceListingId: { in: listingIds },
          wishlist: { userId },
        },
        select: { marketplaceListingId: true },
      }),
    ]);

    for (const l of userLikes) userLikedSet.add(l.listingId);
    for (const s of userSaves) {
      if (s.marketplaceListingId) userSavedSet.add(s.marketplaceListingId);
    }
  }

  // Assemble canonical feed items
  const items: GhubaFeedItem[] = [];

  for (const raw of pageListings) {
    const wrapped = withCapabilities(raw);
    const resolvedType = wrapped.productType as FeedListingType;

    // Filter by type if explicitly requested
    if (type && resolvedType !== type) {
      continue;
    }

    const media = resolveFeedMedia(raw.videos, raw.images);
    const publicUrl = getListingPublicUrl(raw);

    const price = raw.finalPrice && raw.finalPrice > 0 ? raw.finalPrice : raw.sellingPrice || 0;
    const originalPrice =
      raw.discount && raw.discount > 0 && raw.sellingPrice
        ? raw.sellingPrice
        : raw.finalPrice && raw.sellingPrice && raw.finalPrice < raw.sellingPrice
        ? raw.sellingPrice
        : undefined;

    const discountPercentage =
      raw.discount ||
      (originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined);

    const likesCount = likesCountMap.get(raw.id) || 0;
    const commentsCount = commentsCountMap.get(raw.id) || 0;
    const savesCount = savesCountMap.get(raw.id) || 0;

    const score = calculateFeedScore(raw, likesCount, commentsCount, savesCount);

    items.push({
      id: raw.id,
      listingId: raw.id,
      publicUrl,
      type: resolvedType,
      title: raw.name || "Featured Listing",
      description: raw.description || raw.longDescription || "",
      price,
      originalPrice,
      discountPercentage,
      currency: "KES",
      location: raw.locationName || "Nairobi, Kenya",
      category: raw.productCategory?.name || raw.category || undefined,
      subCategory: raw.subCategoryName || undefined,
      seller: {
        id: raw.company?.id || raw.companyId || "seller",
        name: raw.company?.name || "Verified Merchant",
        slug: raw.company?.slug || undefined,
        logoUrl: raw.company?.logoUrl || undefined,
        isVerified: true,
      },
      media,
      engagement: {
        likesCount,
        commentsCount,
        sharesCount: 0,
        savesCount,
      },
      viewerState: {
        liked: userLikedSet.has(raw.id),
        saved: userSavedSet.has(raw.id),
      },
      commerce: {
        canAddToCart: Boolean(wrapped.capabilities.canAddToCart),
        canBuyNow: Boolean(wrapped.capabilities.canAddToCart),
        canBook: Boolean(wrapped.capabilities.canBookSession),
        canEnquire: Boolean(wrapped.capabilities.canInquire),
      },
      score,
      createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    });
  }

  // Next cursor from last item
  const lastItem = pageListings[pageListings.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? `${new Date(lastItem.createdAt || Date.now()).toISOString()}_${lastItem.id}`
      : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
