"use strict";
/**
 * lib/ads/adTrackingService.ts
 *
 * Authoritative Ad Tracking, Anti-Fraud & Attribution Service.
 * Ingests impression, click, and conversion events with session deduplication,
 * click-fraud mitigation, budget debits, and full conversion attribution.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdTrackingService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("./types");
const adBudgetService_1 = require("./adBudgetService");
class AdTrackingService {
    static recentClicks = new Map();
    /**
     * Track an impression beacon.
     */
    static async trackImpression(params) {
        const { campaignId, creativeId, placementCode, companyId, listingId, productId, viewerSessionId, metadata, } = params;
        const campaign = await prismadb_1.default.adCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign)
            return { success: false, error: "Campaign not found" };
        // Calculate cost if CPM
        let impressionCostKES = 0;
        if (campaign.biddingStrategy === types_1.AdBiddingStrategy.CPM) {
            impressionCostKES = (campaign.bidAmountKES || 50) / 1000;
        }
        // Spend check and debit
        let canRecord = true;
        if (impressionCostKES > 0) {
            const budgetResult = await adBudgetService_1.AdBudgetService.recordEventSpend({
                campaignId,
                costKES: impressionCostKES,
                eventType: "IMPRESSION",
            });
            canRecord = budgetResult.allowed;
        }
        if (!canRecord) {
            return { success: false, error: "Campaign budget exhausted" };
        }
        // Record Event
        await prismadb_1.default.adEvent.create({
            data: {
                type: types_1.AdEventType.IMPRESSION,
                campaignId,
                adCreativeId: creativeId || null,
                placementCode,
                companyId: companyId || campaign.companyId || null,
                listingId: listingId || campaign.listingId || null,
                productId: productId || campaign.productId || null,
                viewerSessionId: viewerSessionId || null,
                costKES: impressionCostKES,
                metadata: metadata || {},
            },
        });
        // Update Creative counts
        if (creativeId) {
            await prismadb_1.default.adCreative.update({
                where: { id: creativeId },
                data: { impressions: { increment: 1 } },
            }).catch(() => { });
        }
        // Refresh Campaign metrics cache
        await this.refreshCampaignMetrics(campaignId);
        return { success: true, recordedCostKES: impressionCostKES };
    }
    /**
     * Track a click with anti-fraud deduplication.
     */
    static async trackClick(params) {
        const { campaignId, creativeId, placementCode, companyId, listingId, productId, viewerSessionId, metadata, } = params;
        // 1. Anti-fraud session throttling: reject duplicate clicks within 15 seconds
        const dedupeKey = `${viewerSessionId || "anon"}:${campaignId}:${placementCode}`;
        const now = Date.now();
        const lastClickTime = this.recentClicks.get(dedupeKey);
        if (lastClickTime && now - lastClickTime < 15000) {
            return {
                success: true,
                throttled: true,
                message: "Duplicate click throttled for fraud prevention.",
            };
        }
        this.recentClicks.set(dedupeKey, now);
        // Keep cache size bounded
        if (this.recentClicks.size > 50000) {
            this.recentClicks.clear();
        }
        const campaign = await prismadb_1.default.adCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign)
            return { success: false, error: "Campaign not found" };
        // Calculate cost if CPC
        let clickCostKES = 0;
        if (campaign.biddingStrategy === types_1.AdBiddingStrategy.CPC) {
            clickCostKES = campaign.bidAmountKES || 5.0;
        }
        // Spend check and debit
        let canRecord = true;
        if (clickCostKES > 0) {
            const budgetResult = await adBudgetService_1.AdBudgetService.recordEventSpend({
                campaignId,
                costKES: clickCostKES,
                eventType: "CLICK",
            });
            canRecord = budgetResult.allowed;
        }
        if (!canRecord) {
            return { success: false, error: "Campaign budget exhausted" };
        }
        // Record Event
        await prismadb_1.default.adEvent.create({
            data: {
                type: types_1.AdEventType.CLICK,
                campaignId,
                adCreativeId: creativeId || null,
                placementCode,
                companyId: companyId || campaign.companyId || null,
                listingId: listingId || campaign.listingId || null,
                productId: productId || campaign.productId || null,
                viewerSessionId: viewerSessionId || null,
                costKES: clickCostKES,
                metadata: metadata || {},
            },
        });
        // Update Creative counts
        if (creativeId) {
            await prismadb_1.default.adCreative.update({
                where: { id: creativeId },
                data: { clicks: { increment: 1 } },
            }).catch(() => { });
        }
        // Refresh Campaign metrics cache
        await this.refreshCampaignMetrics(campaignId);
        return { success: true, recordedCostKES: clickCostKES };
    }
    /**
     * Track a commercial conversion (Order, Inquiry, Signup, Booking) attributed to an ad.
     */
    static async trackConversion(params) {
        const { campaignId, creativeId, placementCode = "DIRECT_CONVERSION", conversionValueKES = 0, orderId, viewerSessionId, metadata, } = params;
        const campaign = await prismadb_1.default.adCampaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign)
            return { success: false, error: "Campaign not found" };
        await prismadb_1.default.adEvent.create({
            data: {
                type: types_1.AdEventType.CONVERSION,
                campaignId,
                adCreativeId: creativeId || null,
                placementCode,
                companyId: campaign.companyId || null,
                listingId: campaign.listingId || null,
                productId: campaign.productId || null,
                viewerSessionId: viewerSessionId || null,
                costKES: 0,
                metadata: {
                    conversionValueKES,
                    orderId,
                    ...metadata,
                },
            },
        });
        if (creativeId) {
            await prismadb_1.default.adCreative.update({
                where: { id: creativeId },
                data: { conversions: { increment: 1 } },
            }).catch(() => { });
        }
        await this.refreshCampaignMetrics(campaignId);
        return { success: true, conversionValueKES };
    }
    /**
     * Asynchronously compute and cache performance analytics on AdCampaign.
     */
    static async refreshCampaignMetrics(campaignId) {
        try {
            const events = await prismadb_1.default.adEvent.groupBy({
                by: ["type"],
                where: { campaignId },
                _count: { id: true },
                _sum: { costKES: true },
            });
            let impressions = 0;
            let clicks = 0;
            let conversions = 0;
            let totalCost = 0;
            for (const e of events) {
                if (e.type === types_1.AdEventType.IMPRESSION) {
                    impressions = e._count.id;
                    totalCost += e._sum.costKES || 0;
                }
                else if (e.type === types_1.AdEventType.CLICK) {
                    clicks = e._count.id;
                    totalCost += e._sum.costKES || 0;
                }
                else if (e.type === types_1.AdEventType.CONVERSION) {
                    conversions = e._count.id;
                }
            }
            // Calculate Attributed Revenue
            const conversionEvents = await prismadb_1.default.adEvent.findMany({
                where: { campaignId, type: types_1.AdEventType.CONVERSION },
                select: { metadata: true },
            });
            let attributedRevenueKES = 0;
            for (const ce of conversionEvents) {
                const meta = ce.metadata || {};
                if (meta.conversionValueKES && typeof meta.conversionValueKES === "number") {
                    attributedRevenueKES += meta.conversionValueKES;
                }
            }
            const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
            const cpc = clicks > 0 ? totalCost / clicks : 0;
            const cpm = impressions > 0 ? (totalCost / (impressions / 1000)) : 0;
            const roas = totalCost > 0 ? attributedRevenueKES / totalCost : 0;
            await prismadb_1.default.adCampaign.update({
                where: { id: campaignId },
                data: {
                    metrics: {
                        impressions,
                        clicks,
                        conversions,
                        spendKES: Math.round(totalCost * 100) / 100,
                        ctr: Math.round(ctr * 100) / 100,
                        cpc: Math.round(cpc * 100) / 100,
                        cpm: Math.round(cpm * 100) / 100,
                        attributedRevenueKES: Math.round(attributedRevenueKES * 100) / 100,
                        roas: Math.round(roas * 100) / 100,
                    },
                },
            });
        }
        catch (err) {
            console.warn(`[AD_METRICS_REFRESH_WARN] Failed for campaign ${campaignId}:`, err);
        }
    }
}
exports.AdTrackingService = AdTrackingService;
