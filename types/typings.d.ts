import { User } from "@prisma/client";
import "next-auth";


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
  id: string = "",
  name: string = "",
  email: string = "",
  password: string = "random$123%$^&",
  gender: string = "person",
  exerciseGoal: string = "Lose Weight",
  focusArea: string = "Arms",
  currentHeightInCm: Int = 0,
  currentWeightInKg: Float = 0.0,
  birthYear: Int = 0,
  weeklyGoalInKM: Float = 0.0,//steps
  weightInKgGoal: Float = 0.0,
  physicalActivityLevel: string = "Beginner",
  bmiResult: Double = 0.0,
  imgUri: string = "",
  role: string = "user",
  provider: string = "mobile",
  img: string = "mobile"
  // id: string;
  // name: string;
  // email: string;
  // image: string;
  // role: string;
}

// interface CategoryOption { id: string; name: string; }
type StoreCategoryEntry = {
  id: string;           // parent ProductCategory.id
  name: string;         // parent name
  items: SubObj[];      // zero or more subcategory objects
  allBrands: any[];      // zero or more subcategory objects
  displayName?: string; // (optional override)
  icon: string;        // (optional override)
  sortOrder?: number;
  visible?: boolean;
};

type SelectedCategory = {
  id:    string;
  name:  string;
  icon:string;
  items: SubObj[];
  allBrands: any[];
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
  allBrands:      any[];    // full list of sub‐objects under this parent
};

type RawCategory = {
  id:         string;
  name:       string;
  icon:string;
  allBrands:Array<any>;
  subcategories: Array<{
    id:   string;
    name: string;
    slug: string;
    // …other fields like icon, image, etc., but NOT needed by the tree
  }>;
  // …plus whatever other fields your API returns
};

interface GeoLocation { lat: number; lng: number; }

type OpeningHours = Record<
  string,
  { open: string; close: string } | undefined
>;

type DayHours = { open: string; close: string };

type OpeningHours = { [key: string]: DayHours };

export interface SocialLink { channel: string; url: string; }

export interface Policy { type: string; title?: string; content: string; }

export interface FAQ { question: string; answer: string; order?: number; }

export interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number; order?: number; }

export interface HeroSlide { productImageUrl?:string; imageUrl: string; headline: string; subline?: string; ctaText?: string; ctaLink?: string; order?: number; }

export interface Promotion { title: string; description: string; startsAt?: string; 
                              endsAt?: string; bannerUrl?: string; order?: number;  ctaText?: string; ctaLink?: string; }

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

type StoreForm = {
  id:string;
  name: string;
  slug: string;
  hasWebsite: boolean;
  domain: string;
  tagline: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  geoLocation: GeoLocation;
  openingHours: OpeningHours;
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: HeroSlide[];
  promotions: Promotion[];
  awards: Award[];
  metrics: Metric[];
  stats: Stat[];
  themeSettings: Record<string, any>;
  seo: Record<string, any>;
  analyticsConfig: Record<string, any>;
  paymentSettings: Record<string, any>;
  shippingSettings: Record<string, any>;
  marketplaceListings: MarketplaceListingForm[];
  storeCategories: StoreCategoryEntry[];
  pricingTiers: PricingTier[];
};

export interface PricingTier {
  name: string;
  price: number;
  features: string[];
  isFeatured?: boolean;
  duration?: string;
  description?: string;
}

// types/typings.ts

export interface MarketplaceListingForm {
  id: string;
  title: string;
  name: string;
  description?: string;
  finalPrice: number;
  images: string[];         // JSON[] in Prisma
  isAvailable: boolean;
  isFeatured: boolean;
  // (…any other fields you plan to render on the frontend…)
  product?: {
    id: string;
    name: string;
    description?: string;
    brand?: string;
    color?: string[];
    size?: string[];
    // etc.
  };
}

// Handlers signature
interface Handlers {
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
  handleSlideImageUpload
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
interface StepConfig {
  key: string;
  title: string;
  render: (form: StoreForm, handlers: Handlers, availableCategories: CategoryOption[]) => React.ReactNode;
}

interface BookItem {
  title: string;
  author: string;
  coverFile: File | null;      // raw File for upload
  coverPreview: string | null; // objectURL for preview
}

export interface Promotion {
  title: string;
  description: string;
  startsAt?: string;
  endsAt?: string;
  bannerUrl?: string;
  order?: number;
}

export interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
}