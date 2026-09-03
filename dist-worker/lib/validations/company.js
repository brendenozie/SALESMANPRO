"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companySchema = exports.companyAddressSchema = void 0;
const zod_1 = require("zod");
// Schemas for nested JSON fields or related models
const socialLinkSchema = zod_1.z.object({
    channel: zod_1.z
        .enum(["TWITTER", "FACEBOOK", "INSTAGRAM", "LINKEDIN", "YOUTUBE", "TIKTOK"])
        .default("TWITTER")
        .nullable()
        .optional()
        .or(zod_1.z.literal("")),
    url: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")), //.url("Invalid URL format"),
});
const policySchema = zod_1.z.object({
    type: zod_1.z
        .enum([
        "SHIPPING",
        "RETURNS",
        "PRIVACY",
        "TERMS",
        "CANCELLATION",
        "CONFIDENTIALITY",
    ])
        .default("PRIVACY")
        .nullable()
        .optional()
        .or(zod_1.z.literal("")),
    title: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    content: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
});
const faqSchema = zod_1.z.object({
    question: zod_1.z.string().min(1, "Question cannot be empty"),
    answer: zod_1.z.string().min(1, "Answer cannot be empty"),
    order: zod_1.z.number().optional(),
});
const testimonialSchema = zod_1.z.object({
    quote: zod_1.z.string().min(1),
    authorName: zod_1.z.string().min(1).nullable().optional(),
    authorTitle: zod_1.z.string().nullable().optional(),
    avatarUrl: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    rating: zod_1.z.number().min(1).max(5).nullable().optional(),
    order: zod_1.z.number().optional(),
});
const heroSlideSchema = zod_1.z.object({
    imageUrl: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    productImageUrl: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    headline: zod_1.z.string().nullable().optional(),
    subline: zod_1.z.string().nullable().optional(),
    ctaText: zod_1.z.string().nullable().optional(),
    ctaLink: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    badgeText: zod_1.z.string().nullable().optional(),
    videoLink: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    price: zod_1.z.string().nullable().optional(),
    endsAt: zod_1.z.string().datetime().optional().nullable(),
    order: zod_1.z.number().default(0),
});
const promotionSchema = zod_1.z.object({
    title: zod_1.z.string().nullable().optional(),
    code: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
    startsAt: zod_1.z.string().optional().nullable(),
    endsAt: zod_1.z.string().optional().nullable(),
    ctaText: zod_1.z.string().nullable().optional(),
    ctaLink: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    bannerUrl: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    backgroundColor: zod_1.z.string().nullable().optional(),
    textColor: zod_1.z.string().nullable().optional(),
    badgeText: zod_1.z.string().nullable().optional(),
    price: zod_1.z.string().nullable().optional(),
    // New fields for richer site promotion
    featureImage1: zod_1.z.string().nullable().optional(),
    featureImage2: zod_1.z.string().nullable().optional(),
    featureImage3: zod_1.z.string().nullable().optional(),
    perks: zod_1.z
        .array(zod_1.z.object({
        icon: zod_1.z.string(),
        label: zod_1.z.string(),
    }))
        .nullable()
        .optional(),
    trustLogos: zod_1.z
        .array(zod_1.z.object({
        // id: z.string(),
        url: zod_1.z.string(),
    }))
        .nullable()
        .optional(),
    themePrimary: zod_1.z.string().nullable().optional(),
    themeSecondary: zod_1.z.string().nullable().optional(),
});
const companyLocationSchema = zod_1.z.object({
    locationId: zod_1.z.string(),
    companyId: zod_1.z.string().nullable().optional(),
    displayName: zod_1.z.string().nullable().optional(),
    addressLine1Override: zod_1.z.string().nullable().optional(),
    addressLine2Override: zod_1.z.string().nullable().optional(),
    cityOverride: zod_1.z.string().nullable().optional(),
    stateOverride: zod_1.z.string().nullable().optional(),
    postalCodeOverride: zod_1.z.string().nullable().optional(),
    countryOverride: zod_1.z.string().nullable().optional(),
    latitudeOverride: zod_1.z.number().nullable().optional(),
    longitudeOverride: zod_1.z.number().nullable().optional(),
    sortOrder: zod_1.z.number().nullable().optional(),
    visible: zod_1.z.boolean().nullable().optional(),
});
// const storeCategorySchema = z.object({
//     id: z.string(), // This is the categoryId
//     displayName: z.string().optional(),
//     icon: z.string().optional(),
//     categoryId: z.string().optional(),
//     sortOrder: z.number().optional(),
//     visible: z.boolean().optional(),
//     subcategories: z.any().optional(), // For JSON fields, z.any() is a safe default
//     allBrands: z.any().optional(), // For JSON fields, z.any() is a safe default
// });
const storeCategorySchema = zod_1.z.object({
    categoryId: zod_1.z.string(),
    displayName: zod_1.z.string().optional(),
    icon: zod_1.z.string().optional(),
    image: zod_1.z.string().optional().nullable(),
    sortOrder: zod_1.z.number().optional(),
    visible: zod_1.z.boolean().optional(),
    subcategories: zod_1.z.any().optional(),
    allBrands: zod_1.z.any().optional(),
});
exports.companyAddressSchema = zod_1.z.object({
    id: zod_1.z.string().nullable().optional(),
    companyId: zod_1.z.string().optional(),
    isMain: zod_1.z.boolean().default(false),
    address: zod_1.z.string().optional(),
    lat: zod_1.z.number().nullable().optional(),
    lng: zod_1.z.number().nullable().optional(),
    contactName: zod_1.z
        .string()
        .min(1, "Contact name is required")
        .nullable()
        .optional(),
    contactPhone: zod_1.z
        .string()
        .min(1, "Contact phone is required")
        .nullable()
        .optional(),
    contactEmail: zod_1.z.string().email("Invalid email address").nullable().optional(),
    label: zod_1.z.string().min(1, "Label is required").nullable().optional(),
    instructions: zod_1.z.string().nullable().optional(),
});
// --- Main Schema for Company Creation/Update ---
exports.companySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Company name must be at least 2 characters"),
    slug: zod_1.z
        .string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    domain: zod_1.z.string().optional(),
    tagline: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1),
    variant: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().optional().or(zod_1.z.literal("")),
    bannerUrl: zod_1.z.string().optional().or(zod_1.z.literal("")),
    videoUrl: zod_1.z.string().optional().or(zod_1.z.literal("")),
    contactEmail: zod_1.z.string().email(),
    contactPhone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    hasWebsite: zod_1.z.boolean().optional(),
    currency: zod_1.z.string().optional(),
    locale: zod_1.z.string().optional(),
    // -- JSON fields --
    geoLocation: zod_1.z
        .object({ lat: zod_1.z.number(), lng: zod_1.z.number() })
        .nullable()
        .optional(),
    openingHours: zod_1.z.any().optional(),
    themeSettings: zod_1.z.any().optional(),
    awards: zod_1.z.any().optional(),
    metrics: zod_1.z.any().optional(),
    stats: zod_1.z.any().optional(),
    pricingTiers: zod_1.z.any().optional(),
    // -- Relational fields --
    socialLinks: zod_1.z.array(socialLinkSchema).nullable().optional(),
    policies: zod_1.z.array(policySchema).nullable().optional(),
    faqs: zod_1.z.array(faqSchema).nullable().optional(),
    testimonials: zod_1.z.array(testimonialSchema).nullable().optional(),
    heroSlides: zod_1.z.array(heroSlideSchema).nullable().optional(),
    promotions: zod_1.z.array(promotionSchema).nullable().optional(),
    // -- These are arrays in the schema --
    seo: zod_1.z
        .object({
        title: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        keywords: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .nullable()
        .optional(),
    analyticsConfig: zod_1.z
        .object({
        // id: z.string().optional(),
        // companyId: z.string().optional(),
        googleAnalyticsId: zod_1.z.string().nullable().optional(),
        googleAdsId: zod_1.z.string().nullable().optional(),
        facebookPixelId: zod_1.z.string().nullable().optional(),
        tiktokPixelId: zod_1.z.string().nullable().optional(),
        hotjarSiteId: zod_1.z.string().nullable().optional(),
        isActive: zod_1.z.boolean().default(false),
    })
        .nullable()
        .optional(),
    paymentSettings: zod_1.z
        .object({
        // Primary Key (Needed for updates, as discussed in the previous step)
        id: zod_1.z.string().optional(),
        // --- Payment Method Enablement Flags ---
        isStripeEnabled: zod_1.z.boolean().nullable().optional(),
        isPaypalEnabled: zod_1.z.boolean().nullable().optional(),
        isMpesaEnabled: zod_1.z.boolean().nullable().optional(),
        isPaystackEnabled: zod_1.z.boolean().nullable().optional(),
        isGhubaEnabled: zod_1.z.boolean().nullable().optional(),
        // --- Stripe Configuration ---
        // stripeKey: z.string().nullable().optional(),
        // --- PayPal Configuration ---
        // paypalKey: z.string().nullable().optional(),
        // --- M-Pesa Configuration ---
        mpesaShortcode: zod_1.z.string().nullable().optional(),
        mpesaConsumerKey: zod_1.z.string().nullable().optional(),
        mpesaConsumerSecret: zod_1.z.string().nullable().optional(),
        mpesaCallbackUrl: zod_1.z.string().nullable().optional(),
        // --- Paystack Configuration (NEW) ---
        paystackPublicKey: zod_1.z.string().nullable().optional(),
        paystackSecretKey: zod_1.z.string().nullable().optional(),
        // --- Ghuba Configuration (NEW) ---
        ghubaMerchantId: zod_1.z.string().nullable().optional(),
        ghubaApiKey: zod_1.z.string().nullable().optional(),
        // --- Stripe Configuration ---
        stripePublishableKey: zod_1.z.string().nullable().optional(),
        stripeSecretKey: zod_1.z.string().nullable().optional(),
        paypalClientId: zod_1.z.string().nullable().optional(),
        paypalClientSecret: zod_1.z.string().nullable().optional(),
        // --- Encryption fields ---
        mpesaSecret_encrypted: zod_1.z.string().nullable().optional(),
        mpesaSecret_iv: zod_1.z.string().nullable().optional(),
        mpesaSecret_tag: zod_1.z.string().nullable().optional(),
        stripeSecret_encrypted: zod_1.z.string().nullable().optional(),
        stripeSecret_iv: zod_1.z.string().nullable().optional(),
        stripeSecret_tag: zod_1.z.string().nullable().optional(),
        paypalSecret_encrypted: zod_1.z.string().nullable().optional(),
        paypalSecret_iv: zod_1.z.string().nullable().optional(),
        paypalSecret_tag: zod_1.z.string().nullable().optional(),
        paystackSecret_encrypted: zod_1.z.string().nullable().optional(),
        paystackSecret_iv: zod_1.z.string().nullable().optional(),
        paystackSecret_tag: zod_1.z.string().nullable().optional(),
        ghubaSecret_encrypted: zod_1.z.string().nullable().optional(),
        ghubaSecret_iv: zod_1.z.string().nullable().optional(),
        ghubaSecret_tag: zod_1.z.string().nullable().optional(),
    })
        .nullable()
        .optional(),
    shippingSettings: zod_1.z
        .object({
        carrierName: zod_1.z.string().nullable().optional(),
        trackingUrl: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
        regions: zod_1.z.any().nullable().optional(),
        enablePickup: zod_1.z.boolean().nullable().optional(),
        pickupInstructions: zod_1.z.string().nullable().optional(),
        standardRate: zod_1.z.number().nullable().optional(),
        expressRate: zod_1.z.number().nullable().optional(),
    })
        .nullable()
        .optional(),
    // -- Many-to-Many through explicit join table --
    StoreCategory: zod_1.z.array(storeCategorySchema).nullable().optional(),
    CompanyLocation: zod_1.z.array(companyLocationSchema).nullable().optional(),
    addresses: zod_1.z.array(exports.companyAddressSchema).nullable().optional(),
    founderName: zod_1.z
        .string()
        .min(2)
        .max(100)
        .nullable()
        .optional()
        .or(zod_1.z.literal("")),
    founderQuote: zod_1.z.string().max(500).nullable().optional().or(zod_1.z.literal("")),
    founderImage: zod_1.z.string().nullable().optional().or(zod_1.z.literal("")),
    partnerLogos: zod_1.z
        .array(zod_1.z.object({
        url: zod_1.z.string().optional(),
        altText: zod_1.z.string().max(100).optional(),
    }))
        .nullable()
        .optional(),
    sectionSubtitle: zod_1.z.string().max(150).nullable().optional().or(zod_1.z.literal("")),
    sectionTitle: zod_1.z.string().max(100).nullable().optional().or(zod_1.z.literal("")),
    sectionDescription: zod_1.z
        .string()
        .max(500)
        .nullable()
        .optional()
        .or(zod_1.z.literal("")),
});
