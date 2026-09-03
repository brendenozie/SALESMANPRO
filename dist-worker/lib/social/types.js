"use strict";
/**
 * lib/social/types.ts
 *
 * Core TypeScript contracts, enums, and data transfer objects for
 * the SalesmanPro AI Social Media & Content Marketing Platform.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_LIMITS = exports.CONTENT_PILLARS = exports.SocialApprovalMode = exports.SocialCampaignStatus = exports.SocialContentType = exports.SocialPostStatus = exports.SocialAccountStatus = exports.SocialPlatform = void 0;
const client_1 = require("@prisma/client");
Object.defineProperty(exports, "SocialPlatform", { enumerable: true, get: function () { return client_1.SocialPlatform; } });
Object.defineProperty(exports, "SocialAccountStatus", { enumerable: true, get: function () { return client_1.SocialAccountStatus; } });
Object.defineProperty(exports, "SocialPostStatus", { enumerable: true, get: function () { return client_1.SocialPostStatus; } });
Object.defineProperty(exports, "SocialContentType", { enumerable: true, get: function () { return client_1.SocialContentType; } });
Object.defineProperty(exports, "SocialCampaignStatus", { enumerable: true, get: function () { return client_1.SocialCampaignStatus; } });
Object.defineProperty(exports, "SocialApprovalMode", { enumerable: true, get: function () { return client_1.SocialApprovalMode; } });
exports.CONTENT_PILLARS = [
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
exports.PLATFORM_LIMITS = {
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
};
