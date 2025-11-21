// components/site/layouts/siteBodyComponentMap.ts
/**
 * Server-side component map for dynamically loading site body components.
 * This map is used by the page.tsx to determine which component to render
 * based on the store's category.
 */

// Map category strings to their corresponding layout folder names
// export const folderMap: Record<string, string> = {
//   // Ecommerce
//   'ghuba': 'GhubaLayout',
  
//   'public speaking': 'PublicSpeakingLayout',
//   'public-speaking': 'PublicSpeakingLayout',

//   'ecommerce': 'EcommerceLayout',
//   'e-commerce': 'EcommerceLayout',

//   'shoes-store': 'EcommerceShoesLayout',
//   'shoes store': 'EcommerceShoesLayout',

//   // Services
//   'services': 'ServicesLayout',
//   'service provider': 'ServicesLayout',

//   // Bookings
//   'bookings': 'BookingsLayout',
//   'booking & appointments': 'BookingsLayout',

//   // Real Estate
//   'real estate': 'RealEstateLayout',

//   // Portfolio
//   'portfolio': 'PortfolioLayout',
//   'portfolio & personal branding': 'PortfolioLayout',
  
//   // Consultancy
//   'consultancy': 'ConsultancyLayout',
//   'consultant & coach': 'ConsultancyLayout',

//   // Blog
//   'blog': 'BlogLayout',
//   'blog & content': 'BlogLayout',

//   // Directory
//   'directory': 'DirectoryLayout',
//   'directory & listings': 'DirectoryLayout',

//   // Courses
//   'courses': 'CoursesLayout',
//   'educational': 'CoursesLayout',
//   'educational & online courses': 'CoursesLayout',

//   // Nonprofit
//   'nonprofit': 'NonprofitLayout',
//   'nonprofit & community': 'NonprofitLayout',

//   // Events
//   'event': 'EventsLayout',
//   'event & ticketing': 'EventsLayout',

//   // Healthcare
//   'healthcare': 'HealthcareLayout',
//   'healthcare & clinics': 'HealthcareLayout',

//   // SaaS
//   'saas': 'SaaSLayout',
//   'saas & web apps': 'SaaSLayout',

//   // Automotive
//   'automotive': 'AutomotiveLayout',

//   // Media
//   'media': 'MediaLayout',
//   'media & entertainment': 'MediaLayout',

//   // Finance
//   'finance': 'FinanceLayout',
//   'finance & legal': 'FinanceLayout',

//   // Travel
//   'travel': 'TravelLayout',
//   'travel & tourism': 'TravelLayout',

//   // Fitness
//   'fitness': 'FitnessLayout',
//   'fitness & wellness': 'FitnessLayout',

//   // Marketplace
//   'marketplace': 'MarketplaceLayout',

//   // Restaurant
//   'restaurant': 'RestaurantLayout',
//   'restaurant & food delivery': 'RestaurantLayout',

//   // Default/Other
//   'default': 'DefaultLayout',
//   'other': 'DefaultLayout',
// };
// components/site/layouts/siteBodyComponentMap.ts

// export const folderMap: Record<string, string> = {
//   // 🛒 E-commerce
//   'ecommerce': 'EcommerceLayout',
//   'e commerce': 'EcommerceLayout',
//   'e-commerce': 'EcommerceLayout',
  
//   'modern shop v1': 'EcommerceLayout',
//   'modern shop (v1)': 'EcommerceLayout',
//   'digital goods store (v2)': 'EcommerceLayout',
//   'artisan marketplace (v3)': 'MarketplaceLayout',

//   // 💡 Consultant & Coach
//   'consultant coach': 'ConsultancyLayout',
//   'consultant & coach': 'ConsultancyLayout',
//   'consultancy': 'ConsultancyLayout',
//   'executive coach (v1)': 'ConsultancyLayout',
//   'wellness retreat (v2)': 'ConsultancyLayout',

//   // 🎙️ Public Speaking
//   'public speaking': 'PublicSpeakingLayout',
//   'public-speaking': 'PublicSpeakingLayout',
//   'standard speaker site': 'PublicSpeakingLayout',

//   // 👟 Shoes Store
//   'shoes store': 'EcommerceShoesLayout',
//   'shoes-store': 'EcommerceShoesLayout',
//   'shoes store classic': 'EcommerceShoesLayout',

