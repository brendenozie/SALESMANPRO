// In a separate file (e.g. siteLayoutMap.ts)
import dynamic from 'next/dynamic';

const EcommerceLayout = dynamic(() =>
  import('@/components/site/layouts/EcommerceLayout/EcommerceLayout')
);
const ServicesLayout = dynamic(() =>
    import('@/components/site/layouts/ServicesLayout/ServicesLayout')
  );
import BookingsLayout from '@/components/site/layouts/BookingsLayout/BookingsLayout';
import DefaultLayout from '@/components/site/layouts/DefaultLayout/DefaultLayout';
import RealEstateLayout from '@/components/site/layouts/RealEstateLayout/RealEstateLayout';
import PortfolioLayout from '@/components/site/layouts/PortfolioLayout/PortfolioLayout';
import BlogLayout from '@/components/site/layouts/BlogLayout/BlogLayout';
import CoursesLayout from '@/components/site/layouts/CoursesLayout/CoursesLayout';
import DirectoryLayout from '@/components/site/layouts/DirectoryLayout/DirectoryLayout';
import EventsLayout from '@/components/site/layouts/EventsLayout/EventsLayout';
import FinanceLayout from '@/components/site/layouts/FinanceLayout/FinanceLayout';
import FitnessLayout from '@/components/site/layouts/FitnessLayout/FitnessLayout';
import HealthcareLayout from '@/components/site/layouts/HealthcareLayout/HealthcareLayout';
import MarketplaceLayout from '@/components/site/layouts/MarketplaceLayout/MarketplaceLayout';
import NonprofitLayout from '@/components/site/layouts/NonprofitLayout/NonprofitLayout';
import MediaLayout from '@/components/site/layouts/MediaLayout/MediaLayout';
import TravelLayout from '@/components/site/layouts/TravelLayout/TravelLayout';
import RestaurantLayout from '@/components/site/layouts/RestaurantLayout/RestaurantLayout';
import AutomotiveLayout from '@/components/site/layouts/AutomotiveLayout/AutomotiveLayout';
import SaaSLayout from '@/components/site/layouts/SaaSLayout/SaaSLayout';
import { ReactNode } from 'react';
import { StoreForm } from '../../../types/typings';

type LayoutComponent = React.ComponentType<{
  params: { storeFormData: StoreForm };
  children: ReactNode;
}>;

const categoryLayoutMap: Record<string, LayoutComponent> = {
    'ecommerce': EcommerceLayout,
    'e‐commerce': EcommerceLayout,
    'services': ServicesLayout,
    'service provider': ServicesLayout, 
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
    'saas':SaaSLayout ,
    'saas & web apps':SaaSLayout ,
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
    'default': DefaultLayout,
       
  
};

export default categoryLayoutMap;
