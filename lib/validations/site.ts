// lib/validations/site.ts
// Zod schemas for site API request validation
import { z } from 'zod';

/**
 * Common pagination query parameters
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  cursor: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Common filter query parameters
 */
export const filterSchema = paginationSchema.extend({
  status: z.string().optional(),
  tags: z.string().transform((val) => val?.split(',').filter(Boolean)).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

/**
 * Blog list query parameters
 */
export const blogQuerySchema = filterSchema.extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
});

/**
 * Event list query parameters
 */
export const eventQuerySchema = filterSchema.extend({
  status: z.enum(['SCHEDULED', 'POSTPONED', 'CANCELLED', 'COMPLETED']).optional(),
  eventType: z.enum([
    'GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 
    'MEETING', 'WORKSHOP', 'ORIENTATION', 'FUNDRAISER', 'OTHER'
  ]).optional(),
  upcoming: z.coerce.boolean().optional(),
});

/**
 * Product list query parameters
 */
export const productQuerySchema = filterSchema.extend({
  status: z.enum([
    'ACTIVE', 'PENDING', 'SOLD', 'INACTIVE', 'DRAFT', 
    'REJECTED', 'Available', 'Under_Offer', 'Sold', 
    'BUY', 'RENT', 'RENTED'
  ]).optional(),
  featured: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
});

/**
 * Media list query parameters
 */
export const mediaQuerySchema = paginationSchema.extend({
  type: z.enum(['photos', 'videos', 'photoAlbums', 'videoAlbums', 'all']).optional().default('all'),
  status: z.enum(['DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED', 'REJECTED']).optional(),
});

/**
 * Service list query parameters
 */
export const serviceQuerySchema = paginationSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

/**
 * Testimonial list query parameters
 */
export const testimonialQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'HIDDEN']).optional(),
});

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Pagination response schema
 */
export const paginationResponseSchema = z.object({
  total: z.number(),
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
});

/**
 * API response wrapper schema
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    pagination: paginationResponseSchema.optional(),
  });
}

/**
 * Social link schema
 */
export const socialLinkSchema = z.object({
  id: z.string(),
  channel: z.string(),
  url: z.string(),
});

/**
 * Core value schema
 */
export const coreValueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
});

/**
 * Location schema
 */
export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

/**
 * SEO schema
 */
export const seoSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  keywords: z.array(z.string()),
});

/**
 * Store category schema
 */
export const storeCategorySchema = z.object({
  id: z.string(),
  displayName: z.string().nullable(),
  icon: z.string().nullable(),
  sortOrder: z.number(),
  visible: z.boolean(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    image: z.string().nullable(),
    icon: z.string().nullable(),
  }).nullable(),
});

/**
 * Company profile schema
 */
export const companyProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  tagline: z.string().nullable(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
  contactEmail: z.string(),
  contactPhone: z.string().nullable(),
  address: z.string().nullable(),
  geoLocation: z.record(z.number()).nullable(),
  openingHours: z.record(z.unknown()).nullable(),
  currency: z.string(),
  locale: z.string(),
  category: z.string(),
  variant: z.string().nullable(),
  themeSettings: z.record(z.unknown()).nullable(),
  pricingTiers: z.array(z.unknown()),
  awards: z.array(z.unknown()).nullable(),
  metrics: z.array(z.unknown()).nullable(),
  stats: z.array(z.unknown()).nullable(),
  highlights: z.array(z.unknown()).nullable(),
  founderName: z.string().nullable(),
  founderQuote: z.string().nullable(),
  founderImage: z.string().nullable(),
  partnerLogos: z.array(z.unknown()).nullable(),
  sectionSubtitle: z.string().nullable(),
  sectionTitle: z.string().nullable(),
  sectionDescription: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  seo: seoSchema.nullable(),
  socialLinks: z.array(socialLinkSchema),
  coreValues: z.array(coreValueSchema),
  storeCategories: z.array(storeCategorySchema),
  locations: z.array(z.object({
    id: z.string(),
    isPrimary: z.boolean(),
    location: locationSchema.nullable(),
  })),
});

/**
 * Blog schema
 */
export const blogSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  coverImage: z.string().nullable(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  authorName: z.string().nullable(),
  status: z.string(),
  publishedAt: z.string().nullable(),
  views: z.number(),
  likes: z.number(),
  contentType: z.string(),
  createdAt: z.string(),
});

/**
 * Event schema
 */
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  location: z.string().nullable(),
  status: z.string(),
  eventType: z.string(),
  capacity: z.number().nullable(),
  isOnline: z.boolean(),
  coverImage: z.string().nullable(),
  ticketPrice: z.number().nullable(),
  createdAt: z.string(),
});

/**
 * Product schema
 */
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(z.unknown()),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  sellingPrice: z.number(),
  finalPrice: z.number(),
  discount: z.number(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  status: z.string(),
  createdAt: z.string(),
});

/**
 * Service schema
 */
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  duration: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate query parameters
 */
export function parseQueryParams<T extends z.ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> | { error: string } {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return { error: result.error.errors.map(e => e.message).join(', ') };
  }
  return result.data;
}

/**
 * Validate slug parameter
 */
export const slugSchema = z.string().min(1).max(100);

export function validateSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}
