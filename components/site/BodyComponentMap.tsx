import { StoreForm } from '@/types/typings';

// Import all components
import GhubaSite from '@/components/site/layouts/GhubaLayout/body/GhubaSite';
// ... import all other Body components ...
import DefaultSite from '@/components/site/layouts/DefaultLayout/body/DefaultSite';
import AutomotiveSite from './layouts/AutomotiveLayout/body/AutomotiveSite';
import BlogSite from './layouts/BlogLayout/body/BlogSite';
import BookingsSite from './layouts/BookingsLayout/body/BookingsSite';
import ConsultancyLayout from './layouts/ConsultancyLayout/body/ConsultancySite';
import CoursesSite from './layouts/CoursesLayout/body/CoursesSite';
import CoursesSite2 from './layouts/CoursesLayout2/body/CoursesSite2';
import CoursesSite3 from './layouts/CoursesLayout3/body/CoursesSite3';
import DirectorySite from './layouts/DirectoryLayout/body/DirectorySite';
import EcommerceSite from './layouts/EcommerceLayout/body/EcommerceSite';
import EcommerceShoesSite from './layouts/EcommerceShoesLayout/body/EcommerceShoesSite';
import EventsSite from './layouts/EventsLayout/body/EventsSite';
import FinanceSite from './layouts/FinanceLayout/body/FinanceSite';
import FitnessSite from './layouts/FitnessLayout/body/FitnessSite';
import HealthCareSite from './layouts/HealthcareLayout/body/HealthCareSite';
import MarketPlaceSite from './layouts/MarketplaceLayout/body/MarketPlaceSite';
import MediaSite from './layouts/MediaLayout/body/MediaSite';
import NonProfitSite from './layouts/NonprofitLayout/body/NonProfitSite';
import PortfolioSite from './layouts/PortfolioLayout/body/PortfolioSite';
import PublicSpeakingSite from './layouts/PublicSpeakingLayout/body/PublicSpeakingSite';
import RealEstateSite from './layouts/RealEstateLayout/body/RealEstateSite';
import RestaurentSite from './layouts/RestaurantLayout/body/RestaurentSite';
import SaaSSite from './layouts/SaaSLayout/body/SaasSite';
import ServiceSite from './layouts/ServicesLayout/body/ServiceSite';
import TravelSite from './layouts/TravelLayout/body/TravelSite';
import SecuritySite from './layouts/SecurityLayout/body/SecuritySite';
import Security2Site from './layouts/Security2Layout/body/Security2Site';
import FurnitureSite from './layouts/FurnitureLayout/body/FurnitureSite';
import FashionSite from './layouts/FashionLayout/body/FashionSite';
import { PublicPaymentMethod } from '@/utils/payment-utils';

// A single, clean map from component name to the component itself.
export const BodyComponentMap: Record<string, React.ComponentType<{ pageData: StoreForm; companyId: string; paymentMethods: PublicPaymentMethod[] }>> = {
  'GhubaSite': GhubaSite,
  'PublicSpeakingSite': PublicSpeakingSite,
  'AutomotiveSite': AutomotiveSite,
  'EcommerceSite': EcommerceSite,
  'EcommerceShoesSite': EcommerceShoesSite,
  'EcommerceAgrovetSite': EcommerceAgrovetSite,
  'ConsultancySite': ConsultancyLayout,
  'RealEstateSite': RealEstateSite,
  'BlogSite': BlogSite,
  'CoursesSite': CoursesSite,
  'CoursesSite2': CoursesSite2,
  'CoursesSite3': CoursesSite3,
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
  'SecuritySite': SecuritySite,
  'Security2Site': Security2Site,
  'FurnitureSite': FurnitureSite,
  'FashionSite': FashionSite,
  'DefaultSite': DefaultSite,
};