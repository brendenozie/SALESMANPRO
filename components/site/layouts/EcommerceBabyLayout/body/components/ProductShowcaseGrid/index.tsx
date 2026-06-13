'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import useSWR from 'swr';
import ProductCard from '../ProductCard';
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
  {
    title: 'Top Sells',
    label: 'Popular Picks',
    flag: 'isOnOffer',
    fallback: FALLBACK_PRODUCTS.isOnOffer,
  },
  {
    title: 'Top Rated',
    label: 'Parent Approved',
    flag: 'isFeatured',
    fallback: FALLBACK_PRODUCTS.isFeatured,
  },
  {
    title: 'Trending',
    label: 'Viral Now',
    flag: 'isFlashDeal',
    fallback: FALLBACK_PRODUCTS.isFlashDeal,
  },
  {
    title: 'New Arrivals',
    label: 'Just In',
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
    <section className="relative max-w-[1800px] mx-auto px-6 md:px-12 py-32 bg-white dark:bg-zinc-950 transition-colors">
      
      {/* Background flourish */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-zinc-50/50 dark:from-zinc-900/20 to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-20 relative z-10">
        {productColumns.map((column, idx) => {
          const { products, isLoading } = useMarketplaceProducts(
            companyId,
            column.flag,
            column.fallback
          );

          return (
            <motion.div 
              key={column.flag}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="group/column"
            >
              {/* Boutique Header */}
              <div className="mb-14 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 block">
                  {column.label}
                </span>
                <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                    {column.title}
                  </h3>
                  <div 
                    className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 transition-all group-hover/column:flex-[2]" 
                  />
                </div>
              </div>

              <div className="relative space-y-12">
                {/* Vertical path line */}
                <div className="absolute left-6 top-8 bottom-8 w-px bg-zinc-100 dark:bg-zinc-800 -z-10 group-hover/column:bg-zinc-200 transition-colors" />

                {products.map((product: any, pIdx: number) => (
                  <div key={`${product.id}-${pIdx}`} className="group relative">
                    
                    {/* Unified Product Card (matches Hardware implementation) */}
                    <ProductCard product={product} />

                    {/* --- ORIGINAL BABY DUKA BOUTIQUE LAYOUT --- */}
                    {/* 
                    <Link 
                      href={`/babyecommerce/products/${product.id}`}
                      className="flex items-center gap-6"
                    >
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-900 rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-tl-lg rounded-br-lg transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-sm group-hover:shadow-xl" />
                        <div className="relative h-full w-full p-4">
                          <Image 
                            src={product.images?.[0] || ''} 
                            alt={product.name} 
                            fill 
                            className="object-contain p-2 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6" 
                            loader={({ src, width }) => `${src}?w=${width}&q=80`}
                          />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        <h4 className="text-sm font-black text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-tight">
                          {product.name}
                        </h4>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-2.5 w-2.5 ${i < 4 ? '' : 'text-zinc-200 dark:text-zinc-800'}`} 
                              style={{ color: i < 4 ? primaryColor : undefined }}
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                            ${product.sellingPrice?.toFixed(2)}
                          </span>
                          {product.discount && (
                            <span className="text-xs text-zinc-300 dark:text-zinc-600 line-through font-bold">
                              ${(product.sellingPrice + product.discount).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <button 
                      className="absolute -right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-50 dark:border-zinc-700 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex items-center justify-center hover:text-white"
                      style={{ '--hover-bg': primaryColor } as any}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button> 
                    */}
                  </div>
                ))}
                
                {isLoading && <div className="text-xs opacity-40">Loading…</div>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}