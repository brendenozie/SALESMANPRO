import {
  User,
  Location,
  CompanyLocation,
  Banner,
  Promotion,
  Blog,
  PageSection,
  Event,
  Course,
  ClassSchedule,
  SEO,
  AnalyticsConfig,
  PaymentSettings,
  ShippingSettings,
  CompanySettings,
  ListingStatus,
  Prisma,
  Project,
  ExpertStatus,
  Expertise,
} from "@prisma/client";
import "next-auth";
import { ChangeEvent } from "react";

//################################################################################
//## ENUMS FROM PRISMA SCHEMA
//################################################################################

export enum ROLE {
  USER,
  CONSUMER,
  AGENT,
  CLIENT,
  ADMIN,
  STUDENT,
  EDUCATOR,
  HEADTEACHER,
  PARENT,
  JUNIOR,
  SENIOR,
  SOPHOMORE,
  FRESHMAN,
  WRITER,
  STAFF,
  MODERATOR,
  PATIENT,
  DOCTOR,
  PATRON,
  EXPERT,
  STAFF_MEMBER,
  SERVICE_PROVIDER,
}

export enum UserStatus {
  ACTIVE,
  INACTIVE,
  SUSPENDED,
}

export enum SocialChannel {
  FACEBOOK = "FACEBOOK",
  TWITTER = "TWITTER",
  INSTAGRAM = "INSTAGRAM",
  LINKEDIN = "LINKEDIN",
  YOUTUBE = "YOUTUBE",
  TIKTOK = "TIKTOK",
}

export enum PolicyType {
  SHIPPING = "SHIPPING",
  RETURNS = "RETURNS",
  PRIVACY = "PRIVACY",
  TERMS = "TERMS",
  CANCELLATION = "CANCELLATION",
  CONFIDENTIALITY = "CONFIDENTIALITY",
}

export enum SectionType {
  Hero,
  FeatureGrid,
  TestimonialCarousel,
  BlogPreview,
  CustomHtml,
  About,
  Services,
  Awards,
  HealthTips,
  Features,
  HowItWorks,
  Pricing,
  CTA,
  Metrics,
  Stats,
}

export enum EventStatus {
  SCHEDULED,
  POSTPONED,
  CANCELLED,
  COMPLETED,
}

export enum EventType {
  GENERAL,
  ACADEMIC,
  SPORTS,
  CULTURAL,
  MEETING,
  WORKSHOP,
  ORIENTATION,
  FUNDRAISER,
  OTHER,
}

export enum CourseStatus {
  DRAFT,
  PUBLISHED,
  ARCHIVED,
  INACTIVE,
  ACTIVE,
}

//################################################################################
//## CORE & COMPANY-RELATED INTERFACES
//################################################################################

export interface GeoLocation {
  lat: number;
  lng: number;
}

export type OpeningHours = Record<
  string,
  { open: string; close: string } | undefined
>;

export interface IUser extends User { }

export interface ICoreValue {
  id?: string;
  title: string;
  description: string | null;
  icon: string | null;
}

export interface SocialLink {
  id?: string;
  channel: SocialChannel;
  url: string;
}
export interface Policy {
  id?: string;
  type: PolicyType;
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
  quote: string;
  authorId?: string | null | undefined;
  author?: IUser | null | undefined;
  authorName?: string | null;
  authorTitle?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  order?: number;
}

export interface HeroSlide extends Banner { }
// export interface IPromotion extends Promotion {}
export interface IPromotion {
  id?: string;
  companyId: string;

  code?: string | null | undefined;
  title: string;
  description?: string | null | undefined;

  startsAt?: Date | string | null | undefined;
  endsAt?: Date | string | null | undefined;

  ctaText?: string | null | undefined;
  ctaLink?: string | null | undefined;
  bannerUrl?: string | null | undefined;

  featureImage1?: string | null | undefined;
  featureImage2?: string | null | undefined;
  featureImage3?: string | null | undefined;

  badgeText?: string | null | undefined;
  price?: string | null | undefined;

  perks: { id: string; icon: string; label: string }[];
  trustLogos: { id: string; url: string }[];

  themePrimary?: string | null | undefined;
  themeSecondary?: string | null | undefined;

