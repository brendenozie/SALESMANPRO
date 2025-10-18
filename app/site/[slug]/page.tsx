// app/site/[slug]/page.tsx
// DATA-AWARE PAGE: Fetches page-specific data and passes it to the body component

import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/server/db/prismadb';
import { transformCompanyToStoreForm } from '@/utils/transformPrismaToStoreForm';
import { 
  getComponentNameForCategory, 
  getFolderPathForCategory 
} from '@/components/site/layouts/siteBodyComponentMap';

// Import all body components statically for server-side rendering
import GhubaSite from '@/components/site/layouts/GhubaLayout/body/GhubaSite';
import AutomotiveSite from '@/components/site/layouts/AutomotiveLayout/body/AutomotiveSite';
import EcommerceSite from '@/components/site/layouts/EcommerceLayout/body/EcommerceSite';
import ConsultancyLayout from '@/components/site/layouts/ConsultancyLayout/body/ConsultancySite';
import EcommerceShoesSite from '@/components/site/layouts/EcommerceShoesLayout/body/EcommerceShoesSite';
import RealEstateSite from '@/components/site/layouts/RealEstateLayout/body/RealEstateSite';
import BlogSite from '@/components/site/layouts/BlogLayout/body/BlogSite';
import CoursesSite from '@/components/site/layouts/CoursesLayout/body/CoursesSite';
import FitnessSite from '@/components/site/layouts/FitnessLayout/body/FitnessSite';
import FinanceSite from '@/components/site/layouts/FinanceLayout/body/FinanceSite';
import ServiceSite from '@/components/site/layouts/ServicesLayout/body/ServiceSite';
import BookingsSite from '@/components/site/layouts/BookingsLayout/body/BookingsSite';
import PortfolioSite from '@/components/site/layouts/PortfolioLayout/body/PortfolioSite';
import DirectorySite from '@/components/site/layouts/DirectoryLayout/body/DirectorySite';
import NonProfitSite from '@/components/site/layouts/NonprofitLayout/body/NonProfitSite';
import EventsSite from '@/components/site/layouts/EventsLayout/body/EventsSite';
import HealthCareSite from '@/components/site/layouts/HealthcareLayout/body/HealthCareSite';
import MediaSite from '@/components/site/layouts/MediaLayout/body/MediaSite';
import TravelSite from '@/components/site/layouts/TravelLayout/body/TravelSite';
import MarketPlaceSite from '@/components/site/layouts/MarketplaceLayout/body/MarketPlaceSite';
import RestaurentSite from '@/components/site/layouts/RestaurantLayout/body/RestaurentSite';
import DefaultSite from '@/components/site/layouts/DefaultLayout/body/DefaultSite';
import { StoreForm } from '@/types/typings';
import SaaSSite from '@/components/site/layouts/SaaSLayout/body/SaasSite';

// Map component names to actual components
const componentMap: Record<string, React.ComponentType<{ pageData: StoreForm }>> = {
  'GhubaSite': GhubaSite,
  'AutomotiveSite': AutomotiveSite,
  'EcommerceSite': EcommerceSite,
  'EcommerceShoesSite': EcommerceShoesSite,
  'ConsultancySite': ConsultancyLayout,
  'RealEstateSite': RealEstateSite,
  'BlogSite': BlogSite,
  'CoursesSite': CoursesSite,
  'FitnessSite': FitnessSite,
  'FinanceSite': FinanceSite,
  'ServiceSite': ServiceSite,
  'BookingsSite': BookingsSite,
  'PortfolioSite': PortfolioSite,
  'DirectorySite': DirectorySite,
  'NonProfitSite': NonProfitSite,
  'EventsSite': EventsSite,
  'HealthCareSite': HealthCareSite,
  'SaaSSite': SaaSSite,
  'MediaSite': MediaSite,
  'TravelSite': TravelSite,
  'MarketPlaceSite': MarketPlaceSite,
  'RestaurentSite': RestaurentSite,
  'DefaultSite': DefaultSite,
};

interface StorePageProps {
  params: Promise<{ slug: string }>;
} 
export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const hdrs = await headers();
  const requestedHost = hdrs.get("x-requested-host");
  const requestedSubdomain = hdrs.get("x-requested-subdomain");

  let raw = null;

  // Lookup by forwarded custom domain, subdomain, or slug (same logic as layout)
  if (requestedHost) {
    raw = await prisma.company.findUnique({
      where: { domain: requestedHost },
      include: pageDataInclude(),
    });
  }

  if (!raw && requestedSubdomain) {
    raw = await prisma.company.findUnique({
      where: { slug: requestedSubdomain },
      include: pageDataInclude(),
    });
  }

  if (!raw) {
    raw = await prisma.company.findUnique({
      where: { slug: slug },
      include: pageDataInclude(),
    });
  }

  if (!raw) {
    notFound();
  }

  // Transform the raw Prisma data to StoreForm
  const pageData = transformCompanyToStoreForm(raw);

  // Determine which component to render based on category
  const componentName = getComponentNameForCategory(pageData.category || 'other');
  const BodyComponent = componentMap[componentName] || componentMap['DefaultSite'];

  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <BodyComponent pageData={pageData} />
    </main>
  );
}

