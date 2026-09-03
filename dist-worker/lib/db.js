"use strict";
/**
 * lib/db.ts
 *
 * User-scoped data access layer for profile pages.
 * Provides repository helpers that fetch user-specific data across verticals.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserResources = exports.getUserEngagements = exports.getUserAddresses = exports.getUserWishlist = exports.getUserOrders = exports.getUserStats = exports.getUserServices = exports.getUserNonprofit = exports.getUserRealEstate = exports.getUserSecurity = exports.getUserHealth = exports.getUserFitness = exports.getUserTravel = exports.getUserAutomotive = exports.getUserFinance = exports.getUserMedia = exports.getUserEvents = exports.getUserBlogs = exports.getUserProfileForVertical = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
// ============================================================================
// User Profile Helpers
// ============================================================================
/**
 * Get user profile data for a specific vertical/site context
 */
async function getUserProfileForVertical(userId, slug) {
    const user = await prismadb_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            profilePicture: true,
            bio: true,
            address: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return user;
}
exports.getUserProfileForVertical = getUserProfileForVertical;
/**
 * Get user's blogs for a specific site
 */
async function getUserBlogs(userId, slug, filters = {}) {
    const { status, category, tags, limit = 20, cursor, sort = "desc" } = filters;
    const blogs = await prismadb_1.default.blog.findMany({
        where: {
            ...(status && { status: status }),
            ...(category && { category }),
            ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            category: true,
            tags: true,
            coverImage: true,
            status: true,
            publishedAt: true,
        },
    });
    return blogs;
}
exports.getUserBlogs = getUserBlogs;
/**
 * Get user's events
 */