  createdAt?: Date | string | null | undefined;
  updatedAt?: Date | string | null | undefined;
}
export interface PricingTier {
  name: string;
  frequency?: string;
  badge?: string;
  description?: string;
  price: number;
  monthlyPrice?: number;
  annualPrice?: number;
  duration?: string;
  features: string[];
  isFeatured?: boolean;
}

export interface IPageSection extends PageSection { }
export interface AppPromo {
  id?: string;
  headline: string;
  subheading: string;
  buttons: {
    label: string;
    href: string;
    icon: string;
  }[];
  screenshots: string[];
}

export interface IBlog extends Blog { }

//################################################################################
//## E-COMMERCE & PRODUCT INTERFACES
//################################################################################
/**
 * Represents a short highlight or key section — often used
 * in "About", "Mission", or "Vision" areas.
 */
export interface Highlight {
  id?: string;
  title: string;
  description: string;
  icon?: string | null; // Optional Heroicon or Lucide name
  imageUrl?: string | null; // Optional supporting image
  order?: number; // For sorting if needed
}

/**
 * Represents a numerical or simple textual stat —
 * e.g. "500+ Clients", "10 Years of Experience".
 */
export interface Stat {
  id?: string;
  label: string;
  value: number | string;
  icon?: string | null;
  iconUrl?: string;
  suffix?: string | null; // e.g. "K", "+", "%"
  prefix?: string | null; // e.g. "$"
  color?: string | null; // Optional color for display
  order?: number;
}

/**
 * Represents more detailed performance or operational metrics.
 * Ideal for dashboards, analytics cards, or company KPIs.
 */
export interface Metric {
  id?: string;
  // title: string;
  value: any; //number;
  unit?: string | null; // e.g. "%", "users", "USD"
  trend?: "up" | "down" | "neutral";
  trendValue?: number | null; // e.g. +12 or -3.4
  icon?: string | null;
  description?: string | null;
  updatedAt?: Date | string | null;

  label: string;
  iconUrl?: string;
  order?: number;
}

/**
 * Represents awards, recognitions, or achievements a company has earned.
 */
export interface Award {
  id?: string;
  // title: string;
  organization?: string | null; // Who issued the award
  year?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  link?: string | null; // External reference or proof
  category?: string | null;
  name: string;
  iconUrl: string;
  order?: number;
}

/**
 * Represents color, typography, and layout customization
 * for multi-tenant theming and white-label design.
 */
export interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  buttonStyle?: "rounded" | "square" | "pill";
  layoutStyle?: "default" | "boxed" | "full";
  borderRadius?: number;
  heroOverlayOpacity?: number;
  darkMode?: boolean;
  // Optional background textures or hero options
  heroImage?: string | null;
  logoStyle?: "light" | "dark" | "auto";
  customCSS?: string | null;
}

export interface ISubcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number | null;
  icon?: string | null;
  visible?: boolean;
  tempId?: string;
  image?: string | null;
  _id?: any;
}

export interface IProductCategory {
  id: string;
  name: string;
  icon?: string | null;
  image?: string | null;
  slug: string;
  description?: string;
  longDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  sortOrder?: number | null | undefined;
  visible?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  status?: string;
  allBrands?: string[];
  tags?: string[];
  subcategories?: ISubcategory[];
  imageAlt?: string;
  thumbnail?: string | null;
  bannerImage?: string | null;
  localization?: any;
  productCount?: number;
  isFeatured?: boolean;
  showInHomepage?: boolean;
  attributes?: any;
  companyId?: string | null;
}

export interface IStoreCategory {
  id: string;
  companyId?: string | null | undefined;
  categoryId: string | null;
  displayName?: string | null;
  icon?: string | null;
  image?: string | null;
  sortOrder: number;
  visible: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  subcategories: ISubcategory[];
  allBrands: string[];
  category?: IProductCategory;
}

// 1. System state: Tracks the workflow and moderation lifecycle
export enum ListingSystemStatus {
  DRAFT = "DRAFT", // Form saved but not published
  UNDER_REVIEW = "UNDER_REVIEW", // Sent to admin for approval (Replaces REJECTED pipeline)
  ACTIVE = "ACTIVE", // Live on the marketplace
  REJECTED = "REJECTED", // Failed admin moderation
  INACTIVE = "INACTIVE", // Hidden/archived by the seller
}

