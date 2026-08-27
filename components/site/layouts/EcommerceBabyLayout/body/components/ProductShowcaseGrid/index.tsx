'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import useSWR from 'swr';
import ProductCard from './ProductCard';
import { MarketListingForm } from '@/types/typings';

type ListingFlag = 'isOnOffer' | 'isFeatured' | 'isNewArrival' | 'isFlashDeal';

interface ProductColumnConfig {
  title: string;
  label: string;
  flag: ListingFlag;
  fallback: Partial<MarketListingForm>[];
}

const FALLBACK_PRODUCTS: Record<ListingFlag, Partial<MarketListingForm>[]> = {
  isOnOffer: [
    { id: 'pink-hoodie', name: 'Pink Hoodie', sellingPrice: 200, finalPrice: 150, images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4'] },
    { id: 'remote-control-car', name: 'Remote Control Car', sellingPrice: 600, finalPrice: 450, images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f'] },
    { id: 'baby-boy-set', name: 'Baby Boy Set', sellingPrice: 1200, finalPrice: 990, images: ['https://images.unsplash.com/photo-1522771935876-249711cd40f2'] },
  ],
  isFeatured: [
    { id: 'winter-hat-for-baby', name: 'Winter Hat for Baby', sellingPrice: 740, finalPrice: 590, images: ['https://images.unsplash.com/photo-1522771935876-249711cd40f2'] },
    { id: 'kids-pampers', name: 'Kids Pampers', sellingPrice: 3000, finalPrice: 2800, images: ['https://images.unsplash.com/photo-1617330780360-6060c4c4d57c'] },
    { id: 'electric-bike-toy', name: 'Electric Bike Toy', sellingPrice: 2600, finalPrice: 2390, images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10'] },
  ],
  isFlashDeal: [
    { id: 'puzzle-game', name: 'Puzzle Game', sellingPrice: 2850, finalPrice: 2490, images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831'] },
    { id: 'baby-shampoo', name: 'Baby shampoo', sellingPrice: 1500, finalPrice: 1200, images: ['https://images.unsplash.com/photo-1559599101-f09722fb4948'] },
    { id: 'robo-toys', name: 'Robo Toys', sellingPrice: 3750, finalPrice: 3200, images: ['https://images.unsplash.com/photo-1546776310-eef45dd6d63c'] },
  ],
  isNewArrival: [
    { id: 'red-sneakers', name: 'Red Sneakers', sellingPrice: 1200, finalPrice: 900, images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782'] },
    { id: 'baby-stroller', name: 'Baby Stroller', sellingPrice: 45000, finalPrice: 40000, images: ['https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc'] },
    { id: 'girl-blue-dress', name: 'Girl Blue Dress', sellingPrice: 1800, finalPrice: 1400, images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7'] },
  ],
};

const productColumns: ProductColumnConfig[] = [
  { title: 'Top Sells', label: 'Popular Picks', flag: 'isOnOffer', fallback: FALLBACK_PRODUCTS.isOnOffer },
  { title: 'Top Rated', label: 'Parent Approved', flag: 'isFeatured', fallback: FALLBACK_PRODUCTS.isFeatured },
  { title: 'Trending', label: 'Viral Now', flag: 'isFlashDeal', fallback: FALLBACK_PRODUCTS.isFlashDeal },
  { title: 'New Arrivals', label: 'Just In', flag: 'isNewArrival', fallback: FALLBACK_PRODUCTS.isNewArrival },
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

function useMarketplaceProducts(companyId: string, flag: ListingFlag, fallback: Partial<MarketListingForm>[]) {
  const url = `/api/site/productsByFlag?companyId=${companyId}&flag=${flag}&limit=3`;
  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  return {
    products: Array.isArray(data?.data) && data.data.length > 0 ? data.data : fallback,
    isLoading,
    error,
  };
}

export default function ProductShowcaseGrid({ companyId }: { companyId: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';

  return (
    <section className="relative mx-auto px-6 lg:px-12 py-20 lg:py-28 bg-[#FAFAFA] dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      {/* Soft Background Decorative Ambient Orbs */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-sky-200/40 dark:bg-sky-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 relative z-10">
        {productColumns.map((column, idx) => {
          const { products, isLoading } = useMarketplaceProducts(companyId, column.flag, column.fallback);

          return (
            <motion.div 
              key={column.flag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="group/column flex flex-col"
            >
              {/* Layout Column Section Header Element */}
              <div className="mb-8 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 block">
                  {column.label}
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                    {column.title}
                  </h3>
                  <div className="h-0.5 flex-1 bg-zinc-200/60 dark:bg-zinc-800/80 transition-all group-hover/column:bg-zinc-300 dark:group-hover/column:bg-zinc-700" />
                </div>
              </div>

              {/* Stacked Vertical Product Collection Items Container Wrapper */}
              <div className="relative flex flex-col gap-4">
                {products.map((product: any, pIdx: number) => (
                  <ProductCard 
                    key={`${product.id}-${pIdx}`} 
                    product={product} 
                    variant="list" 
                  />
                ))}
                
                {isLoading && (
                  <div className="flex items-center justify-center py-4 text-[11px] font-bold uppercase tracking-wider text-zinc-400 animate-pulse gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                    Updating Choices...
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}