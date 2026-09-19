"use strict";
/**
 * lib/analytics/aggregationService.ts
 *
 * Core service for aggregating interaction events into precomputed daily metrics
 * and persisting raw telemetry for audit and conversion funnel analysis.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTelemetryBatch = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
function getISODate(date = new Date()) {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
}
/**
 * In-memory cache for fast listing -> (companyId, productId) resolution
 * to avoid repetitive DB queries during high event throughput.
 */
const listingMetadataCache = new Map();
async function getListingMetadata(listingId) {
    const now = Date.now();
    const cached = listingMetadataCache.get(listingId);
    if (cached && cached.expires > now) {
        return cached;
    }
    try {
        const listing = await prismadb_1.default.marketplaceListings.findUnique({
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
    }
    catch {
        return { companyId: null, productId: null, expires: now };
    }
}
/**
 * Processes a batch of telemetry events asynchronously.
 */
async function processTelemetryBatch(events) {
    if (!events || events.length === 0) {
        return { processed: 0, aggregated: 0 };
    }
    const today = getISODate();
    const rawEventsToCreate = [];
    // Group events by (listingId, date, channel) and (companyId, date, channel)
    const listingIncrements = new Map();
    const storeIncrements = new Map();
    const ghubaIncrements = new Map();
    const blogIncrements = new Map();
    const podcastIncrements = new Map();
    for (const ev of events) {
        if (!ev.eventType)
            continue;
        let listingId = ev.marketplaceListingId;
        let productId = ev.productId;
        let companyId = ev.companyId;
        const channel = ev.channel || "GHUBA";
        // Auto-resolve ownership if missing and listingId is present
        if (listingId && (!companyId || !productId)) {
            const meta = await getListingMetadata(listingId);
            if (meta.companyId && !companyId)
                companyId = meta.companyId;
            if (meta.productId && !productId)
                productId = meta.productId;
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
        // Accumulate BlogDailyMetric
        if (ev.blogId && companyId) {
            const blogField = mapBlogEventType(ev.eventType);
            if (blogField) {
                const key = `${ev.blogId}_${today}_${channel}`;
                let item = blogIncrements.get(key);
                if (!item) {
                    item = { blogId: ev.blogId, companyId, date: today, channel, increments: {} };
                    blogIncrements.set(key, item);
                }
                item.increments[blogField] = (item.increments[blogField] || 0) + 1;
                if (ev.eventType === "BLOG_PURCHASE" && ev.metadata?.amount) {
                    item.increments["revenue"] = (item.increments["revenue"] || 0) + Number(ev.metadata.amount);
                }
            }
        }
        // Accumulate PodcastDailyMetric
        if (ev.podcastId && companyId) {
            const podcastField = mapPodcastEventType(ev.eventType);
            if (podcastField) {
                const key = `${ev.podcastId}_${today}_${channel}`;
                let item = podcastIncrements.get(key);
                if (!item) {
                    item = { podcastId: ev.podcastId, companyId, date: today, channel, increments: {} };
                    podcastIncrements.set(key, item);
                }
                item.increments[podcastField] = (item.increments[podcastField] || 0) + 1;
                if (ev.eventType === "PODCAST_PURCHASE" && ev.metadata?.amount) {
                    item.increments["revenue"] = (item.increments["revenue"] || 0) + Number(ev.metadata.amount);
                }
            }
        }
        // Prepare raw event for persistence (sampling high-volume impressions if needed)
        rawEventsToCreate.push({
            eventType: ev.eventType,
            marketplaceListingId: listingId || null,
            productId: productId || null,
            blogId: ev.blogId || null,
            podcastId: ev.podcastId || null,
            companyId: companyId || null,
            storeId: ev.storeId || null,
            userId: ev.userId || null,
            consumerId: ev.consumerId || null,
            customerId: ev.customerId || null,
            anonymousVisitorId: ev.anonymousVisitorId || null,
            sessionId: ev.sessionId || null,
            orderId: ev.orderId || null,
            channel: channel,
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
            await prismadb_1.default.productInteractionEvent.createMany({
                data: rawEventsToCreate,
            });
        }
        catch (err) {
            console.warn("[AggregationService] Failed to persist raw interaction events:", err.message);
        }
    }
    // 2. Atomic upsert to ListingDailyMetric
    for (const item of listingIncrements.values()) {
        try {
            const incrementObj = {};
            const initialData = {
                marketplaceListingId: item.listingId,
                productId: item.productId,
                companyId: item.companyId,
                date: item.date,
                channel: item.channel,
            };
            for (const [f, val] of Object.entries(item.increments)) {
                incrementObj[f] = { increment: val };
                initialData[f] = val;
            }
            await prismadb_1.default.listingDailyMetric.upsert({
                where: {
                    marketplaceListingId_date_channel: {
                        marketplaceListingId: item.listingId,
                        date: item.date,
                        channel: item.channel,
                    },
                },
                create: initialData,
                update: incrementObj,
            });
        }
        catch (err) {
            console.warn(`[AggregationService] Error upserting ListingDailyMetric for ${item.listingId}:`, err.message);
        }
    }
    // 3. Atomic upsert to StoreDailyMetric
    for (const item of storeIncrements.values()) {
        try {
            const incrementObj = {};
            const initialData = {
                companyId: item.companyId,
                date: item.date,
                channel: item.channel,
            };
            for (const [f, val] of Object.entries(item.increments)) {
                incrementObj[f] = { increment: val };
                initialData[f] = val;
            }
            await prismadb_1.default.storeDailyMetric.upsert({
                where: {
                    companyId_date_channel: {
                        companyId: item.companyId,
                        date: item.date,
                        channel: item.channel,
                    },
                },
                create: initialData,
                update: incrementObj,
            });
        }
        catch (err) {
            console.warn(`[AggregationService] Error upserting StoreDailyMetric for ${item.companyId}:`, err.message);
        }
    }
    // 4. Atomic upsert to GhubaDailyMetric
    for (const item of ghubaIncrements.values()) {
        try {
            const incrementObj = {};
            const initialData = {
                date: item.date,
                channel: item.channel,
            };
            for (const [f, val] of Object.entries(item.increments)) {
                incrementObj[f] = { increment: val };
                initialData[f] = val;
            }
            await prismadb_1.default.ghubaDailyMetric.upsert({
                where: {
                    date_channel: {
                        date: item.date,
                        channel: item.channel,
                    },
                },
                create: initialData,
                update: incrementObj,
            });
        }
        catch (err) {
            console.warn(`[AggregationService] Error upserting GhubaDailyMetric for ${item.date}:`, err.message);
        }
    }
    // 5. Atomic upsert to BlogDailyMetric
    for (const item of blogIncrements.values()) {
        try {
            const incrementObj = {};
            const initialData = {
                blogId: item.blogId,
                companyId: item.companyId,
                date: item.date,
                channel: item.channel,
            };
            for (const [f, val] of Object.entries(item.increments)) {
                incrementObj[f] = { increment: val };
                initialData[f] = val;
            }
            await prismadb_1.default.blogDailyMetric.upsert({
                where: {
                    blogId_date_channel: {
                        blogId: item.blogId,
                        date: item.date,
                        channel: item.channel,
                    },
                },
                create: initialData,
                update: incrementObj,
            });
        }
        catch (err) {
            console.warn(`[AggregationService] Error upserting BlogDailyMetric for ${item.blogId}:`, err.message);
        }
    }
    // 6. Atomic upsert to PodcastDailyMetric
    for (const item of podcastIncrements.values()) {
        try {
            const incrementObj = {};
            const initialData = {
                podcastId: item.podcastId,
                companyId: item.companyId,
                date: item.date,
                channel: item.channel,
            };
            for (const [f, val] of Object.entries(item.increments)) {
                incrementObj[f] = { increment: val };
                initialData[f] = val;
            }
            await prismadb_1.default.podcastDailyMetric.upsert({
                where: {
                    podcastId_date_channel: {
                        podcastId: item.podcastId,
                        date: item.date,
                        channel: item.channel,
                    },
                },
                create: initialData,
                update: incrementObj,
            });
        }
        catch (err) {
            console.warn(`[AggregationService] Error upserting PodcastDailyMetric for ${item.podcastId}:`, err.message);
        }
    }
    return {
        processed: events.length,
        aggregated: listingIncrements.size + storeIncrements.size + ghubaIncrements.size + blogIncrements.size + podcastIncrements.size,
    };
}
exports.processTelemetryBatch = processTelemetryBatch;
function mapBlogEventType(eventType) {
    switch (eventType) {
        case "BLOG_IMPRESSION":
            return "impressions";
        case "BLOG_VIEW":
            return "views";
        case "BLOG_READ":
            return "reads";
        case "BLOG_LIKE":
            return "likes";
        case "BLOG_SHARE":
            return "shares";
        case "BLOG_BOOKMARK":
            return "bookmarks";
        case "BLOG_PAYWALL_VIEW":
            return "paywallViews";
        case "BLOG_PURCHASE":
            return "unlocks";
        default:
            return null;
    }
}
function mapPodcastEventType(eventType) {
    switch (eventType) {
        case "PODCAST_IMPRESSION":
            return "impressions";
        case "PODCAST_PLAY_START":
            return "playStarts";
        case "PODCAST_PLAY_COMPLETE":
            return "completions";
        case "PODCAST_LIKE":
            return "likes";
        case "PODCAST_SHARE":
            return "shares";
        case "PODCAST_BOOKMARK":
            return "bookmarks";
        case "PODCAST_PAYWALL_VIEW":
            return "paywallViews";
        case "PODCAST_PURCHASE":
            return "unlocks";
        default:
            return null;
    }
}
function mapEventTypeToMetricField(eventType) {
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