//   // 🔧 Services
//   'services': 'ServicesLayout',
//   'service provider': 'ServicesLayout',
//   'agency portfolio': 'ServicesLayout',

//   // 📅 Bookings
//   'bookings': 'BookingsLayout',
//   'booking & appointments': 'BookingsLayout',
//   'scheduler hub': 'BookingsLayout',

//   // 👤 Portfolio & Personal Branding
//   'portfolio': 'PortfolioLayout',
//   'portfolio & personal branding': 'PortfolioLayout',
//   'creative cv': 'PortfolioLayout',

//   // ✍️ Blog & Content
//   'blog': 'BlogLayout',
//   'blog & content': 'BlogLayout',
//   'modern magazine': 'BlogLayout',

//   // 🤝 Nonprofit
//   'nonprofit': 'NonprofitLayout',
//   'nonprofit & community': 'NonprofitLayout',
//   'charity connect': 'NonprofitLayout',

//   // 🏥 Healthcare
//   'healthcare': 'HealthcareLayout',
//   'healthcare & clinics': 'HealthcareLayout',
//   'clinic pro': 'HealthcareLayout',

//   // 🎬 Media & Entertainment
//   'media': 'MediaLayout',
//   'media & entertainment': 'MediaLayout',
//   'film studio': 'MediaLayout',

//   // 💼 Finance & Legal
//   'finance': 'FinanceLayout',
//   'finance & legal': 'FinanceLayout',
//   'financial advisor': 'FinanceLayout',

//   // 🚗 Automotive
//   'automotive': 'AutomotiveLayout',
//   'car dealership': 'AutomotiveLayout',

//   // ✈️ Travel & Tourism
//   'travel': 'TravelLayout',
//   'travel & tourism': 'TravelLayout',
//   'travel agency': 'TravelLayout',

//   // 🏋️‍♂️ Fitness & Wellness
//   'fitness': 'FitnessLayout',
//   'fitness & wellness': 'FitnessLayout',
//   'gym & fitness': 'FitnessLayout',

//   // 📂 Directory & Listings
//   'directory': 'DirectoryLayout',
//   'directory & listings': 'DirectoryLayout',
//   'business directory': 'DirectoryLayout',

//   // 📚 Educational & Courses
//   'courses': 'CoursesLayout',
//   'educational': 'CoursesLayout',
//   'educational & online courses': 'CoursesLayout',
//   'online learning': 'CoursesLayout',

//   // 🍔 Restaurant & Food Delivery
//   'restaurant': 'RestaurantLayout',
//   'restaurant & food delivery': 'RestaurantLayout',
//   'food delivery': 'RestaurantLayout',

//   // 🎟️ Events
//   'event': 'EventsLayout',
//   'event & ticketing': 'EventsLayout',
//   'event booking': 'EventsLayout',

//   // 🏠 Real Estate
//   'real estate': 'RealEstateLayout',
//   'property listings': 'RealEstateLayout',

//   // 💻 SaaS & Web Apps
//   'saas': 'SaaSLayout',
//   'saas & web apps': 'SaaSLayout',
//   'app landing page': 'SaaSLayout',

//   // 🛍️ Marketplace
//   'marketplace': 'MarketplaceLayout',
//   'product marketplace': 'MarketplaceLayout',

//   // 🌐 Other
//   'default': 'DefaultLayout',
//   'other': 'DefaultLayout',
//   'general purpose site': 'DefaultLayout',

//   // 🛒 Special
//   'ghuba': 'GhubaLayout',
// };


