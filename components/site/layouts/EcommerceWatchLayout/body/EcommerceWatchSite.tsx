'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import FeatureSection from './components/FeatureSection';

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
    <div className="space-y-12">
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      <CategorySection StoreCategory={StoreCategory} themeSettings={themeSettings} />
      <FeatureSection />
      <DynamicPopularProducts id={id} />
      <PromoSection promotions={promotions} />
      <DynamicTrending id={id} />
      <DynamicDailyBestSells id={id} />
      <SecondPromoSection promotions={promotions} />
      <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
      <MetricsSection coreValues={CoreValues} />
      <AwardsSection awards={awards} />
      {testimonialsData?.data && <TestimonialsSection testimonials={testimonialsData.data} />}
      <NewsletterSection />
    </div>
  );
}
