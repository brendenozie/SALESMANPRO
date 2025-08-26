// app/site/[slug]/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStoreContext } from '@/contexts/StoreContext';

// Your existing folderMap (maps category string to Layout folder name)
const folderMap: Record<string, string> = {
  // ... (all your category mappings)
  'ecommerce':          'EcommerceLayout',
  'e-commerce':         'EcommerceLayout',

  'services':           'ServicesLayout',
  'service provider':   'ServicesLayout',

  'bookings':           'BookingsLayout',
  'booking & appointments': 'BookingsLayout',

  'real estate':        'RealEstateLayout',

  'portfolio':          'PortfolioLayout',
  'portfolio & personal branding':          'PortfolioLayout',

  'blog':               'BlogLayout',
  'blog & content':               'BlogLayout',

  'directory':          'DirectoryLayout',
  'directory & listings':          'DirectoryLayout',

  'courses':            'CoursesLayout',
  'educational':            'CoursesLayout',
  'educational & online courses':            'CoursesLayout',
  
  'nonprofit':          'NonprofitLayout',
  'nonprofit & community':          'NonprofitLayout',

  'event':              'EventsLayout',
  'event & ticketing':              'EventsLayout',

  'healthcare':         'HealthcareLayout',
  'healthcare & clinics':         'HealthcareLayout',

  'saas':               'SaaSLayout',
  'saas & web apps':               'SaaSLayout',

  'automotive':         'AutomotiveLayout',

  'media':              'MediaLayout',
  'media & entertainment':              'MediaLayout',

  'finance':            'FinanceLayout',
  'finance & legal':            'FinanceLayout',

  'travel':             'TravelLayout',
  'travel & tourism':             'TravelLayout',

  'fitness':            'FitnessLayout',
  'fitness & wellness':            'FitnessLayout',

  'marketplace':        'MarketplaceLayout',

  'restaurant':         'RestaurantLayout',
  'restaurant & food delivery':         'RestaurantLayout',

  'default':            'DefaultLayout',
  'other':              'DefaultLayout',
};

// Your existing siteComponentNameMap (maps Layout folder name to specific Site component name)
const siteComponentNameMap: Record<string, string> = {
    'EcommerceLayout': 'EcommerceSite',
    'ServicesLayout': 'ServiceSite', // Changed to singular
    'BookingsLayout': 'BookingsSite',
    'RealEstateLayout': 'RealEstateSite',
    'PortfolioLayout': 'PortfolioSite',
    'BlogLayout': 'BlogSite',
    'DirectoryLayout': 'DirectorySite',
    'CoursesLayout': 'CoursesSite',
    'NonprofitLayout': 'NonProfitSite', // Capital P
    'EventsLayout': 'EventsSite',
    'HealthcareLayout': 'HealthCareSite', // Capital C
    'SaaSLayout': 'SaaSSite', // Corrected 'SaaSSite' to match your list
    'AutomotiveLayout': 'AutomotiveSite',
    'MediaLayout': 'MediaSite',
    'FinanceLayout': 'FinanceSite',
    'TravelLayout': 'TravelSite',
    'FitnessLayout': 'FitnessSite',
    'MarketplaceLayout': 'MarketPlaceSite', // Capital P
    'RestaurantLayout': 'RestaurentSite', // Kept your spelling
    'DefaultLayout': 'DefaultSite',
};

// **THIS IS THE CRUCIAL PART:** A map where each value is a STATIC dynamic import
const dynamicComponentsMap: Record<string, React.ComponentType> = {
  'EcommerceSite': dynamic(() => import('@/components/site/layouts/EcommerceLayout/body/EcommerceSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false, // or false if the component needs browser APIs
  }),
  
  'ServiceSite': dynamic(() => import('@/components/site/layouts/ServicesLayout/body/ServiceSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'BookingsSite': dynamic(() => import('@/components/site/layouts/BookingsLayout/body/BookingsSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  
  'PortfolioSite': dynamic(() => import('@/components/site/layouts/PortfolioLayout/body/PortfolioSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'RealEstateSite': dynamic(() => import('@/components/site/layouts/RealEstateLayout/body/RealEstateSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'BlogSite': dynamic(() => import('@/components/site/layouts/BlogLayout/body/BlogSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'DirectorySite': dynamic(() => import('@/components/site/layouts/DirectoryLayout/body/DirectorySite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'CoursesSite': dynamic(() => import('@/components/site/layouts/CoursesLayout/body/CoursesSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'NonProfitSite': dynamic(() => import('@/components/site/layouts/NonprofitLayout/body/NonProfitSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'EventsSite': dynamic(() => import('@/components/site/layouts/EventsLayout/body/EventsSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'HealthCareSite': dynamic(() => import('@/components/site/layouts/HealthcareLayout/body/HealthCareSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'SaaSSite': dynamic(() => import('@/components/site/layouts/SaaSLayout/body/SaaSSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'AutomotiveSite': dynamic(() => import('@/components/site/layouts/AutomotiveLayout/body/AutomotiveSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'MediaSite': dynamic(() => import('@/components/site/layouts/MediaLayout/body/MediaSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'FinanceSite': dynamic(() => import('@/components/site/layouts/FinanceLayout/body/FinanceSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'TravelSite': dynamic(() => import('@/components/site/layouts/TravelLayout/body/TravelSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'FitnessSite': dynamic(() => import('@/components/site/layouts/FitnessLayout/body/FitnessSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'MarketPlaceSite': dynamic(() => import('@/components/site/layouts/MarketplaceLayout/body/MarketPlaceSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'RestaurentSite': dynamic(() => import('@/components/site/layouts/RestaurantLayout/body/RestaurentSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
  'DefaultSite': dynamic(() => import('@/components/site/layouts/DefaultLayout/body/DefaultSite').then(mod => mod.default), {
    loading: () => (<div className="min-h-screen flex items-center justify-center"><p>Loading store content…</p></div>),
    ssr: false,
  }),
};

function normalizeCategory(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9& ]/g, '')
    .replace(/\s+/g, ' ');
}

export default function StorePage() {
  const { storeFormData } = useStoreContext();
  if (!storeFormData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  // 1. Determine the category
  const key = normalizeCategory(storeFormData.category || 'other');

  // 2. Map category to Layout folder name
  const folder = folderMap[key] ?? folderMap['default'];

  // 3. Map Layout folder name to the specific Site Component name (e.g., "EcommerceSite")
  const siteComponentName = siteComponentNameMap[folder] ?? siteComponentNameMap['DefaultLayout'];

  // 4. Select the pre-defined dynamic component from your map
  // This is where the "dynamic selection" happens at runtime
  const BodyComponent = dynamicComponentsMap[siteComponentName] || dynamicComponentsMap['DefaultSite'];

  if (!BodyComponent) {
    // Fallback if mapping somehow fails (shouldn't if DefaultSite is always present)
    console.error(`Error: No dynamic component found for category: ${storeFormData.category}. Resolved to site component: ${siteComponentName}`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Error loading store content.</p>
      </div>
    );
  }

  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <BodyComponent /> {/* Render the selected component */}
    </main>
  );
}