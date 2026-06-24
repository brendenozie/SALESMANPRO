'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, WrenchIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import useSWR from 'swr';
import { MarketListingForm } from '@/types/typings';
import ProductCard from './ProductCard'; // Points directly to the redesigned card below

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
      id: 'performance-rotors-01',
      name: 'Slotted Brake Rotors',
      sellingPrice: 15500,
      finalPrice: 13500,
      images: ['https://images.unsplash.com/photo-1486262715619-670810a070e1?q=80&w=600&auto=format&fit=crop'],
    },
  ],
  isFeatured: [
    {
      id: 'forged-alloy-19',
      name: '19" Forged Alloys',
      sellingPrice: 45000,
      finalPrice: 45000,
      images: ['https://images.unsplash.com/photo-1620882194639-6512e022739a?q=80&w=600&auto=format&fit=crop'],
    },
  ],
  isNewArrival: [
    {
      id: 'led-matrix-hdl',
      name: 'LED Matrix Headlights',
      sellingPrice: 28400,
      finalPrice: 28400,
      images: ['https://images.unsplash.com/photo-1605348325605-77987df1076b?q=80&w=600&auto=format&fit=crop'],
    },
  ],
  isFlashDeal: [
    {
      id: 'turbo-kit-v2',
      name: 'V2 Twin-Scroll Turbo',
      sellingPrice: 85000,
      finalPrice: 75000,
      images: ['https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?q=80&w=600&auto=format&fit=crop'],
    },
  ],
};

const productColumns: ProductColumnConfig[] = [
  { title: 'Top Sells', label: 'High Demand', flag: 'isOnOffer', fallback: FALLBACK_PRODUCTS.isOnOffer },
  { title: 'Top Rated', label: 'Track Tested', flag: 'isFeatured', fallback: FALLBACK_PRODUCTS.isFeatured },
  { title: 'Trending', label: 'Industry Standard', flag: 'isFlashDeal', fallback: FALLBACK_PRODUCTS.isFlashDeal },
  { title: 'New Arrivals', label: 'Latest Inventory', flag: 'isNewArrival', fallback: FALLBACK_PRODUCTS.isNewArrival },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useMarketplaceProducts(companyId: string, flag: ListingFlag, fallback: Partial<MarketListingForm>[]) {
  const url = `/api/site/productsByFlag?companyId=${companyId}&flag=${flag}&limit=4`;
  const { data, isLoading } = useSWR(url, fetcher, { revalidateOnFocus: true, dedupingInterval: 30000 });

  return {
    products: Array.isArray(data?.data) && data.data.length > 0 ? data.data : fallback,
    isLoading,
  };
}

export default function AutomotiveShowcaseGrid({ companyId }: { companyId: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B';

  return (
    <section
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
      className="relative w-full mx-auto px-4 sm:px-6 lg:px-12 py-24 bg-zinc-50 dark:bg-[#030303] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 overflow-hidden"
    >
      {/* Structural Crosshair Laser Grids */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 relative z-10">
        {productColumns.map((column, idx) => {
          const { products, isLoading } = useMarketplaceProducts(companyId, column.flag, column.fallback);

          return (
            <motion.div
              key={column.flag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="flex flex-col h-full group/column"
            >
              {/* Diagnostic Category Banner */}
              <div className="mb-8 relative pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-2 mb-2">
                  <WrenchIcon className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-zinc-400 dark:text-zinc-500">
                    {column.label}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black uppercase italic tracking-tight font-sans">
                    {column.title}
                  </h3>
                  <ArrowRightIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover/column:text-[var(--primary-color)] transition-colors duration-300" />
                </div>
                <div
                  className="absolute bottom-[-1px] left-0 h-[2px] w-12 transition-all duration-500 ease-in-out group-hover/column:w-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Stack Loop Wrapper */}
              <div className="flex flex-col gap-6 flex-grow">
                {products.map((product: any, pIdx: number) => (
                  <div key={`${product.id}-${pIdx}`} className="w-full">
                    <ProductCard product={product as MarketListingForm} />
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center justify-center py-12 gap-3 bg-zinc-100 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-sm">
                    <BoltIcon className="w-4 h-4 text-[var(--primary-color)] animate-pulse" />
                    <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">Syncing Drive...</span>
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