// 2. Market state: Tracks transactional availability for consumers
export enum ListingMarketStatus {
  AVAILABLE = "AVAILABLE", // Instantly purchasable / Ready
  UNDER_OFFER = "UNDER_OFFER", // Real estate/Vehicle deposit paid
  SOLD = "SOLD", // Out of stock permanently / Handled
  RENTED = "RENTED", // For rental categories
}

export enum ListingTransactionType {
  SALE = "SALE", // Replaces BUY
  RENT = "RENT", // Replaces RENT
}

export interface VariantOptionItem {
  category: "color" | "size" | "material" | "weight" | string;
  name: string;
  extraPrice: number;
}
export interface ProductForm {
  // Manual definition matching Prisma's Product model
  id: string;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  category?: any | null; //string | null;
  subCategory?: any;
  subCategoryName?: string | null;
  productCategory?: any | null | undefined;
  images: any[];
  videos?: any[]; //string | null;
  ebooks?: any[]; //string | null;
  tags: string[];
  brand?: string | null;
  companyId?: string | null;
  productCategoryId?: string | null;
  model?: string | null;
  color: string[];
  size: string[];
  weight: string[];
  condition?: string | null;
  dimensions?: string | null;
  material: string[];
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  discount: number;
  finalPrice: number;
  profitMargin: number;
  pricingTiers: any[];
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isDiscounted: boolean;
  startDealDate?: Date | null;
  endDealDate?: Date | null;
  isAvailable: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  make?: string | null;
  trim?: string | null;
  type?: string | null;
  mileage?: string | null;
  engineType?: string | null;
  engineSize?: number | null;

  requiredClientInfo: string[];
  horsepower?: number | null;
  torque?: number | null;
  fuelType?: string | null;
  fuelEconomy?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  vin?: string | null;
  logbookStatus?: string | null;
  serviceHistory?: string | null;
  negotiable: boolean;
  financingAvailable: boolean;
  tradeIn: boolean;
  features: any[];
  previousOwners?: number | null;
  tireCondition?: string | null;
  accidentalHistory?: boolean | null;
  author?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  fabricComposition?: string | null;
  careInstructions?: string | null;
  energyRating?: string | null;
  warrantyPeriod?: string | null;
  applianceDimensions?: string | null;
  ingredients?: string | null;
  usageInstructions?: string | null;
  expirationDate?: Date | null;
  option: any[];
  // option: VariantOptionItem[];
  amenities: string[];
  propertyTypeId?: string | null;
  area?: string | null;
  bedrooms: any[];
  studios: any[];
  bathrooms?: string | null;
  serviceSchedule?: string | null;
  year?: number | null;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  location?: Prisma.JsonValue; //GeoLocation | null; // Correct client-side type
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact?: string | null;
  contactName?: string | null;
  email?: string | null;
  delivery: boolean;
  paymentOption: string;
  showOnGhuba?: boolean | null;
  digitalUrl?: string | null;
  autoDeliver?: boolean | null;
  hourlyRate?: number | null;
  minimumHours?: number | null;
  minNoticePeriod?: string | null;
  maxBookingAhead?: string | null;
  totalCapacity?: number | null;
  deliveryMethod?: string | null;
  fulfillmentStatus?: string | null;
  providerRating?: number | null;
  bookingSlots: any[] | undefined;
  status: ListingStatus;
  collectionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tax?: number | null;
  shippingCost?: number | null;
  locationId?: string | null;

  currentBookedCount?: number | null;

  listingMarketStatus: ListingMarketStatus;
  listingSystemStatus: ListingSystemStatus;
  listingTransactionType: ListingTransactionType;
}

export interface MarketListingForm {
  duration: string | null | undefined;

