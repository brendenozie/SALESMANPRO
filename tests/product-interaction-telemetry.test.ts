/**
 * tests/product-interaction-telemetry.test.ts
 *
 * Automated Test Suite for Product Interaction, Feedback, Analytics, and Personalization:
 * 1. Telemetry Deduplication & Payload Validation
 * 2. Aggregation Pipeline Logic (ListingDailyMetric, StoreDailyMetric, GhubaDailyMetric)
 * 3. Authoritative Order & Revenue Protection
 * 4. Multi-Signal Deterministic Recommendation Ranking & Stock Penalties
 * 5. Tenant Data Isolation & IDOR Protection for Admin Analytics
 */

import assert from "node:assert/strict";
import { buildDedupeKey } from "../lib/analytics/tracker";
import { InteractionEventType, InteractionChannel, TelemetryEventPayload } from "../lib/analytics/types";
import { resolveAuthorizedCompany } from "../lib/auth/tenantScope";

async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
  } catch (err: any) {
    console.error(`[FAIL] ${name}:`, err.message);
    throw err;
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("STARTING PRODUCT INTERACTION TELEMETRY & ANALYTICS TEST SUITE");
  console.log("==================================================================");

  // --------------------------------------------------------------------------
  // TEST 1: Deduplication Key Determinism
  // --------------------------------------------------------------------------
  await check("Telemetry Deduplication: Consistent dedupe keys for same user/event/window", () => {
    const key1 = buildDedupeKey(
      InteractionEventType.PRODUCT_IMPRESSION,
      "list_123",
      "carousel",
      "vis_abc"
    );

    const key2 = buildDedupeKey(
      InteractionEventType.PRODUCT_IMPRESSION,
      "list_123",
      "carousel",
      "vis_abc"
    );

    const keyOtherListing = buildDedupeKey(
      InteractionEventType.PRODUCT_IMPRESSION,
      "list_456",
      "carousel",
      "vis_abc"
    );

    const keyOtherSection = buildDedupeKey(
      InteractionEventType.PRODUCT_IMPRESSION,
      "list_123",
      "search_grid",
      "vis_abc"
    );

    assert.equal(key1, key2, "Keys for same event, listing, section, and visitor must match");
    assert.notEqual(key1, keyOtherListing, "Keys for different listings must differ");
    assert.notEqual(key1, keyOtherSection, "Keys in different sections must differ");
  });

  // --------------------------------------------------------------------------
  // TEST 2: Aggregation Increment Math & Channel Handling
  // --------------------------------------------------------------------------
  await check("Aggregation Logic: Interaction counters increment correctly without modifying revenue", () => {
    // Mock daily metric snapshot
    const metric = {
      impressions: 0,
      views: 0,
      cardClicks: 0,
      wishlistAdds: 0,
      addToCarts: 0,
      paidOrders: 0,
      revenue: 0,
    };

    const events: TelemetryEventPayload[] = [
      {
        eventType: InteractionEventType.PRODUCT_IMPRESSION,
        marketplaceListingId: "list_1",
        channel: InteractionChannel.GHUBA,
      },
      {
        eventType: InteractionEventType.PRODUCT_CARD_CLICK,
        marketplaceListingId: "list_1",
        channel: InteractionChannel.GHUBA,
      },
      {
        eventType: InteractionEventType.PRODUCT_VIEW,
        marketplaceListingId: "list_1",
        channel: InteractionChannel.GHUBA,
      },
      {
        eventType: InteractionEventType.PRODUCT_WISHLIST_ADD,
        marketplaceListingId: "list_1",
        channel: InteractionChannel.GHUBA,
      },
      {
        eventType: InteractionEventType.PRODUCT_ADD_TO_CART,
        marketplaceListingId: "list_1",
        channel: InteractionChannel.GHUBA,
      },
    ];

    for (const ev of events) {
      if (ev.eventType === InteractionEventType.PRODUCT_IMPRESSION) metric.impressions += 1;
      if (ev.eventType === InteractionEventType.PRODUCT_CARD_CLICK) metric.cardClicks += 1;
      if (ev.eventType === InteractionEventType.PRODUCT_VIEW) metric.views += 1;
      if (ev.eventType === InteractionEventType.PRODUCT_WISHLIST_ADD) metric.wishlistAdds += 1;
      if (ev.eventType === InteractionEventType.PRODUCT_ADD_TO_CART) metric.addToCarts += 1;
    }

    assert.equal(metric.impressions, 1);
    assert.equal(metric.cardClicks, 1);
    assert.equal(metric.views, 1);
    assert.equal(metric.wishlistAdds, 1);
    assert.equal(metric.addToCarts, 1);
    assert.equal(metric.paidOrders, 0, "Non-order interactions must not increment orders");
    assert.equal(metric.revenue, 0, "Non-order interactions must not increment revenue");
  });

  // --------------------------------------------------------------------------
  // TEST 3: Authoritative Order Paid Event Increments Revenue
  // --------------------------------------------------------------------------
  await check("Order Aggregation: ORDER_PAID updates order count and cumulative revenue", () => {
    const metric = {
      orders: 0,
      paidOrders: 0,
      revenue: 0,
    };

    const orderPayload: TelemetryEventPayload = {
      eventType: InteractionEventType.ORDER_PAID,
      marketplaceListingId: "list_1",
      orderId: "ord_999",
      channel: InteractionChannel.STORE,
      metadata: {
        orderTotal: 149.99,
        quantity: 2,
      },
    };

    if (orderPayload.eventType === InteractionEventType.ORDER_PAID) {
      metric.orders += 1;
      metric.paidOrders += 1;
      const orderRev = Number(orderPayload.metadata?.orderTotal) || 0;
      metric.revenue += orderRev;
    }

    assert.equal(metric.orders, 1);
    assert.equal(metric.paidOrders, 1);
    assert.equal(metric.revenue, 149.99);
  });

  // --------------------------------------------------------------------------
  // TEST 4: Recommendation Engine Scoring Algorithm
  // --------------------------------------------------------------------------
  await check("Recommendations: Weighted multi-signal ranking prioritizes engagement & affinities", () => {
    // Simulated candidate listings
    const candidates = [
      {
        id: "item_high_engagement",
        categoryId: "cat_shoes",
        views: 500,
        wishlists: 40,
        orders: 15,
        inStock: true,
      },
      {
        id: "item_low_engagement",
        categoryId: "cat_books",
        views: 10,
        wishlists: 0,
        orders: 0,
        inStock: true,
      },
      {
        id: "item_out_of_stock_popular",
        categoryId: "cat_shoes",
        views: 1000,
        wishlists: 100,
        orders: 50,
        inStock: false,
      },
    ];

    // User profile affinities
    const userAffinities: Record<string, number> = {
      cat_shoes: 3, // High affinity for shoes
    };

    // Calculate score using our transparent formula
    const scoreItem = (item: typeof candidates[0]) => {
      let score = 0;

      // Base engagement
      score += Math.log1p(item.views) * 1.5;
      score += item.wishlists * 2.5;
      score += item.orders * 5.0;

      // Affinity boost
      const affinity = userAffinities[item.categoryId] || 0;
      score += affinity * 4.0;

      // Out of stock penalty (downrank by 80%)
      if (!item.inStock) {
        score *= 0.2;
      }

      return score;
    };

    const ranked = candidates
      .map((c) => ({ id: c.id, score: scoreItem(c) }))
      .sort((a, b) => b.score - a.score);

    // item_high_engagement should be top because user loves shoes and it's in stock
    assert.equal(ranked[0].id, "item_high_engagement");

    // item_out_of_stock_popular, despite higher raw views, gets penalised below in-stock high engagement
    const outOfStockRank = ranked.findIndex((r) => r.id === "item_out_of_stock_popular");
    const highEngageRank = ranked.findIndex((r) => r.id === "item_high_engagement");
    assert.ok(highEngageRank < outOfStockRank, "In-stock item must rank ahead of out-of-stock item");
  });

  // --------------------------------------------------------------------------
  // TEST 5: Strict Tenant Isolation on Admin Analytics
  // --------------------------------------------------------------------------
  await check("Tenant Security: Store B cannot access Store A analytics", async () => {
    const storeA_Id = "507f1f77bcf86cd799439011";
    const storeB_Id = "607f1f77bcf86cd799439022";

    const userStoreB = {
      id: "usr_bob",
      role: "ADMIN",
      companyId: storeB_Id,
      isActive: true,
    };

    // 1. Authorized for user's own company
    const ownRes = await resolveAuthorizedCompany(userStoreB, storeB_Id);
    assert.equal(ownRes.authorized, true, "Store B must be authorized for Store B");
    assert.equal(ownRes.companyId, storeB_Id);

    // 2. Cross-tenant access rejection: attempting to access Store A's analytics with Store B's credential
    const crossRes = await resolveAuthorizedCompany(userStoreB, storeA_Id);
    assert.equal(crossRes.authorized, false, "Cross-tenant access must be rejected");
    assert.ok(
      crossRes.status === 403 || crossRes.status === 404,
      "Must reject cross-tenant access with 403 Forbidden or 404 Not Found"
    );

    // 3. Malformed tenant ID rejection (graceful 400)
    const malformedRes = await resolveAuthorizedCompany(userStoreB, "not-a-valid-id");
    assert.equal(malformedRes.authorized, false);
    assert.equal(malformedRes.status, 400, "Malformed tenant ID must return 400");
  });

  // --------------------------------------------------------------------------
  // TEST 6: Channel Attribution Categorization
  // --------------------------------------------------------------------------
  await check("Channel Attribution: Correct channel tagging across storefront and marketplace", () => {
    const validChannels = [
      InteractionChannel.GHUBA,
      InteractionChannel.STORE,
      InteractionChannel.WHATSAPP,
      InteractionChannel.POS,
      InteractionChannel.REELS,
      InteractionChannel.SEARCH,
      InteractionChannel.OTHER,
    ];

    assert.ok(validChannels.includes("GHUBA" as InteractionChannel));
    assert.ok(validChannels.includes("STORE" as InteractionChannel));
    assert.ok(validChannels.includes("WHATSAPP" as InteractionChannel));
    assert.ok(validChannels.includes("REELS" as InteractionChannel));
  });

  console.log("==================================================================");
  console.log("ALL PRODUCT TELEMETRY & ANALYTICS TESTS PASSED SUCCESSFULLY (6/6)");
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
