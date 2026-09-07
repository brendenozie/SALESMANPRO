'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm, ListingMarketStatus, ListingSystemStatus, ListingTransactionType } from '@/types/typings';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  StarIcon, 
  ArrowRightIcon, 
  HeartIcon, 
  FireIcon,
  TruckIcon,
  ShieldCheckIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Above-the-fold components - statically imported
import CategoriesSection from './components/CategorySection';
import FeaturesSection from './components/FeaturesSection';

import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
}

// 🧠 Dynamically import client-side sections (with skeleton fallback)
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

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

  
const MOCK_PRODUCTS: MarketListingForm[] = [
  {
    id: '1',
    name: 'Midnight Velvet Blazer',
    description: 'A luxurious velvet blazer tailored for evening elegance.',
    sellingPrice: 150,
    finalPrice: 120,
    isDiscounted: true,
    discount: 20,
    isNewArrival: true,
    isOnOffer: true,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Formal', 'Winter'],
    brand: 'LuxeWear',
    color: ['Black', 'Navy'],
    size: ['M', 'L', 'XL'],
    material: ['Velvet', 'Silk'],
    quantity: 10,
    category: 'Men',
    subCategory: 'Jackets',
    productCategoryId: 'cat_1',
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
    id: '2',
    name: 'Urban Street Bomber',
    description: 'Lightweight bomber jacket perfect for casual city walks.',
    sellingPrice: 85,
    finalPrice: 85,
    isDiscounted: false,
    isNewArrival: false,
    isOnOffer: false,
    isFlashDeal: true,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1551028919-32163f06d420?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Streetwear', 'Casual'],
    brand: 'StreetPulse',
    color: ['Olive', 'Black'],
    size: ['S', 'M', 'L'],
    material: ['Polyester'],
    quantity: 25,
    category: 'Women',
    subCategory: 'Jackets',
    productCategoryId: 'cat_2',
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
    id: '3',
    name: 'Silk Summer Dress',
    description: 'Breathable silk fabric with a floral pattern.',
    sellingPrice: 200,
    finalPrice: 200,
    isDiscounted: false,
    isNewArrival: true,
    isOnOffer: false,
    isFlashDeal: false,
    isFeatured: true,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Summer', 'Luxury'],
    brand: 'Ethereal',
    color: ['Pink', 'White'],
    size: ['XS', 'S', 'M'],
    material: ['Silk'],
    quantity: 5,
    category: 'Women',
    subCategory: 'Dresses',
    productCategoryId: 'cat_3',
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
    id: '4',
    name: 'Classic Denim Trucker',
    description: 'Vintage wash denim that gets better with age.',
    sellingPrice: 95,
    finalPrice: 75,
    isDiscounted: true,
    discount: 20,
    isNewArrival: false,
    isOnOffer: true,
    isFlashDeal: false,
    isFeatured: false,
    isAvailable: true,
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1000&auto=format&fit=crop'],
    tags: ['Denim', 'Vintage'],
    brand: 'BlueHeritage',
    color: ['Blue'],
    size: ['M', 'L', 'XL', 'XXL'],
    material: ['Cotton', 'Elastane'],
    quantity: 15,
    category: 'Men',
    subCategory: 'Jackets',
    productCategoryId: 'cat_1',
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


const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const ProductCard = ({ item }: { item: MarketListingForm }) => {
  return (
    <motion.div 
      variants={fadeIn}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      {/* Image Area */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <Image 
          src={item.images[0] || 'https://via.placeholder.com/400'} 
          alt={item.name} 
          fill 
          loader={loader}
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.isNewArrival && (
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">New</span>
          )}
          {item.isDiscounted && item.discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">-{item.discount}%</span>
          )}
          {item.isFlashDeal && (
             <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded flex items-center gap-1"><FireIcon className="w-3 h-3"/> Flash</span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button className="w-full bg-white/90 backdrop-blur text-slate-900 py-3 rounded-lg text-sm font-bold hover:bg-slate-900 hover:text-white transition-colors shadow-lg">
            Add to Cart
          </button>
        </div>
        
        <button className="absolute top-3 right-3 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-600 hover:text-red-500">
          <HeartIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{item.brand}</p>
          <div className="flex items-center gap-1">
             <StarIconSolid className="w-3 h-3 text-yellow-400" />
             <span className="text-xs text-slate-600 font-semibold">4.8</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 truncate mb-2">{item.name}</h3>
        
        <div className="flex items-center gap-3">
          {item.isDiscounted ? (
             <>
                <span className="text-lg font-bold text-indigo-600">${item.finalPrice}</span>
                <span className="text-sm text-slate-400 line-through">${item.sellingPrice}</span>
             </>
          ) : (
             <span className="text-lg font-bold text-slate-900">${item.sellingPrice}</span>
          )}
        </div>
        
        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
           {item.tags.slice(0,2).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{tag}</span>
           ))}
        </div>
      </div>
    </motion.div>
  );
};




  return (
    <div>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </div>
      <div id="section-features" data-editor-section="features" data-editor-component="FeaturesSection">
        <FeaturesSection />
      </div>
      <div id="section-categories" data-editor-section="categories" data-editor-component="CategoriesSection">
        <CategoriesSection store={pageData} />
      </div>
      <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="DynamicPopularProducts">
        <DynamicPopularProducts id={id} />
      </div>
      <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection">
        <PromoSection promotions={promotions} />
      </div>
      <div id="section-trending" data-editor-section="trending" data-editor-component="DynamicTrending">
        <DynamicTrending id={id} />
      </div>
      <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DynamicDailyBestSells">
        <DynamicDailyBestSells id={id} />
      </div>
      <div id="section-second-promo" data-editor-section="second-promo" data-editor-component="SecondPromoSection">
        <SecondPromoSection promotions={promotions} />
      </div>
      <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts">
        <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
      </div>
      <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection">
        <MetricsSection coreValues={CoreValues} />
      </div>
      <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection">
        <AwardsSection awards={awards} />
      </div>
      {testimonialsData?.data && <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
   <TestimonialsSection testimonials={testimonialsData.data} />
 </div>}
      <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
        <NewsletterSection />
      </div>
    </div>
  );
}
