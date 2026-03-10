'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBagIcon,
  HeartIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const loader = ({ src }: { src: string }) => src;

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    id,
    name,
    images = [],
    brand,
    sellingPrice,
    finalPrice,
    isNewArrival,
    isDiscounted,
  } = product;

  const img = images?.[0] || 'https://via.placeholder.com/400x500';
  const { addToCart, cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#ef4444';
  const quantity = cart.find((item: any) => item.id === id)?.quantity || 0;

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col bg-white dark:bg-zinc-950"
    >
      {/* --- IMAGE & INTERACTION AREA --- */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
        <Link href={`/ecommerce/products/${id}`} className="block w-full h-full">
          <Image
            src={img}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          {isNewArrival && (
            <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-900 dark:text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.2em] rounded-sm">
              New Drop
            </span>
          )}
          {isDiscounted && discount && (
            <span 
              className="text-white text-[9px] font-black px-2.5 py-1 uppercase tracking-[0.2em] rounded-sm"
              style={{ backgroundColor: primary }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* Heart / Wishlist (Hero Icon) */}
        <button className="absolute top-4 right-4 p-2.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:scale-110 active:scale-95 dark:text-white">
          <HeartIcon className="w-4 h-4" />
        </button>

        {/* --- QUICK ACTION OVERLAY --- */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16, 1, 0.3, 1]">
          <button
            onClick={() => addToCart({...product, finalPrice: finalPrice || sellingPrice})}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-2xl rounded-xl"
          >
            {quantity > 0 ? (
              <>
                <ShoppingBagIcon className="w-4 h-4" />
                In Bag ({quantity})
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                Quick Add
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- DETAILS AREA --- */}
      <div className="pt-6 pb-2 px-2 flex flex-col items-center text-center">
        {brand && (
          <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.4em] mb-2">
            {brand}
          </p>
        )}
        
        <Link href={`/ecommerce/products/${id}`}>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:opacity-60 transition-opacity mb-2 tracking-tight leading-tight uppercase max-w-[220px]">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-3">
          {isDiscounted ? (
            <>
              <span className="text-sm font-black text-zinc-900 dark:text-white">
                ${finalPrice}
              </span>
              <span className="text-[11px] text-zinc-400 line-through font-bold">
                ${sellingPrice}
              </span>
            </>
          ) : (
            <span className="text-sm font-black text-zinc-900 dark:text-white tracking-widest">
              ${sellingPrice}
            </span>
          )}
        </div>

        {/* Status Dot */}
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="mt-4 w-1 h-1 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
              style={{ backgroundColor: primary }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;