// Map layout folder names to their specific Site component names
// export const siteComponentNameMap: Record<string, string> = {
//   'EcommerceLayout': 'EcommerceSite',
//   'EcommerceShoesLayout': 'EcommerceShoesSite',
//   'PublicSpeakingLayout': 'PublicSpeakingSite',
//   'ConsultancyLayout': 'ConsultancySite',
//   'GhubaLayout': 'GhubaSite',
//   'ServicesLayout': 'ServiceSite',
//   'BookingsLayout': 'BookingsSite',
//   'RealEstateLayout': 'RealEstateSite',
//   'PortfolioLayout': 'PortfolioSite',
//   'BlogLayout': 'BlogSite',
//   'DirectoryLayout': 'DirectorySite',
//   'CoursesLayout': 'CoursesSite',
//   'NonprofitLayout': 'NonProfitSite',
//   'EventsLayout': 'EventsSite',
//   'HealthcareLayout': 'HealthCareSite',
//   'SaaSLayout': 'SaaSSite',
//   'AutomotiveLayout': 'AutomotiveSite',
//   'MediaLayout': 'MediaSite',
//   'FinanceLayout': 'FinanceSite',
//   'TravelLayout': 'TravelSite',
//   'FitnessLayout': 'FitnessSite',
//   'MarketplaceLayout': 'MarketPlaceSite',
//   'RestaurantLayout': 'RestaurentSite',
//   'DefaultLayout': 'DefaultSite',

  
// };
// components/site/layouts/siteComponentNameMap.ts

// export const siteComponentNameMap: Record<string, string[]> = {
//   EcommerceLayout: [
//     'ecommerce',
//     'e commerce',
//     'e-commerce',
//     'modern shop (v1)',
//     'digital goods store (v2)',
//   ],
//   MarketplaceLayout: [
//     'artisan marketplace (v3)',
//     'marketplace',
//     'product marketplace',
//   ],
//   ConsultancyLayout: [
//     'consultant coach',
//     'consultant & coach',
//     'consultancy',
//     'executive coach v1',
//     'wellness retreat v2',
//   ],
//   PublicSpeakingLayout: [
//     'public speaking',
//     'public-speaking',
//     'standard speaker site',
//   ],
//   EcommerceShoesLayout: [
//     'shoes store',
//     'shoes-store',
//     'shoes store classic',
//   ],
//   ServicesLayout: [
//     'services',
//     'service provider',
//     'agency portfolio',
//   ],
//   BookingsLayout: [
//     'bookings',
//     'booking & appointments',
//     'scheduler hub',
//   ],
//   PortfolioLayout: [
//     'portfolio',
//     'portfolio & personal branding',
//     'creative cv',
//   ],
//   BlogLayout: [
//     'blog',
//     'blog & content',
//     'modern magazine',
//   ],
//   NonprofitLayout: [
//     'nonprofit',
//     'nonprofit & community',
//     'charity connect',
//   ],
//   HealthcareLayout: [
//     'healthcare',
//     'healthcare & clinics',
//     'clinic pro',
//   ],
//   MediaLayout: [
//     'media',
//     'media & entertainment',
//     'film studio',
//   ],
//   FinanceLayout: [
//     'finance',
//     'finance & legal',
//     'financial advisor',
//   ],
//   AutomotiveLayout: [
//     'automotive',
//     'car dealership',
//   ],
//   TravelLayout: [
//     'travel',
//     'travel & tourism',
//     'travel agency',
//   ],
//   FitnessLayout: [
//     'fitness',
//     'fitness & wellness',
//     'gym & fitness',
//   ],
//   DirectoryLayout: [
//     'directory',
//     'directory & listings',
//     'business directory',
//   ],
//   CoursesLayout: [
//     'courses',
//     'educational',
//     'educational & online courses',
//     'online learning',
//   ],
//   RestaurantLayout: [
//     'restaurant',
//     'restaurant & food delivery',
//     'food delivery',
//   ],
//   EventsLayout: [
//     'event',
//     'event & ticketing',
//     'event booking',
//   ],
//   RealEstateLayout: [
//     'real estate',
//     'property listings',
//   ],
//   SaaSLayout: [
//     'saas',
//     'saas & web apps',
//     'app landing page',
//   ],
//   DefaultLayout: [
//     'default',
//     'other',
//     'general purpose site',
//   ],
//   GhubaLayout: ['ghuba'],
// };



/**
 * Normalizes a string for consistent lookup
 */
// export function normalizeCategory(raw: string): string {
//   return raw
//     ?.trim()
//     ?.toLowerCase()
//     ?.replace(/[^a-z0-9& ]/g, '')
//     ?.replace(/\s+/g, ' ') ?? 'other';
// }
// export function normalizeCategory(value?: string): string {
//   return (value || "")
//     .toLowerCase()
//     .replace(/&/g, "and")
//     .replace(/[^a-z0-9]+/g, " ")
//     .trim();
// }

/**
 * Gets the component name for a given category/variant
 */
