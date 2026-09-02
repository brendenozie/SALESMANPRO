/**
 * lib/social/types.ts
 *
 * Core TypeScript contracts, enums, and data transfer objects for
 * the SalesmanPro AI Social Media & Content Marketing Platform.
 */

import {
  SocialPlatform,
  SocialAccountStatus,
  SocialPostStatus,
  SocialContentType,
  SocialCampaignStatus,
  SocialApprovalMode,
} from "@prisma/client";

export {
  SocialPlatform,
  SocialAccountStatus,
  SocialPostStatus,
  SocialContentType,
  SocialCampaignStatus,
  SocialApprovalMode,
};

// ----------------------------------------------------------------------
// Content Pillars & Categories
// ----------------------------------------------------------------------

export type ContentPillar =
  | "PRODUCT_SHOWCASE"
  | "EDUCATIONAL"
  | "PROBLEM_SOLUTION"
  | "PROMOTIONAL"
  | "SOCIAL_PROOF"
  | "BEHIND_THE_SCENES"
  | "TIPS_ADVICE"
  | "SEASONAL"
  | "NEW_ARRIVALS"
  | "PRODUCT_COMPARISON"
  | "FAQ"
  | "ENGAGEMENT"
  | "BRAND_AWARENESS";

export const CONTENT_PILLARS: Array<{ id: ContentPillar; label: string; description: string }> = [
  {
    id: "PRODUCT_SHOWCASE",
    label: "Product Showcase",
    description: "Spotlight specific products, key features, and tangible benefits.",
  },
  {
    id: "EDUCATIONAL",
    label: "Educational",
    description: "Teach something valuable relevant to your store's industry and domain.",
  },
  {
    id: "PROBLEM_SOLUTION",
    label: "Problem → Solution",
    description: "Highlight a real customer struggle and present your product as the answer.",
  },
  {
    id: "PROMOTIONAL",
    label: "Promotional & Deals",
    description: "Limited-time offers, bundle discounts, clearance, and seasonal sales.",
  },
  {
    id: "SOCIAL_PROOF",
    label: "Social Proof",
    description: "Authentic reviews, user feedback, customer milestones, and case studies.",
  },
  {
    id: "BEHIND_THE_SCENES",
    label: "Behind the Scenes",
    description: "Show the passion, sourcing, unboxing, packaging, and store craft.",
  },
  {
    id: "TIPS_ADVICE",
    label: "Tips & Industry Advice",
    description: "Actionable tips, hacks, and how-to guides customers can use right away.",
  },
  {
    id: "SEASONAL",
    label: "Seasonal & Trending",
    description: "Content themed around holidays, regional events, and current trends.",
  },
  {
    id: "NEW_ARRIVALS",
    label: "New Arrivals & Launches",
    description: "Fresh catalog drops, newly stocked items, and exclusive sneak peeks.",
  },
  {
    id: "PRODUCT_COMPARISON",
    label: "Product Comparison",
    description: "Objective comparison helping customers choose the best option for their needs.",
  },
  {
    id: "FAQ",
    label: "FAQ & Clarity",
    description: "Answers to common objections, shipping times, guarantees, and usage.",
  },
  {
    id: "ENGAGEMENT",
    label: "Engagement & Community",
    description: "Questions, polls, discussions, and conversations to boost algorithm reach.",
  },
  {
    id: "BRAND_AWARENESS",
    label: "Brand Awareness",
    description: "Store mission, values, story, and why customers can trust your brand.",
  },
];

// ----------------------------------------------------------------------
// Store, Product & Audience Contexts for AI Strategy
// ----------------------------------------------------------------------

export interface StoreContext {
  companyId: string;
  name: string;
  slug: string;
  category?: string | null;
  subCategoryName?: string | null;
  description?: string | null;
  tagline?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  storefrontUrl?: string | null;
  brandVoice?: string | null;
  tone?: string | null;
  bannedWords?: string[];
  preferredCtas?: string[];
  preferredLanguage?: string;
}

export interface ProductContext {
  id: string;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  category?: string | null;
  subcategory?: string | null;
  brand?: string | null;
  price?: number | string | null;
  currency?: string;
  availability?: boolean;
  stock?: number | null;
  images?: string[];
  videos?: string[];
  marketplaceUrl?: string | null;
  tags?: string[];
  specifications?: Record<string, string | number>;
}

export interface TargetAudienceContext {
  customerType?: string; // "B2C Shoppers", "B2B Wholesalers", "Parents", "Professionals"
  demographics?: string; // e.g. "Tech enthusiasts 20-40"
  buyerIntent?: "INFORMATIONAL" | "COMPARISON" | "HIGH_INTENT_BUY" | "RETENTION";
  awarenessLevel?: "UNAWARE" | "PROBLEM_AWARE" | "SOLUTION_AWARE" | "PRODUCT_AWARE" | "MOST_AWARE";
  interests?: string[];
  painPoints?: string[];
}

// ----------------------------------------------------------------------
// Platform Adaptation DTO
// ----------------------------------------------------------------------

