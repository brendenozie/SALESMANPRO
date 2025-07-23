import { User } from "@prisma/client";
import "next-auth";
import { ChangeEvent } from "react";



export interface IStyleData {
  img: string;
  title: string;
}

export interface IOptions {
  method: string;
  headers: {
    "X-RapidAPI-Key": string;
    "X-RapidAPI-Host": string;
    "content-type"?: string;
  };
  body?: string;
}

export interface ISuggestion {
  regionNames: {
    shortName: string;
    displayName: string;
  };
  gaiaId: number;
  type: string;
}

export interface ISuggestionFormatted {
  shortName: string;
  displayName: string;
  id: number;
  type: string;
  img?: string;
  location?: string;
  province?: string;
}

export interface provider {
  name: string;
  id: string;
}

export interface IReservation {
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: {
      name: string;
      description: string;
      images: string[];
    };
  };
  quantity: number;
}

export interface ILocation {
  lat: any;
  lng: any;
}
export interface uploadImage {
  publicId: string;
  url: string;
  status: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  imgUri: string;
  role: string ;
  provider: string;
  img: string ;
  // id: string;
  // name: string;
  // email: string;
  // image: string;
  // role: string;
}

// interface CategoryOption { id: string; name: string; }
export type StoreCategoryEntry = {
  id: string;           // parent ProductCategory.id
  name: string;         // parent name
  items: SubObj[];      // zero or more subcategory objects
  allBrands?:  string[];      // zero or more subcategory objects
  displayName?: string; // (optional override)
  icon: string;        // (optional override)
  sortOrder?: number;
  visible?: boolean;
};

export type SelectedCategory = {
  id:    string;
  name:  string;
  icon:string;
  items: SubObj[];
  allBrands?: string[];
};

export type SubObj = {
  id:        string;
  name:      string;
  slug:      string;
  sortOrder?: number;
  visible?:   boolean;
};

export type ParentCategory = {
  id:            string;
  name:          string;
  icon:string;
  items:      SubObj[];    // full list of sub‐objects under this parent
  allBrands?:  string[];    // full list of sub‐objects under this parent
  
  
  companyId?: string;
  categoryId?: string;
  displayName?: string;
  
  sortOrder?: number;
  visible?: boolean;
  // items?: Subcategory[]; // always an array
  // allBrands?: any[] | null;
  category?: ProductCategory;
};

export type RawCategory = {
  id:         string;
  name:       string;
  icon:string;
  allBrands?:  string[];
  subcategories: Array<{
    id:   string;
    name: string;
    slug: string;
    // …other fields like icon, image, etc., but NOT needed by the tree
  }>;
  // …plus whatever other fields your API returns
};


//Updated type starts here

// --- ENUMS based on Prisma Schema ---
export enum SocialChannel { TWITTER, INSTAGRAM, FACEBOOK, LINKEDIN }
export enum PolicyType { SHIPPING, RETURNS, PRIVACY, TERMS }
export enum SectionType { Hero, FeatureGrid, TestimonialCarousel, BlogPreview, CustomHtml, About, Services, Awards, HealthTips, Features, HowItWorks, Pricing, CTA, Metrics, Stats }

// --- INTERFACES for related models ---

export interface GeoLocation { lat: number; lng: number; }
export type OpeningHours = Record<string, { open: string; close: string } | undefined>;

export interface SocialLink {
    id?: string;
    channel: SocialChannel; // Use Enum for type safety
    url: string; 
}

export interface Policy {
    id?: string;
    type: PolicyType; // Use Enum
    title?: string;
    content: string; 
}

export interface FAQ {
    id?: string;
    question: string;
    answer: string;
    order?: number; 
}

export interface Testimonial {
    id?: string;
    author: string;
    quote: string;
    avatarUrl?: string;
    rating?: number; // 1-5 stars 
    order?: number;
}

// Corresponds to the `Banner` model in Prisma
export interface HeroSlide {
    id?: string;
    imageUrl: string;
    productImageUrl?: string; 
    headline?: string;
    subline?: string; 
    ctaText?: string; 
    ctaLink?: string; 
    badgeText?: string; 
    price?: string; // Missing from original type 
    endsAt?: Date | string; // Missing from original type 
    order?: number; 
}

export interface Promotion {
    id?: string;
    code?: string; // Missing from original type 
    title: string; 
    description?: string;
    startsAt?: Date | string;
    endsAt?: Date | string; 
    ctaText?: string;
    ctaLink?: string;
    bannerUrl?: string; 
}

export interface Award {
    name: string;
    iconUrl: string;
    order?: number;
}

