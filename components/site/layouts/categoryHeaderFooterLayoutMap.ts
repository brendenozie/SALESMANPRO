// In a separate file (e.g. siteLayoutMap.ts)
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { StoreForm } from "../../../types/typings";

type LayoutHeaderFooterComponent = React.ComponentType<{
  params: { storeFormData: StoreForm };
  children: ReactNode;
}>;

const GhubaLayout = dynamic(
  () => import("@/components/site/layouts/GhubaLayout/GhubaLayout"),
);
const EcommerceLayout = dynamic(
  () => import("@/components/site/layouts/EcommerceLayout/EcommerceLayout"),
);
const EcommerceAgrovetLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceAgrovetLayout/EcommerceAgrovetLayout"),
);
const EcommerceMeatLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceMeatLayout/EcommerceMeatLayout"),
);
const EcommerceHardwareLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceHardwareLayout/EcommerceHardwareLayout"),
);
const EcommerceShoesLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceShoesLayout/EcommerceShoesLayout"),
);
const EcommerceGamingLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceGamingLayout/EcommerceGamingLayout"),
);
const EcommerceEarphonesLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceEarphonesLayout/EcommerceEarphonesLayout"),
);
const EcommerceGlassesLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceGlassesLayout/EcommerceGlassesLayout"),
);
const EcommerceFlowersLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceFlowersLayout/EcommerceFlowersLayout"),
);
const EcommerceHoneyLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceHoneyLayout/EcommerceHoneyLayout"),
);
const EcommercePeanutsLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommercePeanutsLayout/EcommercePeanutsLayout"),
);
const EcommerceWatchLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceWatchLayout/EcommerceWatchLayout"),
);
const EcommerceBabyLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceBabyLayout/EcommerceBabyLayout"),
);
const EcommerceCakeLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceCakeLayout/EcommerceCakeLayout"),
);
const EcommercePetsLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommercePetsLayout/EcommercePetsLayout"),
);
const EcommerceBikeLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceBikeLayout/EcommerceBikeLayout"),
);
const EcommerceGroceriesLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceGroceriesLayout/EcommerceGroceriesLayout"),
);
const EcommerceMotorCycleLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceMotorCycleLayout/EcommerceMotorCycleLayout"),
);
const ServicesLayout = dynamic(
  () => import("@/components/site/layouts/ServicesLayout/ServicesLayout"),
);
const BookingsLayout = dynamic(
  () => import("@/components/site/layouts/BookingsLayout/BookingsLayout"),
);
const BarbershopBookingsLayout = dynamic(
  () =>
    import("@/components/site/layouts/BarbershopBookingsLayout/BarbershopBookingsLayout"),
);
const DefaultLayout = dynamic(
  () => import("@/components/site/layouts/DefaultLayout/DefaultLayout"),
);
const RealEstateLayout = dynamic(
  () => import("@/components/site/layouts/RealEstateLayout/RealEstateLayout"),
);
const PropertyManagementLayout = dynamic(
  () =>
    import("@/components/site/layouts/PropertyManagementLayout/PropertyManagementLayout"),
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
const CoursesLayout2 = dynamic(
  () => import("@/components/site/layouts/CoursesLayout2/CoursesLayout2"),
);
const CoursesLayout3 = dynamic(
  () => import("@/components/site/layouts/CoursesLayout3/CoursesLayout3"),
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
const Automotive2Layout = dynamic(
  () => import("@/components/site/layouts/Automotive2Layout/Automotive2Layout"),
);
const PublicSpeakingLayout = dynamic(
  () =>
    import("@/components/site/layouts/PublicSpeakingLayout/PublicSpeakingLayout"),
);
const SaaSLayout = dynamic(
  () => import("@/components/site/layouts/SaaSLayout/SaaSLayout"),
);
const ConsultancyLayout = dynamic(
  () => import("@/components/site/layouts/ConsultancyLayout/ConsultancyLayout"),
);
const SecurityLayout = dynamic(
  () => import("@/components/site/layouts/SecurityLayout/SecurityLayout"),
);
const Security2Layout = dynamic(
  () => import("@/components/site/layouts/Security2Layout/Security2Layout"),
);
const FashionLayout = dynamic(
  () => import("@/components/site/layouts/FashionLayout/FashionLayout"),
);
const FurnitureLayout = dynamic(
  () => import("@/components/site/layouts/FurnitureLayout/FurnitureLayout"),
);
const DeliveryLayout = dynamic(
  () => import("@/components/site/layouts/DeliveryLayout/DeliveryLayout"),
);

const EcommerceBookLayout = dynamic(
  () =>
    import("@/components/site/layouts/EcommerceBookLayout/EcommerceBookLayout"),
);

const DrycleaningBookingsLayout = dynamic(
  () =>
    import(
      "@/components/site/layouts/DrycleaningBookingsLayout/DrycleaningBookingsLayout"
    ),
);

const CompanyPortfolioLayout = dynamic(
    () => import(
      "@/components/site/layouts/CompanyPortfolioLayout/CompanyPortfolioLayout"
    ),
  );

const CompanyPortfolioLightLayout = dynamic(
    () => import(
      "@/components/site/layouts/CompanyPortfolioLightLayout/CompanyPortfolioLightLayout"
    ),
  );

const EcommerceAccessoriesLayout = dynamic(
  () =>
    import(
      "@/components/site/layouts/EcommerceAccessoriesLayout/EcommerceAccessoriesLayout"
    ),
);

export const categoryHeaderFooterLayoutMap: Record<string, LayoutHeaderFooterComponent> = {
  ghuba: GhubaLayout,
  ecommerce: EcommerceLayout,
  "public speaking": PublicSpeakingLayout,
  "public-speaking": PublicSpeakingLayout,
  "shoes-store": EcommerceShoesLayout,
  "shoes store": EcommerceShoesLayout,
  "agrovet store": EcommerceAgrovetLayout,
  "agrovet-store": EcommerceAgrovetLayout,
  "meat store": EcommerceMeatLayout,
  "gaming store": EcommerceGamingLayout,
  "earphones store": EcommerceEarphonesLayout,
  "glasses store": EcommerceGlassesLayout,
  "flowers store": EcommerceFlowersLayout,
  "honey store": EcommerceHoneyLayout,
  "peanuts store": EcommercePeanutsLayout,
  "watch store": EcommerceWatchLayout,
  "baby store": EcommerceBabyLayout,
  "book store": EcommerceBookLayout,
  "hardware store": EcommerceHardwareLayout,
  "cake store": EcommerceCakeLayout,
  "bike store": EcommerceBikeLayout,
  "motorcycle store": EcommerceMotorCycleLayout,
  "e-commerce": EcommerceLayout,
  "pets store": EcommercePetsLayout,
  "groceries store": EcommerceGroceriesLayout,
  services: ServicesLayout,
  "service provider": ServicesLayout,
  consultancy: ConsultancyLayout,
  "consultant & coach": ConsultancyLayout,
  bookings: BookingsLayout,
  "booking & appointments": BookingsLayout,
  "barbershop store": BarbershopBookingsLayout,
  "real estate": RealEstateLayout,
  "property management": PropertyManagementLayout,
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
  "courses layout 2": CoursesLayout2,
  "courses layout 3": CoursesLayout3,
  courses: CoursesLayout,
  nonprofit: NonprofitLayout,
  "nonprofit & community": NonprofitLayout,
  event: EventsLayout,
  "event & ticketing": EventsLayout,
  healthcare: HealthcareLayout,
  "healthcare & clinics": HealthcareLayout,
  // 'saas':SaaSLayout ,
  // 'saas & web apps':SaaSLayout ,
  automotive: AutomotiveLayout,
  "automotive 2": Automotive2Layout,
  media: MediaLayout,
  "media & entertainment": MediaLayout,
  finance: FinanceLayout,
  "finance & legal": FinanceLayout,
  travel: TravelLayout,
  "travel & tourism": TravelLayout,
  fitness: FitnessLayout,
  "fitness & wellness": FitnessLayout,
  marketplace: MarketplaceLayout,
  // variant-based (optional)
  "modern shop (v1)": EcommerceLayout,
  "digital goods store (v2)": EcommerceLayout,
  "artisan marketplace (v3)": EcommerceLayout,
  "executive coach (v1)": ConsultancyLayout,
  "wellness retreat (v2)": ConsultancyLayout,
  "standard speaker site": PublicSpeakingLayout,
  "shoes store classic": EcommerceShoesLayout,
  "agency portfolio": ServicesLayout,
  "scheduler hub": BookingsLayout,
  "creative cv": PortfolioLayout,
  "modern magazine": BlogLayout,
  "charity connect": NonprofitLayout,
  "clinic pro": HealthcareLayout,
  "film studio": MediaLayout,
  "financial advisor": FinanceLayout,
  "car dealership": AutomotiveLayout,
  "car dealership 2": Automotive2Layout,
  "travel agency": TravelLayout,
  "gym & fitness": FitnessLayout,
  "business directory": DirectoryLayout,
  "online learning": CoursesLayout,
  "food delivery": RestaurantLayout,
  "event booking": EventsLayout,
  "property listings": RealEstateLayout,
  "app landing page": DefaultLayout, // or SaaSLayout
  "product marketplace": MarketplaceLayout,
  "general purpose site": DefaultLayout,

  "security services": SecurityLayout,
  "security consulting": Security2Layout,

  "modern furniture store": FurnitureLayout,
  "modern fashion store": FashionLayout,

  "delivery & logistics": DeliveryLayout,

  barbershop: BarbershopBookingsLayout,
  drycleaning: DrycleaningBookingsLayout,
  "company portfolio": CompanyPortfolioLayout,
  "company portfolio light": CompanyPortfolioLightLayout,
  "automotive store": EcommerceAccessoriesLayout,

  // Direct PascalCase shellLayout mappings for 100% deterministic resolution by template.shellLayout
  GhubaLayout: GhubaLayout,
  PublicSpeakingLayout: PublicSpeakingLayout,
  AutomotiveLayout: AutomotiveLayout,
  Automotive2Layout: Automotive2Layout,
  EcommerceLayout: EcommerceLayout,
  EcommerceShoesLayout: EcommerceShoesLayout,
  EcommerceAgrovetLayout: EcommerceAgrovetLayout,
  EcommerceMeatLayout: EcommerceMeatLayout,
  EcommerceHardwareLayout: EcommerceHardwareLayout,
  EcommerceGamingLayout: EcommerceGamingLayout,
  EcommerceEarphonesLayout: EcommerceEarphonesLayout,
  EcommerceGlassesLayout: EcommerceGlassesLayout,
  EcommerceFlowersLayout: EcommerceFlowersLayout,
  EcommerceHoneyLayout: EcommerceHoneyLayout,
  EcommercePeanutsLayout: EcommercePeanutsLayout,
  EcommerceWatchLayout: EcommerceWatchLayout,
  EcommerceBabyLayout: EcommerceBabyLayout,
  EcommerceCakeLayout: EcommerceCakeLayout,
  EcommercePetsLayout: EcommercePetsLayout,
  EcommerceGroceriesLayout: EcommerceGroceriesLayout,
  EcommerceBikeLayout: EcommerceBikeLayout,
  EcommerceMotorCycleLayout: EcommerceMotorCycleLayout,
  EcommerceBookLayout: EcommerceBookLayout,
  EcommerceAccessoriesLayout: EcommerceAccessoriesLayout,
  ConsultancyLayout: ConsultancyLayout,
  RealEstateLayout: RealEstateLayout,
  PropertyManagementLayout: PropertyManagementLayout,
  CompanyPortfolioLayout: CompanyPortfolioLayout,
  CompanyPortfolioLightLayout: CompanyPortfolioLightLayout,
  BlogLayout: BlogLayout,
  CoursesLayout: CoursesLayout,
  CoursesLayout2: CoursesLayout2,
  CoursesLayout3: CoursesLayout3,
  DeliveryLayout: DeliveryLayout,
  FitnessLayout: FitnessLayout,
  FinanceLayout: FinanceLayout,
  ServicesLayout: ServicesLayout,
  BookingsLayout: BookingsLayout,
  BarbershopBookingsLayout: BarbershopBookingsLayout,
  PortfolioLayout: PortfolioLayout,
  DirectoryLayout: DirectoryLayout,
  NonprofitLayout: NonprofitLayout,
  EventsLayout: EventsLayout,
  HealthcareLayout: HealthcareLayout,
  MediaLayout: MediaLayout,
  TravelLayout: TravelLayout,
  MarketplaceLayout: MarketplaceLayout,
  RestaurantLayout: RestaurantLayout,
  SecurityLayout: SecurityLayout,
  Security2Layout: Security2Layout,
  FurnitureLayout: FurnitureLayout,
  FashionLayout: FashionLayout,
  DrycleaningBookingsLayout: DrycleaningBookingsLayout,
  SaaSLayout: SaaSLayout,
  saas: SaaSLayout,
  DefaultLayout: DefaultLayout,

  other: DefaultLayout,
  Other: DefaultLayout,

  default: DefaultLayout,
};


export default categoryHeaderFooterLayoutMap;
