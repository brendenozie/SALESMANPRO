'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
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
    { id: 'pink-hoodie', name: 'Pink Hoodie', sellingPrice: 2.00, discount: 1.00, images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4'] },
    { id: 'remote-control-car', name: 'Remote Control Car', sellingPrice: 6.00, discount: 1.00, images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f'] },
    { id: 'baby-boy-set', name: 'Baby Boy Set', sellingPrice: 2.00, discount: 0.99, images: ['https://images.unsplash.com/photo-1522771935876-249711cd40f2'] },
  ],
  isFeatured: [
    { id: 'winter-hat-for-baby', name: 'Winter Hat for Baby', sellingPrice: 7.40, discount: 0.59, images: ['https://images.unsplash.com/photo-1522771935876-249711cd40f2'] },
    { id: 'kids-pampers', name: 'Kids Pampers', sellingPrice: 3.00, discount: 0.99, images: ['https://images.unsplash.com/photo-1617330780360-6060c4c4d57c'] },
    { id: 'electric-bike-toy', name: 'Electric Bike Toy', sellingPrice: 2.60, discount: 0.39, images: ['https://images.unsplash.com/photo-1532330393533-443990a51d10'] },
  ],
  isFlashDeal: [
    { id: 'puzzle-game', name: 'Puzzle Game', sellingPrice: 28.50, discount: 2.49, images: ['https://images.unsplash.com/photo-1585435557343-3b092031a831'] },
    { id: 'baby-shampoo', name: 'Baby shampoo', sellingPrice: 15.00, discount: 4.90, images: ['https://images.unsplash.com/photo-1559599101-f09722fb4948'] },
    { id: 'robo-toys', name: 'Robo Toys', sellingPrice: 3.75, discount: 0.24, images: ['https://images.unsplash.com/photo-1546776310-eef45dd6d63c'] },
  ],
  isNewArrival: [
    { id: 'red-sneakers', name: 'Red Sneakers', sellingPrice: 12.00, discount: 3.00, images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782'] },
    { id: 'baby-stroller', name: 'Baby Stroller', sellingPrice: 45.00, discount: 5.00, images: ['https://images.unsplash.com/photo-1591339102716-4bc24f7c41bc'] },
    { id: 'girl-blue-dress', name: 'Girl Blue Dress', sellingPrice: 18.00, discount: 4.00, images: ['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7'] },
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
    <section className="relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-white dark:bg-zinc-950 transition-colors">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-zinc-50/50 dark:from-zinc-900/20 to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 relative z-10">
        {productColumns.map((column, idx) => {
          const { products, isLoading } = useMarketplaceProducts(companyId, column.flag, column.fallback);

          return (
            <motion.div 
              key={column.flag}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group/column"
            >
              {/* Header */}
              <div className="mb-6 space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 block">
                  {column.label}
                </span>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {column.title}
                  </h3>
                  <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 transition-all group-hover/column:bg-zinc-200 dark:group-hover/column:bg-zinc-700" />
                </div>
              </div>

              {/* Items Wrapper Container */}
              <div className="relative flex flex-col gap-3">
                {products.map((product: any, pIdx: number) => (
                  <ProductCard 
                    key={`${product.id}-${pIdx}`} 
                    product={product} 
                    variant="list" 
                  />
                ))}
                
                {isLoading && (
                  <div className="flex items-center justify-center py-4 text-xs font-medium text-zinc-400 animate-pulse">
                    Updating selections...
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