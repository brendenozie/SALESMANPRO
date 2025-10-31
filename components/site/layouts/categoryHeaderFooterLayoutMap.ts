// In a separate file (e.g. siteLayoutMap.ts)
import dynamic from 'next/dynamic';

const GhubaLayout = dynamic(() => import('@/components/site/layouts/GhubaLayout/GhubaLayout'));
const EcommerceLayout = dynamic(() => import('@/components/site/layouts/EcommerceLayout/EcommerceLayout'));
const EcommerceShoesLayout = dynamic(() => import('@/components/site/layouts/EcommerceShoesLayout/EcommerceShoesLayout'));
const ServicesLayout = dynamic(() =>  import('@/components/site/layouts/ServicesLayout/ServicesLayout'));
const BookingsLayout = dynamic(() => import( '@/components/site/layouts/BookingsLayout/BookingsLayout'));
const DefaultLayout = dynamic(() => import( '@/components/site/layouts/DefaultLayout/DefaultLayout'));
const RealEstateLayout = dynamic(() => import( '@/components/site/layouts/RealEstateLayout/RealEstateLayout'));
const PortfolioLayout = dynamic(() => import( '@/components/site/layouts/PortfolioLayout/PortfolioLayout'));
const BlogLayout = dynamic(() => import( '@/components/site/layouts/BlogLayout/BlogLayout'));
const CoursesLayout = dynamic(() => import( '@/components/site/layouts/CoursesLayout/CoursesLayout'));
const DirectoryLayout = dynamic(() => import( '@/components/site/layouts/DirectoryLayout/DirectoryLayout'));
const EventsLayout = dynamic(() => import( '@/components/site/layouts/EventsLayout/EventsLayout'));
const FinanceLayout = dynamic(() => import( '@/components/site/layouts/FinanceLayout/FinanceLayout'));
const FitnessLayout = dynamic(() => import( '@/components/site/layouts/FitnessLayout/FitnessLayout'));
const HealthcareLayout = dynamic(() => import( '@/components/site/layouts/HealthcareLayout/HealthcareLayout'));
const MarketplaceLayout = dynamic(() => import( '@/components/site/layouts/MarketplaceLayout/MarketplaceLayout'));
const NonprofitLayout = dynamic(() => import( '@/components/site/layouts/NonprofitLayout/NonprofitLayout'));
const MediaLayout = dynamic(() => import( '@/components/site/layouts/MediaLayout/MediaLayout'));
const TravelLayout = dynamic(() => import( '@/components/site/layouts/TravelLayout/TravelLayout'));
const RestaurantLayout = dynamic(() => import( '@/components/site/layouts/RestaurantLayout/RestaurantLayout'));
const AutomotiveLayout = dynamic(() => import( '@/components/site/layouts/AutomotiveLayout/AutomotiveLayout'));
const PublicSpeakingLayout = dynamic(() => import( '@/components/site/layouts/PublicSpeakingLayout/PublicSpeakingLayout'));
// const SaaSLayout = dynamic(() => import( '@/components/site/layouts/SaaSLayout/SaaSLayout'));
const ConsultancyLayout = dynamic(() => import('@/components/site/layouts/ConsultancyLayout/ConsultancyLayout'));
import { ReactNode } from 'react';
import { StoreForm } from '../../../types/typings';

type LayoutHeaderFooterComponent = React.ComponentType<{
  params: { storeFormData: StoreForm };
  children: ReactNode;
}>;

const categoryHeaderFooterLayoutMap: Record<string, LayoutHeaderFooterComponent> = {
    'ghuba': GhubaLayout,
    'ecommerce': EcommerceLayout,
    'public speaking': PublicSpeakingLayout,
    'public-speaking': PublicSpeakingLayout,
    'shoes-store': EcommerceShoesLayout,
    'shoes store': EcommerceShoesLayout,
    'e-commerce': EcommerceLayout,
    'services': ServicesLayout,
    'service provider': ServicesLayout,
    'consultancy': ConsultancyLayout,
    'consultant & coach': ConsultancyLayout,
    'bookings':BookingsLayout,
    'booking & appointments':BookingsLayout,      
    'real estate': RealEstateLayout,    
    'portfolio':PortfolioLayout,
    'portfolio & personal branding':PortfolioLayout,     
    'restaurant':RestaurantLayout,
    'restaurant & food delivery':RestaurantLayout,
    'blog':BlogLayout,
    'blog & content':BlogLayout,
    'directory':DirectoryLayout,
    'directory & listings':DirectoryLayout,
    'educational':CoursesLayout,
    'educational & online courses':CoursesLayout,
    'courses':CoursesLayout,
    'nonprofit':NonprofitLayout,
    'nonprofit & community':NonprofitLayout,
    'event':EventsLayout,
    'event & ticketing':EventsLayout,
    'healthcare':HealthcareLayout,
    'healthcare & clinics':HealthcareLayout,
    // 'saas':SaaSLayout ,
    // 'saas & web apps':SaaSLayout ,
    'automotive':AutomotiveLayout ,
    'media':MediaLayout ,
    'media & entertainment':MediaLayout ,
    'finance':FinanceLayout  ,
    'finance & legal':FinanceLayout  ,
    'travel':TravelLayout ,
    'travel & tourism':TravelLayout ,
    'fitness':FitnessLayout ,
    'fitness & wellness':FitnessLayout ,
    'marketplace':MarketplaceLayout ,
    'other':DefaultLayout ,
    'Other':DefaultLayout ,     
    
    // variant-based (optional)
    'modern shop (v1)': EcommerceLayout,
    'digital goods store (v2)': EcommerceLayout,
    'artisan marketplace (v3)': EcommerceLayout,
    'executive coach (v1)': ConsultancyLayout,
    'wellness retreat (v2)': ConsultancyLayout,
    'standard speaker site': PublicSpeakingLayout,
    'shoes store classic': EcommerceShoesLayout,
    'agency portfolio': ServicesLayout,
    'scheduler hub': BookingsLayout,
    'creative cv': PortfolioLayout,
    'modern magazine': BlogLayout,
    'charity connect': NonprofitLayout,
    'clinic pro': HealthcareLayout,
    'film studio': MediaLayout,
    'financial advisor': FinanceLayout,
    'car dealership': AutomotiveLayout,
    'travel agency': TravelLayout,
    'gym & fitness': FitnessLayout,
    'business directory': DirectoryLayout,
    'online learning': CoursesLayout,
    'food delivery': RestaurantLayout,
    'event booking': EventsLayout,
    'property listings': RealEstateLayout,
    'app landing page': DefaultLayout, // or SaaSLayout
    'product marketplace': MarketplaceLayout,
    'general purpose site': DefaultLayout,

    'default': DefaultLayout,
       
  
};

export default categoryHeaderFooterLayoutMap;
