"use strict";
/**
 * lib/marketing/providers/types.ts
 *
 * Core TypeScript Contracts for the Unified Marketing Intelligence Layer.
 * Normalizes Meta Ads, Google Ads, Google Analytics 4, and Social Organic.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributionModel = exports.MarketingConnectionStatus = exports.MarketingProviderType = void 0;
var MarketingProviderType;
(function (MarketingProviderType) {
    MarketingProviderType["META_ADS"] = "META_ADS";
    MarketingProviderType["GOOGLE_ADS"] = "GOOGLE_ADS";
    MarketingProviderType["GOOGLE_ANALYTICS_4"] = "GOOGLE_ANALYTICS_4";
    MarketingProviderType["TIKTOK_ADS"] = "TIKTOK_ADS";
    MarketingProviderType["SOCIAL_ORGANIC"] = "SOCIAL_ORGANIC";
})(MarketingProviderType = exports.MarketingProviderType || (exports.MarketingProviderType = {}));
var MarketingConnectionStatus;
(function (MarketingConnectionStatus) {
    MarketingConnectionStatus["CONNECTED"] = "CONNECTED";
    MarketingConnectionStatus["EXPIRED"] = "EXPIRED";
    MarketingConnectionStatus["REVOKED"] = "REVOKED";
    MarketingConnectionStatus["ERROR"] = "ERROR";
    MarketingConnectionStatus["DISCONNECTED"] = "DISCONNECTED";
})(MarketingConnectionStatus = exports.MarketingConnectionStatus || (exports.MarketingConnectionStatus = {}));
var AttributionModel;
(function (AttributionModel) {
    AttributionModel["LAST_TOUCH"] = "LAST_TOUCH";
    AttributionModel["FIRST_TOUCH"] = "FIRST_TOUCH";
    AttributionModel["LINEAR"] = "LINEAR";
    AttributionModel["PLATFORM_REPORTED"] = "PLATFORM_REPORTED";
})(AttributionModel = exports.AttributionModel || (exports.AttributionModel = {}));
