'use client';

import useSWR from 'swr';
import { SkeletonGrid } from '@/components/site/SkeletonGrid/SkeletonGrid';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import { MarketListingForm } from '@/types/typings';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartIcon, ArrowRightIcon, CubeIcon, SwatchIcon } from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

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


export default function PopularProducts({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?id=${id}&flag=isFeatured&limit=8`;
  const fetcher = createCachedFetcher(`products-${id}-isFeatured`);

  const fallbackData = typeof window !== 'undefined'
    ? (() => {
        try {
          return JSON.parse(
            localStorage.getItem(`swr-cache:products-${id}-isFeatured:${url}`) || 'null'
          );
        } catch {
          return null;
        }
      })()
    : null;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
    refreshInterval: 120000,
    fallbackData: fallbackData || undefined,
  });

  if (isLoading) return <SkeletonGrid count={8} />;
  if (error) return <div className="text-center text-gray-500"></div>;
  if (!data?.data?.length) return <div className="text-center text-gray-500"></div>;

  return (
    <section className="py-12 max-w-7xl mx-auto px-6 mb-20">
      {/* Title */}
      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8 text-center">
        Weekly Highlights
      </h2>

      {/* Product Grid (Updated design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {(data.data.length > 0 ? data.data : MOCK_FURNITURE).map((item: any) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
