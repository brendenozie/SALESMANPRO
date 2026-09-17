"use strict";
/**
 * lib/search/searchAnalyticsService.ts
 *
 * Telemetry, telemetry aggregation, and demand intelligence for search queries.
 * Records search submissions, zero-result searches, and generates admin analytics
 * for both Ghuba marketplace and tenant store administrators.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchAnalyticsService = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const types_1 = require("@/lib/analytics/types");
class SearchAnalyticsService {
    /**
     * Non-blocking asynchronous logging of a search event into ProductInteractionEvent.
     */
    static async logSearchEvent(event) {
        if (!event.query || event.query.trim().length === 0)
            return;
        try {
            const channel = event.scope === "GHUBA" ? types_1.InteractionChannel.GHUBA : types_1.InteractionChannel.STORE;
            await prismadb_1.default.productInteractionEvent.create({
                data: {
                    eventType: types_1.InteractionEventType.SEARCH_IMPRESSION,
                    channel,
                    companyId: event.companyId,
                    userId: event.userId,
                    anonymousVisitorId: event.visitorId,
                    sessionId: event.sessionId,
                    deviceType: event.deviceType,
                    sourcePage: event.sourcePage,
                    metadata: {
                        query: event.query,
                        normalizedQuery: event.normalizedQuery,
                        resultCount: event.resultCount,
                        filters: event.filtersApplied,
                        sort: event.sort,
                        isZeroResult: event.resultCount === 0,
                        scope: event.scope,
                    },
                },
            });
        }
        catch {
            // Telemetry must never throw or impact user request flow
        }
    }
    /**
     * Aggregates search analytics for Ghuba Super Admin or Tenant Admin.
     * If companyId is provided, strictly scopes to that tenant.
     */
    static async getSearchAnalytics(params) {
        const days = Math.min(Math.max(1, params.days || 30), 90);
        const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const where = {
            eventType: types_1.InteractionEventType.SEARCH_IMPRESSION,
            createdAt: { gte: sinceDate },
            ...(params.companyId ? { companyId: params.companyId } : {}),
        };
        // Query recent search events
        const events = await prismadb_1.default.productInteractionEvent.findMany({
            where,
            select: {
                metadata: true,
                createdAt: true,
            },
            take: 2000,
            orderBy: { createdAt: "desc" },
        });
        const queryCounts = new Map();
        const zeroResultCounts = new Map();
        const categoryCounts = new Map();
        let totalSearches = 0;
        let totalZeroResults = 0;
        for (const ev of events) {
            const meta = ev.metadata;
            if (!meta || !meta.query)
                continue;
            const q = String(meta.query).trim().toLowerCase();
            const resCount = Number(meta.resultCount) || 0;
            totalSearches++;
            // Aggregate query frequencies
            const currentQ = queryCounts.get(q) || { count: 0, totalResults: 0 };
            currentQ.count++;
            currentQ.totalResults += resCount;
            queryCounts.set(q, currentQ);
            // Track zero result queries (unmet demand)
            if (resCount === 0) {
                totalZeroResults++;
                const currentZero = zeroResultCounts.get(q) || { count: 0, lastSearched: ev.createdAt };
                currentZero.count++;
                if (ev.createdAt > currentZero.lastSearched) {
                    currentZero.lastSearched = ev.createdAt;
                }
                zeroResultCounts.set(q, currentZero);
            }
            // Track categories filtered during search
            if (meta.filters?.category && Array.isArray(meta.filters.category)) {
                for (const cat of meta.filters.category) {
                    categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
                }
            }
        }
        const topSearches = Array.from(queryCounts.entries())
            .map(([query, data]) => ({
            query,
            count: data.count,
            resultCountAvg: Math.round(data.totalResults / data.count),
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);
        const zeroResultQueries = Array.from(zeroResultCounts.entries())
            .map(([query, data]) => ({
            query,
            count: data.count,
            lastSearched: data.lastSearched.toISOString(),
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);
        const topCategoriesSearched = Array.from(categoryCounts.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        const zeroResultRatePercent = totalSearches > 0 ? Math.round((totalZeroResults / totalSearches) * 100) : 0;
        return {
            periodDays: days,
            totalSearches,
            zeroResultSearches: totalZeroResults,
            zeroResultRatePercent,
            topSearches,
            zeroResultQueries,
            topCategoriesSearched,
        };
    }
}
exports.SearchAnalyticsService = SearchAnalyticsService;
exports.default = SearchAnalyticsService;
