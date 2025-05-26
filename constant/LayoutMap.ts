// constants/layoutMap.ts
import EcommerceHeaderLayout from '@/components/site/layouts/EcommerceHeaderLayout';
import ServicesHeaderLayout from '@/components/site/layouts/ServicesHeaderLayout';
import BookingsHeaderLayout from '@/components/site/layouts/BookingsHeaderLayout';
import PortfolioHeaderLayout from '@/components/site/layouts/PortfolioHeaderLayout';
import BlogHeaderLayout from '@/components/site/layouts/BlogHeaderLayout';
import DirectoryHeaderLayout from '@/components/site/layouts/DirectoryHeaderLayout';
import CoursesHeaderLayout from '@/components/site/layouts/CoursesHeaderLayout';
import NonprofitHeaderLayout from '@/components/site/layouts/NonprofitHeaderLayout';
import RestaurantHeaderLayout from '@/components/site/layouts/RestaurantHeaderLayout';
import EventsHeaderLayout from '@/components/site/layouts/EventsHeaderLayout';
import RealEstateHeaderLayout from '@/components/site/layouts/RealEstateHeaderLayout';
import HealthcareHeaderLayout from '@/components/site/layouts/HealthcareHeaderLayout';
import SaaSHeaderLayout from '@/components/site/layouts/SaaSHeaderLayout';
import MediaHeaderLayout from '@/components/site/layouts/MediaHeaderLayout';
import FinanceHeaderLayout from '@/components/site/layouts/FinanceHeaderLayout';
import AutomotiveHeaderLayout from '@/components/site/layouts/AutomotiveHeaderLayout';
import TravelHeaderLayout from '@/components/site/layouts/TravelHeaderLayout';
import FitnessHeaderLayout from '@/components/site/layouts/FitnessHeaderLayout';
import MarketplaceHeaderLayout from '@/components/site/layouts/MarketplaceHeaderLayout';
import DefaultHeaderLayout from '@/components/site/layouts/DefaultHeaderLayout';

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
  'saas': SaaSHeaderLayout,
  'media': MediaHeaderLayout,
  'finance': FinanceHeaderLayout,
  'automotive': AutomotiveHeaderLayout,
  'travel': TravelHeaderLayout,
  'fitness': FitnessHeaderLayout,
  'marketplace': MarketplaceHeaderLayout,
  'default': DefaultHeaderLayout,
};
