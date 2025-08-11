// types.ts

import {
  User,
  Company,
  Product,
  ProductCategory,
  StoreCategory,
  Location,
  CompanyLocation,
  Banner,
  Promotion,
  Blog,
  PageSection,
  Event,
  Course,
  Educator,
  AcademicLevel,
  ClassSchedule,
  marketplaceListings as MarketplaceListingsPrisma,
  SEO,
  AnalyticsConfig,
  PaymentSettings,
  ShippingSettings,
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

export enum ListingStatus {
  ACTIVE,
  PENDING,
  SOLD,
  INACTIVE,
  DRAFT,
  REJECTED,
  BUY,
  RENT,
  RENTED,
}

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

// Fully typed User interface based on Prisma's User model
export interface IUser extends User {
  // All fields from Prisma's User are inherited
  // You can add any client-side specific fields if needed
  img?: string; // Example of an additional client-side field
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
  authorId?: string;
  author?: IUser;
  authorName?: string;
  authorTitle?: string;
  avatarUrl?: string;
  rating?: number;
  order?: number;
}

// Corresponds to the `Banner` model in Prisma
export interface HeroSlide extends Banner {}

// Corresponds to the `Promotion` model in Prisma
export interface IPromotion extends Promotion {}

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
  buttons: { label: string; href: string; icon: string }[];
  screenshots: string[];
}

export interface IBlog extends Blog {
  author?: { name: string; profileImage: string };
}

//################################################################################
//## E-COMMERCE & PRODUCT INTERFACES
//################################################################################

export interface ISubcategory {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number | null;
  visible?: boolean;
}

// Represents the full ProductCategory model
export interface IProductCategory extends ProductCategory {
  subcategories: any; // Kept as 'any' because it's a JSON field in Prisma
}

// Represents the StoreCategory model, which links a Company to a ProductCategory
export interface IStoreCategory extends StoreCategory {
  category?: IProductCategory;
  subcategories: any; // Kept as 'any' because it's a JSON field in Prisma
}

// This is the primary form type for creating/editing a product
// It corresponds to the `Product` model in Prisma
export interface ProductForm extends Product {
  // Prisma's Product type already includes most fields.
  // We add optional, client-side specific fields here.
  category: IStoreCategory | null;
  subCategory: IProductCategory | null;
  location?: GeoLocation | null;
}

// This type represents a listing in the marketplace.
// It corresponds to the `marketplaceListings` model in Prisma
export interface MarketListingForm extends MarketplaceListingsPrisma {
  // Prisma's generated type is a good base. Add client-side fields as needed.
  category: IStoreCategory | null;
  subCategory: any; // Can be more specific if needed
  location?: GeoLocation | null;
  selectedLocationDetails?: ILocation | null;
  product?: ProductForm; // The base product details
}

//################################################################################
//## EDUCATION (LMS) INTERFACES
//################################################################################

export interface ICourse extends Course {
  // Add any nested objects or client-side transformations
  averageRating?: number;
  enrolledStudents?: number;
  ctaText?: string;
  ctaLink?: string;
}

export interface TimetableEntry extends ClassSchedule {
  // This seems to be a transformed type for UI display.
  // It's good to keep it if the structure is different from the raw model.
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

// Represents the base Location model
export interface ILocation extends Location {
  // The `children` property is useful for building tree structures in the UI
  children?: ILocation[];
}

// Represents the CompanyLocation join model
export interface ICompanyLocation extends CompanyLocation {}

// UI-specific type for selections
export interface SelectedLocation {
  id: string; // This is the locationId
  name: string;
  children: SelectedLocation[];
}

//################################################################################
//## MAIN STORE FORM INTERFACE (Represents the Company model for forms)
//################################################################################

export interface StoreForm extends Company {
  // The base `Company` type from Prisma has most of what you need.
  // We can strongly type the JSON fields and relations here for form usage.
  geoLocation: GeoLocation | null;
  openingHours: OpeningHours | null;
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: HeroSlide[]; // Corresponds to `Banner`
  promotions: IPromotion[];
  blogs: IBlog[];
  storeCategories: IStoreCategory[];
  pageSections: IPageSection[];
  appPromos: AppPromo[];
  events: Event[];
  awards: Award[] | null;
  metrics: Metric[] | null;
  stats: Stat[] | null;
  pricingTiers: any; // Kept as 'any' because it's a JSON[] field
  themeSettings: Record<string, any> | null;
  writers: User[];
  agents: User[];
  doctors: User[];
  podcasts: any[]; // Replace with IPodcast if you define it
  services: any[]; // Replace with IService if you define it
  companyLocations: ICompanyLocation[];
  courses: ICourse[];
  seo: SEO | null;
  analyticsConfig: AnalyticsConfig | null;
  paymentSettings: PaymentSettings | null;
  shippingSettings: ShippingSettings | null;
  marketplaceListings: MarketListingForm[];
}

//################################################################################
//## EVENT INTERFACE
//################################################################################

export interface IEvent extends Event {
  // Prisma's Event type is already quite comprehensive.
  // Add client-side transformations if needed.
  ticketsSold?: number;
}

//################################################################################
//## HANDLERS & MISC
//################################################################################

// This section seems to be for your form handling logic and can largely remain as is,
// but with updated types for better safety.

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
  onChangeSettings: (updated: Partial<StoreForm>) => void;

  onBulkToggle: (ids: string[]) => void;
  onToggleDay: (dayKey: string) => void;

  onToggleParent: (cat: IStoreCategory) => void;
  onToggleSub: (parentId: string, sub: ISubcategory) => void;
  onToggleBrand: (parentId: string, brand: any) => void;

  // Media (logo/banner)
  handleMediaUpload: (field: "logoUrl" | "bannerUrl", file: File) => void;
  handleMediaRemove: (field: "logoUrl" | "bannerUrl") => void;

  // ... other handlers
}

export interface StepConfig {
  key: string;
  title: string;
  render: (
    form: StoreForm,
    handlers: Handlers,
    availableCategories: IStoreCategory[],
    allLocs: ILocation[],
    selectedLocationsForDisplay: SelectedLocation[]
  ) => React.ReactNode;
}