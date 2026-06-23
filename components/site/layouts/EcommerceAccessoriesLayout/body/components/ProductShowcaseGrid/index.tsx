'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusIcon, BoltIcon, WrenchIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import useSWR from 'swr';
import { MarketListingForm } from '@/types/typings';

type ListingFlag =
  | 'isOnOffer'
  | 'isFeatured'
  | 'isNewArrival'
  | 'isFlashDeal';

interface ProductColumnConfig {
  title: string;
  label: string;
  flag: ListingFlag;
  fallback: Partial<MarketListingForm>[];
}

// Updated fallback data to fit the Automotive Duka aesthetic
const FALLBACK_PRODUCTS: Record<ListingFlag, Partial<MarketListingForm>[]> = {
  isOnOffer: [
    {
      id: 'performance-rotors-01',
      name: 'Slotted Brake Rotors',
      sellingPrice: 15500,
      discount: 2000,
      images: ['https://images.unsplash.com/photo-1486262715619-670810a070e1?q=80&w=600&auto=format&fit=crop'],
    },
  ],
  isFeatured: [
    {
      id: 'forged-alloy-19',
      name: '19" Forged Alloys',
      sellingPrice: 45000,
      images: ['https://images.unsplash.com/photo-1620882194639-6512e022739a?q=80&w=600&auto=format&fit=crop'],
    },
  ],
  isNewArrival: [
    {
      id: 'led-matrix-hdl',
      name: 'LED Matrix Headlights',
      sellingPrice: 28400,
      images: ['https://images.unsplash.com/photo-1605348325605-77987df1076b?q=80&w=600&auto=format&fit=crop'],
    },
  ],
  isFlashDeal: [
    {
      id: 'turbo-kit-v2',
      name: 'V2 Twin-Scroll Turbo',
      sellingPrice: 85000,
      discount: 10000,
      images: ['https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?q=80&w=600&auto=format&fit=crop'],
    }
  ],
};

const productColumns: ProductColumnConfig[] = [
  {
    title: 'Top Sells',
    label: 'High Demand',
    flag: 'isOnOffer',
    fallback: FALLBACK_PRODUCTS.isOnOffer,
  },
  {
    title: 'Top Rated',
    label: 'Track Tested',
    flag: 'isFeatured',
    fallback: FALLBACK_PRODUCTS.isFeatured,
  },
  {
    title: 'Trending',
    label: 'Industry Standard',
    flag: 'isFlashDeal',
    fallback: FALLBACK_PRODUCTS.isFlashDeal,
  },
  {
    title: 'New Arrivals',
    label: 'Latest Inventory',
    flag: 'isNewArrival',
    fallback: FALLBACK_PRODUCTS.isNewArrival,
  },
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

function useMarketplaceProducts(
  companyId: string,
  flag: ListingFlag,
  fallback: Partial<MarketListingForm>[],
) {
  const url = `/api/site/productsByFlag?companyId=${companyId}&flag=${flag}&limit=6`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  return {
    products:
      Array.isArray(data?.data) && data.data.length > 0
        ? data.data
        : fallback,
    isLoading,
    error,
  };
}

export default function AutomotiveShowcaseGrid({ companyId }: { companyId: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B';

  return (
    <section 
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
      className="relative max-w-[1800px] mx-auto px-6 md:px-12 py-32 bg-zinc-100 dark:bg-[#050505] transition-colors duration-500 overflow-hidden"
    >
      {/* Engineered Blueprint Background */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none z-0" 
           style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24 relative z-10">
        {productColumns.map((column, idx) => {
          const { products, isLoading } = useMarketplaceProducts(
            companyId,
            column.flag,
            column.fallback,
          );

          return (
            <motion.div
              key={column.flag}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="group/column"
            >
              {/* Column Header */}
              <div className="mb-14 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-zinc-200 dark:bg-zinc-900 rounded-sm">
                     <WrenchIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">
                    {column.label}
                  </span>
                </div>
                <h3 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
                  {column.title}
                </h3>
                <div
                  className="h-1 w-12 mt-6 transition-all duration-500 ease-out group-hover/column:w-full"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Products Container with Mechanical Guide Line */}
              <div className="relative space-y-12">
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-zinc-300 dark:bg-zinc-800" />

                {products.map((product: any, index: number) => (
                  <div key={`${product.id}-${index}`} className="relative pl-8 group">
                    {/* Node connector dot */}
                    <div className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full group-hover:bg-[var(--primary-color)] transition-colors duration-300" />
                    
                    {/* 
                      Note: You can swap the below code block back to `<ProductCard product={product} />` 
                      if you prefer your external component. However, this inline design perfectly 
                      matches the new dashboard aesthetic.
                    */}
                    <Link 
                      href={`/automotiveecommerce/products/${product.id}`}
                      className="block relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-sm hover:border-[var(--primary-color)]/50 transition-colors duration-300 overflow-hidden shadow-sm hover:shadow-xl p-3"
                    >
                      <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden rounded-sm border border-zinc-200/50 dark:border-zinc-800/50">
                        {/* Tech Specs Overlay */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-[9px] font-mono bg-zinc-900/80 backdrop-blur-sm text-white px-2 py-1 uppercase tracking-wider">
                            SKU:{product.id?.substring(0, 6)}
                          </span>
                        </div>
                        
                        <Image
                          src={product.images?.[0] || ''}
                          alt={product.name || 'Product Image'}
                          fill
                          className="object-cover scale-100 group-hover:scale-110 filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                          loader={({ src }) => `${src}?auto=format&fit=crop&w=400&q=80`}
                        />
                      </div>

                      <div className="pt-5 pb-2 px-1">
                        <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                          {product.name}
                        </h4>

                        <div className="flex gap-3 items-end mt-3">
                          <span className="text-lg font-black tracking-tighter text-zinc-900 dark:text-white">
                            KES {product.sellingPrice?.toLocaleString()}
                          </span>
                          {product.discount && (
                            <span className="text-xs font-bold line-through text-zinc-400 dark:text-zinc-500 mb-0.5">
                              {(product.sellingPrice + product.discount).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Quick Add Action */}
                    <button 
                      className="absolute right-0 bottom-0 w-12 h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-[var(--primary-color)] dark:hover:bg-[var(--primary-color)] hover:text-zinc-950 shadow-lg rounded-tl-lg"
                      title="Quick Add"
                    >
                      <PlusIcon className="w-6 h-6" />
                    </button>
                  </div>
                ))}

                {isLoading && (
                  <div className="pl-8 py-4">
                    <div className="flex items-center gap-2">
                       <BoltIcon className="w-4 h-4 text-zinc-400 animate-pulse" />
                       <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Data...</span>
                    </div>
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