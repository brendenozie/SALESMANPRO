'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, StarIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

const loaderProp = ({ src, width, quality }: any) => {
  const params = [`w=${width || 400}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join('&')}`;
};

export default function GhubaProductCard({ product, toggleLike, likedItems, addToCart }: { product: any; toggleLike: (id: string) => void; likedItems: any; addToCart: (product: any) => void; }) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="relative p-1.5 sm:p-4 group h-full"
    >
      <div 
        onClick={() => router.push(`/ghuba/productlist/${product.id}`)}
        className="relative h-full cursor-pointer bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_-10px_rgba(230,57,70,0.15)] flex flex-col"
      >
        
        {/* --- IMAGE HEADER --- */}
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0">
          {/* Discount Badge - Scaled for Mobile */}
          {product.discount > 0 && (
            <div className="absolute top-2 sm:top-4 left-0 z-20 bg-[#E63946] text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-r-full shadow-lg">
              {product.discount}% OFF
            </div>
          )}

          <Image
            width={400}
            height={400}
            loader={loaderProp}
            src={imageError ? 'https://via.placeholder.com/400x400?text=Image+Not+Found' : product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />

          {/* Quick Action Overlay - Subtle on Mobile */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
             <span className="bg-white text-black font-black text-[8px] sm:text-[10px] uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-3 rounded-full translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
               View Specs
             </span>
          </div>

          {/* Wishlist Button - Scaled down for 2-col mobile */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-90 ${
              likedItems[product.id]
                ? "bg-[#E63946] text-white"
                : "bg-black/20 text-white hover:bg-black/40"
            }`}
          >
            <HeartIcon className="h-4 w-4 sm:h-5 sm:h-5" />
          </button>
        </div>

        {/* --- PRODUCT INFO --- */}
        <div className="p-3 sm:p-6 flex flex-col flex-grow justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-1">
              <h3 className="text-[11px] sm:text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white line-clamp-2 leading-tight">
                {product.name || product.title}
              </h3>
              
              {/* Condition Badge - Only show icon on mobile to save space */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md shrink-0">
                 <BoltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E63946]" />
                 <span className="hidden sm:block text-[8px] font-black dark:text-zinc-300 uppercase">New</span>
              </div>
            </div>

            {/* Rating - Hidden on very small mobile if necessary, or scaled down */}
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-2 w-2 sm:h-3 sm:w-3 ${i < product.rating ? "text-[#E63946]" : "text-zinc-300 dark:text-zinc-800"}`}
                />
              ))}
              <span className="text-[8px] text-zinc-400 font-bold ml-1 sm:ml-2 uppercase">({product.reviews || 24})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Price</span>
              <span className="text-sm sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 sm:mt-1 italic">
                <span className="text-[9px] sm:text-sm not-italic mr-0.5 font-bold">KSH</span>{product.finalPrice.toLocaleString()}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); addToCart(product); }}
              className="relative flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl transition-all hover:bg-[#E63946] dark:hover:bg-[#E63946] hover:text-white"
            >
              <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#E63946]/20 to-transparent shrink-0" />
      </div>
    </motion.div>
  );
}