export interface Metric {
    label: string;
    value: number;
    iconUrl?: string;
}

export interface Stat {
    label: string;
    value: string | number;
    iconUrl?: string;
}

export interface PricingTier {
    name: string;
    description?: string;
    price: number;
    duration?: string;
    features: string[];
}

// NEW: Interface for `PageSection`
export interface PageSection {
    id?: string;
    type: SectionType; // Use Enum
    order: number;
    settings: Record<string, any>; // e.g., { background: "dark" } 
    content: Record<string, any>; // e.g., { headline: "...", blocks: [] } 
}

// NEW: Interface for `AppPromo`
export interface AppPromo {
    id?: string;
    headline?: string;
    subheading: string;
    buttons: { label: string; href: string; icon: string; }[]; // Structured buttons 
    screenshots: string[]; // Array of image URLs
}

// NEW: Stronger type for `Blog`
export interface Blog {
    id?: string;
    title: string; 
    slug: string;
    content: string;
    coverImage?: string; 
    categories: string[];
    tags: string[];
    author?: { name: string; profileImage: string }; 
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt?: Date | string;
}

// --- MAIN UPDATED STORE FORM ---
export interface StoreForm {
    id: string;
    name: string; 
    slug: string; 
    tagline: string; 
    description?: string; 
    hasWebsite: boolean;
    domain: string; 
    
    // --- Missing Core Fields Added ---
    currency: string; // e.g., "KES" 
    locale: string; // e.g., "en-US" 
    companyCategoryId?: string; // Link to CompanyCategory model

    // --- Core Content ---
    category: string;
    logoUrl: string; 
    bannerUrl: string; 
    contactEmail: string; 
    contactPhone: string; 
    address: string; 
    geoLocation: GeoLocation; 
    openingHours: OpeningHours; 
    
    // --- Relational Content (with stronger types) ---
    socialLinks: SocialLink[]; 
    policies: Policy[]; 
    faqs: FAQ[]; 
    testimonials: Testimonial[]; 
    heroSlides: HeroSlide[]; // Corresponds to `Banner`
    promotions: Promotion[]; 
    blogs: Blog[]; // Using the new strong type 
    storeCategories: StoreCategory[]; // Using the new strong type 

    // --- NEW: Missing Relational Sections Added ---
    pageSections: PageSection[];
    appPromos: AppPromo[]; 
    events: any[]; 
    collections: any[]; 
    announcements: any[]; 
    // You can add `events`, `announcements`, etc., following the same pattern.
    
    // --- JSON fields ---
    awards: Award[];
    metrics: Metric[];
    stats: Stat[];
    pricingTiers: PricingTier[]; 

    // --- Settings Objects ---
    themeSettings: Record<string, any>; 
    seo: Record<string, any>;
    analyticsConfig: Record<string, any>;
    paymentSettings: Record<string, any>;
    shippingSettings: Record<string, any>;
    
    marketplaceListings: MarketListingForm[];
}

// interface GeoLocation { lat: number; lng: number; }

// type OpeningHours = Record<
//   string,
//   { open: string; close: string } | undefined
// >;

// type DayHours = { open: string; close: string };

// type OpeningHours = { [key: string]: DayHours };

// export interface SocialLink { channel: string; url: string; }

// export interface Policy { type: string; title?: string; content: string; }

// export interface FAQ { question: string; answer: string; order?: number; }

// export interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number; order?: number; }

// export interface HeroSlide {
//   badgeText: string; productImageUrl?:string; imageUrl: string; headline: string; subline?: string; ctaText?: string; ctaLink?: string; order?: number; 
// }

// export interface Promotion { title: string; description: string; startsAt?: string; 
//                               endsAt?: string; bannerUrl?: string; order?: number;  ctaText?: string; ctaLink?: string; }

// export interface Award {
//   name: string;
//   iconUrl: string;
//   order?: number;
// }

// export interface Metric {
//   label: string;
//   value: number;
//   iconUrl?: string;
// }

// export interface Stat {
//   label: string;
//   value: string | number;
//   iconUrl?: string;
// }

