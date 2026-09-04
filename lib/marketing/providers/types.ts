/**
 * lib/marketing/providers/types.ts
 *
 * Core TypeScript Contracts for the Unified Marketing Intelligence Layer.
 * Normalizes Meta Ads, Google Ads, Google Analytics 4, and Social Organic.
 */

export enum MarketingProviderType {
  META_ADS = "META_ADS",
  GOOGLE_ADS = "GOOGLE_ADS",
  GOOGLE_ANALYTICS_4 = "GOOGLE_ANALYTICS_4",
  TIKTOK_ADS = "TIKTOK_ADS",
  SOCIAL_ORGANIC = "SOCIAL_ORGANIC",
}

export enum MarketingConnectionStatus {
  CONNECTED = "CONNECTED",
  EXPIRED = "EXPIRED",
  REVOKED = "REVOKED",
  ERROR = "ERROR",
  DISCONNECTED = "DISCONNECTED",
}

export enum AttributionModel {
  LAST_TOUCH = "LAST_TOUCH",
  FIRST_TOUCH = "FIRST_TOUCH",
  LINEAR = "LINEAR",
  PLATFORM_REPORTED = "PLATFORM_REPORTED",
}

export interface NormalizedMarketingMetrics {
  spendKES: number;
  impressions: number;
  reach?: number;
  clicks: number;
  ctr: number; // %
  cpcKES: number;
  cpmKES: number;
  conversions: number;
  conversionRate: number; // %
  revenueKES: number;
  roas: number; // revenueKES / spendKES
  sessions?: number;
  engagementRate?: number; // %
  bounceRate?: number; // %
  followers?: number;
  videoViews?: number;
}

export interface ExternalCampaignSummary {
  externalId: string;
  name: string;
  status: string; // ACTIVE, PAUSED, ARCHIVED, COMPLETED
  objective?: string;
  dailyBudgetKES?: number;
  lifetimeBudgetKES?: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  metrics: NormalizedMarketingMetrics;
}

export interface MarketingProviderCredentials {
  accountId: string; // Ad Account ID or GA4 Property ID
  accessToken?: string;
  refreshToken?: string;
  developerToken?: string;
  customerId?: string; // For Google Ads
  metadata?: Record<string, any>;
}

export interface IMarketingProvider {
  readonly provider: MarketingProviderType;

  testConnection(credentials: MarketingProviderCredentials): Promise<{
    success: boolean;
    accountName?: string;
    accountId?: string;
    error?: string;
  }>;

  fetchCampaigns(credentials: MarketingProviderCredentials): Promise<ExternalCampaignSummary[]>;

  fetchMetrics(
    credentials: MarketingProviderCredentials,
    dateRange?: { start: Date; end: Date }
  ): Promise<NormalizedMarketingMetrics>;

  updateCampaignStatus?(
    credentials: MarketingProviderCredentials,
    campaignId: string,
    status: "ACTIVE" | "PAUSED"
  ): Promise<{ success: boolean; error?: string }>;
}

export interface ChannelPerformanceComparison {
  channel: string;
  provider: MarketingProviderType | "INTERNAL_GHUBA_ADS";
  spendKES: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenueKES: number;
  roas: number;
  costPerConversionKES: number;
}

export interface MarketingHealthDiagnostic {
  score: number; // 0 - 100
  rating: "CRITICAL" | "FAIR" | "GOOD" | "EXCELLENT";
  dimensions: {
    trackingHealth: { score: number; label: string; passed: boolean; note: string };
    advertisingEfficiency: { score: number; label: string; passed: boolean; note: string };
    contentConsistency: { score: number; label: string; passed: boolean; note: string };
    trafficQuality: { score: number; label: string; passed: boolean; note: string };
    conversionHealth: { score: number; label: string; passed: boolean; note: string };
  };
  keyRecommendations: string[];
}

export interface MarketingOpportunitySignal {
  id: string;
  type:
    | "HIGH_TRAFFIC_LOW_CONVERSION"
    | "HIGH_ROAS_LOW_BUDGET"
    | "STRONG_ORGANIC_WEAK_PAID"
    | "HIGH_DEMAND_LOW_INVENTORY"
    | "DISCONNECTED_TRACKING";
  severity: "INFO" | "WARNING" | "CRITICAL" | "HIGH_OPPORTUNITY";
  title: string;
  observation: string; // "What happened"
  explanation: string; // Correlation / attribution diagnosis
  recommendedAction: string; // Action proposal
  potentialYield: string; // e.g. "+35% conversions", "KES 15,000 extra sales"
}
