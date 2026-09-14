/**
 * lib/media-optimizer.ts
 *
 * High-performance image and video media optimization engine for Ghuba Vertical Commerce.
 * Features:
 * - Sharp-based responsive WebP/AVIF multi-variant generation (thumb, feed, full)
 * - EXIF metadata stripping (protects seller GPS coordinates, camera/device serials)
 * - Auto-rotation based on EXIF orientation tag before metadata stripping
 * - Ultra-compact BlurDataURL generation (zero layout-shift visual placeholder)
 * - Dimension extraction and bandwidth compression ratio calculation
 * - S3 upload helper with immutable CDN cache headers
 */

import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface MediaVariantUrls {
  thumbnail: string; // 320x480 - for search grids / micro cards
  feed: string;      // 720x1280 - standard 9:16 vertical feed commerce resolution
  full: string;      // 1080x1920 - zoom / high-res presentation
}

export interface OptimizedImageResult {
  width: number;
  height: number;
  aspectRatio: number;
  originalSizeBytes: number;
  totalOptimizedBytes: number;
  compressionRatio: number;
  blurDataUrl: string;
  variants: {
    thumbnail: { buffer: Buffer; width: number; height: number; sizeBytes: number };
    feed: { buffer: Buffer; width: number; height: number; sizeBytes: number };
    full: { buffer: Buffer; width: number; height: number; sizeBytes: number };
  };
}

export interface StoredMediaAsset {
  key: string;
  url: string;
  cdnUrl: string;
  variants: MediaVariantUrls;
  width: number;
  height: number;
  aspectRatio: number;
  blurDataUrl: string;
  mimeType: string;
  sizeBytes: number;
  status: "READY" | "PROCESSING" | "FAILED";
}

/**
 * Initializes S3 client with credentials from environment.
 */
export function getMediaS3Client(): { s3: S3Client; bucket: string; cdnDomain: string } {
  const bucket = process.env.AS3_BUCKET_NAME || process.env.S3_BUCKET_NAME || "tulivuappsbucket";
  const region = process.env.AREGION || process.env.AWS_REGION || "eu-north-1";
  const accessKeyId = process.env.AACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.ASECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_URL || `${bucket}.s3.${region}.amazonaws.com`;

  const s3 = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { s3, bucket, cdnDomain };
}

/**
 * Strips EXIF metadata, auto-rotates, and generates 3 responsive WebP variants + blur placeholder.
 */
export async function optimizeListingImage(
  inputBuffer: Buffer,
  options: {
    maxFeedWidth?: number;
    feedQuality?: number;
    thumbQuality?: number;
    fullQuality?: number;
  } = {}
): Promise<OptimizedImageResult> {
  const {
    maxFeedWidth = 720,
    feedQuality = 82,
    thumbQuality = 80,
    fullQuality = 85,
  } = options;

  // 1. Inspect original image
  const metadata = await sharp(inputBuffer).metadata();
  const origWidth = metadata.width || 1080;
  const origHeight = metadata.height || 1920;
  const aspectRatio = Math.round((origWidth / origHeight) * 100) / 100;
  const originalSizeBytes = inputBuffer.length;

  // 2. Base Sharp instance: rotate according to EXIF orientation, then strip EXIF (withMetadata not called)
  const baseSharp = () => sharp(inputBuffer).rotate();

  // 3. Generate Thumbnail variant (320w max, 480h max)
  const thumbBuffer = await baseSharp()
    .resize({
      width: 320,
      height: 480,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: thumbQuality, effort: 4 })
    .toBuffer();

  const thumbMeta = await sharp(thumbBuffer).metadata();

  // 4. Generate Feed variant (720w max, 1280h max - optimized for mobile 9:16 viewport)
  const feedBuffer = await baseSharp()
    .resize({
      width: maxFeedWidth,
      height: 1280,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: feedQuality, effort: 4 })
    .toBuffer();

  const feedMeta = await sharp(feedBuffer).metadata();

  // 5. Generate Full-Res variant (1080w max, 1920h max)
  const fullBuffer = await baseSharp()
    .resize({
      width: 1080,
      height: 1920,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: fullQuality, effort: 4 })
    .toBuffer();

  const fullMeta = await sharp(fullBuffer).metadata();

  // 6. Generate Ultra-compact Blur placeholder (16x16 WebP base64)
  const blurBuffer = await baseSharp()
    .resize(16, 16, { fit: "cover" })
    .webp({ quality: 20 })
    .toBuffer();

  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const totalOptimizedBytes = thumbBuffer.length + feedBuffer.length + fullBuffer.length;
  const compressionRatio =
    originalSizeBytes > 0
      ? Math.round(((originalSizeBytes - feedBuffer.length) / originalSizeBytes) * 100)
      : 0;

  return {
    width: origWidth,
    height: origHeight,
    aspectRatio,
    originalSizeBytes,
    totalOptimizedBytes,
    compressionRatio,
    blurDataUrl,
    variants: {
      thumbnail: {
        buffer: thumbBuffer,
        width: thumbMeta.width || 320,
        height: thumbMeta.height || 480,
        sizeBytes: thumbBuffer.length,
      },
      feed: {
        buffer: feedBuffer,
        width: feedMeta.width || 720,
        height: feedMeta.height || 1280,
        sizeBytes: feedBuffer.length,
      },
      full: {
        buffer: fullBuffer,
        width: fullMeta.width || 1080,
        height: fullMeta.height || 1920,
        sizeBytes: fullBuffer.length,
      },
    },
  };
}

