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

export interface EnrichedFeedVideo {
  url: string;
  posterUrl: string;
  width?: number;
  height?: number;
  duration?: number;
  status?: "READY" | "PROCESSING" | "FAILED";
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
