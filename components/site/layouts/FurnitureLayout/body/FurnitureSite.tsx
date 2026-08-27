'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm, ListingMarketStatus, ListingSystemStatus, ListingTransactionType } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import USPSlider from './components/USPSlider';
import RoomSection from './components/RoomSection';

// Loading skeleton
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// 🧠 Dynamically import client-side sections (with skeleton fallback)
const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,  ssr: false,});
const DynamicTrending = dynamic(() => import('./components/Trending'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PromoSection = dynamic(() => import('./components/PromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const WeeklyProducts = dynamic(() => import('./components/WeeklyProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
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
    bookingSlots: undefined,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
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
    bookingSlots: undefined,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
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
    bookingSlots: undefined,
    listingMarketStatus: ListingMarketStatus.AVAILABLE,
    listingSystemStatus: ListingSystemStatus.DRAFT,
    listingTransactionType: ListingTransactionType.SALE
  }
];

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
    <div>
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      {/* USP Section */}
      <USPSlider  coreValues={CoreValues} themeSettings={themeSettings} />      
      <CategorySection store={pageData} />      
      {/* Product Grid */}
      <WeeklyProducts id={id} />
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
