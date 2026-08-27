/**
 * types/dto.ts
 * 
 * TypeScript DTOs that map from Prisma models to the props used by UI components.
 * These types remove internal IDs where not needed and normalize date strings.
 */

// ============================================================================
// User Profile DTOs
// ============================================================================

export interface UserProfileDTO {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  address: string | null;
  username: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
  // Stats
  points?: number;
  tier?: string;
}

export interface UserStatsDTO {
  orderCount: number;
  wishlistCount: number;
  blogCount: number;
  eventCount: number;
}

// ============================================================================
// Blog DTOs
// ============================================================================

export interface BlogDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[];
  featuredImage: string | null;
  status: string;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface BlogListDTO {
  items: BlogDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Event DTOs
// ============================================================================

export interface EventDTO {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  imageUrl: string | null;
  status: string;
  capacity: number | null;
  type: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventListDTO {
  items: EventDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Media DTOs
// ============================================================================

export interface MediaItemDTO {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  videos: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListDTO {
  items: MediaItemDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Finance DTOs
// ============================================================================

export interface FinanceTransactionDTO {
  id: string;
  total: number;
  status: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string | null;
    } | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface FinanceListDTO {
  items: FinanceTransactionDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Automotive DTOs
// ============================================================================

export interface AutomotiveListingDTO {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  price: number;
  status: string;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: string | null;
  transmission: string | null;
  fuelType: string | null;
  engineType: string | null;
  condition: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomotiveListDTO {
  items: AutomotiveListingDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Travel DTOs
// ============================================================================

export interface TravelBookingDTO {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TravelListDTO {
  items: TravelBookingDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Fitness DTOs
// ============================================================================

export interface FitnessProgramDTO {
  id: string;
  status: string;
  course: {
    id: string;
    title: string;
    description: string | null;
    image: string | null;
    duration: string | null;
    status: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  // Progress tracking
  progress?: number;
  nextSession?: string;
}

export interface FitnessListDTO {
  items: FitnessProgramDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Security DTOs
// ============================================================================

export interface SecurityServiceDTO {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityListDTO {
  items: SecurityServiceDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Real Estate DTOs
// ============================================================================

export interface RealEstateListingDTO {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  price: number;
  status: string;
  area: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  amenities: string[];
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RealEstateListDTO {
  items: RealEstateListingDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Nonprofit DTOs
// ============================================================================

export interface NonprofitContributionDTO {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NonprofitListDTO {
  items: NonprofitContributionDTO[];
  nextCursor: string | null;
  total: number;
  // Impact stats
  totalDonations?: number;
  hoursVolunteered?: number;
  treesPlanted?: number;
}

// ============================================================================
// Services DTOs
// ============================================================================

export interface ServiceDTO {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  price: number;
  status: string;
  pricingTiers: PricingTierDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface PricingTierDTO {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
}

export interface ServicesListDTO {
  items: ServiceDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Order DTOs
// ============================================================================

export interface OrderItemDTO {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

export interface OrderDTO {
  id: string;
  total: number;
  status: string;
  date: string;
  items: OrderItemDTO[];
}

export interface OrderListDTO {
  items: OrderDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Wishlist DTOs
// ============================================================================

export interface WishlistItemDTO {
  id: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
    category?: string;
  } | null;
  createdAt: string;
}

export interface WishlistListDTO {
  items: WishlistItemDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Address DTOs
// ============================================================================

export interface AddressDTO {
  id: string;
  name: string | null;
  label?: string;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  isDefault: boolean;
}

export interface AddressListDTO {
  items: AddressDTO[];
  total: number;
}

// ============================================================================
// Consultant/Public Speaking DTOs
// ============================================================================

export interface EngagementDTO {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  totalPrice: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementListDTO {
  items: EngagementDTO[];
  nextCursor: string | null;
  total: number;
}

export interface ResourceDTO {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  downloadUrl: string | null;
  author: string | null;
  createdAt: string;
}

export interface ResourceListDTO {
  items: ResourceDTO[];
  nextCursor: string | null;
  total: number;
}

// ============================================================================
// Mapping Utilities
// ============================================================================

/**
 * Convert date to ISO string or null
 */
export function formatDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Map Prisma user to UserProfileDTO
 */
export function mapToUserProfileDTO(user: any): UserProfileDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.profilePicture || user.image,
    bio: user.bio,
    address: user.address,
    username: user.username,
    role: user.role,
    createdAt: formatDate(user.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(user.updatedAt) || new Date().toISOString(),
    points: 0, // Default value
    tier: "Standard", // Default value
  };
}

/**
 * Map Prisma blog to BlogDTO
 */
export function mapToBlogDTO(blog: any): BlogDTO {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    category: blog.category,
    tags: blog.tags || [],
    featuredImage: blog.featuredImage,
    status: blog.status,
    views: blog.views || 0,
    createdAt: formatDate(blog.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(blog.updatedAt) || new Date().toISOString(),
    publishedAt: formatDate(blog.publishedAt),
  };
}

/**
 * Map Prisma event to EventDTO
 */
export function mapToEventDTO(event: any): EventDTO {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: formatDate(event.startDate) || new Date().toISOString(),
    endDate: formatDate(event.endDate),
    location: event.location,
    imageUrl: event.imageUrl,
    status: event.status,
    capacity: event.capacity,
    type: event.type,
    createdAt: formatDate(event.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(event.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map Prisma order to OrderDTO
 */
export function mapToOrderDTO(order: any): OrderDTO {
  return {
    id: order.id,
    total: order.total || 0,
    status: order.status,
    date: formatDate(order.createdAt) || new Date().toISOString(),
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: item.marketplaceListing
        ? {
            id: item.marketplaceListing.id,
            name: item.marketplaceListing.name,
            image: item.marketplaceListing.images?.[0] || null,
          }
        : null,
    })),
  };
}

/**
 * Map Prisma wishlist item to WishlistItemDTO
 */
export function mapToWishlistItemDTO(item: any): WishlistItemDTO {
  return {
    id: item.id,
    product: item.marketListing
      ? {
          id: item.marketListing.id,
          name: item.marketListing.name,
          image: item.marketListing.images?.[0] || null,
          price: item.marketListing.sellingPrice || 0,
        }
      : null,
    createdAt: formatDate(item.createdAt) || new Date().toISOString(),
  };
}

/**
 * Map Prisma address to AddressDTO
 */
export function mapToAddressDTO(address: any): AddressDTO {
  return {
    id: address.id,
    name: address.name,
    label: address.label || "Address",
    street: address.street,
    city: address.city,
    state: address.state,
    zip: address.zipCode,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault || false,
  };
}

/**
 * Map automotive listing to AutomotiveListingDTO
 */
export function mapToAutomotiveDTO(listing: any): AutomotiveListingDTO {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    images: listing.images || [],
    price: listing.sellingPrice || 0,
    status: listing.status,
    make: listing.make,
    model: listing.model,
    year: listing.year,
    mileage: listing.mileage,
    transmission: listing.transmission,
    fuelType: listing.fuelType,
    engineType: listing.engineType,
    condition: listing.condition,
    createdAt: formatDate(listing.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(listing.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map real estate listing to RealEstateListingDTO
 */
export function mapToRealEstateDTO(listing: any): RealEstateListingDTO {
  return {
    id: listing.id,
    title: listing.name,
    description: listing.description,
    images: listing.images || [],
    price: listing.sellingPrice || 0,
    status: listing.status,
    area: listing.area,
    // Handle bedrooms field which could be a number, string, or array
    bedrooms: typeof listing.bedrooms === 'number' 
      ? listing.bedrooms 
      : Array.isArray(listing.bedrooms) 
        ? listing.bedrooms[0] 
        : parseInt(listing.bedrooms) || null,
    bathrooms: listing.bathrooms,
    amenities: listing.amenities || [],
    location: listing.locationName,
    createdAt: formatDate(listing.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(listing.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map fitness enrollment to FitnessProgramDTO
 */
export function mapToFitnessProgramDTO(enrollment: any): FitnessProgramDTO {
  return {
    id: enrollment.id,
    status: enrollment.status,
    course: enrollment.course
      ? {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          image: enrollment.course.image,
          duration: enrollment.course.duration,
          status: enrollment.course.status,
        }
      : null,
    createdAt: formatDate(enrollment.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(enrollment.updatedAt) || new Date().toISOString(),
    progress: Math.floor(Math.random() * 100), // Placeholder - should be calculated
    nextSession: "Upcoming", // Placeholder
  };
}

/**
 * Map booking to TravelBookingDTO
 */
export function mapToTravelBookingDTO(booking: any): TravelBookingDTO {
  return {
    id: booking.id,
    startDate: formatDate(booking.startDate) || new Date().toISOString(),
    endDate: formatDate(booking.endDate),
    status: booking.status,
    totalPrice: booking.totalPrice,
    notes: booking.notes,
    createdAt: formatDate(booking.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(booking.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map booking to SecurityServiceDTO
 */
export function mapToSecurityServiceDTO(booking: any): SecurityServiceDTO {
  return {
    id: booking.id,
    startDate: formatDate(booking.startDate) || new Date().toISOString(),
    endDate: formatDate(booking.endDate),
    status: booking.status,
    totalPrice: booking.totalPrice,
    notes: booking.notes,
    createdAt: formatDate(booking.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(booking.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map order to NonprofitContributionDTO
 */
export function mapToNonprofitContributionDTO(order: any): NonprofitContributionDTO {
  return {
    id: order.id,
    amount: order.total || 0,
    status: order.status,
    createdAt: formatDate(order.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(order.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map media item to MediaItemDTO
 */
export function mapToMediaItemDTO(item: any): MediaItemDTO {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    images: item.images || [],
    videos: item.videos,
    createdAt: formatDate(item.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(item.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map finance order to FinanceTransactionDTO
 */
export function mapToFinanceTransactionDTO(order: any): FinanceTransactionDTO {
  return {
    id: order.id,
    total: order.total || 0,
    status: order.status,
    items: (order.items || []).map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: item.marketplaceListing
        ? {
            id: item.marketplaceListing.id,
            name: item.marketplaceListing.name,
            image: item.marketplaceListing.images?.[0] || null,
          }
        : null,
    })),
    createdAt: formatDate(order.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(order.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map booking to EngagementDTO
 */
export function mapToEngagementDTO(booking: any): EngagementDTO {
  return {
    id: booking.id,
    startDate: formatDate(booking.startDate) || new Date().toISOString(),
    endDate: formatDate(booking.endDate),
    status: booking.status,
    totalPrice: booking.totalPrice,
    notes: booking.notes,
    createdAt: formatDate(booking.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(booking.updatedAt) || new Date().toISOString(),
  };
}

/**
 * Map resource to ResourceDTO
 */
export function mapToResourceDTO(orderItem: any): ResourceDTO {
  const listing = orderItem.marketplaceListing;
  return {
    id: listing?.id || orderItem.id,
    name: listing?.name || "Resource",
    description: listing?.description,
    images: listing?.images || [],
    downloadUrl: listing?.digitalUrl,
    author: listing?.author,
    createdAt: formatDate(orderItem.createdAt) || new Date().toISOString(),
  };
}

/**
 * Map listing to ServiceDTO
 */
export function mapToServiceDTO(listing: any): ServiceDTO {
  return {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    images: listing.images || [],
    price: listing.sellingPrice || 0,
    status: listing.status,
    pricingTiers: listing.pricingTiers || [],
    createdAt: formatDate(listing.createdAt) || new Date().toISOString(),
    updatedAt: formatDate(listing.updatedAt) || new Date().toISOString(),
  };
}
