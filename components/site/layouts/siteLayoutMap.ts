// In a separate file (e.g. components/site/layouts/siteLayoutMap.ts)
import dynamic from "next/dynamic";

// Header/Footer Layouts
const GhubaLayout = dynamic(
  () => import("@/components/site/layouts/GhubaLayout/GhubaLayout"),
);
const EcommerceLayout = dynamic(
  () => import("@/components/site/layouts/EcommerceLayout/EcommerceLayout"),
);
const EcommerceShoesLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceShoesLayout/EcommerceShoesLayout"),
);
const ServicesLayout = dynamic(
  () => import("@/components/site/layouts/ServicesLayout/ServicesLayout"),
);
const BookingsLayout = dynamic(
  () => import("@/components/site/layouts/BookingsLayout/BookingsLayout"),
);
const DefaultLayout = dynamic(
  () => import("@/components/site/layouts/DefaultLayout/DefaultLayout"),
);
const RealEstateLayout = dynamic(
  () => import("@/components/site/layouts/RealEstateLayout/RealEstateLayout"),
);
const PortfolioLayout = dynamic(
  () => import("@/components/site/layouts/PortfolioLayout/PortfolioLayout"),
);
const BlogLayout = dynamic(
  () => import("@/components/site/layouts/BlogLayout/BlogLayout"),
);
const CoursesLayout = dynamic(
  () => import("@/components/site/layouts/CoursesLayout/CoursesLayout"),
);
const DirectoryLayout = dynamic(
  () => import("@/components/site/layouts/DirectoryLayout/DirectoryLayout"),
);
const EventsLayout = dynamic(
  () => import("@/components/site/layouts/EventsLayout/EventsLayout"),
);
const FinanceLayout = dynamic(
  () => import("@/components/site/layouts/FinanceLayout/FinanceLayout"),
);
const FitnessLayout = dynamic(
  () => import("@/components/site/layouts/FitnessLayout/FitnessLayout"),
);
const HealthcareLayout = dynamic(
  () => import("@/components/site/layouts/HealthcareLayout/HealthcareLayout"),
);
const MarketplaceLayout = dynamic(
  () => import("@/components/site/layouts/MarketplaceLayout/MarketplaceLayout"),
);
const NonprofitLayout = dynamic(
  () => import("@/components/site/layouts/NonprofitLayout/NonprofitLayout"),
);
const MediaLayout = dynamic(
  () => import("@/components/site/layouts/MediaLayout/MediaLayout"),
);
const TravelLayout = dynamic(
  () => import("@/components/site/layouts/TravelLayout/TravelLayout"),
);
const RestaurantLayout = dynamic(
  () => import("@/components/site/layouts/RestaurantLayout/RestaurantLayout"),
);
const AutomotiveLayout = dynamic(
  () => import("@/components/site/layouts/AutomotiveLayout/AutomotiveLayout"),
);
const SecurityLayout = dynamic(
  () => import("@/components/site/layouts/SecurityLayout/SecurityLayout"),
);
const Security2Layout = dynamic(
  () => import("@/components/site/layouts/Security2Layout/Security2Layout"),
);
// const SaaSLayout = dynamic(() => import('@/components/site/layouts/SaaSLayout/SaaSLayout'));
const ConsultancyLayout = dynamic(
  () => import("@/components/site/layouts/ConsultancyLayout/ConsultancyLayout"),
);
const PublicSpeakingLayout = dynamic(
  () =>
    import("@/components/site/layouts/PublicSpeakingLayout/PublicSpeakingLayout"),
);
const EcommerceBookLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceBookLayout/EcommerceBookLayout"),
);

import { ReactNode } from "react";
import { StoreForm } from "../../../types/typings";
import EcommerceMeatLayout from "./EcommerceMeatLayout/EcommerceMeatLayout";

type LayoutHeaderFooterComponent = React.ComponentType<{
  params: { storeFormData: StoreForm };
  children: ReactNode;
}>;

export const categoryHeaderFooterLayoutMap: Record<
  string,
  LayoutHeaderFooterComponent
