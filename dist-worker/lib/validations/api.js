"use strict";
/**
 * lib/validations/api.ts
 *
 * Zod schemas for API request validation and response payloads.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseQueryParams = exports.errorResponseSchema = exports.nonprofitListResponseSchema = exports.nonprofitContributionSchema = exports.nonprofitQuerySchema = exports.fitnessListResponseSchema = exports.fitnessProgramSchema = exports.fitnessQuerySchema = exports.travelListResponseSchema = exports.travelBookingSchema = exports.travelQuerySchema = exports.automotiveListResponseSchema = exports.automotiveListingSchema = exports.automotiveQuerySchema = exports.realEstateListResponseSchema = exports.realEstateListingSchema = exports.realEstateQuerySchema = exports.orderListResponseSchema = exports.orderSchema = exports.orderItemSchema = exports.ordersQuerySchema = exports.eventListResponseSchema = exports.eventItemSchema = exports.eventsQuerySchema = exports.blogListResponseSchema = exports.blogItemSchema = exports.blogQuerySchema = exports.updateProfileSchema = exports.userProfileResponseSchema = exports.filterSchema = exports.paginationSchema = exports.parseLimit = void 0;
const zod_1 = require("zod");
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Parse and validate a limit parameter with min/max bounds
 * @param val - The string value from query params
 * @param defaultLimit - Default limit if not provided (default: 20)
 * @param maxLimit - Maximum allowed limit (default: 100)
 */
function parseLimit(val, defaultLimit = 20, maxLimit = 100) {
    const num = parseInt(val || String(defaultLimit));
    return isNaN(num) ? defaultLimit : Math.min(Math.max(num, 1), maxLimit);
}
exports.parseLimit = parseLimit;
// ============================================================================
// Common Query Parameter Schemas
// ============================================================================
exports.paginationSchema = zod_1.z.object({
    limit: zod_1.z.string().optional().transform((val) => parseLimit(val)),
    cursor: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.filterSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional().transform((val) => val?.split(',')),
    q: zod_1.z.string().optional(),
});
// ============================================================================
// Profile Schemas
// ============================================================================
exports.userProfileResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().nullable(),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().nullable(),
    avatar: zod_1.z.string().nullable(),
    bio: zod_1.z.string().nullable(),
    address: zod_1.z.string().nullable(),
    username: zod_1.z.string().nullable(),
    role: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    points: zod_1.z.number().optional(),
    tier: zod_1.z.string().optional(),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    phone: zod_1.z.string().max(20).optional(),
    bio: zod_1.z.string().max(500).optional(),
    address: zod_1.z.string().max(200).optional(),
});
// ============================================================================
// Blog Schemas
// ============================================================================
exports.blogQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.enum(['draft', 'published', 'archived']).optional(),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional(),
}));
exports.blogItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    slug: zod_1.z.string(),
    excerpt: zod_1.z.string().nullable(),
    content: zod_1.z.string().nullable(),
    category: zod_1.z.string().nullable(),
    tags: zod_1.z.array(zod_1.z.string()),
    featuredImage: zod_1.z.string().nullable(),
    status: zod_1.z.string(),
    views: zod_1.z.number(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    publishedAt: zod_1.z.string().nullable(),
});
exports.blogListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.blogItemSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Events Schemas
// ============================================================================
exports.eventsQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
    upcoming: zod_1.z.string().optional().transform((val) => val === 'true'),
}));
exports.eventItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string().nullable(),
    location: zod_1.z.string().nullable(),
    imageUrl: zod_1.z.string().nullable(),
    status: zod_1.z.string(),
    capacity: zod_1.z.number().nullable(),
    type: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.eventListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.eventItemSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Orders Schemas
// ============================================================================
exports.ordersQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
}));
exports.orderItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    quantity: zod_1.z.number(),
    price: zod_1.z.number(),
    product: zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        image: zod_1.z.string().nullable(),
    }).nullable(),
});
exports.orderSchema = zod_1.z.object({
    id: zod_1.z.string(),
    total: zod_1.z.number(),
    status: zod_1.z.string(),
    date: zod_1.z.string(),
    items: zod_1.z.array(exports.orderItemSchema),
});
exports.orderListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.orderSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Real Estate Schemas
// ============================================================================
exports.realEstateQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
    propertyType: zod_1.z.string().optional(),
}));
exports.realEstateListingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    images: zod_1.z.array(zod_1.z.string()),
    price: zod_1.z.number(),
    status: zod_1.z.string(),
    area: zod_1.z.string().nullable(),
    bedrooms: zod_1.z.number().nullable(),
    bathrooms: zod_1.z.string().nullable(),
    amenities: zod_1.z.array(zod_1.z.string()),
    location: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.realEstateListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.realEstateListingSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Automotive Schemas
// ============================================================================
exports.automotiveQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
    make: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    year: zod_1.z.string().optional().transform((val) => val ? parseInt(val) : undefined),
}));
exports.automotiveListingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().nullable(),
    images: zod_1.z.array(zod_1.z.string()),
    price: zod_1.z.number(),
    status: zod_1.z.string(),
    make: zod_1.z.string().nullable(),
    model: zod_1.z.string().nullable(),
    year: zod_1.z.number().nullable(),
    mileage: zod_1.z.string().nullable(),
    transmission: zod_1.z.string().nullable(),
    fuelType: zod_1.z.string().nullable(),
    engineType: zod_1.z.string().nullable(),
    condition: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.automotiveListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.automotiveListingSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Travel Schemas
// ============================================================================
exports.travelQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
}));
exports.travelBookingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string().nullable(),
    status: zod_1.z.string(),
    totalPrice: zod_1.z.number().nullable(),
    notes: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.travelListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.travelBookingSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Fitness Schemas
// ============================================================================
exports.fitnessQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
}));
exports.fitnessProgramSchema = zod_1.z.object({
    id: zod_1.z.string(),
    status: zod_1.z.string(),
    course: zod_1.z.object({
        id: zod_1.z.string(),
        title: zod_1.z.string(),
        description: zod_1.z.string().nullable(),
        image: zod_1.z.string().nullable(),
        duration: zod_1.z.string().nullable(),
        status: zod_1.z.string().nullable(),
    }).nullable(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
    progress: zod_1.z.number().optional(),
    nextSession: zod_1.z.string().optional(),
});
exports.fitnessListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.fitnessProgramSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
});
// ============================================================================
// Nonprofit Schemas
// ============================================================================
exports.nonprofitQuerySchema = exports.paginationSchema.merge(zod_1.z.object({
    status: zod_1.z.string().optional(),
}));
exports.nonprofitContributionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    amount: zod_1.z.number(),
    status: zod_1.z.string(),
    createdAt: zod_1.z.string(),
    updatedAt: zod_1.z.string(),
});
exports.nonprofitListResponseSchema = zod_1.z.object({
    items: zod_1.z.array(exports.nonprofitContributionSchema),
    nextCursor: zod_1.z.string().nullable(),
    total: zod_1.z.number(),
    totalDonations: zod_1.z.number().optional(),
    hoursVolunteered: zod_1.z.number().optional(),
    treesPlanted: zod_1.z.number().optional(),
});
// ============================================================================
// Error Response Schema
// ============================================================================
exports.errorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
    message: zod_1.z.string().optional(),
    details: zod_1.z.record(zod_1.z.any()).optional(),
});
// ============================================================================
// Helper functions for validation
// ============================================================================
function parseQueryParams(searchParams, schema) {
    const params = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return schema.parse(params);
}
exports.parseQueryParams = parseQueryParams;
