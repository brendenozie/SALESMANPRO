'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from '@/components/site/layouts/FurnitureLayout/body/components/HeroSlider';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { StoreForm, MarketListingForm } from '@/types/typings';


// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import { TruckIcon, SwatchIcon, StarIcon, ArrowRightIcon, CubeIcon, HeartIcon } from '@heroicons/react/24/outline';
import USPSlider from './components/USPSlider';
import RoomSection from './components/RoomSection';
import ProductCard from './components/ProductCard';

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

// --- 1. Interface (As Provided) ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
}

const MOCK_FURNITURE: MarketListingForm[] = [
  {
    id: 'f1',
    name: 'Oslo Lounge Chair',
    description: 'Mid-century modern aesthetic with premium ash wood structure.',
    sellingPrice: 450,
    finalPrice: 399,
    isDiscounted: true,
    discount: 12,
    isNewArrival: true,
    isOnOffer: true,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Living Room', 'Scandi'],
    brand: 'NordicHome',
    color: ['Beige', 'Walnut'],
    size: [],
    material: ['Ash Wood', 'Linen'],
    dimensions: 'H: 80cm x W: 75cm',
    condition: 'New',
    quantity: 5,
    category: 'Furniture',
    subCategory: 'Chairs',
    productCategoryId: 'cat_f1',
    option: [],
    weight: [],
    pricingTiers: [],
    features: [],
    bedrooms: [],
    studios: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: true,
    paymentOption: 'Online',
    status: 'ACTIVE',
    location: {},
    duration: null,
    buyingPrice: 0,
    bookingSlots: undefined
  },
  {
    id: 'f2',
    name: 'Marble Coffee Table',
    description: 'Solid Carrara marble top with industrial steel legs.',
    sellingPrice: 800,
    finalPrice: 800,
    isDiscounted: false,
    isNewArrival: false,
    isOnOffer: false,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1634646477375-586b0208ba51?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Minimalist', 'Luxury'],
    brand: 'StoneCraft',
    color: ['White', 'Black'],
    size: [],
    material: ['Marble', 'Steel'],
    dimensions: 'D: 90cm x H: 45cm',
    condition: 'New',
    quantity: 2,
    category: 'Furniture',
    subCategory: 'Tables',
    productCategoryId: 'cat_f2',
    option: [],
    weight: [],
    pricingTiers: [],
    features: [],
    bedrooms: [],
    studios: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: true,
    paymentOption: 'Online',
    status: 'ACTIVE',
    location: {},
    duration: null,
    buyingPrice: 0,
    bookingSlots: undefined
  },
  {
    id: 'f3',
    name: 'Velvet Sectional Sofa',
    description: 'Plush velvet finish in deep emerald green. Modular design.',
    sellingPrice: 2100,
    finalPrice: 2100,
    isDiscounted: false,
    isNewArrival: true,
    isOnOffer: false,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Living Room', 'Comfort'],
    brand: 'LuxeLiving',
    color: ['Green'],
    size: [],
    material: ['Velvet', 'Pine'],
    dimensions: 'W: 280cm x D: 160cm',
    condition: 'New',
    quantity: 10,
    category: 'Furniture',
    subCategory: 'Sofas',
    productCategoryId: 'cat_f3',
    option: [],
    weight: [],
    pricingTiers: [],
    features: [],
    bedrooms: [],
    studios: [],
    requiredClientInfo: [],
    amenities: [],
    delivery: true,
    paymentOption: 'Online',
    status: 'ACTIVE',
    location: {},
    duration: null,
    buyingPrice: 0,
    bookingSlots: undefined
  }
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

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
    <div>
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      {/* USP Section */}
      <USPSlider  coreValues={CoreValues} themeSettings={themeSettings} />      
      <CategorySection StoreCategory={StoreCategory} themeSettings={themeSettings} />      
      {/* Product Grid */}
      <section className="py-12 max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8 text-center">Weekly Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_FURNITURE.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
      {/* Featured Categories */}
      <RoomSection store={pageData}  themeSettings={themeSettings} />
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
