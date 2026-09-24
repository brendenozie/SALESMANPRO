/**
 * lib/db.ts
 *
 * User-scoped data access layer for profile pages.
 * Provides repository helpers that fetch user-specific data across verticals.
 */

import prisma from "@/server/db/prismadb";
import { BlogStatus, OrderStatus, BookingStatus, ListingStatus, EnrollmentStatus } from "@prisma/client";

// ============================================================================
// User Profile Helpers
// ============================================================================

/**
 * Get user profile data for a specific vertical/site context
 */
export async function getUserProfileForVertical(userId: string, slug?: string) {
  const user = await prisma.user.findUnique({
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

// ============================================================================
// Blog Helpers
// ============================================================================

export interface BlogFilters {
  status?: string;
  category?: string;
  tags?: string[];
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's blogs for a specific site
 */
export async function getUserBlogs(
  userId: string,
  slug?: string,
  filters: BlogFilters = {},
) {
  const { status, category, tags, limit = 20, cursor, sort = "desc" } = filters;

  const blogs = await prisma.blog.findMany({
    where: {
      ...(status && { status: status as BlogStatus }),
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

// ============================================================================
// Events Helpers
// ============================================================================

export interface EventFilters {
  status?: string;
  upcoming?: boolean;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's events
 */
export async function getUserEvents(
  userId: string,
  slug?: string,
  filters: EventFilters = {},
) {
  const { status, upcoming, limit = 20, cursor, sort = "desc" } = filters;

  const now = new Date();

  const events = await prisma.event.findMany({
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

// ============================================================================
// Media Helpers
// ============================================================================

export interface MediaFilters {
  type?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's media content (images, videos, documents)
 */
export async function getUserMedia(
  userId: string,
  slug?: string,
  filters: MediaFilters = {},
) {
  const { type, limit = 20, cursor, sort = "desc" } = filters;

  // Using marketplaceListings as a proxy for user media content
  // since there's no dedicated media model in the schema
  const media = await prisma.marketplaceListings.findMany({
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

// ============================================================================
// Finance Helpers
// ============================================================================

export interface FinanceFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's finance-related data (orders, invoices, etc.)
 */
export async function getUserFinance(
  userId: string,
  slug?: string,
  filters: FinanceFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Get user's customer orders as finance data
  const orders = await prisma.customerOrder.findMany({
    where: {
      consumerId: userId,
      ...(status && { status: status as OrderStatus }),
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

// ============================================================================
// Automotive Helpers
// ============================================================================

export interface AutomotiveFilters {
  status?: string;
  make?: string;
  model?: string;
  year?: number;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's automotive listings
 */
export async function getUserAutomotive(
  userId: string,
  slug?: string,
  filters: AutomotiveFilters = {},
) {
  const {
    status,
    make,
    model,
    year,
    limit = 20,
    cursor,
    sort = "desc",
  } = filters;

  const listings = await prisma.marketplaceListings.findMany({
    where: {
      sellerId: userId,
      ...(status && { status: status as ListingStatus }),
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

// ============================================================================
// Travel Helpers
// ============================================================================

export interface TravelFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's travel itineraries/bookings
 */
export async function getUserTravel(
  userId: string,
  slug?: string,
  filters: TravelFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Get user's bookings as travel data
  const bookings = await prisma.booking.findMany({
    where: {
      consumerId: userId,
      ...(status && { status: status as BookingStatus }),
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

// ============================================================================
// Fitness Helpers
// ============================================================================

export interface FitnessFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's fitness programs/classes
 */
export async function getUserFitness(
  userId: string,
  slug?: string,
  filters: FitnessFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Resolve consumer IDs if user has associated consumers
  const consumers = await prisma.consumer.findMany({
    where: { userId },
    select: { id: true },
  });
  const studentIds = [userId, ...consumers.map((c) => c.id)];

  // Get user's course enrollments as fitness programs
  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      studentId: { in: studentIds },
      ...(status && { status: status as EnrollmentStatus }),
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

// ============================================================================
// Health Helpers
// ============================================================================

export interface HealthFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's health appointments/records
 */
export async function getUserHealth(
  userId: string,
  slug?: string,
  filters: HealthFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Get user's bookings as health appointments
  const bookings = await prisma.booking.findMany({
    where: {
      consumerId: userId,
      ...(status && { status: status as BookingStatus }),
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

// ============================================================================
// Security Helpers
// ============================================================================

export interface SecurityFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's security services/content
 */
export async function getUserSecurity(
  userId: string,
  slug?: string,
  filters: SecurityFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Get user's bookings related to security services
  const bookings = await prisma.booking.findMany({
    where: {
      consumerId: userId,
      ...(status && { status: status as BookingStatus }),
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

// ============================================================================
// Real Estate Helpers
// ============================================================================

export interface RealEstateFilters {
  status?: string;
  propertyType?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's real estate listings/appointments
 */
export async function getUserRealEstate(
  userId: string,
  slug?: string,
  filters: RealEstateFilters = {},
) {
  const { status, propertyType, limit = 20, cursor, sort = "desc" } = filters;

  // Get user's saved/listed properties
  const listings = await prisma.marketplaceListings.findMany({
    where: {
      sellerId: userId,
      ...(status && { status: status as ListingStatus }),
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

// ============================================================================
// Nonprofit Helpers
// ============================================================================

export interface NonprofitFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's nonprofit contributions/activities
 */
export async function getUserNonprofit(
  userId: string,
  slug?: string,
  filters: NonprofitFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Get user's donations/orders as nonprofit contributions
  const contributions = await prisma.customerOrder.findMany({
    where: {
      consumerId: userId,
      ...(status && { status: status as OrderStatus }),
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

// ============================================================================
// Services Helpers (Generic)
// ============================================================================

export interface ServicesFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's generic services/pricing tiers
 */
export async function getUserServices(
  userId: string,
  slug?: string,
  filters: ServicesFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  const services = await prisma.marketplaceListings.findMany({
    where: {
      sellerId: userId,
      ...(status && { status: status as ListingStatus }),
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

// ============================================================================
// User Stats Helpers
// ============================================================================

/**
 * Get user statistics for profile dashboard
 */
export async function getUserStats(userId: string, slug?: string) {
  const [orderCount, wishlistCount, blogCount, eventCount] = await Promise.all([
    prisma.customerOrder.count({ where: { consumerId: userId } }),
    prisma.wishlist.count({ where: { userId } }),
    prisma.blog.count(),
    prisma.event.count({ where: { organizerId: userId } }),
  ]);

  return {
    orderCount,
    wishlistCount,
    blogCount,
    eventCount,
  };
}

// ============================================================================
// Orders Helpers
// ============================================================================

export interface OrderFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's orders
 */
export async function getUserOrders(
  userId: string,
  slug?: string,
  filters: OrderFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  const orders = await prisma.customerOrder.findMany({
    where: {
      consumerId: userId,
      ...(status && { status: status as OrderStatus }),
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

// ============================================================================
// Wishlist Helpers
// ============================================================================

export interface WishlistFilters {
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get user's wishlist
 */
export async function getUserWishlist(
  userId: string,
  slug?: string,
  filters: WishlistFilters = {},
) {
  const { limit = 20, cursor } = filters;

  const wishlist = await prisma.wishlist.findMany({
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

// ============================================================================
// Addresses Helpers
// ============================================================================

export interface AddressFilters {
  limit?: number;
  cursor?: string;
}

/**
 * Get user's addresses
 */
export async function getUserAddresses(
  userId: string,
  slug?: string,
  filters: AddressFilters = {},
) {
  const { limit = 20, cursor } = filters;

  const addresses = await prisma.address.findMany({
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

// ============================================================================
// Consultant/Public Speaking Helpers
// ============================================================================

export interface ConsultantFilters {
  status?: string;
  limit?: number;
  cursor?: string;
  sort?: "asc" | "desc";
}

/**
 * Get consultant/speaker engagements
 */
export async function getUserEngagements(
  userId: string,
  slug?: string,
  filters: ConsultantFilters = {},
) {
  const { status, limit = 20, cursor, sort = "desc" } = filters;

  // Get bookings as engagements
  const engagements = await prisma.booking.findMany({
    where: {
      OR: [{ consumerId: userId }, { educatorId: userId }],
      ...(status && { status: status as BookingStatus }),
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

/**
 * Get user's resources (ebooks, downloads)
 */
export async function getUserResources(
  userId: string,
  slug?: string,
  filters: ConsultantFilters = {},
) {
  const { limit = 20, cursor, sort = "desc" } = filters;

  // Get purchased/owned digital resources
  const resources = await prisma.customerOrder.findMany({
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
