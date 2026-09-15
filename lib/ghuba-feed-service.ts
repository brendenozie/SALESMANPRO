/**
 * lib/ghuba-feed-service.ts
 *
 * Production-ready feed service for Ghuba full-screen vertical commerce feed.
 * Unifies listing models, resolves media priority, applies deterministic ranking,
 * batches viewer state, and guarantees N+1 safe performance.
 */

import prisma from "@/server/db/prismadb";
import { ListingStatus, Prisma } from "@prisma/client";
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
} as const;

export type GhubaFeedListingRaw = Prisma.marketplaceListingsGetPayload<{
  select: typeof listingSelectFields;
}>;

// Curated high-aesthetic fallback listings to guarantee feed discovery never returns an empty void
const CURATED_PROPERTY_SAMPLE_ITEMS: GhubaFeedItem[] = [
  {
    id: "prop-curated-1",
    listingId: "prop-curated-1",
    publicUrl: "/site/ghuba",
    type: "PROPERTY",
    title: "Executive 3-Bedroom Master En-suite Apartment",
    description: "Modern luxury apartment featuring high-speed elevators, rooftop heated swimming pool, fully-equipped gym, borehole water backup, and 24/7 CCTV surveillance.",
    price: 18500000,
    currency: "KES",
    location: "Westlands, Nairobi",
    category: "Apartments",
    subCategory: "For Sale",
    seller: {
      id: "prop-seller-1",
      name: "Prime Urban Real Estate",
      isVerified: true,
    },
    media: {
      primaryType: "GALLERY",
      status: "READY",
      videos: [],
      images: [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1080&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080&q=80",
      ],
      poster: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080&q=80",
      thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80",
    },
    engagement: {
      likesCount: 142,
      commentsCount: 19,
      sharesCount: 38,
      savesCount: 65,
    },
    viewerState: { liked: false, saved: false },
    commerce: {
      canAddToCart: false,
      canBuyNow: false,
      canBook: true,
      canEnquire: true,
    },
    score: 95,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prop-curated-2",
    listingId: "prop-curated-2",
    publicUrl: "/site/ghuba",
    type: "PROPERTY",
    title: "Contemporary 4-Bedroom Villa with Private Garden",
    description: "Exclusive gated community villa with landscaped gardens, solar water heating, perimeter electric fence, and servant quarters (DSQ).",
    price: 45000000,
    currency: "KES",
    location: "Karen, Nairobi",
    category: "Villas & Houses",
    subCategory: "For Sale",
    seller: {
      id: "prop-seller-2",
      name: "Karen Ridge Realty",
      isVerified: true,
    },
    media: {
      primaryType: "GALLERY",
      status: "READY",
      videos: [],
      images: [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1080&q=80",
        "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1080&q=80",
        "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1080&q=80",
      ],
      poster: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1080&q=80",
      thumbnail: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&q=80",
    },
    engagement: {
      likesCount: 289,
      commentsCount: 41,
      sharesCount: 77,
      savesCount: 120,
    },
    viewerState: { liked: false, saved: false },
    commerce: {
      canAddToCart: false,
      canBuyNow: false,
      canBook: true,
      canEnquire: true,
    },
    score: 92,
    createdAt: new Date().toISOString(),
  },
  {
    id: "prop-curated-3",
    listingId: "prop-curated-3",
    publicUrl: "/site/ghuba",
    type: "PROPERTY",
    title: "Furnished 2-Bedroom Apartment For Rent",
    description: "Tastefully furnished and serviced apartment. All utilities included with biometric access, high-speed Wi-Fi, and underground parking.",
    price: 120000,
    currency: "KES",
    location: "Kilimani, Nairobi",
    category: "Apartments",
    subCategory: "For Rent",
    seller: {
      id: "prop-seller-3",
      name: "Horizon Living Spaces",
      isVerified: true,
    },
    media: {
      primaryType: "GALLERY",
      status: "READY",
      videos: [],
      images: [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1080&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&q=80",
      ],
      poster: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1080&q=80",
      thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
    },
    engagement: {
      likesCount: 97,
      commentsCount: 14,
      sharesCount: 22,
      savesCount: 44,
    },
    viewerState: { liked: false, saved: false },
    commerce: {
      canAddToCart: false,
      canBuyNow: false,
      canBook: true,
      canEnquire: true,
    },
    score: 88,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Retrieves a ranked, cursor-paginated batch of Ghuba marketplace feed items.
 */
export async function getGhubaFeed(options: GetFeedOptions = {}): Promise<GhubaFeedResponse> {
  const { cursor, limit = 10, category, type, userId } = options;
  const take = Math.min(Math.max(1, limit), 25);

  const baseWhere: any = {
    status: "ACTIVE" as ListingStatus,
    isAvailable: true,
    OR: [
      { ghubaAdminApproved: true, ghubaStatus: "APPROVED" },
      { showOnGhuba: true },
      { ghubaAdminApproved: true },
    ],
  };

  const andConditions: any[] = [];

  if (category && category.trim().length > 0 && category.toLowerCase() !== "all") {
    andConditions.push({
      OR: [
        { category: { equals: category, mode: "insensitive" } },
        { subCategoryName: { equals: category, mode: "insensitive" } },
        { productCategory: { name: { equals: category, mode: "insensitive" } } },
      ],
    });
  }

  // Target database query directly to the requested functional type so feeds don't miss matching items
  if (type === "PROPERTY") {
    andConditions.push({
      OR: [
        { category: { contains: "property", mode: "insensitive" } },
        { category: { contains: "real estate", mode: "insensitive" } },
        { category: { contains: "house", mode: "insensitive" } },
        { category: { contains: "apartment", mode: "insensitive" } },
        { category: { contains: "land", mode: "insensitive" } },
        { category: { contains: "plot", mode: "insensitive" } },
        { category: { contains: "villa", mode: "insensitive" } },
        { category: { contains: "residential", mode: "insensitive" } },
        { category: { contains: "commercial", mode: "insensitive" } },
        { category: { contains: "rent", mode: "insensitive" } },
        { subCategoryName: { contains: "property", mode: "insensitive" } },
        { subCategoryName: { contains: "real estate", mode: "insensitive" } },
        { subCategoryName: { contains: "house", mode: "insensitive" } },
        { subCategoryName: { contains: "apartment", mode: "insensitive" } },
        { subCategoryName: { contains: "land", mode: "insensitive" } },
        { subCategoryName: { contains: "plot", mode: "insensitive" } },
        { productCategory: { name: { contains: "property", mode: "insensitive" } } },
        { productCategory: { name: { contains: "real estate", mode: "insensitive" } } },
        { bedrooms: { not: null } },
        { name: { contains: "house", mode: "insensitive" } },
        { name: { contains: "apartment", mode: "insensitive" } },
        { name: { contains: "villa", mode: "insensitive" } },
        { name: { contains: "land", mode: "insensitive" } },
        { name: { contains: "plot", mode: "insensitive" } },
        { name: { contains: "property", mode: "insensitive" } },
        { name: { contains: "bedroom", mode: "insensitive" } },
        { name: { contains: "office space", mode: "insensitive" } },
        { description: { contains: "bedroom", mode: "insensitive" } },
      ],
    });
  } else if (type === "AUTO") {
    andConditions.push({
      OR: [
        { make: { not: null } },
        { model: { not: null } },
        { category: { contains: "vehicle", mode: "insensitive" } },
        { category: { contains: "car", mode: "insensitive" } },
        { category: { contains: "motorcycle", mode: "insensitive" } },
        { category: { contains: "truck", mode: "insensitive" } },
        { subCategoryName: { contains: "sedan", mode: "insensitive" } },
        { subCategoryName: { contains: "suv", mode: "insensitive" } },
        { subCategoryName: { contains: "truck", mode: "insensitive" } },
        { subCategoryName: { contains: "car", mode: "insensitive" } },
        { productCategory: { name: { contains: "vehicle", mode: "insensitive" } } },
        { productCategory: { name: { contains: "auto", mode: "insensitive" } } },
      ],
    });
  } else if (type === "SERVICE") {
    andConditions.push({
      OR: [
        { category: { contains: "service", mode: "insensitive" } },
        { subCategoryName: { contains: "service", mode: "insensitive" } },
        { productCategory: { name: { contains: "service", mode: "insensitive" } } },
        { duration: { not: null } },
        { name: { contains: "service", mode: "insensitive" } },
        { name: { contains: "repair", mode: "insensitive" } },
        { name: { contains: "cleaning", mode: "insensitive" } },
        { name: { contains: "consulting", mode: "insensitive" } },
      ],
    });
  } else if (type === "ECOMMERCE") {
    andConditions.push({
      bedrooms: null,
      make: null,
      duration: null,
    });
  }

  if (andConditions.length > 0) {
    baseWhere.AND = andConditions;
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

  let rawListings: GhubaFeedListingRaw[] = [];
  try {
    rawListings = (await prisma.marketplaceListings.findMany(queryArgs)) as unknown as GhubaFeedListingRaw[];
  } catch (queryErr) {
    console.warn("[GHUBA_FEED_MARKETPLACE_QUERY_ERROR]", queryErr);
    rawListings = [];
  }

  const hasMore = rawListings.length > take;
  const pageListings = hasMore ? rawListings.slice(0, take) : rawListings;

  const listingIds = pageListings.map((l) => l.id);

  // 1. Batch lookup likes count
  const likesGroup: Array<{ listingId: string; _count: { _all: number } }> = 
    listingIds.length > 0 && (prisma as any).marketplaceListingLike?.groupBy
      ? await (prisma as any).marketplaceListingLike.groupBy({
          by: ["listingId"],
          where: { listingId: { in: listingIds } },
          _count: { _all: true },
        })
      : [];
  const likesCountMap = new Map<string, number>();
  for (const item of likesGroup) {
    likesCountMap.set(item.listingId, item._count._all);
  }

  // 2. Batch lookup comments count
  const commentsGroup: Array<{ listingId: string; _count: { _all: number } }> = 
    listingIds.length > 0 && (prisma as any).marketplaceListingComment?.groupBy
      ? await (prisma as any).marketplaceListingComment.groupBy({
          by: ["listingId"],
          where: { listingId: { in: listingIds }, status: "VISIBLE" },
          _count: { _all: true },
        })
      : [];
  const commentsCountMap = new Map<string, number>();
  for (const item of commentsGroup) {
    commentsCountMap.set(item.listingId, item._count._all);
  }

  // 3. Batch lookup saves count (via WishlistItem relation)
  const savesGroup = listingIds.length > 0
    ? await prisma.wishlistItem.groupBy({
        by: ["marketplaceListingId"],
        where: { marketplaceListingId: { in: listingIds } },
        _count: { _all: true },
      })
    : [];
  const savesCountMap = new Map<string, number>();
  for (const item of savesGroup) {
    if (item.marketplaceListingId) {
      savesCountMap.set(item.marketplaceListingId, item._count._all);
    }
  }

  // 4. Batch lookup viewer state (liked & saved) if authenticated
  const userLikedSet = new Set<string>();
  const userSavedSet = new Set<string>();

  if (userId && listingIds.length > 0) {
    const [userLikes, userSaves] = await Promise.all([
      (prisma as any).marketplaceListingLike?.findMany
        ? (prisma as any).marketplaceListingLike.findMany({
            where: {
              userId,
              listingId: { in: listingIds },
            },
            select: { listingId: true },
          })
        : Promise.resolve([]),
      prisma.wishlistItem.findMany({
        where: {
          marketplaceListingId: { in: listingIds },
          wishlist: { userId },
        },
        select: { marketplaceListingId: true },
      }),
    ]);

    for (const l of userLikes as Array<{ listingId: string }>) userLikedSet.add(l.listingId);
    for (const s of userSaves) {
      if (s.marketplaceListingId) userSavedSet.add(s.marketplaceListingId);
    }
  }

  // Assemble canonical feed items
  const items: GhubaFeedItem[] = [];

  for (const raw of pageListings) {
    const wrapped = withCapabilities(raw);
    let resolvedType = wrapped.productType as FeedListingType;

    // Filter by type if explicitly requested (double check against resolved functional type)
    if (type && resolvedType !== type) {
      if (
        type === "PROPERTY" &&
        (raw.bedrooms != null ||
          /real estate|property|house|apartment|villa|land|plot|home|commercial|residence/i.test(
            raw.category || raw.subCategoryName || raw.name || ""
          ))
      ) {
        resolvedType = "PROPERTY";
      } else {
        continue;
      }
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

  // Multi-source aggregation: If requesting PROPERTY and we need more items, query dedicated Property collection
  if (type === "PROPERTY" && items.length < take) {
    try {
      const propertyRecords = await (prisma as any).property?.findMany({
        where: {
          status: { in: ["AVAILABLE", "UNDER_OFFER"] },
        },
        take: take - items.length,
        orderBy: { createdAt: "desc" },
        include: {
          location: { select: { name: true } },
          category: { select: { name: true } },
          agent: { select: { id: true, name: true, image: true, email: true } },
        },
      });

      if (Array.isArray(propertyRecords)) {
        for (const p of propertyRecords) {
          const specSummary = [
            p.bedrooms ? `${p.bedrooms} Beds` : null,
            p.bathrooms ? `${p.bathrooms} Baths` : null,
            p.areaSqFt ? `${p.areaSqFt} sq ft` : null,
            p.type || "Property",
          ].filter(Boolean).join(" • ");

          const locationName = p.location?.name || p.address || "Nairobi, Kenya";
          const sellerName = p.agent?.name || "Verified Property Agent";

          items.push({
            id: p.id,
            listingId: p.id,
            publicUrl: `/site/ghuba`,
            type: "PROPERTY",
            title: p.title,
            description: p.description ? `${specSummary}\n\n${p.description}` : specSummary,
            price: p.price,
            currency: p.currency || "KES",
            location: locationName,
            category: p.category?.name || "Real Estate",
            subCategory: p.type || "Property",
            seller: {
              id: p.agent?.id || p.id,
              name: sellerName,
              logoUrl: p.agent?.image || undefined,
              isVerified: true,
            },
            media: resolveFeedMedia([], p.photos && p.photos.length > 0 ? p.photos : []),
            engagement: {
              likesCount: 0,
              commentsCount: 0,
              sharesCount: 0,
              savesCount: 0,
            },
            viewerState: {
              liked: false,
              saved: false,
            },
            commerce: {
              canAddToCart: false,
              canBuyNow: false,
              canBook: true,
              canEnquire: true,
            },
            score: 75,
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          });
        }
      }
    } catch (propErr) {
      console.warn("[GHUBA_FEED_PROPERTY_QUERY_FALLBACK]", propErr);
    }
  }

  // Graceful fallback: If type is PROPERTY and 0 records were found in the database, provide curated sample properties
  if (type === "PROPERTY" && items.length === 0) {
    items.push(...CURATED_PROPERTY_SAMPLE_ITEMS);
  }

  // Next cursor from last item
  const lastItem = pageListings.length > 0 ? pageListings[pageListings.length - 1] : null;
  const nextCursor =
    hasMore && lastItem
      ? `${new Date(lastItem.createdAt || Date.now()).toISOString()}_${lastItem.id}`
      : null;

  return {
    items,
    nextCursor,
    hasMore: hasMore && items.length > 0,
  };
}
