/**
 * lib/validations/api.ts
 * 
 * Zod schemas for API request validation and response payloads.
 */

import { z } from 'zod';

// ============================================================================
// Common Query Parameter Schemas
// ============================================================================

export const paginationSchema = z.object({
  limit: z.string().optional().transform((val) => {
    const num = parseInt(val || '20');
    return isNaN(num) ? 20 : Math.min(Math.max(num, 1), 100);
  }),
  cursor: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const filterSchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional().transform((val) => val?.split(',')),
  q: z.string().optional(),
});

// ============================================================================
// Profile Schemas
// ============================================================================

export const userProfileResponseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email(),
  phone: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  address: z.string().nullable(),
  username: z.string().nullable(),
  role: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  points: z.number().optional(),
  tier: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// Blog Schemas
// ============================================================================

export const blogQuerySchema = paginationSchema.merge(z.object({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
}));

export const blogItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  featuredImage: z.string().nullable(),
  status: z.string(),
  views: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
});

export const blogListResponseSchema = z.object({
  items: z.array(blogItemSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type BlogQueryInput = z.infer<typeof blogQuerySchema>;
export type BlogItem = z.infer<typeof blogItemSchema>;
export type BlogListResponse = z.infer<typeof blogListResponseSchema>;

// ============================================================================
// Events Schemas
// ============================================================================

export const eventsQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
  upcoming: z.string().optional().transform((val) => val === 'true'),
}));

export const eventItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  location: z.string().nullable(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  capacity: z.number().nullable(),
  type: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const eventListResponseSchema = z.object({
  items: z.array(eventItemSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type EventsQueryInput = z.infer<typeof eventsQuerySchema>;
export type EventItem = z.infer<typeof eventItemSchema>;
export type EventListResponse = z.infer<typeof eventListResponseSchema>;

// ============================================================================
// Orders Schemas
// ============================================================================

export const ordersQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
}));

export const orderItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  price: z.number(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    image: z.string().nullable(),
  }).nullable(),
});

export const orderSchema = z.object({
  id: z.string(),
  total: z.number(),
  status: z.string(),
  date: z.string(),
  items: z.array(orderItemSchema),
});

export const orderListResponseSchema = z.object({
  items: z.array(orderSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type OrdersQueryInput = z.infer<typeof ordersQuerySchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderListResponse = z.infer<typeof orderListResponseSchema>;

// ============================================================================
// Real Estate Schemas
// ============================================================================

export const realEstateQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
  propertyType: z.string().optional(),
}));

export const realEstateListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  images: z.array(z.string()),
  price: z.number(),
  status: z.string(),
  area: z.string().nullable(),
  bedrooms: z.number().nullable(),
  bathrooms: z.string().nullable(),
  amenities: z.array(z.string()),
  location: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const realEstateListResponseSchema = z.object({
  items: z.array(realEstateListingSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type RealEstateQueryInput = z.infer<typeof realEstateQuerySchema>;
export type RealEstateListing = z.infer<typeof realEstateListingSchema>;
export type RealEstateListResponse = z.infer<typeof realEstateListResponseSchema>;

// ============================================================================
// Automotive Schemas
// ============================================================================

export const automotiveQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
}));

export const automotiveListingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(z.string()),
  price: z.number(),
  status: z.string(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  year: z.number().nullable(),
  mileage: z.string().nullable(),
  transmission: z.string().nullable(),
  fuelType: z.string().nullable(),
  engineType: z.string().nullable(),
  condition: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const automotiveListResponseSchema = z.object({
  items: z.array(automotiveListingSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type AutomotiveQueryInput = z.infer<typeof automotiveQuerySchema>;
export type AutomotiveListing = z.infer<typeof automotiveListingSchema>;
export type AutomotiveListResponse = z.infer<typeof automotiveListResponseSchema>;

// ============================================================================
// Travel Schemas
// ============================================================================

export const travelQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
}));

export const travelBookingSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  status: z.string(),
  totalPrice: z.number().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const travelListResponseSchema = z.object({
  items: z.array(travelBookingSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type TravelQueryInput = z.infer<typeof travelQuerySchema>;
export type TravelBooking = z.infer<typeof travelBookingSchema>;
export type TravelListResponse = z.infer<typeof travelListResponseSchema>;

// ============================================================================
// Fitness Schemas
// ============================================================================

export const fitnessQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
}));

export const fitnessProgramSchema = z.object({
  id: z.string(),
  status: z.string(),
  course: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    image: z.string().nullable(),
    duration: z.string().nullable(),
    status: z.string().nullable(),
  }).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  progress: z.number().optional(),
  nextSession: z.string().optional(),
});

export const fitnessListResponseSchema = z.object({
  items: z.array(fitnessProgramSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export type FitnessQueryInput = z.infer<typeof fitnessQuerySchema>;
export type FitnessProgram = z.infer<typeof fitnessProgramSchema>;
export type FitnessListResponse = z.infer<typeof fitnessListResponseSchema>;

// ============================================================================
// Nonprofit Schemas
// ============================================================================

export const nonprofitQuerySchema = paginationSchema.merge(z.object({
  status: z.string().optional(),
}));

export const nonprofitContributionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const nonprofitListResponseSchema = z.object({
  items: z.array(nonprofitContributionSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
  totalDonations: z.number().optional(),
  hoursVolunteered: z.number().optional(),
  treesPlanted: z.number().optional(),
});

export type NonprofitQueryInput = z.infer<typeof nonprofitQuerySchema>;
export type NonprofitContribution = z.infer<typeof nonprofitContributionSchema>;
export type NonprofitListResponse = z.infer<typeof nonprofitListResponseSchema>;

// ============================================================================
// Error Response Schema
// ============================================================================

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ============================================================================
// Helper functions for validation
// ============================================================================

export function parseQueryParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}
