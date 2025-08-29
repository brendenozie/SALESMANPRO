import { z } from "zod";

// Schemas for nested JSON fields or related models
const socialLinkSchema = z.object({
  channel: z.enum(["TWITTER", "FACEBOOK", "INSTAGRAM", "LINKEDIN"]),
  url: z.string(),//.url("Invalid URL format"),
});

const policySchema = z.object({
  type: z.enum(["SHIPPING", "RETURNS", "PRIVACY", "TERMS"]),
  title: z.string().optional(),
  content: z.string().min(1, "Policy content cannot be empty"),
});

const faqSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  answer: z.string().min(1, "Answer cannot be empty"),
  order: z.number().optional(),
});

const testimonialSchema = z.object({
  quote: z.string().min(1),
  authorName: z.string().min(1).nullable().optional(),
  authorTitle: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional().or(z.literal('')),
  rating: z.number().min(1).max(5).nullable().optional(),
  order: z.number().optional(),
});

const heroSlideSchema = z.object({
  imageUrl: z.string().url(),
  productImageUrl: z.string().url().nullable().optional().or(z.literal('')),
  headline: z.string().nullable().optional(),
  subline: z.string().nullable().optional(),
  ctaText: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional().or(z.literal('')),//.url()
  badgeText: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  endsAt: z.string().datetime().optional().nullable(),
  order: z.number().default(0),
});

const promotionSchema = z.object({
    title: z.string().min(1),
    code: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    startsAt: z.string().datetime().optional().nullable(),
    endsAt: z.string().datetime().optional().nullable(),
    ctaText: z.string().nullable().optional(),
    ctaLink: z.string().url().nullable().optional().or(z.literal('')),
    bannerUrl: z.string().url().nullable().optional().or(z.literal('')),
    backgroundColor: z.string().nullable().optional(),
    textColor: z.string().nullable().optional(),

    badgeText: z.string().nullable().optional(),
    price: z.string().nullable().optional(),

    // New fields for richer site promotion
    featureImage1: z.string().nullable().optional(),
    featureImage2: z.string().nullable().optional(),
    featureImage3: z.string().nullable().optional(),

    perks: z.array(z.object({
        icon: z.string(),
        label: z.string(),
    })).nullable().optional(),
    trustLogos: z.array(z.object({
        // id: z.string(),
        url: z.string(),
    })).nullable().optional(),
    themePrimary: z.string().nullable().optional(),
    themeSecondary: z.string().nullable().optional(),

    
});

const companyLocationSchema = z.object({
    locationId: z.string(), // The ID of the base Location model
    displayName: z.string().optional(),
    addressLine1Override: z.string().optional(),
    addressLine2Override: z.string().optional(),
    cityOverride: z.string().optional(),
    stateOverride: z.string().optional(),
    postalCodeOverride: z.string().optional(),
    countryOverride: z.string().optional(),
    latitudeOverride: z.number().optional(),
    longitudeOverride: z.number().optional(),
    sortOrder: z.number().optional(),
    visible: z.boolean().optional(),
});

const storeCategorySchema = z.object({
    id: z.string(), // This is the categoryId
    displayName: z.string().optional(),
    icon: z.string().optional(),
    categoryId: z.string().optional(),
    sortOrder: z.number().optional(),
    visible: z.boolean().optional(),
    subcategories: z.any().optional(), // For JSON fields, z.any() is a safe default
    allBrands: z.any().optional(), // For JSON fields, z.any() is a safe default
});


// --- Main Schema for Company Creation/Update ---
export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  domain: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1),
  logoUrl: z.string().optional().or(z.literal('')),//.url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  hasWebsite: z.boolean().optional(),
  currency: z.string().optional(),
  locale: z.string().optional(),
  
  // -- JSON fields --
  geoLocation: z.object({ lat: z.number(), lng: z.number() }).optional(),
  openingHours: z.any().optional(),
  themeSettings: z.any().optional(),
  awards: z.any().optional(),
  metrics: z.any().optional(),
  stats: z.any().optional(),
  pricingTiers: z.any().optional(),
  
  // -- Relational fields --
  socialLinks: z.array(socialLinkSchema).optional(),
  policies: z.array(policySchema).optional(),
  faqs: z.array(faqSchema).optional(),
  testimonials: z.array(testimonialSchema).optional(),
  heroSlides: z.array(heroSlideSchema).optional(),
  promotions: z.array(promotionSchema).optional(),
  
  // -- These are arrays in the schema --
  seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
  }),//z.array().optional(),
  
  analyticsConfig: z.object({
      googleTag: z.string().nullable().optional(),
      facebookTag: z.string().nullable().optional(),
      hotjarSiteId: z.string().nullable().optional(),
      isActive: z.boolean().default(false),
  }),//z.array().optional(),
  
  paymentSettings: z.object({
      stripeKey: z.string().nullable().optional(),
      paypalKey: z.string().nullable().optional(),
      mpesaShortcode: z.string().nullable().optional(),
      mpesaConsumerKey: z.string().nullable().optional(),
      mpesaConsumerSecret: z.string().nullable().optional(),
      mpesaCallbackUrl: z.string().nullable().optional(),
  }),//z.array().optional(),

  shippingSettings: z.object({
      carrierName: z.string().nullable().optional(),
      trackingUrl: z.string().url().nullable().optional().or(z.literal('')),
      regions: z.any().nullable().optional(),
      enablePickup: z.boolean().nullable().optional(),
      pickupInstructions: z.string().nullable().optional(),
  }),//z.array().optional(),
  
  // -- Many-to-Many through explicit join table --
  StoreCategory: z.array(storeCategorySchema).optional(),
  companyLocations: z.array(companyLocationSchema).optional(),
});