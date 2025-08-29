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
  Prisma
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

// export enum ListingStatus {
//   ACTIVE,
//   PENDING,
//   SOLD,
//   INACTIVE,
//   DRAFT,
//   REJECTED,
//   BUY,
//   RENT,
//   RENTED,
// }

export enum SocialChannel {
  TWITTER,
  INSTAGRAM,
  FACEBOOK,
  LINKEDIN,
}

export enum PolicyType {
  SHIPPING,
  RETURNS,
  PRIVACY,
  TERMS,
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

export interface IUser extends User {}

export interface ICoreValue {
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
  author?: IUser |  null | undefined;
  authorName?: string | null;
  authorTitle?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  order?: number;
}

export interface HeroSlide extends Banner {}
// export interface IPromotion extends Promotion {}
export interface IPromotion {
  id?: string;
  companyId: string;

  code?: string | null;
  title: string;
  description?: string | null;

  startsAt?: Date | string | null;
  endsAt?: Date | string | null;

  ctaText?: string | null;
  ctaLink?: string | null;
  bannerUrl?: string | null;

  featureImage1?: string | null;
  featureImage2?: string | null;
  featureImage3?: string | null;

  badgeText?: string | null;
  price?: string | null;

  perks: { id:string; icon: string; label: string }[];
  trustLogos: { id:string; url: string }[];

  themePrimary?: string | null;
  themeSecondary?: string | null;

  createdAt?: Date | string;
  updatedAt?: Date | string;
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
  order?: number;
}

export interface Stat {
  label: string;
  value: string;
  iconUrl?: string;
  order?: number;
}

export interface PricingTier {
  name: string;
  description?: string;
  price: number;
  duration?: string;
  features: string[];
  isFeatured?: boolean;
}

export interface IPageSection extends PageSection {}

export interface AppPromo {
  id?: string;
  headline: string;
  subheading: string;
  buttons: { 
    label: string; 
    href: string; 
    icon: string 
  }[];
  screenshots: string[];
}

export interface IBlog extends Blog {}

//################################################################################
//## E-COMMERCE & PRODUCT INTERFACES
//################################################################################

export interface ISubcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number | null;
  visible?: boolean;
  tempId?: string;
  _id?: any;
}

export interface IProductCategory {
  id: string;
  name: string;
  icon?: string | null;
  image?: string | null;
  slug: string;
  description: string;
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string[];
  sortOrder: number;
  visible: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  createdBy: string;
  updatedBy: string;
  status: string;
  allBrands: string[];
  tags: string[];
  subcategories: ISubcategory[];
  imageAlt: string;
  thumbnail?: string | null;
  bannerImage?: string | null;
  localization: any;
  productCount: number;
  isFeatured: boolean;
  showInHomepage: boolean;
  attributes: any;
  companyId?: string | null;
}

export interface IStoreCategory {
  id: string;
  companyId?: string| null | undefined;
  categoryId: string | null;
  displayName?: string | null;
  icon?: string | null;
  sortOrder: number;
  visible: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  subcategories: ISubcategory[];
  allBrands: string[];
  category?: IProductCategory;
}

export interface ProductForm {
  // Manual definition matching Prisma's Product model
  id: string;
  name: string;
  description?: string | null;
  longDescription?: string | null;
  category?: string | null;
  subCategory?: any;
  subCategoryName?: string | null;
  images: any[];
  video?: string | null;
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
  amenities: string[];
  propertyTypeId?: string | null;
  area?: string | null;
  bedrooms: any[];
  studios: any[];
  bathrooms?: string | null;
  serviceSchedule?: string | null;
  year?: number | null;
  availabilityStart?: Date | null;
  availabilityEnd?: Date | null;
  location?: GeoLocation | null; // Correct client-side type
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
  bookingSlots: any[];
  status: ListingStatus;
  collectionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tax?: number | null;
  shippingCost?: number | null;
  locationId?: string | null;
}

export interface MarketListingForm {
  // Manual definition matching Prisma's marketplaceListings model
  id: string;
  companyId?: string | null;
  sellerId?: string | null;
  sellerType?: "CLIENT" | "CONSUMER" | "ADMIN" | "COMPANY" | "INDIVIDUAL" | null;
  productId?: string | null;
  productCategoryId: string;
  category?: string | null;
  subCategory: any;
  subCategoryName?: string | null;
  tags: string[];
  brand?: string | null;
  option: any[];
  name: string;
  description?: string | null;
  longDescription?: string | null;
  model?: string | null;
  color: string[];
  size: string[];
  weight: string[];
  condition?: string | null;
  dimensions?: string | null;
  material: string[];
  quantity: number;
  images: any[];
  video?: string | null;
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
  startDealDate?: Date | null;
  endDealDate?: Date | null;
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
  area?: string | null;
  propertyTypeId?: string | null;
  serviceSchedule?: string | null;
  bedrooms: any[];
  studios: any[];
  bathrooms?: string | null;
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
  availabilityStart?: Date | null;
  availabilityEnd?: Date | null;
  bookingSlots: any[];
  minNoticePeriod?: string | null;
  maxBookingAhead?: string | null;
  requiredClientInfo: string[];
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
  // location?: GeoLocation | null; // Correct client-side type
  location: Prisma.JsonValue; 
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationId?: string | null;
  collectionId?: string | null;
  commissionRateId?: string | null;
}

//################################################################################
//## EDUCATION (LMS) INTERFACES
//################################################################################

export interface ICourse extends Course {}

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

export interface ILocation extends Location {
  children?: ILocation[];
}

export interface ICompanyLocation extends CompanyLocation {}

