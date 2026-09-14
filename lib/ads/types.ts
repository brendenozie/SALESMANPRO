/**
 * lib/ads/types.ts
 *
 * Unified Advertising Domain Types & Interfaces.
 * Covers Store, Ghuba Marketplace, SalesmanPro Platform, and Sponsored Content.
 */

export enum AdvertiserType {
  STORE_ADVERTISER = "STORE_ADVERTISER",
  GHUBA_ADVERTISER = "GHUBA_ADVERTISER",
  SALESMANPRO_ADVERTISER = "SALESMANPRO_ADVERTISER",
  PLATFORM_SPONSORED = "PLATFORM_SPONSORED",
}

export enum AdCampaignStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export enum AdObjective {
  AWARENESS = "AWARENESS",
  TRAFFIC = "TRAFFIC",
  PRODUCT_SALES = "PRODUCT_SALES",
  LEAD_GENERATION = "LEAD_GENERATION",
  STORE_ACQUISITION = "STORE_ACQUISITION",
  SELLER_ACQUISITION = "SELLER_ACQUISITION",
  BUYER_ACQUISITION = "BUYER_ACQUISITION",
}

export enum AdBiddingStrategy {
  CPM = "CPM", // Cost per 1000 impressions
  CPC = "CPC", // Cost per click
  FLAT_DAILY = "FLAT_DAILY", // Fixed daily rate
}

export enum AdCreativeType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  TEXT = "TEXT",
  CAROUSEL = "CAROUSEL",
  NATIVE_LISTING = "NATIVE_LISTING",
}

export enum AdEventType {
  IMPRESSION = "IMPRESSION",
  CLICK = "CLICK",
  CONVERSION = "CONVERSION",
}

export enum AdTransactionType {
  AD_BUDGET_ADDED = "AD_BUDGET_ADDED",
  AD_SPEND = "AD_SPEND",
  AD_REFUND = "AD_REFUND",
  AD_ADJUSTMENT = "AD_ADJUSTMENT",
  AD_RESERVATION = "AD_RESERVATION",
  AD_RELEASE = "AD_RELEASE",
}

export interface AdTargetingRules {
  categories?: string[];
  subcategories?: string[];
  locations?: string[]; // e.g. ["Nairobi", "Mombasa"]
  keywords?: string[];
  deviceTypes?: ("MOBILE" | "DESKTOP" | "TABLET")[];
  minOrderValueKES?: number;
}

export interface AdCampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spendKES: number;
  ctr: number; // Click-through rate %
  cpc: number; // Avg cost per click KES
  cpm: number; // Avg cost per mille KES
  attributedRevenueKES: number;
  roas: number; // Return on ad spend (attributedRevenue / spendKES)
}

export interface CreateCampaignDTO {
  companyId?: string;
  name: string;
  advertiserType?: AdvertiserType;
  level?: "STORE" | "GHUBA" | "PLATFORM";
  objective?: AdObjective;
  currency?: string;
  totalBudgetKES: number;
  dailyBudgetKES: number;
  biddingStrategy?: AdBiddingStrategy;
  bidAmountKES?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  targetAudience?: string;
  targetingRules?: AdTargetingRules;
  listingId?: string;
  productId?: string;
  creatives?: Array<{
    type: AdCreativeType;
    title: string;
    headline?: string;
    body?: string;
    ctaText?: string;
    ctaUrl?: string;
    mediaUrl?: string;
    thumbnailUrl?: string;
    aspectRatio?: string;
    variantTag?: string;
  }>;
}

export interface AdServingRequest {
  placementCode: string;
  category?: string;
  location?: string;
  searchQuery?: string;
  viewerSessionId?: string;
  limit?: number;
}

export interface ServedAdItem {
  campaignId: string;
  creativeId?: string;
  advertiserType: AdvertiserType;
  placementCode: string;
  type: AdCreativeType;
  title: string;
  headline?: string;
  body?: string;
  ctaText: string;
  ctaUrl: string;
  mediaUrl?: string;
  isSponsored: boolean;
  listing?: {
    id: string;
    name: string;
    sellingPrice: number;
    finalPrice?: number | null;
    images: string[];
    isFeatured: boolean;
  };
  product?: {
    id: string;
    name: string;
    sellingPrice: number;
    images: string[];
  };
  trackingPayload: {
    campaignId: string;
    creativeId?: string;
    placementCode: string;
    costKES: number;
  };
}