async function getUserEvents(userId, slug, filters = {}) {
    const { status, upcoming, limit = 20, cursor, sort = "desc" } = filters;
    const now = new Date();
    const events = await prismadb_1.default.event.findMany({
        where: {
            organizerId: userId,
            ...(upcoming && { startDateTime: { gte: now } }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { startDateTime: sort },
        select: {
            id: true,
            title: true,
            description: true,
            startDateTime: true,
            endDateTime: true,
            location: true,
            imageUrl: true,
            eventStatus: true,
            eventType: true,
        },
    });
    return events;
}
exports.getUserEvents = getUserEvents;
/**
 * Get user's media content (images, videos, documents)
 */
async function getUserMedia(userId, slug, filters = {}) {
    const { type, limit = 20, cursor, sort = "desc" } = filters;
    // Using marketplaceListings as a proxy for user media content
    // since there's no dedicated media model in the schema
    const media = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            sellerId: userId,
            ...(type && { type }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            name: true,
            description: true,
            images: true,
            videos: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return media;
}
exports.getUserMedia = getUserMedia;
/**
 * Get user's finance-related data (orders, invoices, etc.)
 */
async function getUserFinance(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's customer orders as finance data
    const orders = await prismadb_1.default.customerOrder.findMany({
        where: {
            consumerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        include: {
            items: {
                select: {
                    id: true,
                    quantity: true,
                    price: true,
                    marketplaceListing: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                        },
                    },
                },
            },
        },
    });
    return orders;
}
exports.getUserFinance = getUserFinance;
/**
 * Get user's automotive listings
 */
async function getUserAutomotive(userId, slug, filters = {}) {
    const { status, make, model, year, limit = 20, cursor, sort = "desc", } = filters;
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            sellerId: userId,
            ...(status && { status: status }),
            ...(make && { make }),
            ...(model && { model }),
            ...(year && { year }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            name: true,
            description: true,
            images: true,
            sellingPrice: true,
            status: true,
            make: true,
            model: true,
            year: true,
            mileage: true,
            transmission: true,
            fuelType: true,
            engineType: true,
            condition: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return listings;
}
exports.getUserAutomotive = getUserAutomotive;
/**
 * Get user's travel itineraries/bookings
 */
async function getUserTravel(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's bookings as travel data
    const bookings = await prismadb_1.default.booking.findMany({
        where: {
            consumerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            totalPrice: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return bookings;
}
exports.getUserTravel = getUserTravel;
/**
 * Get user's fitness programs/classes
 */
async function getUserFitness(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's course enrollments as fitness programs
    const enrollments = await prismadb_1.default.courseEnrollment.findMany({
        where: {
            studentId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        include: {
            course: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    imageUrl: true,
                    duration: true,
                    status: true,
                },
            },
        },
    });
    return enrollments;
}
exports.getUserFitness = getUserFitness;
/**
 * Get user's health appointments/records
 */
async function getUserHealth(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's bookings as health appointments
    const bookings = await prismadb_1.default.booking.findMany({
        where: {
            consumerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            totalPrice: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return bookings;
}
exports.getUserHealth = getUserHealth;
/**
 * Get user's security services/content
 */
async function getUserSecurity(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's bookings related to security services
    const bookings = await prismadb_1.default.booking.findMany({
        where: {
            consumerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            totalPrice: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return bookings;
}
exports.getUserSecurity = getUserSecurity;
/**
 * Get user's real estate listings/appointments
 */
async function getUserRealEstate(userId, slug, filters = {}) {
    const { status, propertyType, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's saved/listed properties
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            sellerId: userId,
            ...(status && { status: status }),
            ...(propertyType && { propertyTypeId: propertyType }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            name: true,
            description: true,
            images: true,
            sellingPrice: true,
            status: true,
            area: true,
            bedrooms: true,
            bathrooms: true,
            amenities: true,
            locationName: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return listings;
}
exports.getUserRealEstate = getUserRealEstate;
/**
 * Get user's nonprofit contributions/activities
 */
async function getUserNonprofit(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get user's donations/orders as nonprofit contributions
    const contributions = await prismadb_1.default.customerOrder.findMany({
        where: {
            consumerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            totalPrice: true,
            totalFinalPrice: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return contributions;
}
exports.getUserNonprofit = getUserNonprofit;
/**
 * Get user's generic services/pricing tiers
 */
async function getUserServices(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    const services = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            sellerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            name: true,
            description: true,
            images: true,
            sellingPrice: true,
            status: true,
            pricingTiers: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return services;
}
exports.getUserServices = getUserServices;
// ============================================================================
// User Stats Helpers
// ============================================================================
/**
 * Get user statistics for profile dashboard
 */
async function getUserStats(userId, slug) {
    const [orderCount, wishlistCount, blogCount, eventCount] = await Promise.all([
        prismadb_1.default.customerOrder.count({ where: { consumerId: userId } }),
        prismadb_1.default.wishlist.count({ where: { userId } }),
        prismadb_1.default.blog.count(),
        prismadb_1.default.event.count({ where: { organizerId: userId } }),
    ]);
    return {
        orderCount,
        wishlistCount,
        blogCount,
        eventCount,
    };
}
exports.getUserStats = getUserStats;
/**
 * Get user's orders
 */
async function getUserOrders(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    const orders = await prismadb_1.default.customerOrder.findMany({
        where: {
            consumerId: userId,
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        include: {
            items: {
                include: {
                    marketplaceListing: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                        },
                    },
                },
            },
        },
    });
    return orders;
}
exports.getUserOrders = getUserOrders;
/**
 * Get user's wishlist
 */
async function getUserWishlist(userId, slug, filters = {}) {
    const { limit = 20, cursor } = filters;
    const wishlist = await prismadb_1.default.wishlist.findMany({
        where: {
            userId,
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        include: {
            WishlistItem: {
                include: {
                    marketplaceListings: {
                        select: {
                            id: true,
                            name: true,
                            images: true,
                            sellingPrice: true,
                        },
                    },
                },
            },
        },
    });
    return wishlist;
}
exports.getUserWishlist = getUserWishlist;
/**
 * Get user's addresses
 */
async function getUserAddresses(userId, slug, filters = {}) {
    const { limit = 20, cursor } = filters;
    const addresses = await prismadb_1.default.address.findMany({
        where: {
            userId,
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            street: true,
            city: true,
            state: true,
            postal: true,
            country: true,
            isDefault: true,
            createdAt: true,
        },
    });
    return addresses;
}
exports.getUserAddresses = getUserAddresses;
/**
 * Get consultant/speaker engagements
 */
async function getUserEngagements(userId, slug, filters = {}) {
    const { status, limit = 20, cursor, sort = "desc" } = filters;
    // Get bookings as engagements
    const engagements = await prismadb_1.default.booking.findMany({
        where: {
            OR: [{ consumerId: userId }, { educatorId: userId }],
            ...(status && { status: status }),
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            totalPrice: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return engagements;
}
exports.getUserEngagements = getUserEngagements;
/**
 * Get user's resources (ebooks, downloads)
 */
async function getUserResources(userId, slug, filters = {}) {
    const { limit = 20, cursor, sort = "desc" } = filters;
    // Get purchased/owned digital resources
    const resources = await prismadb_1.default.customerOrder.findMany({
        where: {
            consumerId: userId,
            items: {
                some: {
                    marketplaceListing: {
                        digitalUrl: { not: null },
                    },
                },
            },
        },
        take: limit,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
        orderBy: { createdAt: sort },
        include: {
            items: {
                where: {
                    marketplaceListing: {
                        digitalUrl: { not: null },
                    },
                },
                include: {
                    marketplaceListing: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            images: true,
                            digitalUrl: true,
                            author: true,
                        },
                    },
                },
            },
        },
    });
    return resources;
}
exports.getUserResources = getUserResources;