// type StoreForm = {
//   id:string;
//   name: string;
//   slug: string;
//   hasWebsite: boolean;
//   domain: string;
//   tagline: string;
//   description: string;
//   category: string;
//   logoUrl: string;
//   bannerUrl: string;
//   contactEmail: string;
//   contactPhone: string;
//   address: string;
//   geoLocation: GeoLocation;
//   openingHours: OpeningHours;
//   socialLinks: SocialLink[];
//   policies: Policy[];
//   faqs: FAQ[];
//   testimonials: Testimonial[];
//   heroSlides: HeroSlide[];
//   promotions: Promotion[];
//   awards: Award[];
//   metrics: Metric[];
//   stats: Stat[];
//   themeSettings: Record<string, any>;
//   seo: Record<string, any>;
//   analyticsConfig: Record<string, any>;
//   paymentSettings: Record<string, any>;
//   shippingSettings: Record<string, any>;
//   marketplaceListings: MarketplaceListingForm[];
//   storeCategories: any[];
//   pricingTiers: PricingTier[];
//   blogs:any[];
//   agents:any[];
//   locations:any[];
//   blogPosts:any[];
// };

// export interface PricingTier {
//   name: string;
//   price: number;
//   features: string[];
//   isFeatured?: boolean;
//   duration?: string;
//   description?: string;
// }

// types/typings.ts


// Define StoreCategory and ProductCategory shapes
export type StoreCategory = {
  id: string;
  companyId: string;
  categoryId: string;
  displayName: string;
  icon?: string;
  sortOrder: number;
  visible: boolean;
  items: Subcategory[]; // always an array
  allBrands?: any[] | null;
  category: ProductCategory;
};

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  visible: boolean;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  sortOrder?: number;
  visible?: boolean;
  isFeatured?: boolean;
  showInHomepage?: boolean;
  attributes?: Record<string, any>;
  subcategories?: Subcategory[] | null;
  icon?: string;
  image?: string;
};


// Handlers signature
export interface Handlers {
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;

  onUpdateArray: <T>(
    key: keyof StoreForm,
    idx: number,
    field: keyof T,
    value: any
  ) => void;

  onAddArray: <T>(key: keyof StoreForm, item: T) => void;
  onRemoveArray: (key: keyof StoreForm, idx: number) => void;

  setAddress: (address: string, geo: GeoLocation) => void;
  onChangeSettings: (updated: any) => void;//Partial<StoreForm>

  onBulkToggle: (ids: string[]) => void;
  onToggleDay: (dayKey: string) => void;
  onToggleParent: (cat: ParentCategory) => void;
  onToggleSub: (parentId: string, sub: SubObj) => void;
  onToggleBrand: (parentId: string, brand: any) => void;

  onUpdateHeroSlide: (
    index: number,
    field: keyof HeroSlide,
    value: string
  ) => void;
  onAddHeroSlide: () => void;
  onRemoveHeroSlide: (index: number) => void;
  handleSlideImageUpload: (
    index: number,
    file: File,
    field: keyof HeroSlide
  ) => void;
  // handleSlideImageUpload
  // onHeroImageUpload: (index: number, file: File) => void;

  onUpdatePromotion: (
    index: number,
    field: keyof Promotion,
    value: string
  ) => void;
  onAddPromotion: () => void;
  onRemovePromotion: (index: number) => void;
  onPromotionImageUpload: (index: number, file: File) => void;

  // onProductImageUpload: (index: number, file: File) => void;
  

  // Media (logo/banner)
  handleMediaUpload: (field: "logoUrl" | "bannerUrl", file: File) => void;
  handleMediaRemove: (field: "logoUrl" | "bannerUrl") => void;
}

// Step configuration
export interface StepConfig {
  key: string;
  title: string;
  render: (form: StoreForm, 
    handlers: Handlers, 
    availableCategories: CategoryOption[]) => React.ReactNode;
}

export interface BookItem {
  title: string;
  author: string;
  coverFile: File | null;      // raw File for upload
  coverPreview: string | null; // objectURL for preview
}

export interface Promotion {
  title: string;
  description?: string;
  startsAt?: Date | string;
  endsAt?: Date | string;
  bannerUrl?: string;
  order?: number;
}

export interface HeroSlide {
  imageUrl: string;
  headline?: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
}

export type TimetableEntry = {
  id: string;
  courseId: string;
  courseTitle: string;
  courseAcademicLevels: { id: string; name: string; sortOrder?: number }[];
  educatorId: string;
  educatorName: string;
  educatorEmail: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  topic?: string | null;
  meetingLink?: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseOption = {
  id: string;
  title: string;
  academicLevels: { id: string; name: string; sortOrder?: number }[];
  instructorName?: string;
};

export type EducatorOption = {
  id: string;
  name: string;
  email: string;
};

export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};


// Assuming these types are defined elsewhere, e.g., in '@/types/typings'
// type StoreCategory = string; // Placeholder, replace with your actual type
// type ProductCategory = string; // Placeholder, replace with your actual type
// type BookingSlotType = any; // Placeholder, replace with your actual type

export interface ProductForm {
  // identifiers
  id: string;
  companyId: string;

