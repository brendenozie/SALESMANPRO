'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import ContactSection from './components/ContactSection/ContactSection';

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// 🧠 Dynamically import client-side sections (with skeleton fallback)
const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const DynamicTrending = dynamic(() => import('./components/Trending'), {
  loading: () => <SectionSkeleton />,
  ssr: false,
});

const PromoSection = dynamic(() => import('./components/PromoSection'), { loading: () => <SectionSkeleton />, ssr: false });
const SecondPromoSection = dynamic(() => import('./components/SecondPromoSection'), { loading: () => <SectionSkeleton />, ssr: false });
const AllProducts = dynamic(() => import('./components/AllProducts'), { loading: () => <SectionSkeleton />, ssr: false });
const MetricsSection = dynamic(() => import('./components/MetricsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const AwardsSection = dynamic(() => import('./components/AwardsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const NewsletterSection = dynamic(() => import('./components/NewsletterSection/NewsletterSection'), { loading: () => <SectionSkeleton />, ssr: false });

type EcommerceSiteProps = {
  pageData: StoreForm;
  companyId: string;
};

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function EcommerceSite({ pageData, companyId }: EcommerceSiteProps) {
  const {
    heroSlides,
    id,
    themeSettings = {},
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    bannerUrl,
    CoreValues = [],
  } = pageData;

  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);

  // ⚙️ Only include featured listings on SSR
  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );

  return (
    <div className="bg-[#050505] min-h-screen selection:bg-primary-color selection:text-white">
      
      {/* 01. THE ENTRY: Full Bleed */}
      <section className="relative z-30">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </section>

      {/* 02. DISCOVERY LAYER: Overlapping the Hero slightly */}
      <div className="relative z-40 -mt-10 md:-mt-20">
        <CategorySection store={pageData} />
      </div>

      {/* 03. PRODUCT ENGINE: High contrast grid */}
      <main className="relative z-10 space-y-32 py-24">
        
        {/* Popular Products with subtle HUD background */}
        <div className="relative">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-center opacity-[0.03] pointer-events-none" />
           <DynamicPopularProducts id={id} />
        </div>

        {/* First Promo: High-Impact Visual Break */}
        <PromoSection promotions={promotions} />

        {/* Trending & Best Sells: Grouped by a shared background plate */}
        <section className="bg-white/[0.02] py-24 border-y border-white/5">
          <div className="space-y-32">
            <DynamicTrending id={id} />
            <DynamicDailyBestSells id={id} />
          </div>
        </section>

        {/* Second Promo: The 'Glitch' or Neon break */}
        <SecondPromoSection promotions={promotions} />

        {/* Comprehensive Product Feed */}
        <AllProducts 
          id={id} 
          marketplaceListings={featured} 
          themeSettings={themeSettings} 
        />
      </main>

      {/* 04. VALIDATION STACK: The Grey/Dark Modules */}
      <div className="relative z-20">
        {/* Core Values / Metrics */}
        <MetricsSection coreValues={CoreValues} />
        
        {/* Recognition / Awards */}
        <AwardsSection awards={awards} />
        
        {/* Feedback / Testimonials */}
        {testimonialsData?.data && (
          <TestimonialsSection testimonials={testimonialsData.data} />
        )}
      </div>

      {/* 05. TERMINAL STACK: The Final Sync */}
      <footer className="relative z-10 border-t border-white/10 bg-[#030303]">
        <NewsletterSection />
        <ContactSection />
      </footer>

    </div>
  );
}