  id: string;
  companyId?: string | null;
  sellerId?: string | null;
  sellerType?:
  | "CLIENT"
  | "CONSUMER"
  | "ADMIN"
  | "COMPANY"
  | "INDIVIDUAL"
  | null;
  productId?: string | null;
  productCategoryId: string;
  productCategory?: any | null | undefined;
  category?: any | null | undefined; //string | null;
  subCategory: any;
  subCategoryName?: string | null;
  tags: string[];
  brand?: string | null;
  // option: VariantOptionItem[];
  option: any[];
  name: string;
  description?: string | null;
  longDescription?: string | null;
  model?: string | null;
  color: string[];
  size: string[];
  weight: string[];

  badge?: string | null;

  condition?: string | null;
  dimensions?: string | null;
  material: string[];
  quantity: number;
  images: any[];
  videos?: any[]; //string | null;
  ebooks?: any[]; //string | null;
  profitMargin?: number | null;
  buyingPrice: number;
  sellingPrice: number;
  finalPrice?: number | null;
  discount?: number | null;
  tax?: number | null;
  shippingCost?: number | null;
  pricingTiers: any[];
  isAvailable: boolean;
  isOnOffer: boolean;
  isFlashDeal: boolean;
  isNewArrival: boolean;
  isDiscounted: boolean;
  isFeatured: boolean;

  author?: string | null;
  publisher?: string | null;
  isbn?: string | null;
  fabricComposition?: string | null;
  careInstructions?: string | null;
  energyRating?: string | null;
  warrantyPeriod?: string | null;
  applianceDimensions?: string | null;
  ingredients?: string | null;
  usageInstructions?: string | null;

  area?: string | null;
  propertyTypeId?: string | null;
  serviceSchedule?: string | null;

  bedrooms: any[];
  studios: any[];
  bathrooms?: string | null | number;
  digitalUrl?: string | null;
  autoDeliver?: boolean | null;
  make?: string | null;
  trim?: string | null;
  type?: string | null;
  mileage?: string | null;
  engineType?: string | null;
  engineSize?: number | null;
  horsepower?: number | null;
  torque?: number | null;
  fuelType?: string | null;
  fuelEconomy?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  vin?: string | null;
  logbookStatus?: string | null;
  serviceHistory?: string | null;
  negotiable?: boolean | null;
  financingAvailable?: boolean | null;
  tradeIn?: boolean | null;
  features: any[];
  previousOwners?: number | null;
  tireCondition?: string | null;
  accidentalHistory?: boolean | null;
  year?: number | null;

  bookingSlots: any[] | undefined;
  minNoticePeriod?: string | null;
  maxBookingAhead?: string | null;
  requiredClientInfo: string[] | undefined;

  fulfillmentStatus?: string | null;
  totalCapacity?: number | null;
  currentBookedCount?: number | null;
  providerRating?: number | null;
  hourlyRate?: number | null;
  minimumHours?: number | null;
  deliveryMethod?: string | null;
  contact?: string | null;
  email?: string | null;
  contactName?: string | null;
  amenities: string[];
  delivery: boolean;
  paymentOption: string;
  showOnGhuba?: boolean | null;
  status: ListingStatus;
  createdAt?: Date | null;
  updatedAt?: Date | null;

  location: Prisma.JsonValue;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationId?: string | null;
  collectionId?: string | null;
  commissionRateId?: string | null;

  startDealDate?: string | null;
  endDealDate?: string | null;
  expirationDate?: string | null;
  availabilityStart?: string | null;
  availabilityEnd?: string | null;
  commissionStartDate?: string | null;
  commissionEndDate?: string | null;

  listingMarketStatus: ListingMarketStatus;
  listingSystemStatus: ListingSystemStatus;
  listingTransactionType: ListingTransactionType;
}

//################################################################################
//## EDUCATION (LMS) INTERFACES
//################################################################################

export interface ICourse extends Course { }

export interface TimetableEntry extends ClassSchedule {
  courseTitle: string;
  courseAcademicLevels: { id: string; name: string }[];
  educatorName: string;
  educatorEmail: string;
}

export interface CourseOption {
  id: string;
  title: string;
  academicLevels: { id: string; name: string }[];
  instructorName?: string;
}
export interface EducatorOption {
  id: string;
  name: string | null;
  email: string;
}
export interface AcademicLevelOption {
  id: string;
  name: string;
  sortOrder?: number;
}

