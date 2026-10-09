"use strict";
/**
 * lib/product-media-resolver.ts
 *
 * Universal Product & Listing Media Resolution Engine for Ghuba & Tenant Storefronts.
 * Bridges product card components, detail pages, quick-view modals, and the vertical feed.
 *
 * Guarantees:
 * 1. Zero Broken Cards: If a listing only has a video and no photos, the video's poster
 *    frame is automatically selected as the card's primary image instead of "No Image".
 * 2. Responsive WebP Delivery: If an image has Sharp-generated variants (thumbnail, feed, full),
 *    the optimal responsive variant is returned rather than a 10MB raw original.
 * 3. Video Awareness: Informs cards and detail views whether an active video is present,
 *    allowing badges, video players, and rich media galleries.
 * 4. Backward Compatibility: Transparently handles legacy string arrays, object URLs, and modern variant schemas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProductMedia = exports.sanitizeImageUrl = void 0;
const media_normalizer_1 = require("./media-normalizer");
const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&q=80";
function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string')
        return DEFAULT_FALLBACK_IMAGE;
    const trimmed = url.trim();
    if (!trimmed)
        return DEFAULT_FALLBACK_IMAGE;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/') || trimmed.startsWith('data:')) {
        return trimmed;
    }
    return `/${trimmed}`;
}
exports.sanitizeImageUrl = sanitizeImageUrl;
/**
 * Resolves complete media state for any product or marketplace listing across Ghuba and tenant stores.
 */
function resolveProductMedia(product) {
    if (!product) {
        return {
            primaryType: "IMAGE",
            hasVideo: false,
            videoCount: 0,
            imageCount: 0,
            primaryImageUrl: DEFAULT_FALLBACK_IMAGE,
            thumbnailUrl: DEFAULT_FALLBACK_IMAGE,
            posterUrl: DEFAULT_FALLBACK_IMAGE,
            gallery: [{ type: "IMAGE", url: DEFAULT_FALLBACK_IMAGE, thumbnailUrl: DEFAULT_FALLBACK_IMAGE }],
        };
    }
    const rawVideos = product.videos;
    const rawImages = product.images;
    const { videos: structuredVideos, images: structuredImages } = (0, media_normalizer_1.parseDetailedMediaList)(rawVideos, rawImages);
    const videoUrls = (0, media_normalizer_1.normalizeMediaList)(rawVideos);
    const imageUrls = (0, media_normalizer_1.normalizeMediaList)(rawImages);
    const hasVideo = videoUrls.length > 0 && (structuredVideos[0]?.status === undefined || structuredVideos[0]?.status === "READY");
    // Determine guaranteed poster frame:
    // 1. Explicit video posterUrl
    // 2. First image's feed variant URL
    // 3. First image URL
    // 4. Default commerce placeholder
    const firstImageVariant = structuredImages[0]?.variants?.feed || structuredImages[0]?.url || imageUrls[0];
    const explicitVideoPoster = structuredVideos[0]?.posterUrl;
    const guaranteedPoster = explicitVideoPoster && explicitVideoPoster.length > 0
        ? explicitVideoPoster
        : firstImageVariant || DEFAULT_FALLBACK_IMAGE;
    const guaranteedThumbnail = structuredImages[0]?.variants?.thumbnail || guaranteedPoster;
    // Build unified gallery (videos first, then images)
    const gallery = [];
    // Add videos
    if (hasVideo) {
        structuredVideos.forEach((vid, idx) => {
            gallery.push({
                type: "VIDEO",
                url: vid.url || videoUrls[idx],
                posterUrl: vid.posterUrl || guaranteedPoster,
                thumbnailUrl: vid.posterUrl || guaranteedThumbnail,
                width: vid.width,
                height: vid.height,
                duration: vid.duration,
            });
        });
    }
    // Add images
    if (structuredImages.length > 0) {
        structuredImages.forEach((img, idx) => {
            gallery.push({
                type: "IMAGE",
                url: img.url || imageUrls[idx],
                thumbnailUrl: img.variants?.thumbnail || img.url,
                variants: img.variants,
                blurDataUrl: img.blurDataUrl,
                width: img.width,
                height: img.height,
            });
        });
    }
    else if (imageUrls.length > 0) {
        imageUrls.forEach((url) => {
            gallery.push({
                type: "IMAGE",
                url,
                thumbnailUrl: url,
            });
        });
    }
    else if (!hasVideo) {
        gallery.push({
            type: "IMAGE",
            url: DEFAULT_FALLBACK_IMAGE,
            thumbnailUrl: DEFAULT_FALLBACK_IMAGE,
        });
    }
    // Primary image for cards (prefers responsive feed/thumbnail variant, falls back to video poster if no photos)
    let primaryImageUrl;
    if (structuredImages.length > 0 && structuredImages[0].variants?.feed) {
        primaryImageUrl = structuredImages[0].variants.feed;
    }
    else if (imageUrls.length > 0) {
        primaryImageUrl = imageUrls[0];
    }
    else if (hasVideo) {
        // If listing only has a video, the video poster IS the card's primary image!
        primaryImageUrl = guaranteedPoster;
    }
    else {
        primaryImageUrl = DEFAULT_FALLBACK_IMAGE;
    }
    const blurDataUrl = structuredImages[0]?.blurDataUrl;
    return {
        primaryType: hasVideo ? "VIDEO" : "IMAGE",
        hasVideo,
        videoCount: videoUrls.length,
        imageCount: imageUrls.length,
        primaryImageUrl: sanitizeImageUrl(primaryImageUrl),
        thumbnailUrl: sanitizeImageUrl(guaranteedThumbnail),
        posterUrl: sanitizeImageUrl(guaranteedPoster),
        blurDataUrl,
        primaryVideoUrl: hasVideo ? (structuredVideos[0]?.url || videoUrls[0]) : undefined,
        gallery,
    };
}
exports.resolveProductMedia = resolveProductMedia;
