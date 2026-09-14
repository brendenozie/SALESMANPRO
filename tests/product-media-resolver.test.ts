/**
 * tests/product-media-resolver.test.ts
 *
 * Verifies universal product media resolution for:
 * 1. GhubaProductCard & Tenant ProductCard
 * 2. Ghuba Product Detail Page Bento Gallery & Lightbox
 * 3. Tenant Storefront ProductDetail & QuickViewModal
 */

import { resolveProductMedia } from "@/lib/product-media-resolver";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  PRODUCT MEDIA RESOLVER & VIEWER INTEGRATION TEST SUITE");
  console.log("========================================================\n");

  // TEST 1: Video-Only Product (Zero Photos)
  console.log("[TEST 1] Video-Only Product (Zero Photos)...");
  {
    const product = {
      id: "prod-vid-only",
      name: "Smart Watch Pro",
      videos: [
        {
          url: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/videos/smartwatch.mp4",
          posterUrl: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/smartwatch-poster.webp",
          status: "READY",
        },
      ],
      images: [],
    };

    const resolved = resolveProductMedia(product);
    assert(resolved.hasVideo === true, "hasVideo must be true");
    assert(resolved.primaryType === "VIDEO", "primaryType must be VIDEO");
    assert(
      resolved.primaryImageUrl === "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/smartwatch-poster.webp",
      "primaryImageUrl must fall back to the guaranteed video poster URL instead of broken image placeholder"
    );
    assert(resolved.gallery.length === 1, "Gallery must contain 1 video item");
    assert(resolved.gallery[0].type === "VIDEO", "Gallery item 0 must be VIDEO");
    assert(resolved.gallery[0].url === product.videos[0].url, "Gallery item 0 url must match");
    console.log("  ✓ Guaranteed poster fallback and video gallery resolution verified");
  }

  // TEST 2: Hybrid Product (Video + Multi-Variant Sharp WebP Images)
  console.log("\n[TEST 2] Hybrid Product (Video + Multi-Variant Sharp WebP Images)...");
  {
    const product = {
      id: "prod-hybrid",
      name: "Luxury Leather Handbag",
      videos: [
        {
          url: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/videos/handbag-demo.mp4",
          posterUrl: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/handbag-poster.webp",
          status: "READY",
        },
      ],
      images: [
        {
          url: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/handbag-raw.jpg",
          variants: {
            thumbnail: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/variants/handbag-320w.webp",
            feed: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/variants/handbag-720w.webp",
            full: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/variants/handbag-1080w.webp",
          },
          blurDataUrl: "data:image/webp;base64,sampleblur",
        },
        {
          url: "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/handbag-angle2.jpg",
        },
      ],
    };

    const resolved = resolveProductMedia(product);
    assert(resolved.hasVideo === true, "hasVideo must be true");
    assert(resolved.videoCount === 1, "videoCount must be 1");
    assert(resolved.imageCount === 2, "imageCount must be 2");
    assert(
      resolved.primaryImageUrl === "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/variants/handbag-720w.webp",
      "primaryImageUrl must use Sharp 720w WebP feed variant instead of heavy raw image"
    );
    assert(resolved.gallery.length === 3, "Unified gallery must contain 3 items (1 video + 2 images)");
    assert(resolved.gallery[0].type === "VIDEO", "Gallery item 0 must be VIDEO");
    assert(resolved.gallery[1].type === "IMAGE", "Gallery item 1 must be IMAGE");
    assert(
      resolved.gallery[1].thumbnailUrl === "https://dozi4r4ug9739.cloudfront.net/companies/comp1/images/variants/handbag-320w.webp",
      "Image thumbnail must use 320w WebP variant"
    );
    console.log("  ✓ High-performance WebP variants and video inclusion verified");
  }

  // TEST 3: Legacy String Array Compatibility
  console.log("\n[TEST 3] Legacy String Array Compatibility (Backward Compatibility)...");
  {
    const product = {
      id: "prod-legacy",
      name: "Vintage Table",
      videos: ["https://cdn.example.com/demo.mp4"],
      images: ["https://cdn.example.com/table1.jpg", "https://cdn.example.com/table2.jpg"],
    };

    const resolved = resolveProductMedia(product);
    assert(resolved.hasVideo === true, "Legacy string video must be detected");
    assert(resolved.primaryImageUrl === "https://cdn.example.com/table1.jpg", "Primary image must be first image string");
    assert(resolved.gallery.length === 3, "Gallery must contain 3 items");
    assert(resolved.gallery[0].type === "VIDEO", "Legacy video is item 0");
    assert(resolved.gallery[1].url === "https://cdn.example.com/table1.jpg", "Item 1 is table1");
    console.log("  ✓ Legacy string array compatibility verified");
  }

  // TEST 4: Null / Empty Safety Fallback
  console.log("\n[TEST 4] Null / Empty Safety Fallback...");
  {
    const resolvedNull = resolveProductMedia(null);
    assert(resolvedNull.hasVideo === false, "hasVideo must be false for null");
    assert(typeof resolvedNull.primaryImageUrl === "string" && resolvedNull.primaryImageUrl.length > 0, "fallback image present");

    const resolvedEmpty = resolveProductMedia({});
    assert(resolvedEmpty.hasVideo === false, "hasVideo must be false for empty");
    assert(typeof resolvedEmpty.primaryImageUrl === "string" && resolvedEmpty.primaryImageUrl.length > 0, "fallback image present");
    console.log("  ✓ Resilient fallback for missing or null objects verified");
  }

  console.log("\n========================================================");
  console.log("  ALL RESOLVER TESTS COMPLETED SUCCESSFULLY! ✓");
  console.log("========================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
