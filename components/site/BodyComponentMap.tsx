import { StoreForm } from '@/types/typings';

// Import all components
import GhubaSite from '@/components/site/layouts/GhubaLayout/body/GhubaSite';
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
import EcommerceGamingSite from './layouts/EcommerceGamingLayout/body/EcommerceGamingSite';
import EcommerceEarphonesSite from './layouts/EcommerceEarphonesLayout/body/EcommerceEarphonesSite';
import EcommerceGlassesSite from './layouts/EcommerceGlassesLayout/body/EcommerceGlassesSite';
import EcommerceFlowersSite from './layouts/EcommerceFlowersLayout/body/EcommerceFlowersSite';
import EcommerceHoneySite from './layouts/EcommerceHoneyLayout/body/EcommerceHoneySite';
import EcommercePeanutsSite from './layouts/EcommercePeanutsLayout/body/EcommercePeanutsSite';
import EcommerceWatchSite from './layouts/EcommerceWatchLayout/body/EcommerceWatchSite';
import EcommerceBabySite from './layouts/EcommerceBabyLayout/body/EcommerceBabySite';
import EcommerceCakeSite from './layouts/EcommerceCakeLayout/body/EcommerceCakeSite';
import EcommercePetsSite from './layouts/EcommercePetsLayout/body/EcommercePetsSite';
import EcommerceGroceriesSite from './/layouts/EcommerceGroceriesLayout/body/EcommerceGroceriesSite';
import BarbershopBookingsSite from './layouts/BarbershopBookingsLayout/body/BarbershopBookingsSite';
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
import EcommerceAgrovetSite from './layouts/EcommerceAgrovetLayout/body/EcommerceAgrovetSite';
import DeliverySite from './layouts/DeliveryLayout/body/DeliverySite';
import EcommerceBikeSite from './layouts/EcommerceBikeLayout/body/EcommerceBikeSite';
import EcommerceMotorCycleSite from './layouts/EcommerceMotorCycleLayout/body/EcommerceMotorCycleSite';
import EcommerceMeatSite from './layouts/EcommerceMeatLayout/body/EcommerceMeatSite';
import EcommerceHardwareSite from './layouts/EcommerceHardwareLayout/body/EcommerceHardwareSite';
import EcommerceBookSite from './layouts/EcommerceBookLayout/body/EcommerceBookSite';
import DrycleaningBookingsSite from './layouts/DrycleaningBookingsLayout/body/DrycleaningBookingsSite';
import PropertyManagementSite from './layouts/PropertyManagementLayout/body/PropertyManagementSite';
import CompanyPortfolioSite from './layouts/CompanyPortfolioLayout/body/CompanyPortfolioSite';
import EcommerceAccessoriesSite from './layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite';

// A single, clean map from component name to the component itself.
export const BodyComponentMap: Record<string, React.ComponentType<{ pageData: StoreForm; companyId: string; paymentMethods: PublicPaymentMethod[] }>> = {
  'GhubaSite': GhubaSite,
  'PublicSpeakingSite': PublicSpeakingSite,
  'AutomotiveSite': AutomotiveSite,
  'EcommerceSite': EcommerceSite,
  'EcommerceShoesSite': EcommerceShoesSite,
  'EcommerceBookSite': EcommerceBookSite,
  'EcommerceAgrovetSite': EcommerceAgrovetSite,
  'EcommerceAccessoriesSite': EcommerceAccessoriesSite,
  'EcommerceMeatSite': EcommerceMeatSite,
  'EcommerceHardwareSite': EcommerceHardwareSite,
  'EcommerceGamingSite': EcommerceGamingSite,
  'EcommerceEarphonesSite': EcommerceEarphonesSite,
  'EcommerceGlassesSite': EcommerceGlassesSite,
  'EcommerceFlowersSite': EcommerceFlowersSite,
  'EcommerceHoneySite': EcommerceHoneySite,
  'EcommercePeanutsSite': EcommercePeanutsSite,
  'EcommerceWatchSite': EcommerceWatchSite,
  'EcommerceBabySite': EcommerceBabySite,
  'EcommerceCakeSite': EcommerceCakeSite,
  'EcommercePetsSite': EcommercePetsSite,
  'EcommerceGroceriesSite': EcommerceGroceriesSite,
  'EcommerceBikeSite': EcommerceBikeSite,
  'EcommerceMotorCycleSite': EcommerceMotorCycleSite,
  'ConsultancySite': ConsultancyLayout,
  'RealEstateSite': RealEstateSite,
  'PropertyManagementSite': PropertyManagementSite,
  'CompanyPortfolioSite': CompanyPortfolioSite,
  'BlogSite': BlogSite,
  'CoursesSite': CoursesSite,
  'CoursesSite2': CoursesSite2,
  'CoursesSite3': CoursesSite3,
  'DeliverySite': DeliverySite,
  'FitnessSite': FitnessSite,
  'FinanceSite': FinanceSite,
  'ServiceSite': ServiceSite,
  'BookingsSite': BookingsSite,
  'BarbershopBookingsSite': BarbershopBookingsSite,
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
  'DrycleaningBookingsSite': DrycleaningBookingsSite,
  'DefaultSite': DefaultSite,
};