export interface PlatformContentAdaptation {
  platform: SocialPlatform;
  title?: string;
  caption: string;
  hashtags: string[];
  recommendedMediaType: "IMAGE" | "VIDEO" | "REEL_SHORT" | "CAROUSEL" | "TEXT_ONLY";
  aspectRatio: "1:1" | "9:16" | "16:9" | "4:5";
  characterCount: number;
  hook: string;
  callToAction: string;
  videoScenePlan?: Array<{
    sceneNumber: number;
    durationSeconds: number;
    visualDescription: string;
    narrationOrTextOverlay: string;
  }>;
  audioPrompt?: string;
}

// ----------------------------------------------------------------------
// AI Social Generation Inputs & Outputs
// ----------------------------------------------------------------------

export interface GenerateSocialContentInput {
  companyId: string;
  productId?: string;
  campaignId?: string;
  contentType: SocialContentType;
  targetPlatforms: SocialPlatform[];
  contentPillars?: ContentPillar[];
  topicOrGoal?: string;
  tone?: string;
  targetAudience?: TargetAudienceContext;
  customInstructions?: string;
  includeMediaGeneration?: boolean;
  mediaType?: "IMAGE" | "VIDEO" | "NONE";
}

export interface GenerateSocialContentOutput {
  postId?: string;
  primaryCopy: string;
  hashtags: string[];
  callToAction: string;
  adaptations: Record<SocialPlatform, PlatformContentAdaptation>;
  recommendedBestTime?: {
    dayOfWeek: string;
    hourUtc: number;
    explanation: string;
  };
  generatedMedia?: Array<{
    url: string;
    mediaType: "IMAGE" | "VIDEO";
    mediaAssetId?: string;
  }>;
  creditsConsumed: number;
}

export interface GenerateCampaignInput {
  companyId: string;
  name: string;
  objective: string;
  productId?: string;
  targetPlatforms: SocialPlatform[];
  contentPillars: ContentPillar[];
  durationDays?: number;
  postingFrequency?: "DAILY" | "TWICE_WEEKLY" | "WEEKLY" | "CUSTOM";
  targetAudience?: TargetAudienceContext;
  budget?: number;
}

export interface GenerateCampaignOutput {
  campaignId: string;
  name: string;
  strategySummary: string;
  contentPillars: ContentPillar[];
  scheduleOverview: Array<{
    dayNumber: number;
    platform: SocialPlatform;
    contentType: SocialContentType;
    pillar: ContentPillar;
    title: string;
    hook: string;
    previewCopy: string;
  }>;
  createdPostsCount: number;
  creditsConsumed: number;
}

// ----------------------------------------------------------------------
// Social Platform Adapters Interfaces
// ----------------------------------------------------------------------

export interface OAuthUrlParams {
  state: string;
  redirectUri: string;
  scopes?: string[];
}

export interface OAuthTokenResult {
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds?: number;
  tokenType?: string;
  scopes: string[];
  platformAccountId: string;
  accountName: string;
  username?: string;
  profileImageUrl?: string;
  accountType?: string;
  metadata?: Record<string, unknown>;
}

export interface PublishPostInput {
  content: string;
  title?: string;
  linkUrl?: string;
  mediaUrls?: string[];
  hashtags?: string[];
  aspectRatio?: string;
  platformSpecificOptions?: Record<string, unknown>;
}

export interface PublishPostResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  publishedAt?: Date;
  error?: string;
  rawResponse?: unknown;
}

export interface PlatformMetrics {
  impressions?: number;
  reach?: number;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  engagementRate?: number;
  watchTimeSeconds?: number;
  rawMetrics?: unknown;
}

export interface ISocialPlatformAdapter {
  readonly platform: SocialPlatform;

  getOAuthUrl(params: OAuthUrlParams, config?: any): string;

  exchangeCodeForToken(
    code: string,
    redirectUri: string,
    config?: any
  ): Promise<OAuthTokenResult[]>;

  refreshToken?(
    refreshToken: string,
    config?: any
  ): Promise<Partial<OAuthTokenResult>>;

  publish(
    account: {
      platformAccountId: string;
      accessToken: string;
      metadata?: any;
    },
    input: PublishPostInput
  ): Promise<PublishPostResult>;

  getMetrics?(
    account: {
      platformAccountId: string;
      accessToken: string;
    },
    platformPostId: string
  ): Promise<PlatformMetrics>;
}

export const PLATFORM_LIMITS = {
  FACEBOOK: {
    maxCaptionLength: 63206,
    recommendedCaptionLength: 250,
    maxHashtags: 30,
    supportedMedia: ["IMAGE", "VIDEO"],
  },
  INSTAGRAM: {
    maxCaptionLength: 2200,
    recommendedCaptionLength: 150,
    maxHashtags: 30,
    supportedMedia: ["IMAGE", "VIDEO"],
  },
  TIKTOK: {
    maxCaptionLength: 2200,
    recommendedCaptionLength: 150,
    maxHashtags: 10,
    supportedMedia: ["VIDEO"],
  },
  YOUTUBE: {
    maxTitleLength: 100,
    maxDescriptionLength: 5000,
    maxTags: 500,
    supportedMedia: ["VIDEO"],
  },
} as const;

