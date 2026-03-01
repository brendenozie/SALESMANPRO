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
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';
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
      {/* IMAGE AREA */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Link href={`/ecommerce/products/${id}`} className="block w-full h-full">
          <Image
            src={img}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        </Link>

        {/* TOP BADGES */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          {isNewArrival && (
            <span className="bg-white/90 backdrop-blur text-zinc-900 text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em] shadow-sm">
              New
            </span>
          )}
          {isDiscounted && discount && (
            <span className="bg-zinc-900 text-white text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em]">
              -{discount}%
            </span>
          )}
        </div>

        {/* WISHLIST BUTTON */}
        <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-white text-zinc-900">
          <HeartIcon className="w-4 h-4" />
        </button>

        {/* QUICK ADD - SLIDE UP OVERLAY */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.22, 1, 0.36, 1]">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-2xl"
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

      {/* INFO AREA */}
      <div className="pt-6 pb-2 flex flex-col items-center text-center">
        {brand && (
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-2">
            {brand}
          </p>
        )}
        
        <Link href={`/ecommerce/products/${id}`}>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 transition-colors mb-2 tracking-tight leading-snug max-w-[200px] mx-auto">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-3">
          {isDiscounted ? (
            <>
              <span className="text-sm font-black text-zinc-900 dark:text-white">
                ${finalPrice}
              </span>
              <span className="text-xs text-zinc-400 line-through font-medium">
                ${sellingPrice}
              </span>
            </>
          ) : (
            <span className="text-sm font-black text-zinc-900 dark:text-white tracking-wide">
              ${sellingPrice}
            </span>
          )}
        </div>

        {/* SUBTLE INDICATOR IF IN CART */}
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mt-3 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: primary }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;