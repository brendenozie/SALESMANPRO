import { z } from "zod";

// Schemas for nested JSON fields or related models
const socialLinkSchema = z.object({
  channel: z.enum(["TWITTER", "FACEBOOK", "INSTAGRAM", "LINKEDIN"]).default("TWITTER").nullable().optional().or(z.literal('')),
  url: z.string().nullable().optional().or(z.literal('')),//.url("Invalid URL format"),
});

const policySchema = z.object({
  type: z.enum(["SHIPPING", "RETURNS", "PRIVACY", "TERMS"]).default("PRIVACY").nullable().optional().or(z.literal('')),
  title: z.string().nullable().optional().or(z.literal('')),
  content: z.string().nullable().optional().or(z.literal('')),
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
  imageUrl: z.string().nullable().optional().or(z.literal('')),
  productImageUrl: z.string().url().nullable().optional().or(z.literal('')),
  headline: z.string().nullable().optional(),
  subline: z.string().nullable().optional(),
  ctaText: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional().or(z.literal('')),//.url()
  badgeText: z.string().nullable().optional(),
  videoLink: z.string().nullable().optional().or(z.literal('')),//.url()
  price: z.string().nullable().optional(),
  endsAt: z.string().datetime().optional().nullable(),
  order: z.number().default(0),
});

const promotionSchema = z.object({
    title: z.string().nullable().optional(),
    code: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    startsAt: z.string().optional().nullable(),//.datetime()
    endsAt: z.string().optional().nullable(),//.datetime()
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
    companyId: z.string().nullable().optional(), // The ID of the base Location model
    displayName: z.string().nullable().optional(),
    addressLine1Override: z.string().nullable().optional(),
    addressLine2Override: z.string().nullable().optional(),
    cityOverride: z.string().nullable().optional(),
    stateOverride: z.string().nullable().optional(),
    postalCodeOverride: z.string().nullable().optional(),
    countryOverride: z.string().nullable().optional(),
    latitudeOverride: z.number().nullable().optional(),
    longitudeOverride: z.number().nullable().optional(),
    sortOrder: z.number().nullable().optional(),
    visible: z.boolean().nullable().optional(),
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
const storeCategorySchema = z.object({
  categoryId: z.string(), // This is the ID of the ProductCategory
  displayName: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
  visible: z.boolean().optional(),
  subcategories: z.any().optional(),
  allBrands: z.any().optional(),
});


// --- Main Schema for Company Creation/Update ---
export const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
  domain: z.string().optional(),
  tagline: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1),
  variant: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),//.url().optional().or(z.literal('')),
  bannerUrl: z.string().url().optional().or(z.literal('')),
  videoUrl: z.string().url().optional().or(z.literal('')),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  hasWebsite: z.boolean().optional(),
  currency: z.string().optional(),
  locale: z.string().optional(),
  
  // -- JSON fields --
  geoLocation: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(),
  openingHours: z.any().optional(),
  themeSettings: z.any().optional(),
  awards: z.any().optional(),
  metrics: z.any().optional(),
  stats: z.any().optional(),
  pricingTiers: z.any().optional(),
  
  // -- Relational fields --
  socialLinks: z.array(socialLinkSchema).nullable().optional(),
  policies: z.array(policySchema).nullable().optional(),
  faqs: z.array(faqSchema).nullable().optional(),
  testimonials: z.array(testimonialSchema).nullable().optional(),
  heroSlides: z.array(heroSlideSchema).nullable().optional(),
  promotions: z.array(promotionSchema).nullable().optional(),
  
  // -- These are arrays in the schema --
  seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
  }).nullable().optional(),//z.array().optional(),
  
  analyticsConfig: z.object({
      googleTag: z.string().nullable().optional(),
      facebookTag: z.string().nullable().optional(),
      hotjarSiteId: z.string().nullable().optional(),
      isActive: z.boolean().default(false),
  }).nullable().optional(),//z.array().optional(),
  
  paymentSettings: z.object({
      // Primary Key (Needed for updates, as discussed in the previous step)
      id: z.string().optional(), // Prisma ObjectId are treated as strings in the app layer

      // --- Payment Method Enablement Flags ---
      isStripeEnabled: z.boolean().nullable().optional(),
      isPaypalEnabled: z.boolean().nullable().optional(),
      isMpesaEnabled: z.boolean().nullable().optional(),
      isPaystackEnabled: z.boolean().nullable().optional(), // NEW: Paystack toggle
      isGhubaEnabled: z.boolean().nullable().optional(),

      // --- Stripe Configuration ---
      stripeKey: z.string().nullable().optional(),

      // --- PayPal Configuration ---
      paypalKey: z.string().nullable().optional(),

      // --- M-Pesa Configuration ---
      mpesaShortcode: z.string().nullable().optional(),
      mpesaConsumerKey: z.string().nullable().optional(),
      mpesaConsumerSecret: z.string().nullable().optional(),
      mpesaCallbackUrl: z.string().nullable().optional(),

      // --- Paystack Configuration (NEW) ---
      paystackPublicKey: z.string().nullable().optional(),
      paystackSecretKey: z.string().nullable().optional(),
      // --- Ghuba Configuration (NEW) ---
      ghubaMerchantId: z.string().nullable().optional(),
      ghubaApiKey: z.string().nullable().optional(),
  }).nullable().optional(),

  shippingSettings: z.object({
      carrierName: z.string().nullable().optional(),
      trackingUrl: z.string().nullable().optional().or(z.literal('')),//.url()
      regions: z.any().nullable().optional(),
      enablePickup: z.boolean().nullable().optional(),
      pickupInstructions: z.string().nullable().optional(),
  }).nullable().optional(),//z.array().optional(),
  
  // -- Many-to-Many through explicit join table --
  StoreCategory: z.array(storeCategorySchema).nullable().optional(),
  CompanyLocation: z.array(companyLocationSchema).nullable().optional(),

  founderName: z.string().min(2).max(100).nullable().optional().or(z.literal('')),
  founderQuote: z.string().max(500).nullable().optional().or(z.literal('')),
  founderImage: z.string().nullable().optional().or(z.literal('')),
  partnerLogos: z.array(z.object({
      url: z.string().optional(),
      altText: z.string().max(100).optional(),
  })).nullable().optional(),

  sectionSubtitle: z.string().max(150).nullable().optional().or(z.literal('')),
  sectionTitle: z.string().max(100).nullable().optional().or(z.literal('')),
  sectionDescription: z.string().max(500).nullable().optional().or(z.literal('')),

});