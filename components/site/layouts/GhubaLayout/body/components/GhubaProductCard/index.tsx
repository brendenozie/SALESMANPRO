'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, StarIcon, BoltIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

const loaderProp = ({ src, width, quality }: any) => {
  const params = [`w=${width || 400}`]; // Default width to 400 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join('&')}`;
};

export default function GhubaProductCard({ key, product, toggleLike, likedItems, addToCart }: { key: string; product: any; toggleLike: (id: string) => void; likedItems: any; addToCart: (product: any) => void;}) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  // High-Octane Palette
  const nitroRed = "#E63946";

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="relative p-2 sm:p-4 group h-full"
    >
      <div 
        onClick={() => router.push(`/ghuba/productlist/${product.id}`)}
        className="relative h-full cursor-pointer bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_30px_60px_-15px_rgba(230,57,70,0.1)]"
      >
        
        {/* --- IMAGE HEADER --- */}
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          {/* Discount Badge - Industrial Tag Style */}
          {product.discount > 0 && (
            <div className="absolute top-4 left-0 z-20 bg-[#E63946] text-white text-[10px] font-black px-4 py-1 rounded-r-full shadow-lg">
              {product.discount}% OFF
            </div>
          )}

          <Image
            width={400}
            height={400}
            loader={loaderProp}
            src={imageError ? 'https://via.placeholder.com/400x400?text=Image+Not+Found' : product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 scale-100 group-hover:scale-110 group-hover:rotate-1"
            onError={() => setImageError(true)}
          />

          {/* Quick Action Overlay (Visible on Hover) */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
             <span className="bg-white text-black font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
               View Specs
             </span>
          </div>

          {/* Wishlist Button - Floating Glass */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
            className={`absolute top-4 right-4 z-20 p-2.5 rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-90 ${
              likedItems[product.id]
                ? "bg-[#E63946] text-white shadow-[0_0_15px_rgba(230,57,70,0.5)]"
                : "bg-black/20 text-white hover:bg-black/40"
            }`}
          >
            <HeartIcon className="h-5 w-5" />
          </button>
        </div>

        {/* --- PRODUCT INFO --- */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-sm sm:text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white line-clamp-1 leading-tight">
                {product.name || product.title}
              </h3>
              {/* Rating - Simplified for Moto style */}
              <div className="flex items-center mt-1 space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-3 w-3 ${i < product.rating ? "text-[#E63946]" : "text-zinc-300 dark:text-zinc-800"}`}
                  />
                ))}
                <span className="text-[10px] text-zinc-400 font-bold ml-2 uppercase">({product.reviews || 24})</span>
              </div>
            </div>
            
            {/* Condition Badge (New/Used) */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
               <BoltIcon className="w-3 h-3 text-[#E63946]" />
               <span className="text-[8px] font-black dark:text-zinc-300 uppercase">New</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Price</span>
              <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1 italic">
                <span className="text-sm not-italic mr-0.5 font-bold">KSH</span>{product.finalPrice.toLocaleString()}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); addToCart(product); }}
              className="group/btn relative flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 w-12 h-12 rounded-2xl transition-all hover:bg-[#E63946] dark:hover:bg-[#E63946] hover:text-white shadow-lg"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {/* Tooltip for desktop */}
              <span className="absolute -top-10 scale-0 group-hover/btn:scale-100 bg-black text-white text-[9px] px-2 py-1 rounded-md transition-all font-black uppercase">Add</span>
            </motion.button>
          </div>
        </div>

        {/* Landscape Mobile Detail Bar (Subtle hint of color) */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#E63946]/30 to-transparent" />
      </div>
    </motion.div>
  );
}