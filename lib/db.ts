// lib/db.ts
// Unified data access layer for site profile pages
import prisma from '@/server/db/prismadb';
import { Prisma } from '@prisma/client';

/**
 * Common pagination options
 */
export interface PaginationOptions {
  limit?: number;
  cursor?: string;
  sort?: 'asc' | 'desc';
}

/**
 * Filter options for listings
 */
export interface FilterOptions extends PaginationOptions {
  status?: string;
  tags?: string[];
  category?: string;
  search?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

// ============================================================================
// COMPANY / PROFILE DATA ACCESS
// ============================================================================

/**
 * Get company by slug with full profile data
 */
export async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findFirst({
    where: { 
      OR: [
        { slug },
        { domain: slug },
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      tagline: true,
      description: true,
      logoUrl: true,
      bannerUrl: true,
      videoUrl: true,
      contactEmail: true,
      contactPhone: true,
      address: true,
      geoLocation: true,
      openingHours: true,
      currency: true,
      locale: true,
      category: true,
      variant: true,
      themeSettings: true,
      pricingTiers: true,
      awards: true,
      metrics: true,
      stats: true,
      highlights: true,
      founderName: true,
      founderQuote: true,
      founderImage: true,
      partnerLogos: true,
      sectionSubtitle: true,
      sectionTitle: true,
      sectionDescription: true,
      createdAt: true,
      updatedAt: true,
      // Relations
      SEO: true,
      socialLinks: true,
      CoreValues: true,
      StoreCategory: {
        orderBy: { sortOrder: 'asc' },
        include: {
          category: {
            select: { id: true, name: true, slug: true, image: true, icon: true }
          }
        }
      },
      CompanyLocation: {
        include: {
          location: true
        }
      },
    },
  });

  return company;
}

/**
 * Get company location by slug (fallback from company slug)
 */
export async function getCompanyLocationBySlug(slug: string) {
  const location = await prisma.companyLocation.findFirst({
    where: {
      company: {
        slug
      }
    },
    include: {
      location: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        }
      }
    }
  });

  return location;
}

// ============================================================================
// BLOG DATA ACCESS
// ============================================================================

/**
 * Get blogs by company with pagination and filters
 */
export async function getBlogsByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 10, cursor, sort = 'desc', status, tags, search } = options;

  const where: Prisma.BlogWhereInput = {
    companyId,
    ...(status && { status: status as any }),
    ...(tags?.length && { tags: { hasSome: tags } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        categories: true,
        tags: true,
        authorName: true,
        status: true,
        publishedAt: true,
        views: true,
        likes: true,
        contentType: true,
        createdAt: true,
      },
    }),
    prisma.blog.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

// ============================================================================
// EVENTS DATA ACCESS
// ============================================================================

/**
 * Get events by company with pagination and filters
 */
export async function getEventsByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 10, cursor, sort = 'asc', status, search } = options;

  const where: Prisma.EventWhereInput = {
    companyId,
    ...(status && { eventStatus: status as any }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { startDateTime: sort },
      select: {
        id: true,
        title: true,
        description: true,
        startDateTime: true,
        endDateTime: true,
        location: true,
        eventStatus: true,
        eventType: true,
        maxCapacity: true,
        onlineMeetingLink: true,
        imageUrl: true,
        price: true,
        isPaid: true,
        createdAt: true,
      },
    }),
    prisma.event.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

// ============================================================================
// PRODUCTS DATA ACCESS
// ============================================================================

/**
 * Get products by company with pagination and filters
 */
