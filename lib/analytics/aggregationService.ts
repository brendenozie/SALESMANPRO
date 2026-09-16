/**
 * lib/analytics/aggregationService.ts
 *
 * Core service for aggregating interaction events into precomputed daily metrics
 * and persisting raw telemetry for audit and conversion funnel analysis.
 */

import prisma from "@/server/db/prismadb";
import { TelemetryEventPayload, InteractionChannel } from "./types";

function getISODate(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * In-memory cache for fast listing -> (companyId, productId) resolution
 * to avoid repetitive DB queries during high event throughput.
 */
const listingMetadataCache = new Map<
  string,
  { companyId: string | null; productId: string | null; expires: number }
>();

async function getListingMetadata(listingId: string) {
  const now = Date.now();
  const cached = listingMetadataCache.get(listingId);
  if (cached && cached.expires > now) {
    return cached;
  }

  try {
    const listing = await prisma.marketplaceListings.findUnique({
      where: { id: listingId },
      select: { companyId: true, productId: true },
    });

    const meta = {
      companyId: listing?.companyId || null,
      productId: listing?.productId || null,
      expires: now + 300000, // 5 min cache
    };

    listingMetadataCache.set(listingId, meta);
    return meta;
  } catch {
    return { companyId: null, productId: null, expires: now };
  }
}

/**
 * Processes a batch of telemetry events asynchronously.
 */
export async function processTelemetryBatch(events: TelemetryEventPayload[]): Promise<{
  processed: number;
  aggregated: number;
}> {
  if (!events || events.length === 0) {
    return { processed: 0, aggregated: 0 };
  }

  const today = getISODate();
  const rawEventsToCreate: any[] = [];

  // Group events by (listingId, date, channel) and (companyId, date, channel)
  const listingIncrements = new Map<string, {
    listingId: string;
    productId?: string;
    companyId: string;
    date: string;
    channel: InteractionChannel;
    increments: Record<string, number>;
  }>();

  const storeIncrements = new Map<string, {
    companyId: string;
    date: string;
    channel: InteractionChannel;
    increments: Record<string, number>;
  }>();

  const ghubaIncrements = new Map<string, {
    date: string;
    channel: InteractionChannel;
    increments: Record<string, number>;
  }>();

  for (const ev of events) {
    if (!ev.eventType) continue;

    let listingId = ev.marketplaceListingId;
    let productId = ev.productId;
    let companyId = ev.companyId;
    const channel: InteractionChannel = ev.channel || "GHUBA";

    // Auto-resolve ownership if missing and listingId is present
    if (listingId && (!companyId || !productId)) {
      const meta = await getListingMetadata(listingId);
      if (meta.companyId && !companyId) companyId = meta.companyId;
      if (meta.productId && !productId) productId = meta.productId;
    }

    // Determine metric increment field
    const field = mapEventTypeToMetricField(ev.eventType);

    // Accumulate ListingDailyMetric
    if (listingId && companyId && field) {
      const key = `${listingId}_${today}_${channel}`;
      let item = listingIncrements.get(key);
      if (!item) {
        item = {
          listingId,
          productId: productId || undefined,
          companyId,
          date: today,
          channel,
          increments: {},
        };
        listingIncrements.set(key, item);
      }
      item.increments[field] = (item.increments[field] || 0) + 1;

      // Handle unique viewers / unique impressions
      if (field === "impressions") {
        item.increments["uniqueImpressions"] = (item.increments["uniqueImpressions"] || 0) + 1;
      }
      if (field === "views") {
        item.increments["uniqueViews"] = (item.increments["uniqueViews"] || 0) + 1;
      }
    }

    // Accumulate StoreDailyMetric
    if (companyId && field) {
      const key = `${companyId}_${today}_${channel}`;
      let item = storeIncrements.get(key);
      if (!item) {
        item = {
          companyId,
          date: today,
          channel,
          increments: {},
        };
        storeIncrements.set(key, item);
      }
      item.increments[field] = (item.increments[field] || 0) + 1;
      if (field === "impressions") {
        item.increments["uniqueImpressions"] = (item.increments["uniqueImpressions"] || 0) + 1;
      }
      if (field === "views") {
        item.increments["uniqueViews"] = (item.increments["uniqueViews"] || 0) + 1;
      }
    }

    // Accumulate GhubaDailyMetric
    if (field) {
      const key = `${today}_${channel}`;
      let item = ghubaIncrements.get(key);
      if (!item) {
        item = {
          date: today,
          channel,
          increments: {},
        };
        ghubaIncrements.set(key, item);
      }
      item.increments[field] = (item.increments[field] || 0) + 1;
      if (field === "impressions") {
        item.increments["uniqueImpressions"] = (item.increments["uniqueImpressions"] || 0) + 1;
      }
      if (field === "views") {
        item.increments["uniqueViews"] = (item.increments["uniqueViews"] || 0) + 1;
      }
    }

    // Prepare raw event for persistence (sampling high-volume impressions if needed)
    rawEventsToCreate.push({
      eventType: ev.eventType as any,
      marketplaceListingId: listingId || null,
      productId: productId || null,
      companyId: companyId || null,
      storeId: ev.storeId || null,
      userId: ev.userId || null,
      consumerId: ev.consumerId || null,
      customerId: ev.customerId || null,
      anonymousVisitorId: ev.anonymousVisitorId || null,
      sessionId: ev.sessionId || null,
      orderId: ev.orderId || null,
      channel: channel as any,
      sourcePage: ev.sourcePage || null,
      sourceSection: ev.sourceSection || null,
      referrer: ev.referrer || null,
      deviceType: ev.deviceType || null,
      country: ev.country || null,
      metadata: ev.metadata || undefined,
      dedupeKey: ev.dedupeKey || null,
    });
  }

  // 1. Batch insert raw interaction events
  if (rawEventsToCreate.length > 0) {
    try {
      await prisma.productInteractionEvent.createMany({
        data: rawEventsToCreate,
      });
    } catch (err: any) {
      console.warn("[AggregationService] Failed to persist raw interaction events:", err.message);
    }
  }

  // 2. Atomic upsert to ListingDailyMetric
  for (const item of listingIncrements.values()) {
    try {
      const incrementObj: Record<string, { increment: number }> = {};
      const initialData: Record<string, any> = {
        marketplaceListingId: item.listingId,
        productId: item.productId,
        companyId: item.companyId,
        date: item.date,
        channel: item.channel as any,
      };

      for (const [f, val] of Object.entries(item.increments)) {
        incrementObj[f] = { increment: val };
        initialData[f] = val;
      }

      await prisma.listingDailyMetric.upsert({
        where: {
          marketplaceListingId_date_channel: {
            marketplaceListingId: item.listingId,
            date: item.date,
            channel: item.channel as any,
          },
        },
        create: initialData as any,
        update: incrementObj as any,
      });
    } catch (err: any) {
      console.warn(`[AggregationService] Error upserting ListingDailyMetric for ${item.listingId}:`, err.message);
    }
  }

  // 3. Atomic upsert to StoreDailyMetric
  for (const item of storeIncrements.values()) {
    try {
      const incrementObj: Record<string, { increment: number }> = {};
      const initialData: Record<string, any> = {
        companyId: item.companyId,
        date: item.date,
        channel: item.channel as any,
      };

      for (const [f, val] of Object.entries(item.increments)) {
        incrementObj[f] = { increment: val };
        initialData[f] = val;
      }

      await prisma.storeDailyMetric.upsert({
        where: {
          companyId_date_channel: {
            companyId: item.companyId,
            date: item.date,
            channel: item.channel as any,
          },
        },
        create: initialData as any,
        update: incrementObj as any,
      });
    } catch (err: any) {
      console.warn(`[AggregationService] Error upserting StoreDailyMetric for ${item.companyId}:`, err.message);
    }
  }

  // 4. Atomic upsert to GhubaDailyMetric
  for (const item of ghubaIncrements.values()) {
    try {
      const incrementObj: Record<string, { increment: number }> = {};
      const initialData: Record<string, any> = {
        date: item.date,
        channel: item.channel as any,
      };

      for (const [f, val] of Object.entries(item.increments)) {
        incrementObj[f] = { increment: val };
        initialData[f] = val;
      }

      await prisma.ghubaDailyMetric.upsert({
        where: {
          date_channel: {
            date: item.date,
            channel: item.channel as any,
          },
        },
        create: initialData as any,
        update: incrementObj as any,
      });
    } catch (err: any) {
      console.warn(`[AggregationService] Error upserting GhubaDailyMetric for ${item.date}:`, err.message);
    }
  }

  return {
    processed: events.length,
    aggregated: listingIncrements.size + storeIncrements.size + ghubaIncrements.size,
  };
}

function mapEventTypeToMetricField(eventType: string): string | null {
  switch (eventType) {
    case "PRODUCT_IMPRESSION":
      return "impressions";
    case "PRODUCT_VIEW":
    case "PRODUCT_DETAIL_OPEN":
      return "views";
    case "PRODUCT_CARD_CLICK":
      return "cardClicks";
    case "PRODUCT_LIKE":
      return "likes";
    case "PRODUCT_WISHLIST_ADD":
      return "wishlistAdds";
    case "PRODUCT_COMMENT_CREATE":
    case "PRODUCT_COMMENT_REPLY":
      return "comments";
    case "PRODUCT_SHARE":
      return "shares";
    case "PRODUCT_SAVE":
      return "saves";
    case "PRODUCT_ADD_TO_CART":
      return "addToCarts";
    case "CHECKOUT_STARTED":
      return "checkoutStarts";
    case "ORDER_CREATED":
      return "orders";
    case "ORDER_PAID":
      return "paidOrders";
    default:
      return null;
  }
}