// export function getComponentNameForCategory(category?: string, variant?: string): string {
//   const key = normalizeCategory(variant || category || "other");
//   const layoutName = folderMap[key] || folderMap["default"];
//   return layoutName || "DefaultLayout";
// }


/**
 * Gets the folder path for a given category/variant
 */
// export function getFolderPathForCategory(category?: string, variant?: string): string {
//   const key = normalizeCategory(variant || category || 'other');
//   return folderMap[key] ?? folderMap['default'];
// }

/**
 * Normalizes a string for consistent lookup
 */
// export function normalizeCategory(value?: string): string {
//   return (value || "")
//     .toLowerCase()
//     .replace(/&/g, "and")
//     .replace(/[()]/g, "")        // remove parentheses
//     .replace(/[^a-z0-9]+/g, " ") // replace non-alphanumeric with space
//     .trim();
// }

/**
 * Gets the layout folder name for a given category/variant
 */
export function getFolderPathForCategory(category?: string, variant?: string): string {
  const key = normalizeCategory(variant || category || "other");
  return folderMap[key] ?? folderMap["default"];
}

/**
 * Gets the site component name for a given category/variant
 */
// export function getComponentNameForCategory(category?: string, variant?: string): string {
//   const key = normalizeCategory(variant || category || "other");

//   // Step 1: Get folder layout (e.g., "EcommerceLayout")
//   const folder = folderMap[key] ?? folderMap["default"];

//   // Step 2: Use reverse map to find the correct site component (e.g., "EcommerceSite")
//   const siteComponentName =
//     siteComponentNameMap[folder]?.[0] ?? "DefaultSite";

//   return siteComponentName;
// }



// ✅ Normalizer
export function normalizeCategory(value?: string): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ✅ Folder Map
export const folderMap: Record<string, string> = {
  'ecommerce': 'EcommerceLayout',
  'e-commerce': 'EcommerceLayout',
  'digital-goods-store-v2': 'EcommerceLayout',
  'modern-shop-v1': 'EcommerceLayout',
  'marketplace': 'MarketplaceLayout',
  'artisan-marketplace-v3': 'MarketplaceLayout',
  'product-marketplace': 'MarketplaceLayout',
  'consultant-coach': 'ConsultancyLayout',
  'consultant-coach-v1': 'ConsultancyLayout',
  'wellness-retreat-v2': 'ConsultancyLayout',
  'consultancy': 'ConsultancyLayout',
  'public-speaking': 'PublicSpeakingLayout',
  'standard-speaker-site': 'PublicSpeakingLayout',
  'shoes-store': 'EcommerceShoesLayout',
  'shoes-store-classic': 'EcommerceShoesLayout',
  'services': 'ServicesLayout',
  'service-provider': 'ServicesLayout',
  'agency-portfolio': 'ServicesLayout',
  'bookings': 'BookingsLayout',
  'booking-appointments': 'BookingsLayout',
  'scheduler-hub': 'BookingsLayout',
  'portfolio': 'PortfolioLayout',
  'portfolio-personal-branding': 'PortfolioLayout',
  'creative-cv': 'PortfolioLayout',
  'blog': 'BlogLayout',
  'blog-content': 'BlogLayout',
  'modern-magazine': 'BlogLayout',
  'nonprofit': 'NonprofitLayout',
  'nonprofit-community': 'NonprofitLayout',
  'charity-connect': 'NonprofitLayout',
  'healthcare': 'HealthcareLayout',
  'healthcare-clinics': 'HealthcareLayout',
  'clinic-pro': 'HealthcareLayout',
  'media': 'MediaLayout',
  'media-entertainment': 'MediaLayout',
  'film-studio': 'MediaLayout',
  'finance': 'FinanceLayout',
  'finance-legal': 'FinanceLayout',
  'financial-advisor': 'FinanceLayout',
  'automotive': 'AutomotiveLayout',
  'car-dealership': 'AutomotiveLayout',
  'travel': 'TravelLayout',
  'travel-tourism': 'TravelLayout',
  'travel-agency': 'TravelLayout',
  'fitness': 'FitnessLayout',
  'fitness-wellness': 'FitnessLayout',
  'gym-fitness': 'FitnessLayout',
  'directory': 'DirectoryLayout',
  'directory-listings': 'DirectoryLayout',
  'business-directory': 'DirectoryLayout',
  'courses': 'CoursesLayout',
  'educational': 'CoursesLayout',
  'educational-online-courses': 'CoursesLayout',
  'online-learning': 'CoursesLayout',
  'restaurant': 'RestaurantLayout',
  'restaurant-food-delivery': 'RestaurantLayout',
  'food-delivery': 'RestaurantLayout',
  'event': 'EventsLayout',
  'event-ticketing': 'EventsLayout',
  'event-booking': 'EventsLayout',
  'real-estate': 'RealEstateLayout',
  'property-listings': 'RealEstateLayout',
  'saas': 'SaaSLayout',
  'saas-web-apps': 'SaaSLayout',
  'app-landing-page': 'SaaSLayout',
  'ghuba': 'GhubaLayout',
  'security-services': 'SecurityLayout',
  'security-consulting': 'Security2Layout',
  'furniture': 'FurnitureLayout',
  'fashion': 'FashionLayout',
  'default': 'DefaultLayout',
  'other': 'DefaultLayout',
  'general-purpose-site': 'DefaultLayout',
};

