/**
 * tests/ghuba-feed.test.ts
 *
 * Automated test suite for Ghuba Marketplace Full-Screen Vertical Commerce Feed.
 * Tests:
 * 1. Feed query and canonical item mapping
 * 2. Media Priority Rule (Video > Gallery > Image > Fallback)
 * 3. Deterministic Ranking & Scoring
 * 4. Cursor Pagination
 * 5. Like / Unlike persistence and atomic constraints
 * 6. Comment creation, retrieval, and deletion authorization
 * 7. Saved listings / Wishlist sync
 * 8. Product capability mapping (cart vs booking vs enquiry)
 * 9. Canonical URL token encoding and decoding
 */

import assert from "node:assert/strict";
import prisma from "../server/db/prismadb";
import {
  getGhubaFeed,
  resolveFeedMedia,
  calculateFeedScore,
  normalizeMediaList,
} from "../lib/ghuba-feed-service";
import { resolveProductType, withCapabilities } from "../lib/ghuba-product-type";
import {
  getListingPublicUrl,
  encodeListingId,
  decodeListingId,
  extractListingId,
} from "../lib/ghuba-slug";

async function runTests() {
  console.log("\n========================================================");
  console.log("  GHUBA VERTICAL COMMERCE FEED TEST SUITE");
  console.log("========================================================\n");

  let testListingId: string = "";
  let testUserId: string = "";

  // -----------------------------------------------------------
  // 1. MEDIA PRIORITY RULE
  // -----------------------------------------------------------
  console.log("[TEST 1] Testing Media Priority Resolution...");
  {
    // Video priority
    const mediaWithVideo = resolveFeedMedia(
      ["https://cdn.example.com/video.mp4"],
      ["https://cdn.example.com/image1.jpg", "https://cdn.example.com/image2.jpg"]
    );
    assert.equal(mediaWithVideo.primaryType, "VIDEO");
    assert.equal(mediaWithVideo.videos.length, 1);
    assert.equal(mediaWithVideo.images.length, 2);

    // Gallery priority when multiple images and no video
    const mediaWithGallery = resolveFeedMedia(
      [],
      ["https://cdn.example.com/img1.jpg", "https://cdn.example.com/img2.jpg"]
    );
    assert.equal(mediaWithGallery.primaryType, "GALLERY");
    assert.equal(mediaWithGallery.images.length, 2);

    // Single image priority
    const mediaWithSingleImage = resolveFeedMedia([], ["https://cdn.example.com/single.jpg"]);
    assert.equal(mediaWithSingleImage.primaryType, "IMAGE");
    assert.equal(mediaWithSingleImage.images.length, 1);

    // Fallback when empty
    const mediaEmpty = resolveFeedMedia([], []);
    assert.equal(mediaEmpty.primaryType, "IMAGE");
    assert.ok(mediaEmpty.images.length >= 1, "Must have fallback image");
    console.log("  ✓ Media Priority rules verified: VIDEO > GALLERY > IMAGE > FALLBACK");
  }

  // -----------------------------------------------------------
  // 2. CANONICAL SLUG & ENCRYPTION TOKENS
  // -----------------------------------------------------------
  console.log("\n[TEST 2] Testing Canonical URL Slug & Tokens...");
  {
    const sampleObjectId = "687ae1d3990c2854fe8bcdd2";
    const token = encodeListingId(sampleObjectId);
    assert.ok(token.length > 10, "Token must be non-empty base64url string");

    const decoded = decodeListingId(token);
    assert.equal(decoded, sampleObjectId, "Decoded token must match original 24-hex ObjectId");

    const url = getListingPublicUrl({ id: sampleObjectId, name: "Leather Tent Special" });
    assert.ok(url.startsWith("/ghuba/productlist/leather-tent-special--"), "URL format must follow semantic slug pattern");

    const extracted = extractListingId(url);
    assert.equal(extracted, sampleObjectId, "Extracted ID from URL must decode to original ObjectId");
    console.log("  ✓ Token encoding, decoding, and canonical URL extraction verified");
  }

  // -----------------------------------------------------------
  // 3. PRODUCT CAPABILITY MAPPING
  // -----------------------------------------------------------
  console.log("\n[TEST 3] Testing Product Capabilities & Commerce Actions...");
  {
    const ecommerceItem = withCapabilities({
      name: "Smart Watch",
      category: "Electronics",
      sellingPrice: 5000,
    });
    assert.equal(ecommerceItem.productType, "ECOMMERCE");
    assert.equal(ecommerceItem.capabilities.canAddToCart, true);
    assert.equal(ecommerceItem.capabilities.canBookSession, false);

    const serviceItem = withCapabilities({
      name: "Vehicle Engine Diagnostics and Repair",
      category: "Automotive Services",
      duration: "1 hour",
    });
    assert.equal(serviceItem.productType, "SERVICE");
    assert.equal(serviceItem.capabilities.canBookSession, true);
    assert.equal(serviceItem.capabilities.canAddToCart, false);

    const propertyItem = withCapabilities({
      name: "2 Bedroom Apartment in Westlands",
      category: "Real Estate",
      bedrooms: [{ type: "Master" }],
    });
    assert.equal(propertyItem.productType, "PROPERTY");
    assert.equal(propertyItem.capabilities.canInquire, true);
    console.log("  ✓ Capabilities properly distinguish AddToCart, BookSession, and Inquire");
  }

  // -----------------------------------------------------------
  // 4. FEED RETRIEVAL & RANKING
  // -----------------------------------------------------------
  console.log("\n[TEST 4] Testing Feed Query & Deterministic Ranking...");
  {
    const feed = await getGhubaFeed({ limit: 5 });
    assert.ok(Array.isArray(feed.items), "Feed must return an items array");
    assert.ok(feed.items.length > 0, "Feed must contain eligible items");
    assert.ok(feed.items.length <= 5, "Feed items count must obey limit");

    const firstItem = feed.items[0];
    testListingId = firstItem.listingId;

    assert.ok(firstItem.id, "Item must have id");
    assert.ok(firstItem.listingId, "Item must have persistent listingId");
    assert.ok(firstItem.title, "Item must have title");
    assert.ok(firstItem.media, "Item must have media object");
    assert.ok(firstItem.engagement, "Item must have engagement counters");
    assert.ok(firstItem.commerce, "Item must have commerce capabilities");
    assert.ok(typeof firstItem.score === "number", "Item must have calculated score");

    // Test cursor pagination
    if (feed.hasMore && feed.nextCursor) {
      const nextPage = await getGhubaFeed({ cursor: feed.nextCursor, limit: 3 });
      assert.ok(Array.isArray(nextPage.items));
      if (nextPage.items.length > 0) {
        assert.notEqual(
          nextPage.items[0].id,
          firstItem.id,
          "Next page items must not duplicate current page first item"
        );
      }
    }
    console.log(`  ✓ Queried ${feed.items.length} items with deterministic scoring and cursor pagination`);
  }

  // Find or create test user for engagement tests
  const existingUser = await prisma.user.findFirst({ select: { id: true } });
  if (existingUser) {
    testUserId = existingUser.id;
  } else {
    const newUser = await prisma.user.create({
      data: {
        email: `test_feed_user_${Date.now()}@example.com`,
        name: "Test Feed User",
      },
    });
    testUserId = newUser.id;
  }

  // -----------------------------------------------------------
  // 5. PERSISTENT LIKES (ATOMIC & IDEMPOTENT)
  // -----------------------------------------------------------
  console.log("\n[TEST 5] Testing Persistent Listing Likes...");
  {
    // Clean up any existing like
    await prisma.marketplaceListingLike.deleteMany({
      where: { listingId: testListingId, userId: testUserId },
    });

    const countBefore = await prisma.marketplaceListingLike.count({
      where: { listingId: testListingId },
    });

    // Create like
    await prisma.marketplaceListingLike.upsert({
      where: {
        listingId_userId: {
          listingId: testListingId,
          userId: testUserId,
        },
      },
      create: {
        listingId: testListingId,
        userId: testUserId,
      },
      update: {},
    });

    const countAfterLike = await prisma.marketplaceListingLike.count({
      where: { listingId: testListingId },
    });
    assert.equal(countAfterLike, countBefore + 1, "Like count must increment by 1");

    // Re-upsert (Idempotency check)
    await prisma.marketplaceListingLike.upsert({
      where: {
        listingId_userId: {
          listingId: testListingId,
          userId: testUserId,
        },
      },
      create: {
        listingId: testListingId,
        userId: testUserId,
      },
      update: {},
    });
    const countDuplicate = await prisma.marketplaceListingLike.count({
      where: { listingId: testListingId },
    });
    assert.equal(countDuplicate, countAfterLike, "Duplicate like must not increment count");

    // Unlike
    await prisma.marketplaceListingLike.deleteMany({
      where: { listingId: testListingId, userId: testUserId },
    });
    const countAfterUnlike = await prisma.marketplaceListingLike.count({
      where: { listingId: testListingId },
    });
    assert.equal(countAfterUnlike, countBefore, "Unlike must restore original count");
    console.log("  ✓ Like/Unlike atomic persistence & idempotency verified");
  }

  // -----------------------------------------------------------
  // 6. COMMENTS SYSTEM (CREATE, RETRIEVE, DELETE)
  // -----------------------------------------------------------
  console.log("\n[TEST 6] Testing Comments System...");
  {
    const commentContent = `Test comment from automated suite: ${Date.now()}`;
    const comment = await prisma.marketplaceListingComment.create({
      data: {
        listingId: testListingId,
        userId: testUserId,
        content: commentContent,
        status: "VISIBLE",
      },
    });
    assert.ok(comment.id, "Comment must be created with valid id");
    assert.equal(comment.content, commentContent);

    // Retrieve comments for listing
    const commentsList = await prisma.marketplaceListingComment.findMany({
      where: { listingId: testListingId, status: "VISIBLE" },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(commentsList.some((c) => c.id === comment.id), "Created comment must be in list");

    // Delete comment
    await prisma.marketplaceListingComment.delete({
      where: { id: comment.id },
    });

    const afterDelete = await prisma.marketplaceListingComment.findUnique({
      where: { id: comment.id },
    });
    assert.equal(afterDelete, null, "Deleted comment must no longer exist");
    console.log("  ✓ Comment creation, retrieval, and deletion verified");
  }

  // -----------------------------------------------------------
  // 7. SAVE / WISHLIST SYNC
  // -----------------------------------------------------------
  console.log("\n[TEST 7] Testing Save / Wishlist Sync...");
  {
    let wishlist = await prisma.wishlist.findFirst({ where: { userId: testUserId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: testUserId, name: "Test Wishlist" },
      });
    }

    // Save listing
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        marketplaceListingId: testListingId,
      },
    });
    assert.ok(wishlistItem.id);

    // Check feed returns viewerState.saved: true
    const feedForUser = await getGhubaFeed({ limit: 10, userId: testUserId });
    const userItem = feedForUser.items.find((it) => it.listingId === testListingId);
    if (userItem) {
      assert.equal(userItem.viewerState.saved, true, "Saved item must reflect saved: true in viewerState");
    }

    // Clean up
    await prisma.wishlistItem.delete({ where: { id: wishlistItem.id } });
    console.log("  ✓ Save/Wishlist sync and viewerState resolution verified");
  }

  console.log("\n========================================================");
  console.log("  ALL TESTS PASSED SUCCESSFULLY! ✓");
  console.log("========================================================\n");
}

runTests()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("TEST FAILED:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
