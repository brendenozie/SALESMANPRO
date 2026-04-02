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
  EyeIcon,
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

  const img = images?.[0] || 'https://via.placeholder.com/400x600';
  const { addToCart, cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#000000';
  const quantity = cart.find((item: any) => item.id === id)?.quantity || 0;

  const discount =
    sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col w-full bg-white dark:bg-zinc-950 transition-colors duration-500"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-2xl transition-all duration-700 ease-[0.16, 1, 0.3, 1]">
        
        <Link href={`/fashionecommerce/products/${id}`} className="block w-full h-full">
          <Image
            src={img}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-transform duration-[2s] scale-100 group-hover:scale-110 group-active:scale-105"
            priority
          />
        </Link>

        {/* --- DYNAMIC BADGES --- */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          {isNewArrival && (
            <motion.span 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl text-zinc-900 dark:text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.25em] rounded-full border border-white/20 shadow-xl"
            >
              New Season
            </motion.span>
          )}
          {isDiscounted && discount && (
            <span 
              className="text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.25em] rounded-full shadow-lg"
              style={{ backgroundColor: primary }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* --- TOP ACTIONS (Hidden on Mobile, Hover on Desktop) --- */}
        <div className="absolute top-5 right-5 flex flex-col gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-10 lg:flex hidden">
          <button className="p-3 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-xl">
            <HeartIcon className="w-4 h-4" />
          </button>
          <button className="p-3 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-full text-zinc-900 dark:text-white hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-xl">
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>

        {/* --- MOBILE QUICK-ADD (Visible on Mobile Only) --- */}
        <div className="absolute bottom-4 right-4 lg:hidden z-10">
          <button 
            onClick={() => addToCart({...product, finalPrice: finalPrice || sellingPrice})}
            className="relative p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border border-white/20 active:scale-90 transition-transform"
            style={{ backgroundColor: `${primary}dd`, color: '#fff' }}
          >
            <PlusIcon className="w-6 h-6" />
            
            {/* DYNAMIC QUANTITY BADGE */}
            <AnimatePresence>
              {quantity > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white text-zinc-900 text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border border-zinc-100"
                >
                  {quantity}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* --- DESKTOP QUICK-ADD OVERLAY --- */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.16, 1, 0.3, 1] lg:block hidden">
          <button
            onClick={() => addToCart({...product, finalPrice: finalPrice || sellingPrice})}
            className="w-full py-5 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-[0.35em] flex items-center justify-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl"
          >
            {quantity > 0 ? (
              <>
                <ShoppingBagIcon className="w-4 h-4" />
                Added To Bag ({quantity})
              </>
            ) : (
              "Add To Wardrobe"
            )}
          </button>
        </div>
      </div>

      {/* --- INFO AREA --- */}
      <div className="mt-6 flex flex-col items-center text-center px-2">
        {brand && (
          <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-2.5">
            {brand}
          </span>
        )}
        
        <Link href={`/fashionecommerce/products/${id}`} className="max-w-[85%]">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 transition-colors mb-3 tracking-wide leading-tight uppercase truncate">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-base font-black text-zinc-950 dark:text-white tracking-tighter">
            ${finalPrice || sellingPrice}
          </span>
          {isDiscounted && sellingPrice && (
            <span className="text-xs text-zinc-400 line-through font-medium opacity-60">
              ${sellingPrice}
            </span>
          )}
        </div>


        {/* Status Indicator Bar */}
        <div className="mt-5 w-10 h-[2px] bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <AnimatePresence>
            {quantity > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                exit={{ width: 0 }}
                className="h-full"
                style={{ backgroundColor: primary }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;