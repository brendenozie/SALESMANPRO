'use client';

import React from 'react';
import { useStore, useStoreContext } from '../../../contexts/StoreContext';
import AutomotiveSite from '@/components/site/layouts/AutomotiveLayout/body/AutomotiveSite';
import BookingsSite from '@/components/site/layouts/BookingsLayout/body/BookingsSite';
import CoursesSite from '@/components/site/layouts/CoursesLayout/body/CoursesSite';
import DirectorySite from '@/components/site/layouts/DirectoryLayout/body/DirectorySite';
import EcommerceSite from '@/components/site/layouts/EcommerceLayout/body/EcommerceSite';
import EventsSite from '@/components/site/layouts/EventsLayout/body/EventsSite';
import FinanceSite from '@/components/site/layouts/FinanceLayout/body/FinanceSite';
import FitnessSite from '@/components/site/layouts/FitnessLayout/body/FitnessSite';
import MarketplaceSite from '@/components/site/layouts/MarketplaceLayout/body/MarketPlaceSite';
import MediaSite from '@/components/site/layouts/MediaLayout/body/MediaSite';
import RealEstateSite from '@/components/site/layouts/RealEstateLayout/body/RealEstateSite';
import RestaurantSite from '@/components/site/layouts/RestaurantLayout/body/RestaurentSite';
import TravelSite from '@/components/site/layouts/TravelLayout/body/TravelSite';
import HealthCareSite from '@/components/site/layouts/HealthcareLayout/body/HealthCareSite';
import NonProfitSite from '@/components/site/layouts/NonprofitLayout/body/NonProfitSite';
import BlogSite from '@/components/site/layouts/BlogLayout/body/BlogSite';
import DefaultSite from '@/components/site/layouts/DefaultLayout/body/DefaultSite';
import PortfolioSite from '@/components/site/layouts/PortfolioLayout/body/PortfolioSite';
import ServiceSite from '@/components/site/layouts/ServicesLayout/body/ServiceSite';
import SaaSSite from '@/components/site/layouts/SaaSLayout/body/SaaSSite';

export default function StorePage() {
  const { storeFormData} = useStoreContext();


  if (!storeFormData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  // Normalize category
  const type = (storeFormData.category ?? 'default').toLowerCase();

  switch (type) {

      case 'e-commerce':
      case 'ecommerce':
        return <EcommerceSite/>
      
      case 'services':
      case 'service provider':
        return <ServiceSite/>

      case 'bookings':
      case 'booking & appointments':
        return <BookingsSite/>
  
      case 'real estate':
        return <RealEstateSite/>
  
      case 'portfolio':
      case 'portfolio & personal branding':
        return <PortfolioSite/>
  
      case 'restaurant':
      case 'restaurant & food delivery':
        return <RestaurantSite/>
  
      case 'blog':
      case 'blog & content':
        return <BlogSite/>

      case 'directory':
      case 'directory & listings':
        return <DirectorySite/>
              
      case 'educational':
      case 'educational & online courses':
      case 'courses':
        return <CoursesSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'nonprofit':
      case 'nonprofit & community':
        return <NonProfitSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'event':
      case 'event & ticketing':
        return <EventsSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'healthcare':
      case 'healthcare & clinics':
        return <HealthCareSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'saas':
      case 'saas & web apps':
        return <SaaSSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'automotive':
      case 'automotive':
        return <AutomotiveSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'media':
      case 'media & entertainment':
        return <MediaSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />
// Review stopped at finance
      case 'finance':
      case 'finance & legal':
        return <FinanceSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'travel':
      case 'travel & tourism':
        return <TravelSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />

      case 'fitness':
      case 'fitness & wellness':
        return <FitnessSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />
  
      case 'marketplace':
      case 'marketplace':
        return <MarketplaceSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />
  
      case 'other':
      case 'Other':
        return <DefaultSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />
  
      default:
        return <DefaultSite 
                // storeFormData={storeFormData}
                // slug={storeFormData.slug}
                />
    }

}