//################################################################################
//## LOCATION INTERFACES
//################################################################################

export interface Expert {
  id: string;
  userId: string;
  user: User; // always included if you query with include
  companyId: string;
  specialty: string;
  experienceYears?: number;
  travelsCompleted?: number;
  photoUrl?: string;
  bio?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: ExpertStatus;
  expertise: Expertise[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILocation extends Location {
  children?: ILocation[];
}

export interface ICompanyLocation extends CompanyLocation {
  location?: ILocation;
}

export interface SelectedLocation {
  id: string;
  name: string;
  children: SelectedLocation[];
}
export interface IDestination {
  id: string;
  name: string;
  slug: string;
  country: string;
  continent: string;
  description: string;
  longDescription?: string;
  images: string[];
  bannerImage?: string | null;
  activities: string[];
  bestTimeToVisit?: string | null;
  averageRating?: number | null;
  published: boolean;
}
export interface ITourPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  duration: string;
  price: number;
  status: string;
  imageUrl?: string | null;
  images: string[];
  destinations: Pick<IDestination, "id" | "name" | "slug" | "country">[]; // lightweight relation
}

//################################################################################
//## MAIN STORE FORM INTERFACE (Represents the Company model for forms)
//################################################################################

export interface CompanyAddress {
  id?: string | null;

  // Link back to the Company
  // companyId: string;

  // Address Status
  isMain?: boolean | null; // Indicates if this is the primary address

  // Location Data
  address?: string | null;
  lat?: number | null;
  lng?: number | null;

  // Contact info specific to this location
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;

  // Additional helpful metadata
  label?: string | null; // e.g., "Headquarters", "Warehouse", "Nairobi Branch"
  instructions?: string | null; // e.g., "Use the back entrance"

  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// FIXED: This interface no longer extends `Company` to avoid type conflicts.
// It manually defines the shape of the data for your store form.
export interface StoreForm {
  whatsappSettings?: any;
  // All fields from Prisma's Company model
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  hasWebsite: boolean | null | undefined;
  companyCategoryId: string | null;
  /**
   * The broad business category (e.g. "E-commerce", "Health & Fitness")
   */
  category: string;

  /**
   * The specific design variant chosen (e.g. "Modern Shop (v1)")
   */
  variant?: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  videoUrl?: string | null;
  contactEmail: string;
  contactPhone: string | null;
  site: string | null;
  address: string | null;
  domain: string | null;
  currency: string;
  locale: string;
  userId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
  sEOId: string | null;
  CoreValues: ICoreValue[];

  // Manually typed JSON and relational fields for client-side use
  geoLocation: GeoLocation | null;
  openingHours: OpeningHours | null;
  pricingTiers: PricingTier[];
  themeSettings: Record<string, any> | null;
  awards: Award[] | null;
  metrics: Metric[] | null;
  stats: Stat[] | null;

  sectionSubtitle?: string | null | undefined;
  sectionTitle?: string | null | undefined;
  sectionDescription?: string | null | undefined;

  galleries: IGallery[];
  addresses: CompanyAddress[];

  // Relational arrays
  settings: CompanySettings | null;
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  promotions: IPromotion[];
  Announcement: any[]; // Define IAnnouncement if needed
  Collection: any[]; // Define IAnnouncement if needed
  pageSections: IPageSection[];
  heroSlides: HeroSlide[];
  appPromos: AppPromo[];
  events: Event[];
  courses: ICourse[];
  blogs: IBlog[];
  projects: Project[];
  seo: SEO | null;
  analyticsConfig: AnalyticsConfig | null;
  paymentSettings: PaymentSettings | null;
  shippingSettings: ShippingSettings | null;
  StoreCategory: IStoreCategory[];
  CompanyLocation: ICompanyLocation[];
  marketplaceListings: MarketListingForm[];
  Writer: User[];
  Expert: Expert[];
  salesAgents: {
    id: string;
    userId: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    companyId: string | null | undefined;
    loginCode: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    specialties: string[];
    regions: string[];
  }[];
  Educator: Educator[];
  Doctor: User[];
  packages: any[];
  Podcast: any[];
  services: any[];
  destinations: IDestination[];
  tourPackages: ITourPackage[];

