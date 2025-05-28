'use client';

import React from 'react';
import { useStore } from '../../../contexts/StoreContext';
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

// Import your site components


export default function StorePage() {
  const store = useStore();

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  // Normalize category
  const type = (store.category ?? 'default').toLowerCase();

  switch (type) {
      case 'services':
      case 'service provider':
        return <ServiceSite 
            // store={store}
            // slug={store.slug}
        />

      case 'e-commerce':
      case 'ecommerce':
        return <EcommerceSite
            store={store}
            slug={store.slug}
        />
      
      case 'bookings':
      case 'booking & appointments':
        return <BookingsSite 
                // store={store}
                // slug={store.slug}
                />
  
      case 'real estate':
        return <RealEstateSite 
                // store={store}
                // slug={store.slug}
                />
  
      case 'portfolio':
      case 'portfolio & personal branding':
        return <PortfolioSite 
                // store={store}
                // slug={store.slug}
                />
  
      case 'restaurant':
      case 'restaurant & food delivery':
        return <RestaurantSite 
                // store={store}
                // slug={store.slug}
                />
  
      case 'blog':
      case 'blog & content':
        return <BlogSite 
                // store={store}
                // slug={store.slug}
                />

      case 'directory':
      case 'directory & listings':
        return <DirectorySite 
                // store={store}
                // slug={store.slug}
                />
              
      case 'educational':
      case 'educational & online courses':
      case 'courses':
        return <CoursesSite 
                // store={store}
                // slug={store.slug}
                />

      case 'nonprofit':
      case 'nonprofit & community':
        return <NonProfitSite 
                // store={store}
                // slug={store.slug}
                />

      case 'event':
      case 'event & ticketing':
        return <EventsSite 
                // store={store}
                // slug={store.slug}
                />

      case 'healthcare':
      case 'healthcare & clinics':
        return <HealthCareSite 
                // store={store}
                // slug={store.slug}
                />

      case 'saas':
      case 'saas & web apps':
        return <SaaSSite 
                // store={store}
                // slug={store.slug}
                />

      case 'automotive':
      case 'automotive':
        return <AutomotiveSite 
                // store={store}
                // slug={store.slug}
                />

      case 'media':
      case 'media & entertainment':
        return <MediaSite 
                // store={store}
                // slug={store.slug}
                />

      case 'finance':
      case 'finance & legal':
        return <FinanceSite 
                // store={store}
                // slug={store.slug}
                />

      case 'travel':
      case 'travel & tourism':
        return <TravelSite 
                // store={store}
                // slug={store.slug}
                />

      case 'fitness':
      case 'fitness & wellness':
        return <FitnessSite 
                // store={store}
                // slug={store.slug}
                />
  
      case 'marketplace':
      case 'marketplace':
        return <MarketplaceSite 
                // store={store}
                // slug={store.slug}
                />
  
      case 'other':
      case 'Other':
        return <DefaultSite 
                // store={store}
                // slug={store.slug}
                />
  
      default:
        return <DefaultSite 
                // store={store}
                // slug={store.slug}
                />
    }

}
