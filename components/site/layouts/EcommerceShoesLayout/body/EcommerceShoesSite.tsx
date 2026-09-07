'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';

import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import CategoriesSection from './components/CategoriesSection';
import DailyBestSells from './components/DailyBestSells';
import FeaturesSection from './components/FeaturesSection';
import SleepTapeAd from './components/SleepTapeAd';
import TrendingPromotion from './components/TrendingPromotion';

import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';
import BannerSection from './components/BannerSection/BannerSection';
import { ClockIcon, TagIcon, Squares2X2Icon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

// Loading skeleton

// 🧠 Dynamically import client-side sections (with skeleton fallback)
const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), {
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
  ssr: false,
});

const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), {
  loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
  ssr: false,
});

const DynamicTrending = dynamic(() => import('./components/TrendingPromotion'), {
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

const features = [
  {
    id: 1,
    title: '10 minute now',
    description:
      'Get your order delivered to your doorstep at the near you.',
    icon: ClockIcon,
  },
  {
    id: 2,
    title: 'Best Prices & Offers',
    description:
      'Cheaper prices than your local supermarket, great cashback offers to top it off. Get best prices & offers.',
    icon: TagIcon,
  },
  {
    id: 3,
    title: 'Wide Assortment',
    description:
      'Choose from 5000+ products across food, personal care, household, bakery, veg and non-veg & other categories.',
    icon: Squares2X2Icon,
  },
  {
    id: 4,
    title: 'Easy Returns',
    description:
      'Not satisfied with a product? Return it at the doorstep & get a refund within hours. No questions asked policy.',
    icon: ArrowUturnLeftIcon,
  },
];


type EcommerceSiteShoesProps = {
  pageData: StoreForm;
  companyId: string;
};


// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function EcommerceSite({ pageData, companyId }: EcommerceSiteShoesProps) {
  const {
    heroSlides,
    id,
    StoreCategory = [],
    marketplaceListings = [],
    themeSettings = {},
    testimonials = [],
    awards = [],
    promotions = [],
    bannerUrl,
    slug,
    CoreValues = [],
    
  } = pageData || {};

  return (
    <div>
      <div id="section-hero-slider" data-editor-section="hero-slider" data-editor-component="HeroSlider">
        <HeroSlider heroSlides={heroSlides} />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection features={features} themeSettings={themeSettings} />
      </div>
      <div id="section-categories" data-editor-section="categories" data-editor-component="CategoriesSection">
        <CategoriesSection StoreCategory={StoreCategory} themeSettings={themeSettings} />
      </div>
      <div id="section-category-section" data-editor-section="category-section" data-editor-component="CategorySection">
        <CategorySection promotions={promotions} themeSettings={themeSettings} />
      </div>
      <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection">
        <PromoSection promotions={promotions} />
      </div>
      <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="PopularProducts">
        <DynamicPopularProducts id={id} themeSettings={themeSettings} marketplaceListings={marketplaceListings} slug={slug} />
      </div>
      <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection">
        <MetricsSection coreValues={CoreValues} />
      </div>
      <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DailyBestSells">
        <DynamicDailyBestSells id={id} />
      </div>
      <div id="section-sleep-tape-ad" data-editor-section="sleep-tape-ad" data-editor-component="SleepTapeAd">
        <SleepTapeAd promotions={promotions} themeSettings={themeSettings} />
      </div>
      <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts">
        <AllProducts martketplaceListings={marketplaceListings} themeSettings={themeSettings} />
      </div>
      <div id="section-trending-promo" data-editor-section="trending-promo" data-editor-component="TrendingPromotion">
        <TrendingPromotion promotions={promotions} themeSettings={themeSettings} />
      </div>
      <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection">
        <AwardsSection awards={awards} />
      </div>
      <div id="section-banner" data-editor-section="banner" data-editor-component="BannerSection">
        <BannerSection promotions={promotions} themeSettings={themeSettings} />
      </div>
      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
        <TestimonialsSection testimonials={testimonials} />
      </div>
      <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
        <NewsletterSection />
      </div>
    </div>
  );
}
