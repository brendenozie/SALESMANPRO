'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported for LCP
import CategorySection from './components/CategorySection';
import ContactSection from './components/ContactSection/ContactSection';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// Loading skeleton: Adapted for dual-mode visibility

// 🧠 Dynamic imports for heavy or client-only sections
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
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

  // Fetch client-side testimonials
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);

  // Featured listings optimization
  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );

  return (
    <div className="bg-white dark:bg-[#050505] min-h-screen transition-colors duration-500 selection:bg-zinc-900 dark:selection:bg-white selection:text-white dark:selection:text-black">
      
      {/* 01. THE ENTRY: Hero Layer */}
      <section className="relative z-30">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </section>

      {/* 02. DISCOVERY LAYER: Overlapping Category Section */}
      <div className="relative z-40 mt-10 md:mt-20">
        <CategorySection store={pageData} />
      </div>

      {/* 03. PRODUCT ENGINE: High contrast grid surfaces */}
      <main className="relative z-10 space-y-32 py-24">
        
        {/* Popular Products with responsive grid overlay */}
        <div className="relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.05] dark:opacity-[0.03] pointer-events-none invert dark:invert-0" />
           <DynamicPopularProducts id={id} />
        </div>

        {/* First Promo Break */}
        <PromoSection promotions={promotions} />

        {/* Trending & Best Sells: Unified background plate */}
        <section className="bg-zinc-50 dark:bg-white/[0.02] py-24 border-y border-black/5 dark:border-white/5 transition-colors duration-300">
          <div className="space-y-32">
            <DynamicTrending id={id} />
            <DynamicDailyBestSells id={id} />
          </div>
        </section>

        {/* Second Promo Break */}
        <SecondPromoSection promotions={promotions} />

        {/* Comprehensive Product Feed */}
        <AllProducts 
          id={id} 
          marketplaceListings={featured} 
          themeSettings={themeSettings} 
        />
      </main>

      {/* 04. VALIDATION STACK: Social Proof & Reliability */}
      <div className="relative z-20 space-y-0">
        <MetricsSection coreValues={CoreValues} />
        <AwardsSection awards={awards} />
        {testimonialsData?.data && (
          <TestimonialsSection testimonials={testimonialsData.data} />
        )}
      </div>

      {/* 05. TERMINAL STACK: The Footer Sequence */}
      <footer className="relative z-10 border-t border-black/5 dark:border-white/10 bg-zinc-50 dark:bg-[#030303] transition-colors duration-300">
        <NewsletterSection />
        <ContactSection />
      </footer>

    </div>
  );
}