// constants/layoutMap.ts


import BlogHeaderLayout from '@/components/site/layouts/BlogLayout/BlogLayout';
import NonprofitHeaderLayout from '@/components/site/layouts/NonprofitLayout/NonprofitLayout';
// import SaaSHeaderLayout from '@/components/site/layouts/SaaSLayout/SaaSLayout';
import AutomotiveHeaderLayout from '@/components/site/layouts/AutomotiveLayout/AutomotiveLayout';
import TravelHeaderLayout from '@/components/site/layouts/TravelLayout/TravelLayout';
import CoursesHeaderLayout from "@/components/site/layouts/CoursesLayout/CoursesLayout";
import DefaultHeaderLayout from "@/components/site/layouts/DefaultLayout/DefaultLayout";
import DirectoryHeaderLayout from "@/components/site/layouts/DirectoryLayout/DirectoryLayout";
import EcommerceHeaderLayout from "@/components/site/layouts/EcommerceLayout/EcommerceLayout";
import EventsHeaderLayout from "@/components/site/layouts/EventsLayout/EventsLayout";
import FinanceHeaderLayout from "@/components/site/layouts/FinanceLayout/FinanceLayout";
import FitnessHeaderLayout from "@/components/site/layouts/FitnessLayout/FitnessLayout";
import HealthcareHeaderLayout from "@/components/site/layouts/HealthcareLayout/HealthcareLayout";
import MarketplaceHeaderLayout from "@/components/site/layouts/MarketplaceLayout/MarketplaceLayout";
import MediaHeaderLayout from "@/components/site/layouts/MediaLayout/MediaLayout";
import PortfolioHeaderLayout from "@/components/site/layouts/PortfolioLayout/PortfolioLayout";
import RealEstateHeaderLayout from "@/components/site/layouts/RealEstateLayout/RealEstateLayout";
import RestaurantHeaderLayout from "@/components/site/layouts/RestaurantLayout/RestaurantLayout";
import ServicesHeaderLayout from "@/components/site/layouts/ServicesLayout/ServicesLayout";
import BookingsHeaderLayout from '@/components/site/layouts/BookingsLayout/BookingsLayout';
import SecurityHeaderLayout from '@/components/site/layouts/SecurityLayout/SecurityLayout';

export const layoutMap: Record<string, any> = {
  'e-commerce': EcommerceHeaderLayout,
  'services': ServicesHeaderLayout,
  'bookings': BookingsHeaderLayout,
  'portfolio': PortfolioHeaderLayout,
  'blog': BlogHeaderLayout,
  'directory': DirectoryHeaderLayout,
  'courses': CoursesHeaderLayout,
  'nonprofit': NonprofitHeaderLayout,
  'restaurant': RestaurantHeaderLayout,
  'events': EventsHeaderLayout,
  'real-estate': RealEstateHeaderLayout,
  'healthcare': HealthcareHeaderLayout,
  // 'saas': SaaSHeaderLayout,
  'media': MediaHeaderLayout,
  'finance': FinanceHeaderLayout,
  'automotive': AutomotiveHeaderLayout,
  'travel': TravelHeaderLayout,
  'fitness': FitnessHeaderLayout,
  'marketplace': MarketplaceHeaderLayout,
  'security': SecurityHeaderLayout,
  'default': DefaultHeaderLayout,
};
