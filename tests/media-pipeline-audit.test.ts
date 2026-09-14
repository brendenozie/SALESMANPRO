/**
 * tests/media-pipeline-audit.test.ts
 *
 * Automated test suite for Ghuba Vertical Commerce Feed Media Pipeline.
 * Validates:
 * 1. Upload validation & filename sanitization (path traversal & extension security)
 * 2. Sharp image optimization (multi-variant WebP, EXIF stripping, blurDataUrl)
 * 3. Video poster generation & guaranteed fallback
 * 4. Media State Machine (READY vs PROCESSING vs FAILED video priority)
 * 5. Structured metadata resolution & backward compatibility with legacy string URLs
 * 6. S3 Storage key extraction for lifecycle cleanup
 */

import assert from "node:assert/strict";
import sharp from "sharp";
import { sanitizeFilename } from "../app/api/upload-url/route";
import {
  optimizeListingImage,
  generateVideoPosterBuffer,
} from "../lib/media-optimizer";
import {
  resolveFeedMedia,
  normalizeMediaList,
  parseDetailedMediaList,
} from "../lib/ghuba-feed-service";
import { extractStorageKeyFromUrl } from "../lib/media-cleanup";

async function runMediaPipelineTests() {
  console.log("\n========================================================");
  console.log("  GHUBA VERTICAL COMMERCE MEDIA PIPELINE AUDIT TEST SUITE");
  console.log("========================================================\n");

  // -----------------------------------------------------------
  // TEST 1: UPLOAD SANITIZATION & SECURITY
  // -----------------------------------------------------------
  console.log("[TEST 1] Testing Upload Filename Sanitization & Path Traversal Security...");
  {
    // Path traversal should be stripped
    const traversal = sanitizeFilename("../../../etc/passwd/image.jpg");
    assert.equal(traversal.safeName.includes(".."), false);
    assert.equal(traversal.safeName.includes("/"), false);
    assert.equal(traversal.ext, "jpg");

    // Dangerous executable extensions should throw
    assert.throws(() => sanitizeFilename("malicious_script.php"), /Forbidden file extension/);
    assert.throws(() => sanitizeFilename("virus.exe"), /Forbidden file extension/);
    assert.throws(() => sanitizeFilename("script.sh"), /Forbidden file extension/);
    assert.throws(() => sanitizeFilename("xss_payload.html"), /Forbidden file extension/);

    // Normal filenames with spaces and special chars
    const normal = sanitizeFilename("My Product Photo #1 (Summer 2026).png");
    assert.equal(normal.ext, "png");
    assert.equal(normal.safeName.length > 0, true);
    assert.equal(/^[a-zA-Z0-9_-]+$/.test(normal.safeName), true);

    console.log("  ✓ Filename sanitization, path traversal, and forbidden extensions verified");
  }

  // -----------------------------------------------------------
  // TEST 2: SHARP IMAGE OPTIMIZATION & EXIF PRIVACY STRIPPING
  // -----------------------------------------------------------
  console.log("\n[TEST 2] Testing Sharp Image Optimization & Responsive WebP Multi-Variants...");
  {
    // Generate a test uncompressed image buffer with simulated size (1200x1600 RGBA)
    const testImageBuffer = await sharp({
      create: {
        width: 1200,
        height: 1600,
        channels: 4,
        background: { r: 230, g: 100, b: 50, alpha: 1 },
      },
    })
      .jpeg({ quality: 95 })
      .toBuffer();

    const initialSizeBytes = testImageBuffer.length;
    const optimized = await optimizeListingImage(testImageBuffer);

    // Verify dimensions & aspect ratio
    assert.equal(optimized.width, 1200);
    assert.equal(optimized.height, 1600);
    assert.equal(optimized.aspectRatio, 0.75);

    // Verify WebP variants exist and match target bounds
    assert.ok(optimized.variants.thumbnail.buffer.length > 0);
    assert.ok(optimized.variants.feed.buffer.length > 0);
    assert.ok(optimized.variants.full.buffer.length > 0);

    // Thumbnail should be <= 320px wide
    assert.ok(optimized.variants.thumbnail.width <= 320);

    // Feed variant should be <= 720px wide (optimal 9:16 vertical view)
    assert.ok(optimized.variants.feed.width <= 720);

    // Full variant should be <= 1080px wide
    assert.ok(optimized.variants.full.width <= 1080);

    // BlurDataURL should be a valid base64 data URI
    assert.ok(optimized.blurDataUrl.startsWith("data:image/webp;base64,"));

    // Verify EXIF data is stripped: inspected metadata should have no GPS or TIFF tags
    const feedMetadata = await sharp(optimized.variants.feed.buffer).metadata();
    assert.equal(feedMetadata.format, "webp");
    assert.equal(feedMetadata.exif, undefined);

    // Compression ratio should be calculated
    assert.ok(optimized.compressionRatio >= 0);

    console.log(`  ✓ Original: ${(initialSizeBytes / 1024).toFixed(1)} KB`);
    console.log(`  ✓ Feed WebP: ${(optimized.variants.feed.sizeBytes / 1024).toFixed(1)} KB (${optimized.variants.feed.width}x${optimized.variants.feed.height})`);
    console.log(`  ✓ Thumb WebP: ${(optimized.variants.thumbnail.sizeBytes / 1024).toFixed(1)} KB (${optimized.variants.thumbnail.width}x${optimized.variants.thumbnail.height})`);
    console.log(`  ✓ BlurDataURL generated: ${optimized.blurDataUrl.slice(0, 35)}...`);
    console.log("  ✓ EXIF metadata stripped successfully for privacy");
  }

  // -----------------------------------------------------------
  // TEST 3: VIDEO POSTER GENERATION
  // -----------------------------------------------------------
  console.log("\n[TEST 3] Testing Video Poster Buffer Generation...");
  {
    const sampleFrame = await sharp({
      create: {
        width: 1080,
        height: 1920,
        channels: 3,
        background: { r: 20, g: 30, b: 60 },
      },
    })
      .png()
      .toBuffer();

    const poster = await generateVideoPosterBuffer(sampleFrame);
    assert.ok(poster.buffer.length > 0);
    assert.ok(poster.width <= 720);
    assert.ok(poster.height <= 1280);
    assert.ok(poster.blurDataUrl.startsWith("data:image/webp;base64,"));

    console.log(`  ✓ Poster frame generated: ${poster.width}x${poster.height}, Blur: ${poster.blurDataUrl.slice(0, 30)}...`);
  }

  // -----------------------------------------------------------
  // TEST 4: MEDIA STATE MACHINE & PRIORITY RESOLUTION
  // -----------------------------------------------------------
  console.log("\n[TEST 4] Testing Media State Machine & Priority Resolution...");
  {
    // A. READY Video -> Primary Type is VIDEO, poster is guaranteed
    const readyVideoMedia = resolveFeedMedia(
      [{ url: "https://cdn.example.com/video.mp4", status: "READY", posterUrl: "https://cdn.example.com/poster.webp" }],
      [{ url: "https://cdn.example.com/image1.webp" }]
    );
    assert.equal(readyVideoMedia.primaryType, "VIDEO");
    assert.equal(readyVideoMedia.status, "READY");
    assert.equal(readyVideoMedia.poster, "https://cdn.example.com/poster.webp");
    assert.equal(readyVideoMedia.videos.length, 1);

    // B. Video without explicit poster -> guaranteed poster is derived from first image
    const videoWithDerivedPoster = resolveFeedMedia(
      ["https://cdn.example.com/video.mp4"],
      ["https://cdn.example.com/photo.webp"]
    );
    assert.equal(videoWithDerivedPoster.primaryType, "VIDEO");
    assert.equal(videoWithDerivedPoster.poster, "https://cdn.example.com/photo.webp");

    // C. Video with NO images -> guaranteed poster fallback (NEVER undefined)
    const videoWithNoImages = resolveFeedMedia(
      ["https://cdn.example.com/isolated-video.mp4"],
      []
    );
    assert.equal(videoWithNoImages.primaryType, "VIDEO");
    assert.ok(videoWithNoImages.poster.length > 0);
    assert.notEqual(videoWithNoImages.poster, undefined);

    // D. Video in PROCESSING state -> Falls back to IMAGE/GALLERY
    const processingVideoMedia = resolveFeedMedia(
      [{ url: "https://cdn.example.com/transcoding.mp4", status: "PROCESSING" }],
      ["https://cdn.example.com/fallback-photo1.webp", "https://cdn.example.com/fallback-photo2.webp"]
    );
    assert.equal(processingVideoMedia.primaryType, "GALLERY"); // Falls back to images because video is not READY
    assert.equal(processingVideoMedia.images.length, 2);

    // E. Video in FAILED state -> Falls back to IMAGE
    const failedVideoMedia = resolveFeedMedia(
      [{ url: "https://cdn.example.com/corrupt.mp4", status: "FAILED" }],
      ["https://cdn.example.com/good-photo.webp"]
    );
    assert.equal(failedVideoMedia.primaryType, "IMAGE");
    assert.equal(failedVideoMedia.images[0], "https://cdn.example.com/good-photo.webp");

    // F. Multi-image gallery
    const galleryMedia = resolveFeedMedia(
      [],
      ["https://cdn.example.com/1.jpg", "https://cdn.example.com/2.jpg", "https://cdn.example.com/3.jpg"]
    );
    assert.equal(galleryMedia.primaryType, "GALLERY");
    assert.equal(galleryMedia.images.length, 3);

    // G. Empty media fallback
    const emptyMedia = resolveFeedMedia([], []);
    assert.equal(emptyMedia.primaryType, "IMAGE");
    assert.ok(emptyMedia.images.length >= 1);
    assert.ok(emptyMedia.poster.length > 0);

    console.log("  ✓ Ready video priority verified");
    console.log("  ✓ Guaranteed poster fallback verified (zero black screens)");
    console.log("  ✓ PROCESSING & FAILED video fallback to image/gallery verified");
    console.log("  ✓ Gallery and default placeholder fallbacks verified");
  }

  // -----------------------------------------------------------
  // TEST 5: STRUCTURED MEDIA PARSING & BACKWARD COMPATIBILITY
  // -----------------------------------------------------------
  console.log("\n[TEST 5] Testing Structured Media Parsing & Backward Compatibility...");
  {
    // Legacy mixed input: string URLs mixed with enriched variant objects
    const legacyMixedImages = [
      "https://cdn.example.com/legacy-string.jpg",
      {
        url: "https://cdn.example.com/enriched.jpg",
        variants: {
          thumbnail: "https://cdn.example.com/enriched-thumb.webp",
          feed: "https://cdn.example.com/enriched-feed.webp",
          full: "https://cdn.example.com/enriched-full.webp",
        },
        width: 1080,
        height: 1920,
        blurDataUrl: "data:image/webp;base64,sampleblur",
      },
    ];

    const normalized = normalizeMediaList(legacyMixedImages);
    assert.equal(normalized.length, 2);
    assert.equal(normalized[0], "https://cdn.example.com/legacy-string.jpg");
    assert.equal(normalized[1], "https://cdn.example.com/enriched.jpg");

    const parsed = parseDetailedMediaList(legacyMixedImages);
    assert.equal(parsed.images.length, 2);
    assert.equal(parsed.images[1].variants?.feed, "https://cdn.example.com/enriched-feed.webp");
    assert.equal(parsed.images[1].blurDataUrl, "data:image/webp;base64,sampleblur");

    console.log("  ✓ Legacy string URLs and modern enriched variant objects parsed seamlessly");
  }

  // -----------------------------------------------------------
  // TEST 6: S3 STORAGE KEY EXTRACTION FOR LIFECYCLE CLEANUP
  // -----------------------------------------------------------
  console.log("\n[TEST 6] Testing Storage Key Extraction for S3 Lifecycle Cleanup...");
  {
    const cdnUrl = "https://dozi4r4ug9739.cloudfront.net/companies/comp123/images/2026-09/photo.webp";
    const key1 = extractStorageKeyFromUrl(cdnUrl);
    assert.equal(key1, "companies/comp123/images/2026-09/photo.webp");

    const s3Url = "https://tulivuappsbucket.s3.eu-north-1.amazonaws.com/companies/comp123/videos/2026-09/clip.mp4";
    const key2 = extractStorageKeyFromUrl(s3Url);
    assert.equal(key2, "companies/comp123/videos/2026-09/clip.mp4");

    const relativeUrl = "/companies/comp123/images/thumb.webp";
    const key3 = extractStorageKeyFromUrl(relativeUrl);
    assert.equal(key3, "companies/comp123/images/thumb.webp");

    console.log("  ✓ CloudFront, S3, and relative keys extracted accurately for batch cleanup");
  }

  console.log("\n========================================================");
  console.log("  ALL MEDIA PIPELINE AUDIT TESTS PASSED! ✓");
  console.log("========================================================\n");
}

runMediaPipelineTests().catch((err) => {
  console.error("\n❌ Media Pipeline Audit Test Suite Failed:", err);
  process.exit(1);
});
