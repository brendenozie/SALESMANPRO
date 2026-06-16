'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm } from '@/types/typings';

// Above-the-fold components
import CategorySection from './components/CategorySection';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Loading skeleton - now theme-aware

// Dynamically import client-side sections
const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), {
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
  ssr: false,
});

const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), {
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
  ssr: false,
});

const DynamicTrending = dynamic(() => import('./components/Trending'), {
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
  ssr: false,
});

const PromoSection = dynamic(() => import('./components/PromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const SecondPromoSection = dynamic(() => import('./components/SecondPromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AllProducts = dynamic(() => import('./components/AllProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const MetricsSection = dynamic(() => import('./components/MetricsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AwardsSection = dynamic(() => import('./components/AwardsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const NewsletterSection = dynamic(() => import('./components/NewsletterSection/NewsletterSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

type EcommerceSiteProps = {
  pageData: StoreForm;
  companyId: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function EcommerceSite({ pageData, companyId }: EcommerceSiteProps) {
  const {
    heroSlides,
    id,
    themeSettings = {},
    marketplaceListings = [],
    awards = [],
    promotions = [],
    CoreValues = [],
  } = pageData;

  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);

  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );

  return (
    <div className="bg-white dark:bg-black flex flex-col overflow-hidden transition-colors duration-500">
      
      {/* --- 01. COMMAND CENTER (Hero) --- */}
      <section className="relative">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </section>

      {/* --- 02. NAVIGATION NODES (Categories) --- */}
      <div className="relative z-20 mt-8">
        <CategorySection store={pageData} />
      </div>

      {/* --- 03. MISSION OBJECTIVES (Products) --- */}
      <main className="space-y-0 relative">
        {/* Grid Background Overlay - adapts color via 'currentColor' */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none text-zinc-900 dark:text-white" 
          style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
        />

        <section className="py-20 border-b border-zinc-100 dark:border-white/5">
          <DynamicPopularProducts id={id} />
        </section>

        <section className="relative">
          <PromoSection promotions={promotions} />
        </section>

        <section className="py-20 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="container mx-auto">
            <DynamicTrending id={id} />
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600/20 to-transparent my-20" />
            <DynamicDailyBestSells id={id} />
          </div>
        </section>

        <section className="relative">
          <SecondPromoSection promotions={promotions} />
        </section>

        <section className="py-24 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-black">
          <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
        </section>
      </main>

      {/* --- 04. SYSTEM PROTOCOLS (Metrics & Awards) --- */}
      <div className="relative">
        <MetricsSection coreValues={CoreValues} />
        <div className="bg-zinc-100 dark:bg-zinc-950">
          <AwardsSection awards={awards} />
        </div>
      </div>

      {/* --- 05. COMMS & INTEL (Social) --- */}
      <div className="relative bg-white dark:bg-black border-t border-red-600/10">
        {testimonialsData?.data && (
          <TestimonialsSection testimonials={testimonialsData.data} />
        )}
        
        <div className="relative z-10">
          <NewsletterSection />
        </div>
      </div>

      {/* Decorative Global Scan Line */}
      <div className="fixed top-0 left-0 w-full h-[1px] bg-red-600/20 z-50 pointer-events-none shadow-[0_0_10px_rgba(255,0,60,0.3)]" />
    </div>
  );
}