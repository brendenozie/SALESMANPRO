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


const ProductCard = ({ item }: { item: MarketListingForm }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-white border border-stone-100 rounded-none md:rounded-sm shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <Image 
          src={item.images[0] || ''} 
          alt={item.name} 
          loader={loader}
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.isNewArrival && (
            <span className="bg-stone-900 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">New In</span>
          )}
          {item.isDiscounted && (
            <span className="bg-orange-600 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">Sale</span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <button className="p-2 bg-white text-stone-800 rounded-full shadow-md hover:bg-stone-900 hover:text-white transition-colors">
            <HeartIcon className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white text-stone-800 rounded-full shadow-md hover:bg-stone-900 hover:text-white transition-colors">
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Quick View Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
           <button className="w-full bg-white text-stone-900 font-medium py-3 hover:bg-stone-900 hover:text-white transition-colors">
             Add to Cart
           </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-medium text-stone-900">{item.name}</h3>
          <div className="flex flex-col items-end">
             {item.isDiscounted ? (
               <>
                 <span className="text-sm text-stone-400 line-through">${item.sellingPrice}</span>
                 <span className="text-lg font-bold text-orange-700">${item.finalPrice}</span>
               </>
             ) : (
               <span className="text-lg font-bold text-stone-900">${item.sellingPrice}</span>
             )}
          </div>
        </div>

        {/* Furniture Specific Details */}
        <div className="flex items-center gap-4 text-xs text-stone-500 mt-3 py-3 border-t border-stone-100">
           {item.dimensions && (
             <div className="flex items-center gap-1">
                <CubeIcon className="w-4 h-4" />
                <span>{item.dimensions}</span>
             </div>
           )}
           {item.material.length > 0 && (
             <div className="flex items-center gap-1">
                <SwatchIcon className="w-4 h-4" />
                <span>{item.material[0]}</span>
             </div>
           )}
        </div>
        
        <p className="text-sm text-stone-500 line-clamp-2 mt-2">{item.description}</p>
      </div>
    </motion.div>
  );
};

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
    <div className="space-y-12">
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      {/* USP Section */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: TruckIcon, title: "White Glove Delivery", desc: "We assemble and place your items." },
            { icon: SwatchIcon, title: "Sustainable Materials", desc: "FSC certified wood and organic fabrics." },
            { icon: StarIcon, title: "5-Year Warranty", desc: "Quality guaranteed on all structural frames." }
          ].map((feature, i) => (
            <div key={i} className="flex gap-4 items-start group">
               <div className="p-4 bg-stone-50 rounded-full text-stone-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                 <feature.icon className="w-8 h-8" />
               </div>
               <div>
                 <h4 className="text-lg font-bold text-stone-900 mb-2">{feature.title}</h4>
                 <p className="text-stone-500 leading-relaxed">{feature.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Featured Categories */}
      <section className="py-24 max-w-7xl mx-auto px-6">
         <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif font-bold text-stone-900">Shop by Room</h2>
            <a href="#" className="text-stone-500 hover:text-orange-700 underline underline-offset-4">View Full Catalog</a>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Living Room', img: 'https://images.unsplash.com/photo-1583847669868-28203b10cd11?q=80&w=1000' },
              { name: 'Bedroom', img: 'https://images.unsplash.com/photo-1616594039964-40891f913dd2?q=80&w=1000' },
              { name: 'Dining', img: 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=1000' }
            ].map((cat, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="relative h-80 group overflow-hidden cursor-pointer"
              >
                <Image src={cat.img} alt={cat.name} fill className="object-cover" loader={loader} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl text-white font-serif font-medium">{cat.name}</h3>
                </div>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Product Grid */}
      <section className="py-12 max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8 text-center">Weekly Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_FURNITURE.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Material Focus Section */}
      <section className="bg-stone-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Designed for Life, <br/>Crafted to Last.</h2>
            <p className="text-stone-400 text-lg mb-8 leading-relaxed">
              We believe furniture should be more than just functional. It should be an extension of your personality. That's why we source only the finest oak, walnut, and sustainable textiles.
            </p>
            <div className="grid grid-cols-2 gap-8">
               <div>
                 <div className="text-3xl font-bold text-orange-500 mb-1">100%</div>
                 <div className="text-stone-400 text-sm">Sustainable Wood</div>
               </div>
               <div>
                 <div className="text-3xl font-bold text-orange-500 mb-1">25+</div>
                 <div className="text-stone-400 text-sm">Artisan Partners</div>
               </div>
            </div>
          </div>
          <div className="relative h-[500px] w-full">
             <div className="absolute inset-0 border border-white/20 translate-x-4 translate-y-4 z-0" />
             <div className="relative z-10 h-full w-full overflow-hidden">
               <Image 
                 src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop" 
                 alt="Craftsmanship" 
                 loader={loader}
                 fill 
                 className="object-cover grayscale hover:grayscale-0 transition-all duration-1000" 
               />
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
