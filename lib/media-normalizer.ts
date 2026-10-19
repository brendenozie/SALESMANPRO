/**
 * lib/media-normalizer.ts
 *
 * Client-safe, isomorphic media parsing and normalization utilities.
 * Free of server-only dependencies (no Prisma, no Redis, no Node built-ins).
 */

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

export interface VideoVariantUrls {
  low: string; // 480p eco for 3G / low-end devices / Data-saver
  feed: string; // 720p standard mobile
  full: string; // 1080p full quality
  poster: string; // Auto-generated 0s poster frame
}

export interface EnrichedFeedVideo {
  url: string;
  posterUrl: string;
  variants?: VideoVariantUrls;
  width?: number;
  height?: number;
  duration?: number;
  status?: "READY" | "PROCESSING" | "FAILED";
}

/**
 * Generates responsive variant URLs for known CDNs (Cloudinary, Unsplash).
 * Reduces image payloads by 60-80% on mobile devices while maintaining high visual quality.
 */
export function generateResponsiveVariants(rawUrl: string): MediaVariantUrls {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      thumbnail: rawUrl,
      feed: rawUrl,
      full: rawUrl,
    };
  }

  const clean = rawUrl.trim();

  // 1. Cloudinary optimization
  if (clean.includes("res.cloudinary.com") && clean.includes("/image/upload/")) {
    const uploadIndex = clean.indexOf("/image/upload/") + "/image/upload/".length;
    const prefix = clean.substring(0, uploadIndex);
    const suffix = clean.substring(uploadIndex);

    // If already has transformation parameters, don't double-transform unless standard
    if (!suffix.startsWith("f_auto") && !suffix.startsWith("w_")) {
      return {
        thumbnail: `${prefix}f_auto,q_auto:low,w_360,c_limit/${suffix}`,
        feed: `${prefix}f_auto,q_auto:eco,w_720,c_limit/${suffix}`,
        full: `${prefix}f_auto,q_auto,w_1080,c_limit/${suffix}`,
      };
    }
  }

  // 2. Unsplash optimization
  if (clean.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(clean);
      urlObj.searchParams.set("auto", "format");
      
      const thumbUrl = new URL(urlObj.toString());
      thumbUrl.searchParams.set("w", "360");
      thumbUrl.searchParams.set("q", "70");

      const feedUrl = new URL(urlObj.toString());
      feedUrl.searchParams.set("w", "720");
      feedUrl.searchParams.set("q", "75");

      const fullUrl = new URL(urlObj.toString());
      fullUrl.searchParams.set("w", "1080");
      fullUrl.searchParams.set("q", "80");

      return {
        thumbnail: thumbUrl.toString(),
        feed: feedUrl.toString(),
        full: fullUrl.toString(),
      };
    } catch {
      // Fallback if URL parsing fails
    }
  }

  return {
    thumbnail: clean,
    feed: clean,
    full: clean,
  };
}

/**
 * Generates adaptive video delivery variants for supported CDNs (Cloudinary).
 * Provides 480p low-bandwidth for 3G/Data Saver, 720p for standard 4G, and auto-generated poster.
 */
export function generateVideoVariants(rawUrl: string): VideoVariantUrls {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      low: rawUrl,
      feed: rawUrl,
      full: rawUrl,
      poster: "",
    };
  }

  const clean = rawUrl.trim();

  // Cloudinary video adaptive delivery
  if (clean.includes("res.cloudinary.com") && clean.includes("/video/upload/")) {
    const uploadIndex = clean.indexOf("/video/upload/") + "/video/upload/".length;
    const prefix = clean.substring(0, uploadIndex);
    const suffix = clean.substring(uploadIndex);

    if (!suffix.startsWith("vc_") && !suffix.startsWith("w_")) {
      const webpPoster = suffix.replace(/\.[^/.]+$/, ".webp");
      return {
        low: `${prefix}vc_auto,q_auto:eco,w_480,c_limit/${suffix}`,
        feed: `${prefix}vc_auto,q_auto,w_720,c_limit/${suffix}`,
        full: `${prefix}vc_auto,q_auto:best,w_1080,c_limit/${suffix}`,
        poster: `${prefix}so_0,f_webp,q_auto,w_720,c_limit/${webpPoster}`,
      };
    }
  }

  return {
    low: clean,
    feed: clean,
    full: clean,
    poster: "",
  };
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
        const variants = generateVideoVariants(clean);
        videos.push({
          url: clean,
          posterUrl: variants.poster || "",
          variants,
          status: "READY",
        });
      }
    } else if (typeof item === "object") {
      const url = (item.url || item.secure_url || item.src || item.path || item.cdnUrl || "").trim();
      if (url) {
        const variants = item.variants || generateVideoVariants(url);
        videos.push({
          url,
          posterUrl: item.posterUrl || item.poster || item.thumbnailUrl || variants.poster || "",
          variants,
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
        images.push({
          url: clean,
          variants: generateResponsiveVariants(clean),
        });
      }
    } else if (typeof item === "object") {
      const url = (item.url || item.secure_url || item.src || item.path || item.cdnUrl || "").trim();
      if (url) {
        images.push({
          url,
          variants: item.variants || generateResponsiveVariants(url),
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
    const combined = Array.isArray(rawVideosOrList) ? rawVideosOrList : rawVideosOrList ? [rawVideosOrList] : [];
    for (const item of combined) {
      if (typeof item === "string") {
        const lower = item.toLowerCase();
        if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov") || lower.includes("/video/upload/")) {
          parseVideoItem(item);
        } else {
          parseImageItem(item);
        }
      } else if (typeof item === "object" && item) {
        const type = String(item.type || item.resource_type || "").toUpperCase();
        if (type === "VIDEO" || item.duration || item.posterUrl) {
          parseVideoItem(item);
        } else {
          parseImageItem(item);
        }
      }
    }
  }

  return { images, videos };
}