/**
 * PAGE DATA INCLUDE: Fetch all page-specific data
 * This includes listings, testimonials, blogs, courses, etc.
 */

/**
 * PAGE DATA INCLUDE: Fetch all page-specific data
 * This includes listings, testimonials, blogs, courses, etc.
 */
function pageDataInclude() {
  return {
    // REMOVED Basic company info. Prisma fetches these scalar fields by default.
    // name: true,
    // slug: true,
    // description: true,
    // category: true,
    // bannerUrl: true,
    // logoUrl: true,
    
    // Page content data (These are all relations and are correct)
    blogs: { orderBy: { publishedAt: "desc" as const } },
    faqs: { orderBy: { order: "asc" as const } },
    testimonials: { orderBy: { order: "asc" as const } },
    heroSlides: { orderBy: { order: "asc" as const } },
    promotions: {
      select:{
        title: true,
        description: true,
        startsAt: true,
        endsAt: true,
        badgeText: true,
        price: true,
        ctaText: true,
        ctaLink: true,
        bannerUrl: true,
        featureImage1: true,
        featureImage2: true,
        featureImage3: true,
        perks: true,
        trustLogos: true,
      }
    },
    PageSection: { orderBy: { order: "asc" as const } },
    appPromos: true,
    Collection: { orderBy: { order: "asc" as const } },
    
    // Listings and products
    marketplaceListings: {
      take: 50, // Fetch more for page content
      select: {
        id: true, 
        name: true, 
        description: true, 
        finalPrice: true, 
        sellingPrice: true, 
        images: true, 
        isAvailable: true, 
        isFeatured: true, 
        category: true,
      },
    },
    
    // People/experts
    Writer: { include: { user: { select: { id: true, name: true, image: true } } } },
    Expert: { include: { user: { select: { id: true, name: true, image: true } } } },
    Doctor: { include: { User: { select: { id: true, name: true, image: true } } } },
    salesAgents: { include: { user: { select: { id: true, name: true, image: true } } } },
    educators: { include: { user: { select: { id: true, name: true, image: true } } } },
    
    // Content
    Podcast: true,
    courses: true,
    events: true,
    Package: true,
    Project: true,
    services: true,
    CoreValues: true,
    
    // Locations
    CompanyLocation: { include: { location: true } },
    Destination: true,
    TourPackage: true,
    
    // Settings (needed for some page functionality)
    PaymentSettings: true,
    ShippingSettings: true,
    // themeSettings: true,
  };
}
// function pageDataInclude() {
//   return {
//     // Basic company info
//     name: true,
//     slug: true,
//     description: true,
//     category: true,
//     bannerUrl: true,
//     logoUrl: true,
    
//     // Page content data
//     blogs: { orderBy: { publishedAt: "desc" as const } },
//     faqs: { orderBy: { order: "asc" as const } },
//     testimonials: { orderBy: { order: "asc" as const } },
//     heroSlides: { orderBy: { order: "asc" as const } },
//     promotions: {
//       select:{
//         title: true,
//         description: true,
//         startsAt: true,
//         endsAt: true,
//         badgeText: true,
//         price: true,
//         ctaText: true,
//         ctaLink: true,
//         bannerUrl: true,
//         featureImage1: true,
//         featureImage2: true,
//         featureImage3: true,
//         perks: true,
//         trustLogos: true,
//       }
//     },
//     PageSection: { orderBy: { order: "asc" as const } },
//     appPromos: true,
//     Collection: { orderBy: { order: "asc" as const } },
    
//     // Listings and products
//     marketplaceListings: {
//       take: 50, // Fetch more for page content
//       select: {
//         id: true, 
//         name: true, 
//         description: true, 
//         finalPrice: true, 
//         sellingPrice: true, 
//         images: true, 
//         isAvailable: true, 
//         isFeatured: true, 
//         category: true,
//       },
//     },
    
//     // People/experts
//     Writer: { include: { user: { select: { id: true, name: true, image: true } } } },
//     Expert: { include: { user: { select: { id: true, name: true, image: true } } } },
//     Doctor: { include: { User: { select: { id: true, name: true, image: true } } } },
//     salesAgents: { include: { user: { select: { id: true, name: true, image: true } } } },
//     educators: { include: { user: { select: { id: true, name: true, image: true } } } },
    
//     // Content
//     Podcast: true,
//     courses: true,
//     events: true,
//     Package: true,
//     Project: true,
//     services: true,
//     CoreValues: true,
    
//     // Locations
//     CompanyLocation: { include: { location: true } },
//     Destination: true,
//     TourPackage: true,
    
//     // Settings (needed for some page functionality)
//     PaymentSettings: true,
//     ShippingSettings: true,
//     themeSettings: true,
//   };
// }