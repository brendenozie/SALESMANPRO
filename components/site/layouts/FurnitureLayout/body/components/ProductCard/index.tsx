'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartIcon, 
  StarIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'; // Switched to outline for premium feel

import { CubeIcon, SwatchIcon } from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src }: { src: string }) => src;

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const primary = storeFormData?.themeSettings?.primaryColor || '#ef4444';
  const quantity = cart.find((item: MarketListingForm) => item.id === product.id)?.quantity || 0;

  const discount =
    product.sellingPrice && product.finalPrice != null && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-zinc-950 transition-colors duration-500 overflow-hidden"
    >
      {/* --- IMAGE SECTION --- */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Link href={`/ecommerce/products/${product.id}`}>
          <Image
            src={product.images[0] || "https://unsplash.com/photos/6VhPY27jdps?q=80&w=1000&auto=format&fit=crop"}
            alt={product.name}
            loader={loader}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        </Link>

        {/* STATUS BADGES */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-black px-2 py-1 uppercase tracking-[0.2em]">
              New Arrival
            </span>
          )}
          {discount !== null && (
            <span className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-[9px] font-black px-2 py-1 uppercase tracking-[0.2em] border border-zinc-100 dark:border-zinc-700">
              -{discount}%
            </span>
          )}
        </div>

        {/* HEART BUTTON (TOP RIGHT) */}
        <button className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <HeartIcon className="w-4 h-4" />
        </button>

        {/* QUICK ADD OVERLAY */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          {quantity === 0 ? (
            <button
              onClick={() => addToCart({...product, finalPrice: product.finalPrice || product.sellingPrice})}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] py-4 transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-2xl"
            >
              Add to Collection
            </button>
          ) : (
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 shadow-2xl">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
              </button>
              <span className="text-[11px] font-black dark:text-white">{quantity}</span>
              <button
                onClick={() => addToCart({...product, finalPrice: product.finalPrice || product.sellingPrice})}
                className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="py-6 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              {product.material?.[0] || 'Atelier Series'}
            </h3>
            <Link href={`/ecommerce/products/${product.id}`}>
              <h2 className="text-lg font-light tracking-tighter text-zinc-900 dark:text-white group-hover:opacity-60 transition-opacity">
                {product.name}
              </h2>
            </Link>
          </div>
          
          <div className="text-right">
            {discount !== null ? (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-400 line-through tracking-tighter">${product.sellingPrice}</span>
                <span className="text-base font-bold text-zinc-900 dark:text-white">${product.finalPrice}</span>
              </div>
            ) : (
              <span className="text-base font-bold text-zinc-900 dark:text-white">${product.sellingPrice}</span>
            )}
          </div>
        </div>

        {/* METRICS & SPECS */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-4">
             {product.dimensions && (
               <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                 <CubeIcon className="w-3.5 h-3.5" />
                 <span>{product.dimensions}</span>
               </div>
             )}
             <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-900 dark:text-white">
                <StarIcon className="w-3 h-3 fill-current" />
                <span>4.8</span>
             </div>
          </div>
          
          <Link href={`/ecommerce/products/${product.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
             <ArrowRightIcon className="w-4 h-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;