> = {
  ghuba: GhubaLayout,
  ecommerce: EcommerceLayout,
  "e-commerce": EcommerceLayout,
  "public speaking": PublicSpeakingLayout,
  "public-speaking": PublicSpeakingLayout,
  "shoes-store": EcommerceShoesLayout,
  "shoes store": EcommerceShoesLayout,
  "book-store": EcommerceBookLayout,
  "book store": EcommerceBookLayout,
  "meat store": EcommerceMeatLayout,
  services: ServicesLayout,
  "service provider": ServicesLayout,
  bookings: BookingsLayout,
  "booking & appointments": BookingsLayout,
  consultancy: ConsultancyLayout,
  "consultant & coach": ConsultancyLayout,
  "real estate": RealEstateLayout,
  portfolio: PortfolioLayout,
  "portfolio & personal branding": PortfolioLayout,
  restaurant: RestaurantLayout,
  "restaurant & food delivery": RestaurantLayout,
  blog: BlogLayout,
  "blog & content": BlogLayout,
  directory: DirectoryLayout,
  "directory & listings": DirectoryLayout,
  educational: CoursesLayout,
  "educational & online courses": CoursesLayout,
  courses: CoursesLayout,
  nonprofit: NonprofitLayout,
  "nonprofit & community": NonprofitLayout,
  event: EventsLayout,
  "event & ticketing": EventsLayout,
  healthcare: HealthcareLayout,
  "healthcare & clinics": HealthcareLayout,
  // 'saas': SaaSLayout,
  // 'saas & web apps': SaaSLayout,
  automotive: AutomotiveLayout,
  media: MediaLayout,
  "media & entertainment": MediaLayout,
  finance: FinanceLayout,
  "finance & legal": FinanceLayout,
  travel: TravelLayout,
  "travel & tourism": TravelLayout,
  fitness: FitnessLayout,
  "fitness & wellness": FitnessLayout,
  marketplace: MarketplaceLayout,
  "security services": SecurityLayout,
  "security consulting": Security2Layout,
  other: DefaultLayout,
  Other: DefaultLayout,
  default: DefaultLayout,
};

// Maps category to layout folder name
export const folderMap: Record<string, string> = {
  ghuba: "GhubaLayout",
  ecommerce: "EcommerceLayout",
  "e-commerce": "EcommerceLayout",
  "public speaking": "PublicSpeakingLayout",
  "public-speaking": "PublicSpeakingLayout",
  "shoes-store": "EcommerceShoesLayout",
  "shoes store": "EcommerceShoesLayout",
  "books-store": "EcommerceBookLayout",
  "books store": "EcommerceBookLayout",
  "meat store": "EcommerceMeatLayout",
  services: "ServicesLayout",
  "service provider": "ServicesLayout",
  bookings: "BookingsLayout",
  "booking & appointments": "BookingsLayout",
  consultancy: "ConsultancyLayout",
  "consultant & coach": "ConsultancyLayout",
  "real estate": "RealEstateLayout",
  portfolio: "PortfolioLayout",
  "portfolio & personal branding": "PortfolioLayout",
  blog: "BlogLayout",
  "blog & content": "BlogLayout",
  directory: "DirectoryLayout",
  "directory & listings": "DirectoryLayout",
  courses: "CoursesLayout",
  educational: "CoursesLayout",
  "educational & online courses": "CoursesLayout",
  nonprofit: "NonprofitLayout",
  "nonprofit & community": "NonprofitLayout",
  event: "EventsLayout",
  "event & ticketing": "EventsLayout",
  healthcare: "HealthcareLayout",
  "healthcare & clinics": "HealthcareLayout",
  saas: "SaaSLayout",
  "saas & web apps": "SaaSLayout",
  automotive: "AutomotiveLayout",
  media: "MediaLayout",
  "media & entertainment": "MediaLayout",
  finance: "FinanceLayout",
  "finance & legal": "FinanceLayout",
  travel: "TravelLayout",
  "travel & tourism": "TravelLayout",
  fitness: "FitnessLayout",
  "fitness & wellness": "FitnessLayout",
  marketplace: "MarketplaceLayout",
  restaurant: "RestaurantLayout",
  "restaurant & food delivery": "RestaurantLayout",
  "security services": "SecurityLayout",
  "security consulting": "Security2Layout",
  "delivery & logistics": "DeliveryLayout",
  default: "DefaultLayout",
  other: "DefaultLayout",
};

// Maps layout folder name to specific Site component name
export const siteComponentNameMap: Record<string, string> = {
  GhubaLayout: "GhubaSite",
  PublicSpeakingLayout: "PublicSpeakingSite",
  EcommerceLayout: "EcommerceSite",
  EcommerceShoesLayout: "EcommerceShoesSite",
  ConsultancyLayout: "ConsultancySite",
  DeliveryLayout: "DeliverySite",
  ServicesLayout: "ServiceSite",
  BookingsLayout: "BookingsSite",
  RealEstateLayout: "RealEstateSite",
  PortfolioLayout: "PortfolioSite",
  BlogLayout: "BlogSite",
  DirectoryLayout: "DirectorySite",
  CoursesLayout: "CoursesSite",
  NonprofitLayout: "NonProfitSite",
  EventsLayout: "EventsSite",
  HealthcareLayout: "HealthCareSite",
  SaaSLayout: "SaaSSite",
  AutomotiveLayout: "AutomotiveSite",
  MediaLayout: "MediaSite",
  FinanceLayout: "FinanceSite",
  TravelLayout: "TravelSite",
  FitnessLayout: "FitnessSite",
  MarketplaceLayout: "MarketPlaceSite",
  RestaurantLayout: "RestaurentSite",
  SecurityLayout: "SecuritySite",
  Security2Layout: "Security2Site",
  DefaultLayout: "DefaultSite",
};
