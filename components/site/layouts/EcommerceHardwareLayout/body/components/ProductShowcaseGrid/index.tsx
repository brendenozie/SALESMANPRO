'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
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
    {
      id: 'impact-driver',
      name: 'Impact Driver V2 Professional Pack',
      sellingPrice: 12500,
      finalPrice: 11000,
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c'],
      option: [],
    },
  ],
  isFeatured: [
    {
      id: 'steel-rebar',
      name: 'Reinforced High-Tensile Steel Rods Pack',
      sellingPrice: 1200,
      finalPrice: 1200,
      images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615ad'],
      option: [],
    },
  ],
  isNewArrival: [
    {
      id: 'smart-meter',
      name: 'IoT Smart Digital Energy Monitor Pro',
      sellingPrice: 5400,
      finalPrice: 5400,
      images: ['https://images.unsplash.com/photo-1591136934893-b6c867a1d132'],
      option: [],
    },
  ],
  isFlashDeal: [
    {
      id: 'heavy-duty-mixer',
      name: 'Industrial Concrete Mixer 500L',
      sellingPrice: 85000,
      finalPrice: 79000,
      images: ['https://images.unsplash.com/photo-1581094288338-2314dddb7ecc'],
      option: [],
    },
  ],
};

const productColumns: ProductColumnConfig[] = [
  { title: 'Top Sells', label: 'High Demand', flag: 'isOnOffer', fallback: FALLBACK_PRODUCTS.isOnOffer },
  { title: 'Top Rated', label: 'Field Tested', flag: 'isFeatured', fallback: FALLBACK_PRODUCTS.isFeatured },
  { title: 'Trending', label: 'Industry Standard', flag: 'isFlashDeal', fallback: FALLBACK_PRODUCTS.isFlashDeal },
  { title: 'New Arrivals', label: 'New Inventory', flag: 'isNewArrival', fallback: FALLBACK_PRODUCTS.isNewArrival },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useMarketplaceProducts(companyId: string, flag: ListingFlag, fallback: Partial<MarketListingForm>[]) {
  const url = `/api/site/productsByFlag?companyId=${companyId}&flag=${flag}&limit=4`;
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

export default function HardwareShowcaseGrid({ companyId }: { companyId: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B';

  return (
    <section className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-24 bg-zinc-50 dark:bg-[#050505] overflow-hidden transition-colors duration-500">
      {/* Blueprint Grid Technical Underlay Layout */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04] pointer-events-none mix-blend-difference" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 relative z-10">
        {productColumns.map((column, idx) => {
          const { products, isLoading } = useMarketplaceProducts(companyId, column.flag, column.fallback);

          return (
            <motion.div
              key={column.flag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              {/* Column Header */}
              <div className="mb-8 relative pb-4 border-b border-zinc-200 dark:border-zinc-800 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <BoltIcon className="w-3.5 h-3.5 animate-pulse" style={{ color: primaryColor }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                    {column.label}
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center justify-between">
                  <span>{column.title}</span>
                  <span className="text-xs font-mono text-zinc-300 dark:text-zinc-700">//0{idx+1}</span>
                </h3>
                <div
                  className="absolute bottom-0 left-0 h-[2px] w-12 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Products Container */}
              <div className="space-y-6 flex-grow">
                {products.map((product: any, index: number) => (
                  <div key={`${product.id}-${index}`} className="w-full">
                    <ProductCard product={product} />
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center justify-center py-12 gap-3 text-xs font-mono tracking-widest text-zinc-400 uppercase">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 animate-spin" style={{ color: primaryColor }} />
                    Analyzing Inventory...
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