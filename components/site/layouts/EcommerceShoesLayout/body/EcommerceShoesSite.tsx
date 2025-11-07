'use client';

import React from 'react';
import HeroSlider from '@/components/site/layouts/EcommerceShoesLayout/body/components/HeroSlider';
// import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import MetricsSection from '@/components/site/MetricsSection';
import AwardsSection from '@/components/site/AwardsSection';
import TestimonialsSection from '@/components/site/TestimonialsSection/TestimonialsSection';
// import PromotionsSection from '@/components/site/PromotionsSection';
import CategorySection from './components/CategorySection';
import PromoSection from './components/PromoSection';
import PopularProducts from './components/PopularProducts';
import DailyBestSells from './components/DailyBestSells';
import FeaturesSection from './components/FeaturesSection';
import SleepTapeAd from './components/SleepTapeAd';
import Trending from './components/Trending';
import AllProducts from './components/AllProducts';
import { StoreForm } from '@/types/typings';
import BannerSection from './components/BannerSection/BannerSection';
import { ClockIcon, TagIcon, Squares2X2Icon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';


type EcommerceSiteShoesProps = {
  pageData: StoreForm;
  companyId: string;
};

const features = [
  {
    id: 1,
    title: '10 minute grocery now',
    description:
      'Get your order delivered to your doorstep at the earliest from FreshCart pickup stores near you.',
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

export default function EcommerceShoesSite({ pageData, companyId }: EcommerceSiteShoesProps) {
  const {
    heroSlides ,
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    themeSettings = {},
    slug = '',
    CoreValues = [],
  } = pageData || {};

  const products = marketplaceListings.length;
  const customers = 0; // Or from your `storeData`
  const awardsCount = awards?.length || 0;
  const support = 24; // Or from your `storeData`

  return (
    <>
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      <CategorySection promotions={promotions} themeSettings={themeSettings} />
      <PromoSection promotions={promotions} />
      <PopularProducts themeSettings={themeSettings} marketplaceListings={marketplaceListings} slug={slug} />
      <MetricsSection  coreValues={CoreValues} />
      <DailyBestSells marketplaceListings={marketplaceListings}/>
      <SleepTapeAd promotions={promotions} themeSettings={themeSettings} />
      <Trending promotions={promotions} themeSettings={themeSettings}  />
      <FeaturesSection features={features} themeSettings={themeSettings} />
      <AllProducts martketplaceListings={marketplaceListings} themeSettings={themeSettings} />
      <AwardsSection awards={awards} />
      <TestimonialsSection testimonials={testimonials} />
      <BannerSection promotions={promotions} themeSettings={themeSettings}/>
      <NewsletterSection />
    </>
  );
}