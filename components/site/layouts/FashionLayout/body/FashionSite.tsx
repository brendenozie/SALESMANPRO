'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from '@/components/site/layouts/FashionLayout/body/components/HeroSlider';
import { StoreForm, MarketListingForm } from '@/types/typings';
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
import CategorySection from './components/CategorySection';

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
}

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
    bookingSlots: undefined
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
    bookingSlots: undefined
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
    bookingSlots: undefined
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
    bookingSlots: undefined
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

const Features = () => {
  const features = [
    { icon: TruckIcon, title: "Fast Delivery", desc: "Free shipping on orders over $200" },
    { icon: ShieldCheckIcon, title: "Secure Payment", desc: "100% secure payment processing" },
    { icon: TagIcon, title: "Best Prices", desc: "Guaranteed quality at best prices" },
  ];

  return (
    <div className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-around gap-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
             <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
               <f.icon className="w-6 h-6" />
             </div>
             <div>
               <h4 className="font-bold text-slate-900">{f.title}</h4>
               <p className="text-sm text-slate-500">{f.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}


  return (
    <div>
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      <Features />
      {/* Categories Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
           {/* Large Item */}
           <div className="md:col-span-1 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000" loader={loader} alt="Women" fill className="object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                 <h3 className="text-2xl font-bold text-white">Women</h3>
                 <p className="text-white/80 text-sm mt-2">New Collection</p>
              </div>
           </div>
           {/* Small Item 1 */}
           <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1000" loader={loader} alt="Men" fill className="object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                 <h3 className="text-xl font-bold text-white">Men</h3>
              </div>
           </div>
           {/* Small Item 2 */}
           <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1611558709798-e009c8fd7706?q=80&w=1000" loader={loader} alt="Accessories" fill className="object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6">
                 <h3 className="text-xl font-bold text-white">Accessories</h3>
              </div>
           </div>
           {/* Wide Item */}
           <div className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000" loader={loader} alt="Shoes" fill className="object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8">
                 <h3 className="text-2xl font-bold text-white">Shoes</h3>
                 <button className="mt-4 text-sm font-bold text-white underline decoration-2 underline-offset-4">Browse Collection</button>
              </div>
           </div>
        </div>
      </section>

      <CategorySection StoreCategory={StoreCategory} themeSettings={themeSettings} />
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
