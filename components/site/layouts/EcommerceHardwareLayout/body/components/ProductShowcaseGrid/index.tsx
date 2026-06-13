'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlusIcon, BoltIcon } from '@heroicons/react/24/solid';
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
    {
      id: 'impact-driver',
      name: 'Impact Driver V2',
      sellingPrice: 12500,
      discount: 1500,
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c'],
      
    },
  ],
  isFeatured: [
    {
      id: 'steel-rebar',
      name: 'Reinforced Steel',
      sellingPrice: 1200,
      images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615ad'],
      
    },
  ],
  isNewArrival: [
    {
      id: 'smart-meter',
      name: 'IoT Energy Monitor',
      sellingPrice: 5400,
      images: ['https://images.unsplash.com/photo-1591136934893-b6c867a1d132'],
      
    },
  ],
  isFlashDeal: [],
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
    label: 'Field Tested',
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
    label: 'New to Inventory',
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


export default function HardwareShowcaseGrid({ companyId }: { companyId: string }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B';

  return (
    <section className="relative max-w-[1800px] mx-auto px-6 md:px-12 py-32 bg-white dark:bg-[#050505]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24">
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
              transition={{ delay: idx * 0.1 }}
            >
              {/* Column Header */}
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-3">
                  <BoltIcon className="w-3 h-3" style={{ color: primaryColor }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    {column.label}
                  </span>
                </div>
                <h3 className="text-4xl font-black uppercase italic">
                  {column.title}
                </h3>
                <div
                  className="h-1 w-12 mt-4 transition-all"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Products */}
              <div className="space-y-16">
                {products.map((product: any, index: number) => (
                  <div key={`${product.id}-${index}`} className="relative pl-8 group">
                    <ProductCard product={product} />
                    {/* <Link href={`/hardwareecommerce/products/${product.id}`}>
                      <div className="relative aspect-square border overflow-hidden">
                        <Image
                          src={product.images?.[0] || ''}
                          alt={product.name}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition"
                          loader={({ src }) => `${src}?auto=format&fit=crop&w=400&q=80`}
                        />
                      </div>

                      <h4 className="text-xs font-black uppercase mt-4">
                        {product.name}
                      </h4>

                      <div className="flex gap-2 items-center">
                        <span className="text-xl font-black">
                          KES {product.sellingPrice?.toLocaleString()}
                        </span>
                        {product.discount && (
                          <span className="text-xs line-through opacity-50">
                            {(product.sellingPrice + product.discount).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <button className="absolute -right-2 top-0 w-10 h-10 bg-black text-white opacity-0 group-hover:opacity-100">
                      <PlusIcon className="w-5 h-5" />
                    </button> */}
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


// 'use client';

// import React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { StarIcon, PlusIcon, BoltIcon } from '@heroicons/react/24/solid';
// import { useStoreContext } from '@/contexts/StoreContext';

// const productColumns = [
//   {
//     title: 'Top Sells',
//     label: 'High Demand',
//     products: [
//       { id: 'impact-driver', name: 'Impact Driver V2', price: 12500, oldPrice: 14000, rating: 5, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c' },
//       { id: 'safety-helmet', name: 'PRO-Shield Helmet', price: 2500, oldPrice: 3200, rating: 4, img: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589' },
//       { id: 'concrete-mixer', name: 'Heavy Duty Mixer', price: 85000, oldPrice: 92000, rating: 5, img: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc' },
//     ]
//   },
//   {
//     title: 'Top Rated',
//     label: 'Field Tested',
//     products: [
//       { id: 'steel-rebar', name: 'Reinforced Steel', price: 1200, oldPrice: 1500, rating: 5, img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615ad' },
//       { id: 'laser-level', name: 'Precision Leveler', price: 4500, oldPrice: 5000, rating: 4, img: 'https://images.unsplash.com/photo-1572916141101-97b7274070b4' },
//       { id: 'work-boots', name: 'Titanium Toe Boots', price: 6800, oldPrice: 7500, rating: 5, img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86' },
//     ]
//   },
//   {
//     title: 'Trending',
//     label: 'Industry Standard',
//     products: [
//       { id: 'solar-panel-pro', name: 'Monocrystalline Cell', price: 18000, oldPrice: 21000, rating: 5, img: 'https://images.unsplash.com/photo-1509391366360-fe5bb65830bb' },
//       { id: 'welding-kit', name: 'Arc Fusion Series', price: 32000, oldPrice: 35000, rating: 4, img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1' },
//       { id: 'copper-wiring', name: 'Gage-12 Roll (50m)', price: 4200, oldPrice: 4800, rating: 5, img: 'https://images.unsplash.com/photo-1558434195-096860368d40' },
//     ]
//   },
//   {
//     title: 'New Arrivals',
//     label: 'New to Inventory',
//     products: [
//       { id: 'smart-meter', name: 'IoT Energy Monitor', price: 5400, oldPrice: 6000, rating: 5, img: 'https://images.unsplash.com/photo-1591136934893-b6c867a1d132' },
//       { id: 'cordless-drill', name: '20V Brushless XR', price: 15500, oldPrice: 18000, rating: 5, img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c' },
//       { id: 'generator-portable', name: 'QuietRun 3000W', price: 95000, oldPrice: 110000, rating: 5, img: 'https://images.unsplash.com/photo-1590135327266-40763f03b22e' },
//     ]
//   }
// ];

// export default function HardwareShowcaseGrid() {
//   ({ id }: { id: string }) {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const { storeFormData } = useStoreContext();
  
//   const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

//   const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
//   const cacheKey = `products-${id}-isOnOffer`;
//   const fetcher = createCachedFetcher(cacheKey);

//   const { data, error, isLoading } = useSWR(url, fetcher, {
//     revalidateOnFocus: true,
//     dedupingInterval: 30000,
//   });

//   const { storeFormData } = useStoreContext();
//   const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

//   return (
//     <section className="relative max-w-[1800px] mx-auto px-6 md:px-12 py-32 bg-white dark:bg-[#050505] transition-colors">
      
//       {/* Blueprint Grid Overlay */}
//       <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
//            style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-24 relative z-10">
//         {productColumns.map((column, idx) => (
//           <motion.div 
//             key={idx}
//             initial={{ opacity: 0, y: 30 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: idx * 0.1 }}
//             viewport={{ once: true }}
//             className="group/column"
//           >
//             {/* Professional Header */}
//             <div className="mb-16">
//               <div className="flex items-center gap-3 mb-3">
//                 <BoltIcon className="w-3 h-3 text-amber-500" />
//                 <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500 block">
//                   {column.label}
//                 </span>
//               </div>
//               <div className="space-y-4">
//                 <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic leading-none">
//                   {column.title}
//                 </h3>
//                 <div className="h-1 w-12 bg-amber-500 group-hover/column:w-full transition-all duration-700" />
//               </div>
//             </div>

//             <div className="relative space-y-16">
//               {/* Mechanical Guide Line */}
//               <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-zinc-100 dark:bg-zinc-800" />

//               {column.products.map((product, pIdx) => (
//                 <div key={pIdx} className="group relative pl-8">
//                   <Link 
//                     href={`/hardwareecommerce/product/${product.id}`}
//                     className="flex flex-col gap-4"
//                   >
//                     {/* Precision Frame Image Container */}
//                     <div className="relative w-full aspect-square bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
//                       <div className="absolute top-0 right-0 p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
//                          <span className="text-[8px] font-black bg-white dark:bg-zinc-800 px-2 py-1 border border-zinc-200 dark:border-zinc-700">REF: {product.id.substring(0, 5).toUpperCase()}</span>
//                       </div>
//                       <Image 
//                         src={product.img} 
//                         alt={product.name} 
//                         fill 
//                         className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
//                         loader={({ src }) => `${src}?auto=format&fit=crop&w=400&q=80`}
//                       />
//                     </div>

//                     {/* Product Specs */}
//                     <div className="space-y-2">
//                       <div className="flex items-center gap-1">
//                         {[...Array(5)].map((_, i) => (
//                           <div 
//                             key={i} 
//                             className={`h-1 flex-1 ${i < product.rating ? 'bg-amber-500' : 'bg-zinc-100 dark:bg-zinc-800'}`} 
//                           />
//                         ))}
//                       </div>

//                       <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wide group-hover:text-amber-500 transition-colors">
//                         {product.name}
//                       </h4>

//                       <div className="flex items-baseline gap-3">
//                         <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
//                           KES {product.price.toLocaleString()}
//                         </span>
//                         {product.oldPrice && (
//                           <span className="text-[10px] text-zinc-400 line-through font-bold">
//                             {product.oldPrice.toLocaleString()}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </Link>

//                   {/* Add to Requisition Button */}
//                   <button 
//                     className="absolute -right-2 top-0 w-10 h-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center hover:bg-amber-500 hover:text-zinc-900"
//                   >
//                     <PlusIcon className="w-5 h-5" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </section>
//   );
// }