export async function getProductsByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 12, cursor, sort = 'desc', status, category, tags, search } = options;

  const where: Prisma.ProductWhereInput = {
    companyId,
    ...(status && { status: status as any }),
    ...(category && { category }),
    ...(tags?.length && { tags: { hasSome: tags } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        category: true,
        tags: true,
        sellingPrice: true,
        finalPrice: true,
        discount: true,
        isAvailable: true,
        isFeatured: true,
        isNewArrival: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

/**
 * Get marketplace listings by company
 */
export async function getListingsByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 12, cursor, sort = 'desc', status, category, search } = options;

  const where: Prisma.marketplaceListingsWhereInput = {
    companyId,
    ...(status && { status: status as any }),
    ...(category && { category }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.marketplaceListings.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        category: true,
        type: true,
        sellingPrice: true,
        finalPrice: true,
        discount: true,
        isAvailable: true,
        isFeatured: true,
        status: true,
        location: true,
        locationName: true,
        createdAt: true,
      },
    }),
    prisma.marketplaceListings.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

// ============================================================================
// MEDIA DATA ACCESS
// ============================================================================

/**
 * Get photos by company
 */
export async function getPhotosByCompany(
  companyId: string,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 12, cursor, sort = 'desc' } = options;

  const [data, total] = await Promise.all([
    prisma.photo.findMany({
      where: { companyId },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      select: {
        id: true,
        imageUrl: true,
        altText: true,
        title: true,
        description: true,
        tags: true,
        createdAt: true,
      },
    }),
    prisma.photo.count({ where: { companyId } }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

/**
 * Get videos by company
 */
export async function getVideosByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 12, cursor, sort = 'desc', status } = options;

  const where: Prisma.VideoWhereInput = {
    companyId,
    ...(status && { status: status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.video.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        thumbnailUrl: true,
        duration: true,
        views: true,
        status: true,
        tags: true,
        createdAt: true,
      },
    }),
    prisma.video.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

/**
 * Get photo albums by company
 */
export async function getPhotoAlbumsByCompany(
  companyId: string,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 12, cursor, sort = 'desc' } = options;

  const [data, total] = await Promise.all([
    prisma.photoAlbum.findMany({
      where: { companyId },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      include: {
        photos: {
          take: 4,
          select: {
            id: true,
            imageUrl: true,
            altText: true,
          },
        },
        _count: {
          select: { photos: true },
        },
      },
    }),
    prisma.photoAlbum.count({ where: { companyId } }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

/**
 * Get video albums by company
 */
export async function getVideoAlbumsByCompany(
  companyId: string,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 12, cursor, sort = 'desc' } = options;

  const [data, total] = await Promise.all([
    prisma.videoAlbum.findMany({
      where: { companyId },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      include: {
        videos: {
          take: 4,
          select: {
            id: true,
            thumbnailUrl: true,
            title: true,
          },
        },
        _count: {
          select: { videos: true },
        },
      },
    }),
    prisma.videoAlbum.count({ where: { companyId } }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

// ============================================================================
// SERVICES DATA ACCESS
// ============================================================================

/**
 * Get services by company
 */
export async function getServicesByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 20, cursor, sort = 'asc', status } = options;

  const where: Prisma.ServiceWhereInput = {
    companyId,
    ...(status && { status: status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { createdAt: sort },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        duration: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.service.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

// ============================================================================
// TESTIMONIALS DATA ACCESS
// ============================================================================

/**
 * Get testimonials by company
 */
export async function getTestimonialsByCompany(
  companyId: string,
  options: FilterOptions = {}
): Promise<PaginatedResponse<any>> {
  const { limit = 10, cursor, sort = 'asc', status } = options;

  const where: Prisma.TestimonialWhereInput = {
    companyId,
    ...(status && { status: status as any }),
  };

  const [data, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { order: sort },
      select: {
        id: true,
        quote: true,
        authorName: true,
        authorTitle: true,
        avatarUrl: true,
        rating: true,
        status: true,
      },
    }),
    prisma.testimonial.count({ where }),
  ]);

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return {
    data: items,
    pagination: {
      total,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
    },
  };
}

// ============================================================================
// FAQS DATA ACCESS
// ============================================================================

/**
 * Get FAQs by company
 */
export async function getFAQsByCompany(companyId: string) {
  return prisma.fAQ.findMany({
    where: { companyId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      question: true,
      answer: true,
      order: true,
    },
  });
}

// ============================================================================
// TEAM / STAFF DATA ACCESS
// ============================================================================

/**
 * Get team members (experts, doctors, writers, educators) by company
 */
export async function getTeamByCompany(companyId: string) {
  const userSelect = {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      bio: true,
    },
  };

  const [experts, doctors, writers, educators, salesAgents] = await Promise.all([
    prisma.expert.findMany({
      where: { companyId, user: { isNot: null } },
      select: {
        id: true,
        specialty: true,
        experienceYears: true,
        bio: true,
        photoUrl: true,
        status: true,
        expertise: true,
        user: userSelect,
      },
    }),
    prisma.doctor.findMany({
      where: { companyId, User: { isNot: null } },
      select: {
        id: true,
        specialty: true,
        bio: true,
        profilePicture: true,
        status: true,
        User: userSelect,
      },
    }),
    prisma.writer.findMany({
      where: { companyId, user: { isNot: null } },
      select: {
        id: true,
        bio: true,
        profilePicture: true,
        status: true,
        totalArticles: true,
        user: userSelect,
      },
    }),
    prisma.educator.findMany({
      where: { companyId, user: { isNot: null } },
      select: {
        id: true,
        specialty: true,
        bio: true,
        photoUrl: true,
        certifications: true,
        status: true,
        user: userSelect,
      },
    }),
    prisma.salesAgent.findMany({
      where: { companyId, user: { isNot: null }, isActive: true },
      select: {
        id: true,
        specialties: true,
        regions: true,
        user: userSelect,
      },
    }),
  ]);

  return { experts, doctors, writers, educators, salesAgents };
}