/**
 * Uploads optimized variants directly to S3 with immutable cache headers and returns CDN URLs.
 */
export async function persistOptimizedVariantsToStorage(
  companyId: string,
  assetId: string,
  optimized: OptimizedImageResult
): Promise<StoredMediaAsset> {
  const { s3, bucket, cdnDomain } = getMediaS3Client();
  const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const basePath = `companies/${companyId}/listings/${datePrefix}/${assetId}`;

  const thumbKey = `${basePath}/thumb.webp`;
  const feedKey = `${basePath}/feed.webp`;
  const fullKey = `${basePath}/full.webp`;

  const immutableCacheControl = "public, max-age=31536000, immutable";

  // Upload variants in parallel
  await Promise.all([
    s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: thumbKey,
        Body: optimized.variants.thumbnail.buffer,
        ContentType: "image/webp",
        CacheControl: immutableCacheControl,
      })
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: feedKey,
        Body: optimized.variants.feed.buffer,
        ContentType: "image/webp",
        CacheControl: immutableCacheControl,
      })
    ),
    s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fullKey,
        Body: optimized.variants.full.buffer,
        ContentType: "image/webp",
        CacheControl: immutableCacheControl,
      })
    ),
  ]);

  const feedUrl = `https://${cdnDomain}/${feedKey}`;
  const thumbUrl = `https://${cdnDomain}/${thumbKey}`;
  const fullUrl = `https://${cdnDomain}/${fullKey}`;

  return {
    key: feedKey,
    url: feedUrl,
    cdnUrl: feedUrl,
    variants: {
      thumbnail: thumbUrl,
      feed: feedUrl,
      full: fullUrl,
    },
    width: optimized.width,
    height: optimized.height,
    aspectRatio: optimized.aspectRatio,
    blurDataUrl: optimized.blurDataUrl,
    mimeType: "image/webp",
    sizeBytes: optimized.variants.feed.sizeBytes,
    status: "READY",
  };
}

/**
 * Generates an optimized WebP poster frame from an image buffer or frame data.
 */
export async function generateVideoPosterBuffer(
  frameBuffer: Buffer,
  quality: number = 85
): Promise<{ buffer: Buffer; width: number; height: number; blurDataUrl: string }> {
  const posterBuffer = await sharp(frameBuffer)
    .rotate()
    .resize({
      width: 720,
      height: 1280,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer();

  const meta = await sharp(posterBuffer).metadata();

  const blurBuffer = await sharp(posterBuffer)
    .resize(16, 16, { fit: "cover" })
    .webp({ quality: 20 })
    .toBuffer();

  return {
    buffer: posterBuffer,
    width: meta.width || 720,
    height: meta.height || 1280,
    blurDataUrl: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
  };
}