  // 🧠 Extended Company Insights
  partnerLogos?: { src: string; alt: string }[] | null | undefined; // For marquee sections

  founderName?: string | null | undefined;
  founderQuote?: string | null | undefined;
  founderImage?: string | null | undefined; // Optional field for founder photo

  // subscriptionTier?: string | null | undefined; // e.g., "Basic", "Pro", "Enterprise"

  subscription: Subscription | null; // Optional subscription details
}

export interface Subscription {
  id?: string | null;
  companyId?: string | null;
  tier?: string | null; // e.g., "Basic", "Pro", "Enterprise"
  status?: "ACTIVE" | "CANCELLED" | "EXPIRED" | null;
  startDate?: Date | null;
  endDate?: Date | null; // null if ongoing
  autoRenew?: boolean | null;
  paymentMethod?: string | null; // e.g., "Credit Card", "PayPal"
  billingCycle?: "MONTHLY" | "ANNUAL" | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  renewalDate?: Date | null; // Next renewal date if applicable
  subscriptionStatus?: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE" | "TRIAL" | "CANCELED" | "UNPAID" | "PAUSED" | "PENDING" | "COMPLETED" | "FAILED" | "INACTIVE" | "SUSPENDED" | "TERMINATED" | "REFUNDED" | "CHARGEBACK" | "ON_HOLD" | "RENEWAL_PENDING" | "RENEWAL_FAILED" | "RENEWAL_COMPLETED" | "RENEWAL_CANCELLED" | "RENEWAL_EXPIRED" | null;
  plan?: {
    id?: string | null;
    name?: string | null; // e.g., "Basic", "Pro", "Enterprise"
    price?: number | null; // Price in cents or smallest currency unit
    features: string[] | null; // List of features included in the plan
  } | null;
}

export interface IGalleryItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  altText: string | null;
  order: number;
  featured: boolean;
  galleryId: string;
  createdAt: Date;
}

export interface IGallery {
  id: string;
  title: string;
  description: string | null;
  type: string | null; // e.g., "office", "events", "products"
  isFeatured: boolean;
  companyId: string;
  items: IGalleryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type EducatorStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"; // adjust if you have an enum

export interface Educator {
  id: string;
  userId: string;
  user?: User;

  phone?: string | null;
  bio?: string | null;
  address?: string | null;
  profilePicture?: string | null;

  specialty?: string | null; // e.g., "Fitness", "Yoga", "Nutrition"
  certifications: string[]; // array of cert names
  photoUrl?: string | null; // profile photo URL
  status: EducatorStatus; // ACTIVE by default

  loginCode: string; // unique login code

  departmentId?: string | null;
  // department?: Department | null;    // add if you want to expand this relation

  createdAt?: Date | null;
  updatedAt?: Date | null;

}

//################################################################################
//## EVENT INTERFACE
//################################################################################

export interface IEvent extends Event {
  ticketsSold?: number;
}

//################################################################################
//## HANDLERS & MISC
//################################################################################

export interface Handlers {
  // ✅ General form handlers (unchanged)
  onUpdatePaymentSettings: (updatedSettings: PaymentSettings) => void;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onUpdateArray: <T>(
    key: keyof StoreForm,
    idx: number,
    field: keyof T,
    value: any,
  ) => void;
  onAddArray: <T>(key: keyof StoreForm, item: T) => void;
  onRemoveArray: (key: keyof StoreForm, idx: number) => void;
  setAddress: (address: string, geo: GeoLocation) => void;

  savedLocations?: CompanyAddress[];
  selectedLocationId?: string | null;

  handleLocationSelect: (newLocation: CompanyAddress) => void,
  handleLocationSave: (updatedLocation: CompanyAddress) => void,
  handleLocationUpdate: (updatedLocation: CompanyAddress) => void,
  handleLocationDelete: (locationId: string) => void,

  onChangeSettings: (updated: Partial<StoreForm>) => void;
  onToggleDay: (dayKey: string) => void;

  // ✨ ADDED: Reducer dispatch for all category actions
  categoryDispatch: React.Dispatch<CategoryAction>;

