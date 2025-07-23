// app/site/[slug]/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStoreContext } from '@/contexts/StoreContext';

const folderMap: Record<string, string> = {
  'ecommerce':           'EcommerceLayout',
  'e-commerce':          'EcommerceLayout',
  'services':            'ServicesLayout',
  'service provider':    'ServicesLayout',
  'bookings':            'BookingsLayout',
  'booking & appointments': 'BookingsLayout',
  'real estate':         'RealEstateLayout',
  'portfolio':           'PortfolioLayout',
  'blog':                'BlogLayout',
  'directory':           'DirectoryLayout',
  'courses':             'CoursesLayout',
  'nonprofit':           'NonprofitLayout',
  'event':               'EventsLayout',
  'healthcare':          'HealthcareLayout',
  'saas':                'SaaSLayout',
  'automotive':          'AutomotiveLayout',
  'media':               'MediaLayout',
  'finance':             'FinanceLayout',
  'travel':              'TravelLayout',
  'fitness':             'FitnessLayout',
  'marketplace':         'MarketplaceLayout',
  // fallback
  'default':             'DefaultLayout',
  'other':               'DefaultLayout',
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

  // derive the layout folder
  const key = normalizeCategory(storeFormData.category || 'other');
  const folder = folderMap[key] ?? folderMap['default'];

  // build the import path:
  // @/components/site/layouts/EcommerceLayout/body/EcommerceSite
  const importPath = `@/components/site/layouts/${folder}/body/${folder.replace('Layout','Site')}`;

  // dynamically import exactly that component:
  const BodyComponent = dynamic(() => import('@/components/site/layouts/EcommerceLayout/body/EcommerceSite').then(mod => mod.default), {
    // SSR: true (default) if these bodies are server-friendly; else false
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading store content…</p>
      </div>
    ),
  });

  return (
    <main className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      <BodyComponent />
    </main>
  );
}