  // basic info
  name: string;
  description?: string;
  longDescription: string; // Added from GeneralDetails

  tags: string[];

  category: StoreCategory | null;
  subCategory: ProductCategory | null;
  subCategoryName: string;
  brand: string | null;

  // specs (General Details - physical attributes)
  model: string;
  color: string[];
  size: string[]; // Assuming size can be multiple strings (e.g., ["S", "M", "L"])
  weight: string; // Kept as string as it might include units (e.g., "5 kg")
  condition: string;
  dimensions: string; // Corrected to `dimensions` from `dimension` for consistency
  material: string[]; // Can be a single string or an array of materials

  // media
  images: string[];
  video: string | null;
  digitalUrl: string;
  autoDeliver: boolean;

  // flags
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;

  // pricing
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  discount: number;
  finalPrice: number;
  profitMargin: number;
  pricingTiers: PricingTier[]; // New: Added for more complex pricing structures

  // vehicle (Engine & Performance, Ownership & Pricing sections)
  make: string;
  trim: string;
  type: string;
  mileage: string; // Kept as string as it might include units (e.g., "50000 km")
  engineType: string;
  engineSize: number; // Changed to number for calculations
  transmission: string;
  drivetrain: string;
  vin: string;
  logbookStatus: string;
  serviceHistory: string;
  negotiable: boolean;
  financingAvailable: boolean;
  tradeIn: boolean;
  features: any[]; // Generic array for miscellaneous features

  // New vehicle-related fields
  horsepower: number; // Changed to number
  torque: number; // Changed to number
  fuelType: string;
  fuelEconomy: string; // Kept as string as it includes units (e.g., "7.5 L/100km")

  // New ownership-related fields
  previousOwners: number; // Changed to number
  tireCondition: string;
  accidentalHistory: boolean;

  // books
  author: string;
  publisher: string;
  isbn: string;

  // fashion
  fabricComposition: string;
  careInstructions: string;

  // appliances
  energyRating: string;
  warrantyPeriod: string;

  // beauty
  ingredients: string;
  usageInstructions: string;
  expirationDate: string | null;

  // options & amenities
  option: JSON[]; // Generic array for various options
  amenities: string[]; // Specific for properties/services

  // property
  bedrooms: number; // Changed to number
  studios: number; // Changed to number
  bathrooms: number; // Changed to number
  area: string; // Kept as string for units (e.g., "1500 sqft")

  propertyTypeId: string;
  serviceSchedule: string;

  // year & scheduling
  year: number; // Changed to number

  
  // deals
  startDealDate: string | null;
  endDealDate: string | null;

  availabilityStart: string;
  availabilityEnd: string;
  
  tax?: number | null;
  shippingCost?: number | null; 

  // location & contact
  location: any; // Consider a more specific type if possible (e.g., { lat: number, lng: number })
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  contact: string;
  contactName: string;
  email: string;

  // admin
  status: string;
  collectionId: string;
  
  applianceDimensions?: string;

  // Service/Booking related fields (from previous snippet, kept for completeness)
  hourlyRate?: number | null;
  minimumHours?: number | null;
  minNoticePeriod?: string | null;
  maxBookingAhead?: string | null;
  totalCapacity?: number | null;
  deliveryMethod?: string  | null;
  fulfillmentStatus?: string | null;
  providerRating?: number | null;
  
  requiredClientInfo?: string[] | null;
  bookingSlots?: JSON[]; // JSON array

  productCategory?: { id: string; name: string }; // Changed displayName to name for ProductCategory
  productCategoryId?: string;
  
  delivery?: boolean;
  paymentOption?: string;
  showOnGhuba?: boolean;
  
  locationId?: string | null;
  propertyType?: { id: string }; // Assuming PropertyType relation on Product
  
  currentBookedCount?: number | null;
  
  commissionStartDate?: string | Date; // Added
  commissionEndDate?: string | Date; // Added
  commissionType?: string; // Added
  commissionRate?: number; // Added
}

export interface InventoryItem {
  id: string;
  name: string;
  companyId: string;
  productItem: ProductForm;
  inventoryId: string;
  category: StoreCategory;
  agentStock: number;
  companyStock: number;
  sales: number;
  costPrice: number;
  salesPrice: number;
  commissionRate: number;
  commissionType: number;
}

export interface MarketListingForm {
  // Identifiers & relations
  id: string;
  productId: string;
  sellerType: string;
  companyId: string;
  productTypeId?: string; // Added: For propertyType relation
  commissionRateId?: string; // Added for the relation ID

  // Title & description
  name: string;
  description?: string; // Made optional
  longDescription?: string; // Added: Matches schema

