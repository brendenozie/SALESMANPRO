'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import HeroSlider from '@/components/site/layouts/EcommerceLayout/body/components/HeroSlider';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import MetricsSection from '@/components/site/MetricsSection';
import AwardsSection from '@/components/site/AwardsSection';
import TestimonialsSection from '@/components/site/TestimonialsSection/TestimonialsSection';
import CategorySection from './components/CategorySection';
import PromoSection from './components/PromoSection';
import FeaturesSection from './components/FeaturesSection';
import SleepTapeAd from './components/SleepTapeAd';
import AllProducts from './components/AllProducts';
import { StoreForm, MarketListingForm } from '@/types/typings';

// 🧠 Dynamically import client-side sections (with skeleton fallback)
const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), {
  loading: () => <div className="h-56 animate-pulse bg-gray-100 rounded-xl" />,
  ssr: false,
});

const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), {
  loading: () => <div className="h-56 animate-pulse bg-gray-100 rounded-xl" />,
  ssr: false,
});

const DynamicTrending = dynamic(() => import('./components/Trending'), {
  loading: () => <div className="h-56 animate-pulse bg-gray-100 rounded-xl" />,
  ssr: false,
});

type EcommerceSiteProps = {
  pageData: StoreForm;
};

export default function EcommerceSite({ pageData }: EcommerceSiteProps) {
  const {
    heroSlides,
    slug,
    themeSettings = {},
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    bannerUrl,
    CoreValues = [],
  } = pageData;

  // ⚙️ Only include featured listings on SSR
  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );

  return (
    <div className="space-y-12">
      {/* 🔝 Critical above-the-fold content (SSR) */}
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      <CategorySection StoreCategory={StoreCategory} themeSettings={themeSettings} />
      <DynamicPopularProducts slug={slug} />
      <PromoSection promotions={promotions} />
      <DynamicTrending slug={slug} />
      <DynamicDailyBestSells slug={slug} />
      <SleepTapeAd bannerUrl={bannerUrl} themeSettings={themeSettings} />
      <AllProducts
        slug={slug}
        marketplaceListings={featured}
        themeSettings={themeSettings}
      />
      <FeaturesSection />
      <MetricsSection coreValues={CoreValues} />
      <AwardsSection awards={awards} />
      <TestimonialsSection testimonials={testimonials} />
      <NewsletterSection />
    </div>
  );
}
