'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm } from '@/types/typings';

// Above-the-fold components
import CategorySection from './components/CategorySection';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';
import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

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

  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);

  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );

  const renderSection = (sec: any, idx: number) => {
    const key = (sec.component || sec.id || sec.type || '').toLowerCase();

    if (key.includes('hero') || key.includes('heroslider')) {
      return (
        <section key={sec.id || idx} className="relative">
          <div id={sec.id || "section-hero"} data-editor-section={sec.id || "hero"} data-editor-component="HeroSlider">
            <HeroSlider heroSlides={sec.content?.heroSlides || heroSlides} themeSettings={themeSettings} />
          </div>
        </section>
      );
    }

    if (key.includes('category') || key.includes('categorysection')) {
      return (
        <div key={sec.id || idx} className="relative z-20 mt-8">
          <div id={sec.id || "section-category"} data-editor-section={sec.id || "category"} data-editor-component="CategorySection">
            <CategorySection store={pageData} />
          </div>
        </div>
      );
    }

    if (key.includes('popular') || key.includes('popularproducts') || key.includes('dynamicpopularproducts')) {
      return (
        <section key={sec.id || idx} className="py-20 border-b border-zinc-100 dark:border-white/5">
          <div id={sec.id || "section-popular-products"} data-editor-section={sec.id || "popular-products"} data-editor-component="DynamicPopularProducts">
            <DynamicPopularProducts id={id} />
          </div>
        </section>
      );
    }

    if (key.includes('promo') && !key.includes('second')) {
      return (
        <section key={sec.id || idx} className="relative">
          <div id={sec.id || "section-promo"} data-editor-section={sec.id || "promo"} data-editor-component="PromoSection">
            <PromoSection promotions={sec.content?.promotions || promotions} />
          </div>
        </section>
      );
    }

    if (key.includes('trending') || key.includes('dynamictrending')) {
      return (
        <div key={sec.id || idx} className="py-10 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="container mx-auto">
            <div id={sec.id || "section-trending"} data-editor-section={sec.id || "trending"} data-editor-component="DynamicTrending">
              <DynamicTrending id={id} />
            </div>
          </div>
        </div>
      );
    }

    if (key.includes('best-sells') || key.includes('dailybestsells') || key.includes('dynamicdailybestsells')) {
      return (
        <div key={sec.id || idx} className="py-10 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="container mx-auto">
            <div id={sec.id || "section-daily-best-sells"} data-editor-section={sec.id || "daily-best-sells"} data-editor-component="DynamicDailyBestSells">
              <DynamicDailyBestSells id={id} />
            </div>
          </div>
        </div>
      );
    }

    if (key.includes('second-promo') || key.includes('secondpromosection')) {
      return (
        <section key={sec.id || idx} className="relative">
          <div id={sec.id || "section-second-promo"} data-editor-section={sec.id || "second-promo"} data-editor-component="SecondPromoSection">
            <SecondPromoSection promotions={sec.content?.promotions || promotions} />
          </div>
        </section>
      );
    }

    if (key.includes('all-products') || key.includes('allproducts')) {
      return (
        <section key={sec.id || idx} className="py-24 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-black">
          <div id={sec.id || "section-all-products"} data-editor-section={sec.id || "all-products"} data-editor-component="AllProducts">
            <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
          </div>
        </section>
      );
    }

    if (key.includes('metrics') || key.includes('metricssection')) {
      return (
        <div key={sec.id || idx} className="relative">
          <div id={sec.id || "section-metrics"} data-editor-section={sec.id || "metrics"} data-editor-component="MetricsSection">
            <MetricsSection coreValues={CoreValues} />
          </div>
        </div>
      );
    }

    if (key.includes('awards') || key.includes('awardssection')) {
      return (
        <div key={sec.id || idx} className="bg-zinc-100 dark:bg-zinc-950">
          <div id={sec.id || "section-awards"} data-editor-section={sec.id || "awards"} data-editor-component="AwardsSection">
            <AwardsSection awards={awards} />
          </div>
        </div>
      );
    }

    if (key.includes('testimonials') || key.includes('testimonialssection')) {
      return (
        <div key={sec.id || idx} className="relative bg-white dark:bg-black border-t border-red-600/10">
          <div id={sec.id || "section-testimonials"} data-editor-section={sec.id || "testimonials"} data-editor-component="TestimonialsSection">
            <TestimonialsSection testimonials={testimonialsData?.data || []} />
          </div>
        </div>
      );
    }

    if (key.includes('newsletter') || key.includes('newslettersection')) {
      return (
        <div key={sec.id || idx} className="relative z-10">
          <div id={sec.id || "section-newsletter"} data-editor-section={sec.id || "newsletter"} data-editor-component="NewsletterSection">
            <NewsletterSection />
          </div>
        </div>
      );
    }

    return null;
  };

  const staticFallback = (
    <>
      {/* --- 01. COMMAND CENTER (Hero) --- */}
      <section className="relative">
        <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider">
          <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
        </div>
      </section>

      {/* --- 02. NAVIGATION NODES (Categories) --- */}
      <div className="relative z-20 mt-8">
        <div id="section-category" data-editor-section="category" data-editor-component="CategorySection">
          <CategorySection store={pageData} />
        </div>
      </div>

      {/* --- 03. MISSION OBJECTIVES (Products) --- */}
      <main className="space-y-0 relative">
        {/* Grid Background Overlay - adapts color via 'currentColor' */}
        <div 
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none text-zinc-900 dark:text-white" 
          style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`, backgroundSize: '50px 50px' }} 
        />

        <section className="py-20 border-b border-zinc-100 dark:border-white/5">
          <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="DynamicPopularProducts">
            <DynamicPopularProducts id={id} />
          </div>
        </section>

        <section className="relative">
          <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection">
            <PromoSection promotions={promotions} />
          </div>
        </section>

        <section className="py-20 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="container mx-auto">
            <div id="section-trending" data-editor-section="trending" data-editor-component="DynamicTrending">
              <DynamicTrending id={id} />
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-600/20 to-transparent my-20" />
            <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DynamicDailyBestSells">
              <DynamicDailyBestSells id={id} />
            </div>
          </div>
        </section>

        <section className="relative">
          <div id="section-second-promo" data-editor-section="second-promo" data-editor-component="SecondPromoSection">
            <SecondPromoSection promotions={promotions} />
          </div>
        </section>

        <section className="py-24 border-t border-zinc-100 dark:border-white/5 bg-white dark:bg-black">
          <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts">
            <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
          </div>
        </section>
      </main>

      {/* --- 04. SYSTEM PROTOCOLS (Metrics & Awards) --- */}
      <div className="relative">
        <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection">
          <MetricsSection coreValues={CoreValues} />
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-950">
          <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection">
            <AwardsSection awards={awards} />
          </div>
        </div>
      </div>

      {/* --- 05. COMMS & INTEL (Social) --- */}
      <div className="relative bg-white dark:bg-black border-t border-red-600/10">
        {testimonialsData?.data && (
          <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
            <TestimonialsSection testimonials={testimonialsData.data} />
          </div>
        )}
        
        <div className="relative z-10">
          <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
            <NewsletterSection />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white dark:bg-black flex flex-col overflow-hidden transition-colors duration-500">
      <ThemeSectionContainer
        sections={pageData?.sections}
        renderSection={renderSection}
        staticFallback={staticFallback}
      />
      {/* Decorative Global Scan Line */}
      <div className="fixed top-0 left-0 w-full h-[1px] bg-red-600/20 z-50 pointer-events-none shadow-[0_0_10px_rgba(255,0,60,0.3)]" />
    </div>
  );
}