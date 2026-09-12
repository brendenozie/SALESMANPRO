// components/site/layouts/siteBodyComponentMap.ts
/**
 * Server-side component map for dynamically loading site body components.
 * This map is used by the page.tsx to determine which component to render
 * based on the store's category.
 */

// Map category strings to their corresponding layout folder names

/**
 * Gets the layout folder name for a given category/variant
 */
export function getFolderPathForCategory(
  category?: string,
  variant?: string,
): string {
  const key = normalizeCategory(variant || category || "other");
  return folderMap[key] ?? folderMap["default"];
}

// ✅ Normalizer
export function normalizeCategory(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ✅ Folder Map
export const folderMap: Record<string, string> = {
  ecommerce: "EcommerceLayout",
  "e-commerce": "EcommerceLayout",
  "agrovet-store": "EcommerceAgrovetLayout",
  "agrovet store": "EcommerceAgrovetLayout",
  "modern-meat-store": "EcommerceMeatLayout",
  "modern meat store": "EcommerceMeatLayout",
  "meat-store": "EcommerceMeatLayout",
  "digital-goods-store-v2": "EcommerceLayout",
  "gaming-store": "EcommerceGamingLayout",
  "book-store": "EcommerceBookLayout",
  "book store": "EcommerceBookLayout",
  "earphones-store": "EcommerceEarphonesLayout",
  "glasses-store": "EcommerceGlassesLayout",
  "flowers-store": "EcommerceFlowersLayout",
  "honey-store": "EcommerceHoneyLayout",
  "peanuts-store": "EcommercePeanutsLayout",
  "watch-store": "EcommerceWatchLayout",
  "baby-store": "EcommerceBabyLayout",
  "hardware-store": "EcommerceHardwareLayout",
  "bike-store": "EcommerceBikeLayout",
  "motorcycle-store": "EcommerceMotorCycleLayout",
  "cake-store": "EcommerceCakeLayout",
  "pets-store": "EcommercePetsLayout",
  "groceries-store": "EcommerceGroceriesLayout",
  "modern-shop-v1": "EcommerceLayout",
  marketplace: "MarketplaceLayout",
  "artisan-marketplace-v3": "MarketplaceLayout",
  "product-marketplace": "MarketplaceLayout",
  "consultant-coach": "ConsultancyLayout",
  "consultant-coach-v1": "ConsultancyLayout",
  "executive-coach-v1": "ConsultancyLayout",
  "wellness-retreat-v2": "ConsultancyLayout",
  consultancy: "ConsultancyLayout",
  "public-speaking": "PublicSpeakingLayout",
  "standard-speaker-site": "PublicSpeakingLayout",
  "shoes-store": "EcommerceShoesLayout",
  "shoes-store-classic": "EcommerceShoesLayout",
  services: "ServicesLayout",
  "service-provider": "ServicesLayout",
  "agency-portfolio": "ServicesLayout",
  bookings: "BookingsLayout",
  "booking-appointments": "BookingsLayout",
  "barbershop-store": "BarbershopBookingsLayout",
  "salon-bookings": "SalonBookingsLayout",
  salon: "SalonBookingsLayout",
  "scheduler-hub": "BookingsLayout",
  portfolio: "PortfolioLayout",
  "portfolio-personal-branding": "PortfolioLayout",
  "creative-cv": "PortfolioLayout",
  blog: "BlogLayout",
  "blog-content": "BlogLayout",
  "modern-magazine": "BlogLayout",
  nonprofit: "NonprofitLayout",
  "nonprofit-community": "NonprofitLayout",
  "charity-connect": "NonprofitLayout",
  healthcare: "HealthcareLayout",
  "healthcare-clinics": "HealthcareLayout",
  "clinic-pro": "HealthcareLayout",
  media: "MediaLayout",
  "media-entertainment": "MediaLayout",
  "film-studio": "MediaLayout",
  finance: "FinanceLayout",
  "finance-legal": "FinanceLayout",
  "financial-advisor": "FinanceLayout",
  automotive: "AutomotiveLayout",
  "car-dealership": "AutomotiveLayout",
  "car-dealership-2": "Automotive2Layout",
  travel: "TravelLayout",
  "travel-tourism": "TravelLayout",
  "travel-agency": "TravelLayout",
  fitness: "FitnessLayout",
  "fitness-wellness": "FitnessLayout",
  "gym-fitness": "FitnessLayout",
  directory: "DirectoryLayout",
  "directory-listings": "DirectoryLayout",
  "business-directory": "DirectoryLayout",
  courses: "CoursesLayout",
  educational: "CoursesLayout",
  "educational-online-courses": "CoursesLayout",
  "courses-layout-2": "CoursesLayout2",
  "courses-layout-3": "CoursesLayout3",
  "online-learning": "CoursesLayout",
  restaurant: "RestaurantLayout",
  "restaurant-food-delivery": "RestaurantLayout",
  "food-delivery": "RestaurantLayout",
  event: "EventsLayout",
  "event-ticketing": "EventsLayout",
  "delivery-&-logistics": "DeliveryLayout",
  "delivery-service": "DeliveryLayout",
  "event-booking": "EventsLayout",
  "real-estate": "RealEstateLayout",
  "property-listings": "RealEstateLayout",
  "property-management": "PropertyManagementLayout",
  "property-manager": "PropertyManagementLayout",
  saas: "SaaSLayout",
  "saas-web-apps": "SaaSLayout",
  "app-landing-page": "SaaSLayout",
  ghuba: "GhubaLayout",
  "security-services": "SecurityLayout",
  "security-consulting": "Security2Layout",
  "modern-furniture-store": "FurnitureLayout",
  "modern-fashion-store": "FashionLayout",
  drycleaning: "DrycleaningBookingsLayout",
  barbershop: "BarbershopBookingsLayout",
  default: "DefaultLayout",
  other: "DefaultLayout",
  "general-purpose-site": "DefaultLayout",
  "company-portfolio": "CompanyPortfolioLayout",
  "company-portfolio-light": "CompanyPortfolioLightLayout",
  "automotive-store": "EcommerceAccessoriesLayout",
};

// ✅ Reverse Map (auto-aligned)
export const siteComponentNameMap: Record<string, string> = {
  EcommerceLayout: "EcommerceSite",
  EcommerceAgrovetLayout: "EcommerceAgrovetSite",
  EcommerceBookLayout: "EcommerceBookSite",
  EcommerceMeatLayout: "EcommerceMeatSite",
  EcommerceHardwareLayout: "EcommerceHardwareSite",
  EcommerceShoesLayout: "EcommerceShoesSite",
  EcommerceGamingLayout: "EcommerceGamingSite",
  EcommerceEarphonesLayout: "EcommerceEarphonesSite",
  EcommerceGlassesLayout: "EcommerceGlassesSite",
  EcommerceFlowersLayout: "EcommerceFlowersSite",
  EcommerceHoneyLayout: "EcommerceHoneySite",
  EcommercePeanutsLayout: "EcommercePeanutsSite",
  EcommerceWatchLayout: "EcommerceWatchSite",
  EcommerceBabyLayout: "EcommerceBabySite",
  EcommerceCakeLayout: "EcommerceCakeSite",
  EcommercePetsLayout: "EcommercePetsSite",
  EcommerceBikeLayout: "EcommerceBikeSite",
  EcommerceMotorCycleLayout: "EcommerceMotorCycleSite",
  EcommerceGroceriesLayout: "EcommerceGroceriesSite",
  PublicSpeakingLayout: "PublicSpeakingSite",
  ConsultancyLayout: "ConsultancySite",
  GhubaLayout: "GhubaSite",
  ServicesLayout: "ServiceSite",
  BookingsLayout: "BookingsSite",
  BarbershopBookingsLayout: "BarbershopBookingsSite",
  DrycleaningBookingsLayout: "DrycleaningBookingsSite",
  SalonBookingsLayout: "SalonBookingsSite",
  RealEstateLayout: "RealEstateSite",
  PropertyManagementLayout: "PropertyManagementSite",
  PortfolioLayout: "PortfolioSite",
  BlogLayout: "BlogSite",
  DirectoryLayout: "DirectorySite",
  CoursesLayout: "CoursesSite",
  CoursesLayout2: "CoursesSite2",
  CoursesLayout3: "CoursesSite3",
  NonprofitLayout: "NonProfitSite",
  DeliveryLayout: "DeliverySite",
  EventsLayout: "EventsSite",
  HealthcareLayout: "HealthCareSite",
  SaaSLayout: "SaaSSite",
  AutomotiveLayout: "AutomotiveSite",
  Automotive2Layout: "Automotive2Site",
  MediaLayout: "MediaSite",
  FinanceLayout: "FinanceSite",
  TravelLayout: "TravelSite",
  FitnessLayout: "FitnessSite",
  MarketplaceLayout: "MarketPlaceSite",
  RestaurantLayout: "RestaurentSite",
  SecurityLayout: "SecuritySite",
  Security2Layout: "Security2Site",
  FurnitureLayout: "FurnitureSite",
  FashionLayout: "FashionSite",
  DefaultLayout: "DefaultSite",
  CompanyPortfolioLayout: "CompanyPortfolioSite",
  CompanyPortfolioLightLayout: "CompanyPortfolioLightSite",
  EcommerceAccessoriesLayout: "EcommerceAccessoriesSite", 
};

// ✅ Core Resolver
export function getComponentNameForCategory(
  category?: string,
  variant?: string,
): string {
  const key = normalizeCategory(variant || category || "other");
  const folder = folderMap[key] ?? folderMap["default"];
  return siteComponentNameMap[folder] ?? siteComponentNameMap["DefaultLayout"];
}
