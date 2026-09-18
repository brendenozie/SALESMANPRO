/**
 * lib/media/content-media-resolver.ts
 *
 * Universal Media Resolver for Blogs & Podcasts across Ghuba & Tenant Storefronts.
 * Ensures zero broken cover images, handles WebP variants, and normalizes audio streaming sources.
 */

import { normalizeMediaList, parseDetailedMediaList, MediaVariantUrls } from "@/lib/media-normalizer";

export interface ResolvedContentMedia {
  coverUrl: string;
  thumbnailUrl: string;
  audioUrl?: string;
  durationFormatted: string;
  durationSeconds: number;
  hasAudio: boolean;
}

const DEFAULT_BLOG_FALLBACK = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1080&q=80";
const DEFAULT_PODCAST_FALLBACK = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1080&q=80";

export function formatAudioDuration(seconds: number | string | null | undefined): string {
  if (!seconds) return "00:00";
  const num = typeof seconds === "string" ? parseFloat(seconds) : seconds;
  if (isNaN(num) || num <= 0) return "00:00";
  const m = Math.floor(num / 60);
  const s = Math.floor(num % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function resolveBlogMedia(blog: any): ResolvedContentMedia {
  if (!blog) {
    return {
      coverUrl: DEFAULT_BLOG_FALLBACK,
      thumbnailUrl: DEFAULT_BLOG_FALLBACK,
      durationFormatted: "5 min read",
      durationSeconds: 300,
      hasAudio: false,
    };
  }

  // 1. Resolve Cover Image
  let coverUrl = blog.coverImage || blog.coverImageUrl || blog.thumbnailUrl || "";
  if (!coverUrl && blog.media) {
    const parsed = parseDetailedMediaList(blog.media);
    if (parsed.images.length > 0) {
      coverUrl = parsed.images[0].variants?.full || parsed.images[0].url;
    }
  }

  if (!coverUrl) {
    coverUrl = DEFAULT_BLOG_FALLBACK;
  }

  // 2. Read Time Computation
  let durationFormatted = blog.duration || "";
  if (!durationFormatted && blog.content) {
    // Standard ~200 words per minute
    const wordCount = (typeof blog.content === "string" ? blog.content : "").split(/\s+/).filter(Boolean).length;
    const estMinutes = Math.max(1, Math.ceil(wordCount / 200));
    durationFormatted = `${estMinutes} min read`;
  }

  return {
    coverUrl,
    thumbnailUrl: coverUrl,
    durationFormatted: durationFormatted || "5 min read",
    durationSeconds: 300,
    hasAudio: false,
  };
}

export function resolvePodcastMedia(podcast: any): ResolvedContentMedia {
  if (!podcast) {
    return {
      coverUrl: DEFAULT_PODCAST_FALLBACK,
      thumbnailUrl: DEFAULT_PODCAST_FALLBACK,
      durationFormatted: "00:00",
      durationSeconds: 0,
      hasAudio: false,
    };
  }

  // 1. Resolve Cover Art
  let coverUrl = podcast.coverImageUrl || podcast.coverImage || podcast.thumbnailUrl || "";
  if (!coverUrl && podcast.media) {
    const parsed = parseDetailedMediaList(podcast.media);
    if (parsed.images.length > 0) {
      coverUrl = parsed.images[0].variants?.full || parsed.images[0].url;
    }
  }

  if (!coverUrl) {
    coverUrl = DEFAULT_PODCAST_FALLBACK;
  }

  // 2. Audio Stream URL
  const audioUrl = podcast.audioUrl || podcast.contentUrl || "";

  // 3. Duration
  const durationSeconds = typeof podcast.duration === "number" ? podcast.duration : parseFloat(podcast.duration || "0") || 0;
  const durationFormatted = formatAudioDuration(durationSeconds);

  return {
    coverUrl,
    thumbnailUrl: coverUrl,
    audioUrl,
    durationFormatted,
    durationSeconds,
    hasAudio: Boolean(audioUrl),
  };
}
