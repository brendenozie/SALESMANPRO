// components/site/layouts/siteBodyComponentMap.ts
/**
 * Server-side component map for dynamically loading site body components.
 * This map is used by the page.tsx to determine which component to render
 * based on the store's category.
 */

// Map category strings to their corresponding layout folder names
export const folderMap: Record<string, string> = {
  // Ecommerce
  'ecommerce': 'EcommerceLayout',
  'e-commerce': 'EcommerceLayout',

  // Services
  'services': 'ServicesLayout',
  'service provider': 'ServicesLayout',

  // Bookings
  'bookings': 'BookingsLayout',
  'booking & appointments': 'BookingsLayout',

  // Real Estate
  'real estate': 'RealEstateLayout',

  // Portfolio
  'portfolio': 'PortfolioLayout',
  'portfolio & personal branding': 'PortfolioLayout',

  // Blog
  'blog': 'BlogLayout',
  'blog & content': 'BlogLayout',

  // Directory
  'directory': 'DirectoryLayout',
  'directory & listings': 'DirectoryLayout',

  // Courses
  'courses': 'CoursesLayout',
  'educational': 'CoursesLayout',
  'educational & online courses': 'CoursesLayout',

  // Nonprofit
  'nonprofit': 'NonprofitLayout',
  'nonprofit & community': 'NonprofitLayout',

  // Events
  'event': 'EventsLayout',
  'event & ticketing': 'EventsLayout',

  // Healthcare
  'healthcare': 'HealthcareLayout',
  'healthcare & clinics': 'HealthcareLayout',

  // SaaS
  'saas': 'SaaSLayout',
  'saas & web apps': 'SaaSLayout',

  // Automotive
  'automotive': 'AutomotiveLayout',

  // Media
  'media': 'MediaLayout',
  'media & entertainment': 'MediaLayout',

  // Finance
  'finance': 'FinanceLayout',
  'finance & legal': 'FinanceLayout',

  // Travel
  'travel': 'TravelLayout',
  'travel & tourism': 'TravelLayout',

  // Fitness
  'fitness': 'FitnessLayout',
  'fitness & wellness': 'FitnessLayout',

  // Marketplace
  'marketplace': 'MarketplaceLayout',

  // Restaurant
  'restaurant': 'RestaurantLayout',
  'restaurant & food delivery': 'RestaurantLayout',

  // Default/Other
  'default': 'DefaultLayout',
  'other': 'DefaultLayout',
};

// Map layout folder names to their specific Site component names
export const siteComponentNameMap: Record<string, string> = {
  'EcommerceLayout': 'EcommerceSite',
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
  'DefaultLayout': 'DefaultSite',
};

/**
 * Normalizes a category string for consistent lookup
 */
export function normalizeCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Gets the component name for a given category
 */
export function getComponentNameForCategory(category: string): string {
  const normalizedKey = normalizeCategory(category || 'other');
  const folder = folderMap[normalizedKey] ?? folderMap['default'];
  return siteComponentNameMap[folder] ?? siteComponentNameMap['DefaultLayout'];
}

/**
 * Gets the folder path for a given category
 */
export function getFolderPathForCategory(category: string): string {
  const normalizedKey = normalizeCategory(category || 'other');
  return folderMap[normalizedKey] ?? folderMap['default'];
}
