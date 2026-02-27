'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';

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
const MetricsSection = dynamic(() => import('@/components/site/MetricsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const AwardsSection = dynamic(() => import('@/components/site/AwardsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('@/components/site/TestimonialsSection/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const NewsletterSection = dynamic(() => import('@/components/site/NewsletterSection/NewsletterSection'), { loading: () => <SectionSkeleton />, ssr: false });

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
    <div className="bg-black flex flex-col overflow-hidden">
  {/* --- 01. COMMAND CENTER (Hero) --- */}
  <section className="relative">
    <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
    {/* Visual bridge to next section */}
    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent z-10" />
  </section>

  {/* --- 02. NAVIGATION NODES (Categories) --- */}
  <div className="relative z-20 mt-8">
    <CategorySection store={pageData} />
  </div>

  {/* --- 03. MISSION OBJECTIVES (Products) --- */}
  <main className="space-y-0 relative">
    {/* Grid Background Overlay for the entire product area */}
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
         style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

    <section className="py-20 border-b border-white/5">
      <DynamicPopularProducts id={id} />
    </section>

    <section className="relative">
      <PromoSection promotions={promotions} />
    </section>

    <section className="py-20 bg-zinc-950/50">
       <div className="container mx-auto">
          <DynamicTrending id={id} />
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600/20 to-transparent my-20" />
          <DynamicDailyBestSells id={id} />
       </div>
    </section>

    <section className="relative">
      <SecondPromoSection promotions={promotions} />
    </section>

    <section className="py-24 border-t border-white/5 bg-black">
      <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
    </section>
  </main>

  {/* --- 04. SYSTEM PROTOCOLS (Metrics & Awards) --- */}
  <div className="relative">
    {/* These two sections are stitched together with no gap */}
    <MetricsSection coreValues={CoreValues} />
    <div className="bg-zinc-950">
      <AwardsSection awards={awards} />
    </div>
  </div>

  {/* --- 05. COMMS & INTEL (Social) --- */}
  <div className="relative bg-black border-t border-red-600/10">
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