export interface SelectedLocation {
  id: string;
  name: string;
  children: SelectedLocation[];
}

//################################################################################
//## MAIN STORE FORM INTERFACE (Represents the Company model for forms)
//################################################################################

// FIXED: This interface no longer extends `Company` to avoid type conflicts.
// It manually defines the shape of the data for your store form.
export interface StoreForm {
  // All fields from Prisma's Company model
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  hasWebsite: boolean | null | undefined;
  companyCategoryId: string | null;
  category: string;
  logoUrl: string | null;
  bannerUrl: string | null;
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
  seo: SEO | null;
  analyticsConfig: AnalyticsConfig | null;
  paymentSettings: PaymentSettings | null;
  shippingSettings: ShippingSettings | null;
  StoreCategory: IStoreCategory[];
  CompanyLocation: ICompanyLocation[];
  marketplaceListings: MarketListingForm[];
  Writer: User[];
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
  Doctor: User[];
  Podcast: any[];
  services: any[];
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
  onChangeSettings: (updated: Partial<StoreForm>) => void;
  onToggleDay: (dayKey: string) => void;

  // 🔥 REMOVED: Old category toggle functions
  // onBulkToggle: (ids: string[], categoryContext: string) => void;
  // onToggleParent: (cat: IProductCategory) => void;
  // onToggleSub: (parentId: string, sub: ISubcategory) => void;
  // onToggleBrand: (parentId: string, brand: any) => void;

  // ✨ ADDED: Reducer dispatch for all category actions
  categoryDispatch: React.Dispatch<CategoryAction>;

  // ✅ Hero slide handlers (unchanged)
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
    
  // ✅ Promotion handlers (unchanged)
  onUpdatePromotion: (
      index: number,
      field: keyof IPromotion,
      value: string
    ) => void;
  onAddPromotion: () => void;
  onRemovePromotion: (index: number) => void;
  onPromotionImageUpload: (index: number, file: File) => void;

  onAddPerk: (promoIndex: number) => void;
  onUpdatePerk: (promoIndex: number, perkIndex: number, field: keyof { id:string; icon: string; label: string }, value: string) => void;
  onRemovePerk: (promoIndex: number, perkIndex: number) => void;
  onAddTrustLogo: (promoIndex: number) => void;
  onUpdateTrustLogo: (promoIndex: number, logoIndex: number, url: string) => void;
  onRemoveTrustLogo: (promoIndex: number, logoIndex: number) => void;

  // ✅ Location handlers (unchanged)
  onToggleLocation: (location: Location, isSelected: boolean) => void;
  onBulkToggleLocations: (locationIds: string[]) => void;

  // ✅ Media handlers (unchanged)
  handleMediaUpload: (field: "logoUrl" | "bannerUrl", file: File) => void;
  handleMediaRemove: (field: "logoUrl" | "bannerUrl") => void;
}
// export interface Handlers {
//   handleChange: (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => void;
//   onUpdateArray: <T>(
//     key: keyof StoreForm,
//     idx: number,
//     field: keyof T,
//     value: any
//   ) => void;
//   onAddArray: <T>(key: keyof StoreForm, item: T) => void;
//   onRemoveArray: (key: keyof StoreForm, idx: number) => void;
//   setAddress: (address: string, geo: GeoLocation) => void;
//   onChangeSettings: (updated: Partial<StoreForm>) => void;
//   onBulkToggle: (ids: string[], categoryContext: string) => void;
//   onToggleDay: (dayKey: string) => void;
//   onToggleParent: (cat: IProductCategory) => void;
//   onToggleSub: (parentId: string, sub: ISubcategory) => void;
//   onToggleBrand: (parentId: string, brand: any) => void;

//   onUpdateHeroSlide: (
//       index: number,
//       field: keyof HeroSlide,
//       value: string
//     ) => void;
//   onAddHeroSlide: () => void;
//   onRemoveHeroSlide: (index: number) => void;
//   handleSlideImageUpload: (
//       index: number,
//       file: File,
//       field: keyof HeroSlide
//     ) => void;
//   onUpdatePromotion: (
//       index: number,
//       field: keyof Promotion,
//       value: string
//     ) => void;
//   onAddPromotion: () => void;
//   onRemovePromotion: (index: number) => void;
//   onPromotionImageUpload: (index: number, file: File) => void;

//   onToggleLocation: (location: Location, isSelected: boolean) => void;
//   onBulkToggleLocations: (locationIds: string[]) => void;

//   handleMediaUpload: (field: "logoUrl" | "bannerUrl", file: File) => void;
//   handleMediaRemove: (field: "logoUrl" | "bannerUrl") => void;
  
// }

export interface StepConfig {
  key: string;
  title: string;
  render: (
    form: StoreForm,
    handlers: Handlers,
    availableCategories: IProductCategory[],
    allLocs: ILocation[], 
    selectedLocationsForDisplay: SelectedLocation[],
    selectedCategoriesArray: IStoreCategory[],
    dispatch: React.Dispatch<CategoryAction>
  ) => React.ReactNode;
}

// Define all possible actions for type safety
export type CategoryAction =
  | { type: 'TOGGLE_PARENT'; payload: { parent: IProductCategory } }
  | { type: 'TOGGLE_SUB'; payload: { parentId: string; subcategory: ISubcategory; parentData: IProductCategory } }
  | { type: 'TOGGLE_BRAND'; payload: { parentId: string; brand: string; parentData: IProductCategory } }
  | { type: 'BULK_UPDATE'; payload: { ids: Set<string>; availableForContext: IProductCategory[] } };