  // ✅ Hero slide handlers (unchanged)
  onUpdateHeroSlide: (
    index: number,
    field: keyof HeroSlide,
    value: string,
  ) => void;
  onAddHeroSlide: () => void;
  onRemoveHeroSlide: (index: number) => void;
  handleSlideImageUpload: (
    index: number,
    file: File,
    field: keyof HeroSlide,
  ) => void;

  // ✅ Promotion handlers (unchanged)
  onUpdatePromotion: (
    index: number,
    field: keyof IPromotion,
    value: string,
  ) => void;
  onAddPromotion: () => void;
  onRemovePromotion: (index: number) => void;
  onPromotionImageUpload: (
    index: number,
    file: File,
    field: keyof IPromotion,
  ) => void;

  onAddPerk: (promoIndex: number) => void;
  onUpdatePerk: (
    promoIndex: number,
    perkIndex: number,
    field: keyof { id: string; icon: string; label: string },
    value: string,
  ) => void;
  onRemovePerk: (promoIndex: number, perkIndex: number) => void;
  onAddTrustLogo: (promoIndex: number) => void;
  onUpdateTrustLogo: (
    promoIndex: number,
    logoIndex: number,
    field: "id" | "url",
    value: string,
  ) => void;
  onRemoveTrustLogo: (promoIndex: number, logoIndex: number) => void;

  // ✅ Location handlers (unchanged)
  onToggleLocation: (location: Location, isSelected: boolean) => void;
  onBulkToggleLocations: (locationIds: string[]) => void;

  // ✅ Media handlers (unchanged)
  handleMediaUpload: (
    field: "logoUrl" | "bannerUrl" | "videoUrl" | "founderImage",
    file: File,
  ) => void;
  handleMediaRemove: (
    field: "logoUrl" | "bannerUrl" | "videoUrl" | "founderImage",
  ) => void;

  handleArrayChange: (
    field: "partnerLogos",
    index: number,
    key: string,
    value: string | number,
  ) => void;
  addItem: (field: "partnerLogos") => void;
  removeItem: (field: "partnerLogos", index: number) => void;

  prev: () => void;
  next: () => void;
  goToStep: (stepKey: string) => void;
  totalSteps: number;
}

export interface WhatsAppAIResult {
  reply: string;

  intent:
  | "GREETING"
  | "SEARCH_PRODUCT"
  | "PRODUCT_DETAILS"
  | "CREATE_ORDER"
  | "ORDER_STATUS"
  | "BOOK_SERVICE"
  | "CANCEL_ORDER"
  | "SELLER_ONBOARDING"
  | "LISTING_HELP"
  | "FAQ"
  | "PROMOTION"
  | "HUMAN_HANDOFF"
  | "UNKNOWN";

  confidence: number;

  language: string;

  requiresHuman: boolean;

  leadDetected: boolean;

  entities: {
    productId?: string;
    listingId?: string;
    orderId?: string;
    category?: string;
    quantity?: number;
    date?: string;
    timeSlot?: string;
    paymentOption?: string;
    location?: string;
  };

  action?: {
    type: string;
    payload?: Record<string, unknown>;
  };
}

export interface StepConfig {
  key: string;
  title: string;
  render: (
    form: StoreForm,
    handlers: Handlers,
    siteCategories: any[],
    availableCategories: IProductCategory[],
    allLocs: ILocation[],
    selectedLocationsForDisplay: SelectedLocation[],
    selectedCategoriesArray: IStoreCategory[],
    dispatch: React.Dispatch<CategoryAction>,
  ) => React.ReactNode;
}

// Define all possible actions for type safety
export type CategoryAction =
  | { type: "TOGGLE_PARENT"; payload: { parent: IProductCategory } }
  | {
    type: "TOGGLE_SUB";
    payload: {
      parentId: string;
      subcategory: ISubcategory;
      parentData: IProductCategory;
    };
  }
  | {
    type: "TOGGLE_BRAND";
    payload: {
      parentId: string;
      brand: string;
      parentData: IProductCategory;
    };
  }
  | {
    type: "BULK_UPDATE";
    payload: { ids: Set<string>; availableForContext: IProductCategory[] };
  };


