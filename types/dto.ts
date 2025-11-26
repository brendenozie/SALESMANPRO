// types/dto.ts
// Data Transfer Objects for API responses

/**
 * Pagination metadata
 */
export interface PaginationDTO {
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Base API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationDTO;
}

/**
 * Social link DTO
 */
export interface SocialLinkDTO {
  id: string;
  channel: string;
  url: string;
}

/**
 * Core value DTO
 */
export interface CoreValueDTO {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
}

/**
 * Location DTO
 */
export interface LocationDTO {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Company location DTO
 */
export interface CompanyLocationDTO {
  id: string;
  isPrimary: boolean;
  location: LocationDTO | null;
}

/**
 * SEO metadata DTO
 */
export interface SEODTO {
  id: string;
  title: string | null;
  description: string | null;
  keywords: string[];
}

/**
 * Store category DTO
 */
export interface StoreCategoryDTO {
  id: string;
  displayName: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    icon: string | null;
  } | null;
}

/**
 * Company profile DTO - full profile data
 */
export interface CompanyProfileDTO {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  videoUrl: string | null;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  geoLocation: Record<string, number> | null;
  openingHours: Record<string, unknown> | null;
  currency: string;
  locale: string;
  category: string;
  variant: string | null;
  themeSettings: Record<string, unknown> | null;
  pricingTiers: unknown[];
  awards: unknown[] | null;
  metrics: unknown[] | null;
  stats: unknown[] | null;
  highlights: unknown[] | null;
  founderName: string | null;
  founderQuote: string | null;
  founderImage: string | null;
  partnerLogos: unknown[] | null;
  sectionSubtitle: string | null;
  sectionTitle: string | null;
  sectionDescription: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  seo: SEODTO | null;
  socialLinks: SocialLinkDTO[];
  coreValues: CoreValueDTO[];
  storeCategories: StoreCategoryDTO[];
  locations: CompanyLocationDTO[];
}

/**
 * Blog post DTO
 */
export interface BlogDTO {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  categories: string[];
  tags: string[];
  authorName: string | null;
  status: string;
  publishedAt: string | null;
  views: number;
  likes: number;
  contentType: string;
  createdAt: string;
}

/**
 * Event DTO
 */
export interface EventDTO {
  id: string;
  title: string;
  description: string | null;
  startDateTime: string;
  endDateTime: string | null;
  location: string | null;
  eventStatus: string;
  eventType: string;
  maxCapacity: number | null;
  isOnline: boolean;
  imageUrl: string | null;
  price: number | null;
  isPaid: boolean;
  createdAt: string;
}

/**
 * Product DTO
 */
export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  images: unknown[];
  category: string | null;
  tags: string[];
  sellingPrice: number;
  finalPrice: number;
  discount: number;
  isAvailable: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  status: string;
  createdAt: string;
}

/**
 * Marketplace listing DTO
 */
export interface ListingDTO {
  id: string;
  name: string;
  description: string | null;
  images: unknown[];
  category: string | null;
  type: string | null;
  sellingPrice: number;
  finalPrice: number | null;
  discount: number | null;
  isAvailable: boolean;
  isFeatured: boolean;
  status: string;
  location: unknown | null;
  locationName: string | null;
  createdAt: string;
}

/**
 * Photo DTO
 */
export interface PhotoDTO {
  id: string;
  imageUrl: string;
  altText: string | null;
  title: string | null;
  description: string | null;
  tags: string[];
  createdAt: string;
}

/**
 * Video DTO
 */
export interface VideoDTO {
  id: string;
  title: string | null;
  url: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
  views: number;
  status: string;
  tags: string[];
  createdAt: string;
}

/**
 * Photo album DTO
 */
export interface PhotoAlbumDTO {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  photos: {
    id: string;
    imageUrl: string;
    altText: string | null;
  }[];
  photoCount: number;
  createdAt: string;
}

/**
 * Video album DTO
 */
export interface VideoAlbumDTO {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  videos: {
    id: string;
    thumbnailUrl: string | null;
    title: string | null;
  }[];
  videoCount: number;
  createdAt: string;
}

/**
 * Service DTO
 */
export interface ServiceDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string;
  status: string;
  createdAt: string;
}

/**
 * Testimonial DTO
 */
export interface TestimonialDTO {
  id: string;
  quote: string;
  authorName: string | null;
  authorTitle: string | null;
  avatarUrl: string | null;
  rating: number | null;
  status: string;
}

/**
 * FAQ DTO
 */
export interface FAQDTO {
  id: string;
  question: string;
  answer: string;
  order: number;
}

/**
 * Team member base DTO
 */
export interface TeamMemberBaseDTO {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
}

/**
 * Expert DTO
 */
export interface ExpertDTO {
  id: string;
  specialty: string;
  experienceYears: number | null;
  bio: string | null;
  photoUrl: string | null;
  status: string;
  expertise: string[];
  user: TeamMemberBaseDTO | null;
}

/**
 * Doctor DTO
 */
export interface DoctorDTO {
  id: string;
  specialty: string | null;
  bio: string | null;
  profilePicture: string | null;
  status: string;
  user: TeamMemberBaseDTO | null;
}

/**
 * Writer DTO
 */
export interface WriterDTO {
  id: string;
  bio: string | null;
  profilePicture: string | null;
  status: string;
  totalArticles: number;
  user: TeamMemberBaseDTO | null;
}

/**
 * Educator DTO
 */
export interface EducatorDTO {
  id: string;
  specialty: string | null;
  bio: string | null;
  photoUrl: string | null;
  certifications: string[];
  status: string;
  user: TeamMemberBaseDTO | null;
}

/**
 * Sales agent DTO
 */
export interface SalesAgentDTO {
  id: string;
  specialties: string[];
  regions: string[];
  user: TeamMemberBaseDTO | null;
}

/**
 * Team DTO
 */
export interface TeamDTO {
  experts: ExpertDTO[];
  doctors: DoctorDTO[];
  writers: WriterDTO[];
  educators: EducatorDTO[];
  salesAgents: SalesAgentDTO[];
}

/**
 * Media response DTO
 */
export interface MediaResponseDTO {
  photos: PhotoDTO[];
  videos: VideoDTO[];
  photoAlbums: PhotoAlbumDTO[];
  videoAlbums: VideoAlbumDTO[];
}
