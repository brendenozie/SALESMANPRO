"use strict";
/**
 * lib/ads/types.ts
 *
 * Unified Advertising Domain Types & Interfaces.
 * Covers Store, Ghuba Marketplace, SalesmanPro Platform, and Sponsored Content.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdTransactionType = exports.AdEventType = exports.AdCreativeType = exports.AdBiddingStrategy = exports.AdObjective = exports.AdCampaignStatus = exports.AdvertiserType = void 0;
var AdvertiserType;
(function (AdvertiserType) {
    AdvertiserType["STORE_ADVERTISER"] = "STORE_ADVERTISER";
    AdvertiserType["GHUBA_ADVERTISER"] = "GHUBA_ADVERTISER";
    AdvertiserType["SALESMANPRO_ADVERTISER"] = "SALESMANPRO_ADVERTISER";
    AdvertiserType["PLATFORM_SPONSORED"] = "PLATFORM_SPONSORED";
})(AdvertiserType = exports.AdvertiserType || (exports.AdvertiserType = {}));
var AdCampaignStatus;
(function (AdCampaignStatus) {
    AdCampaignStatus["DRAFT"] = "DRAFT";
    AdCampaignStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    AdCampaignStatus["APPROVED"] = "APPROVED";
    AdCampaignStatus["SCHEDULED"] = "SCHEDULED";
    AdCampaignStatus["ACTIVE"] = "ACTIVE";
    AdCampaignStatus["PAUSED"] = "PAUSED";
    AdCampaignStatus["COMPLETED"] = "COMPLETED";
    AdCampaignStatus["REJECTED"] = "REJECTED";
    AdCampaignStatus["CANCELLED"] = "CANCELLED";
})(AdCampaignStatus = exports.AdCampaignStatus || (exports.AdCampaignStatus = {}));
var AdObjective;
(function (AdObjective) {
    AdObjective["AWARENESS"] = "AWARENESS";
    AdObjective["TRAFFIC"] = "TRAFFIC";
    AdObjective["PRODUCT_SALES"] = "PRODUCT_SALES";
    AdObjective["LEAD_GENERATION"] = "LEAD_GENERATION";
    AdObjective["STORE_ACQUISITION"] = "STORE_ACQUISITION";
    AdObjective["SELLER_ACQUISITION"] = "SELLER_ACQUISITION";
    AdObjective["BUYER_ACQUISITION"] = "BUYER_ACQUISITION";
})(AdObjective = exports.AdObjective || (exports.AdObjective = {}));
var AdBiddingStrategy;
(function (AdBiddingStrategy) {
    AdBiddingStrategy["CPM"] = "CPM";
    AdBiddingStrategy["CPC"] = "CPC";
    AdBiddingStrategy["FLAT_DAILY"] = "FLAT_DAILY";
})(AdBiddingStrategy = exports.AdBiddingStrategy || (exports.AdBiddingStrategy = {}));
var AdCreativeType;
(function (AdCreativeType) {
    AdCreativeType["IMAGE"] = "IMAGE";
    AdCreativeType["VIDEO"] = "VIDEO";
    AdCreativeType["TEXT"] = "TEXT";
    AdCreativeType["CAROUSEL"] = "CAROUSEL";
    AdCreativeType["NATIVE_LISTING"] = "NATIVE_LISTING";
})(AdCreativeType = exports.AdCreativeType || (exports.AdCreativeType = {}));
var AdEventType;
(function (AdEventType) {
    AdEventType["IMPRESSION"] = "IMPRESSION";
    AdEventType["CLICK"] = "CLICK";
    AdEventType["CONVERSION"] = "CONVERSION";
})(AdEventType = exports.AdEventType || (exports.AdEventType = {}));
var AdTransactionType;
(function (AdTransactionType) {
    AdTransactionType["AD_BUDGET_ADDED"] = "AD_BUDGET_ADDED";
    AdTransactionType["AD_SPEND"] = "AD_SPEND";
    AdTransactionType["AD_REFUND"] = "AD_REFUND";
    AdTransactionType["AD_ADJUSTMENT"] = "AD_ADJUSTMENT";
    AdTransactionType["AD_RESERVATION"] = "AD_RESERVATION";
    AdTransactionType["AD_RELEASE"] = "AD_RELEASE";
})(AdTransactionType = exports.AdTransactionType || (exports.AdTransactionType = {}));