  // Category hierarchy & tagging
  productCategoryId: string; // This will hold the ID of the actual ProductCategory
  category: StoreCategory | null; // This holds the *selected StoreCategory object*
  subCategory: any; // JSON from StoreCategory.items or ProductCategory.subcategories
  subCategoryName: string; // If you derive a name from subCategory JSON
  tags: string[];

  // Branding & specs
  brand: string | null;
  model: string;
  color: string[];
  size: string[];
  weight: string;
  condition: string;
  dimensions: string; // Corrected: From dimension to dimensions
  material: string[];

  // Profit & pricing
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  discount: number;
  finalPrice: number;
  profitMargin: number;
  pricingTiers: any[]; // Added: For JSON array of pricing tiers

  // Deal scheduling
  startDealDate: string | null;
  endDealDate: string | null;

  // Feature flags
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;

  // Marketplace-specific
  delivery: boolean;
  paymentOption: string;
  showOnGhuba: boolean;

  // Contact & location
  contactName: string;
  contact: string;
  email?: string; // Added: As per schema
  locationName: string;
  location: any; // JSON for GeoJSON or similar
  locationId?: string | null; // ID for PropertyLocation relation
  latitude: number | null;
  longitude: number | null;
  
  option: JSON[]; // Generic array for various options
  amenities: string[]; // Moved here, was under Property-specific

  // Vehicle-specific
  make: string;
  trim: string;
  type: string;
  mileage: string;
  engineType: string;
  engineSize: number | null; // Corrected to number | null
  horsepower: number | null; // Added: Matches schema
  torque: number | null; // Added: Matches schema
  fuelType: string; // Added: Matches schema
  fuelEconomy: string; // Added: Matches schema
  transmission: string;
  drivetrain: string;
  vin: string;
  logbookStatus: string;
  serviceHistory: string;
  negotiable: boolean;
  financingAvailable: boolean;
  tradeIn: boolean;
  features: any[]; // Added: For JSON array of features

  // Ownership & Pricing (New fields for Vehicle/General)
  previousOwners: number | null; // Added: Matches schema
  tireCondition: string; // Added: Matches schema
  accidentalHistory: boolean; // Added: Matches schema
  tax?: number | null; // Added
  shippingCost?: number | null; // Added

  // Books
  author: string;
  publisher: string;
  isbn: string;

  // Clothing/Fashion
  fabricComposition: string;
  careInstructions: string;

  // Home Appliances
  energyRating: string;
  warrantyPeriod: string;
  applianceDimensions?: string;

  // Beauty Products
  ingredients: string;
  usageInstructions: string;
  expirationDate: string | null;

  // Property-specific
  bedrooms: number | null; // Corrected to number | null
  studios: number | null; // Corrected to number | null
  bathrooms: number | null; // Corrected to number | null
  area: string;
  serviceSchedule: string;

  // Service/Booking related fields
  availabilityStart: string | null; // Nullable
  availabilityEnd: string | null; // Nullable

  bookingSlots?: JSON[]; // JSON array
  minNoticePeriod?: string | null;
  maxBookingAhead?: string | null;
  requiredClientInfo?: string[] | null;
  fulfillmentStatus?: string | null;
  totalCapacity?: number | null; // Corrected to number | null

  currentBookedCount?: number | null; // Corrected to number | null
  providerRating?: number | null; // Corrected to number | null
  hourlyRate?: number | null; // Corrected to number | null
  minimumHours?: number | null; // Corrected to number | null
  deliveryMethod?: string | null;

  // Digital goods
  digitalUrl: string;
  autoDeliver: boolean;

  // Admin-only
  status: string;
  collectionId?: string; // Added: Matches schema
  year?: number | null; // Added: As per schema (vehicle/service year)

  // Commission fields
  commissionType: string;
  commissionRate: number;
  commissionStartDate: string | null;
  commissionEndDate: string | null;

  images?: string[];
  video?: string;
  
  propertyTypeId?: string; // Relation ID
  
  // Timestamps
  createdAt?: string | Date;
  updatedAt?: string | Date;
  

  // The `product` nested object is likely for displaying details from the base product
  // but if the form itself handles all these fields, it might be redundant or for specific scenarios.
  // I've kept it but note that most fields are now direct properties of MarketplaceListingForm
  product?: {
    id: string;
    name: string;
    description?: string;
    brand?: string;
    color?: string[];
    size?: string[];
    // ... all other relevant product fields if you intend to display/edit them through this nested object
    // It's generally better for the form to directly map to the listing's properties
    // unless there's a specific reason for this nested structure.
  }
}