// ✅ Reverse Map (auto-aligned)
export const siteComponentNameMap: Record<string, string> = {
  'EcommerceLayout': 'EcommerceSite',
  'EcommerceShoesLayout': 'EcommerceShoesSite',
  'PublicSpeakingLayout': 'PublicSpeakingSite',
  'ConsultancyLayout': 'ConsultancySite',
  'GhubaLayout': 'GhubaSite',
  'ServicesLayout': 'ServiceSite',
  'BookingsLayout': 'BookingsSite',
  'RealEstateLayout': 'RealEstateSite',
  'PortfolioLayout': 'PortfolioSite',
  'BlogLayout': 'BlogSite',
  'DirectoryLayout': 'DirectorySite',
  'CoursesLayout': 'CoursesSite',
  'NonprofitLayout': 'NonProfitSite',
  'EventsLayout': 'EventsSite',
  'HealthcareLayout': 'HealthCareSite',
  'SaaSLayout': 'SaaSSite',
  'AutomotiveLayout': 'AutomotiveSite',
  'MediaLayout': 'MediaSite',
  'FinanceLayout': 'FinanceSite',
  'TravelLayout': 'TravelSite',
  'FitnessLayout': 'FitnessSite',
  'MarketplaceLayout': 'MarketPlaceSite',
  'RestaurantLayout': 'RestaurentSite',
  'SecurityLayout': 'SecuritySite',
  'Security2Layout': 'Security2Site',
  'DefaultLayout': 'DefaultSite',
};

// ✅ Core Resolver
export function getComponentNameForCategory(category?: string, variant?: string): string {
  const key = normalizeCategory(variant || category || 'other');
  const folder = folderMap[key] ?? folderMap['default'];
  return siteComponentNameMap[folder] ?? siteComponentNameMap['DefaultLayout'];
}

// ✅ Component Map
// export const componentMap: Record<string, React.ComponentType<{ pageData: StoreForm }>> = {
//   'GhubaSite': GhubaSite,
//   'PublicSpeakingSite': PublicSpeakingSite,
//   'AutomotiveSite': AutomotiveSite,
//   'EcommerceSite': EcommerceSite,
//   'EcommerceShoesSite': EcommerceShoesSite,
//   'ConsultancySite': ConsultancySite,
//   'RealEstateSite': RealEstateSite,
//   'BlogSite': BlogSite,
//   'CoursesSite': CoursesSite,
//   'FitnessSite': FitnessSite,
//   'FinanceSite': FinanceSite,
//   'ServiceSite': ServiceSite,
//   'BookingsSite': BookingsSite,
//   'PortfolioSite': PortfolioSite,
//   'DirectorySite': DirectorySite,
//   'NonProfitSite': NonProfitSite,
//   'EventsSite': EventsSite,
//   'HealthCareSite': HealthCareSite,
//   'SaaSSite': SaaSSite,
//   'MediaSite': MediaSite,
//   'TravelSite': TravelSite,
//   'MarketPlaceSite': MarketPlaceSite,
//   'RestaurentSite': RestaurentSite,
//   'DefaultSite': DefaultSite,
// };
