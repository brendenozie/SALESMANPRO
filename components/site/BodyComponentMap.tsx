
import dynamic from 'next/dynamic';
import { StoreForm } from '@/types/typings';
import { PublicPaymentMethod } from '@/utils/payment-utils';
import DefaultSite from '@/components/site/layouts/DefaultLayout/body/DefaultSite';

// Type definition for standardizing component props
type BodyComponentType = React.ComponentType<{ 
  pageData: StoreForm; 
  companyId: string; 
  paymentMethods: PublicPaymentMethod[]; 
  ghubaData?: any 
}>;

// Import all components
const GhubaSite = dynamic(() => import('@/components/site/layouts/GhubaLayout/body/GhubaSite'));
const AutomotiveSite = dynamic(() => import('@/components/site/layouts/AutomotiveLayout/body/AutomotiveSite'));
const Automotive2Site = dynamic(() => import('@/components/site/layouts/Automotive2Layout/body/Automotive2Site'));
const BlogSite = dynamic(() => import('@/components/site/layouts/BlogLayout/body/BlogSite'));
const BookingsSite = dynamic(() => import('@/components/site/layouts/BookingsLayout/body/BookingsSite'));
const ConsultancySite = dynamic(() => import('@/components/site/layouts/ConsultancyLayout/body/ConsultancySite'));
const CoursesSite = dynamic(() => import('@/components/site/layouts/CoursesLayout/body/CoursesSite'));
const CoursesSite2 = dynamic(() => import('@/components/site/layouts/CoursesLayout2/body/CoursesSite2'));
const CoursesSite3 = dynamic(() => import('@/components/site/layouts/CoursesLayout3/body/CoursesSite3'));
const DirectorySite = dynamic(() => import('@/components/site/layouts/DirectoryLayout/body/DirectorySite'));
const EcommerceSite = dynamic(() => import('@/components/site/layouts/EcommerceLayout/body/EcommerceSite'));
const EcommerceShoesSite = dynamic(() => import('@/components/site/layouts/EcommerceShoesLayout/body/EcommerceShoesSite'));
const EcommerceGamingSite = dynamic(() => import('@/components/site/layouts/EcommerceGamingLayout/body/EcommerceGamingSite'));
const EcommerceEarphonesSite = dynamic(() => import('@/components/site/layouts/EcommerceEarphonesLayout/body/EcommerceEarphonesSite'));
const EcommerceGlassesSite = dynamic(() => import('@/components/site/layouts/EcommerceGlassesLayout/body/EcommerceGlassesSite'));
const EcommerceFlowersSite = dynamic(() => import('@/components/site/layouts/EcommerceFlowersLayout/body/EcommerceFlowersSite'));
const EcommerceHoneySite = dynamic(() => import('@/components/site/layouts/EcommerceHoneyLayout/body/EcommerceHoneySite'));
const EcommercePeanutsSite = dynamic(() => import('@/components/site/layouts/EcommercePeanutsLayout/body/EcommercePeanutsSite'));
const EcommerceWatchSite = dynamic(() => import('@/components/site/layouts/EcommerceWatchLayout/body/EcommerceWatchSite'));
const EcommerceBabySite = dynamic(() => import('@/components/site/layouts/EcommerceBabyLayout/body/EcommerceBabySite'));
const EcommerceCakeSite = dynamic(() => import('@/components/site/layouts/EcommerceCakeLayout/body/EcommerceCakeSite'));
const EcommercePetsSite = dynamic(() => import('@/components/site/layouts/EcommercePetsLayout/body/EcommercePetsSite'));
const EcommerceGroceriesSite = dynamic(() => import('@/components/site/layouts/EcommerceGroceriesLayout/body/EcommerceGroceriesSite'));
const BarbershopBookingsSite = dynamic(() => import('@/components/site/layouts/BarbershopBookingsLayout/body/BarbershopBookingsSite'));
const EventsSite = dynamic(() => import('@/components/site/layouts/EventsLayout/body/EventsSite'));
const FinanceSite = dynamic(() => import('@/components/site/layouts/FinanceLayout/body/FinanceSite'));
const FitnessSite = dynamic(() => import('@/components/site/layouts/FitnessLayout/body/FitnessSite'));
const HealthCareSite = dynamic(() => import('@/components/site/layouts/HealthcareLayout/body/HealthCareSite'));
const MarketPlaceSite = dynamic(() => import('@/components/site/layouts/MarketplaceLayout/body/MarketPlaceSite'));
const MediaSite = dynamic(() => import('@/components/site/layouts/MediaLayout/body/MediaSite'));
const NonProfitSite = dynamic(() => import('@/components/site/layouts/NonprofitLayout/body/NonProfitSite'));
const PortfolioSite = dynamic(() => import('@/components/site/layouts/PortfolioLayout/body/PortfolioSite'));
const PublicSpeakingSite = dynamic(() => import('@/components/site/layouts/PublicSpeakingLayout/body/PublicSpeakingSite'));
const RealEstateSite = dynamic(() => import('@/components/site/layouts/RealEstateLayout/body/RealEstateSite'));
const RestaurantSite = dynamic(() => import('@/components/site/layouts/RestaurantLayout/body/RestaurentSite'));
const SaaSSite = dynamic(() => import('@/components/site/layouts/SaaSLayout/body/SaasSite'));
const ServiceSite = dynamic(() => import('@/components/site/layouts/ServicesLayout/body/ServiceSite'));
const TravelSite = dynamic(() => import('@/components/site/layouts/TravelLayout/body/TravelSite'));
const SecuritySite = dynamic(() => import('@/components/site/layouts/SecurityLayout/body/SecuritySite'));
const Security2Site = dynamic(() => import('@/components/site/layouts/Security2Layout/body/Security2Site'));
const FurnitureSite = dynamic(() => import('@/components/site/layouts/FurnitureLayout/body/FurnitureSite'));
const FashionSite = dynamic(() => import('@/components/site/layouts/FashionLayout/body/FashionSite'));
const EcommerceAgrovetSite = dynamic(() => import('@/components/site/layouts/EcommerceAgrovetLayout/body/EcommerceAgrovetSite'));
const DeliverySite = dynamic(() => import('@/components/site/layouts/DeliveryLayout/body/DeliverySite'));
const EcommerceBikeSite = dynamic(() => import('@/components/site/layouts/EcommerceBikeLayout/body/EcommerceBikeSite'));
const EcommerceMotorCycleSite = dynamic(() => import('@/components/site/layouts/EcommerceMotorCycleLayout/body/EcommerceMotorCycleSite'));
const EcommerceMeatSite = dynamic(() => import('@/components/site/layouts/EcommerceMeatLayout/body/EcommerceMeatSite'));
const EcommerceHardwareSite = dynamic(() => import('@/components/site/layouts/EcommerceHardwareLayout/body/EcommerceHardwareSite'));
const EcommerceBookSite = dynamic(() => import('@/components/site/layouts/EcommerceBookLayout/body/EcommerceBookSite'));
const DrycleaningBookingsSite = dynamic(() => import('@/components/site/layouts/DrycleaningBookingsLayout/body/DrycleaningBookingsSite'));
const PropertyManagementSite = dynamic(() => import('@/components/site/layouts/PropertyManagementLayout/body/PropertyManagementSite'));
const CompanyPortfolioSite = dynamic(() => import('@/components/site/layouts/CompanyPortfolioLayout/body/CompanyPortfolioSite'));
const EcommerceAccessoriesSite = dynamic(() => import('@/components/site/layouts/EcommerceAccessoriesLayout/body/EcommerceAccessoriesSite'));
const CompanyPortfolioLightSite = dynamic(() => import('@/components/site/layouts/CompanyPortfolioLightLayout/body/CompanyPortfolioLightSite'));

// A single, clean map from component name to the component itself.4
export const BodyComponentMap: Record<string, BodyComponentType> = {
  'GhubaSite': GhubaSite,
  'PublicSpeakingSite': PublicSpeakingSite,
  'AutomotiveSite': AutomotiveSite,
  'Automotive2Site': Automotive2Site,
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
  'ConsultancySite': ConsultancySite,
  'RealEstateSite': RealEstateSite,
  'PropertyManagementSite': PropertyManagementSite,
  'CompanyPortfolioSite': CompanyPortfolioSite,
  'CompanyPortfolioLightSite': CompanyPortfolioLightSite,
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
  'RestaurentSite': RestaurantSite,
  'SecuritySite': SecuritySite,
  'Security2Site': Security2Site,
  'FurnitureSite': FurnitureSite,
  'FashionSite': FashionSite,
  'DrycleaningBookingsSite': DrycleaningBookingsSite,
  'DefaultSite': DefaultSite,
};