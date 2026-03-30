'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartIcon, 
  MinusIcon, 
  PlusIcon, 
  TrashIcon,
  CubeIcon,
  ChevronRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
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

  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const discount =
    product.sellingPrice && product.finalPrice != null && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col bg-white dark:bg-[#080808] transition-all duration-700"
    >
      {/* --- ARCHITECTURAL IMAGE FRAME --- */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#F7F7F7] dark:bg-zinc-900 border border-transparent dark:border-zinc-800/50 group-hover:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700">
        
        <Link href={`/furnitureecommerce/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images[0] || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000"}
            alt={product.name}
            loader={loader}
            fill
            className="object-cover transition-transform duration-[2s] ease-[0.16, 1, 0.3, 1] group-hover:scale-110"
          />
        </Link>

        {/* ELEGANT BADGES */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          {product.isNewArrival && (
            <span className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] rounded-full shadow-sm">
              Limited Edition
            </span>
          )}
          {discount && (
            <span 
              className="text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-[0.3em] rounded-full"
              style={{ backgroundColor: primary }}
            >
              -{discount}% Off
            </span>
          )}
        </div>

        {/* WISHLIST BUTTON */}
        <button className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-xl text-zinc-900 dark:text-white hover:bg-white dark:hover:bg-white dark:hover:text-black transition-all shadow-xl">
          <HeartIcon className="w-4 h-4" />
        </button>

        {/* --- MOBILE & DESKTOP QUANTITY HUD --- */}
        <div className="absolute inset-x-6 bottom-6 z-20">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={() => addToCart({...product, finalPrice: product.finalPrice || product.sellingPrice})}
                className="w-full h-14 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl text-zinc-900 dark:text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 rounded-2xl shadow-2xl border border-white/20 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 md:opacity-100"
              >
                <PlusIcon className="w-4 h-4" />
                Reserve Piece
              </motion.button>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
              >
                <button
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4 text-zinc-400" />}
                </button>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-black dark:text-white">{quantity}</span>
                   <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-tighter">In Cart</span>
                </div>
                <button
                  onClick={() => addToCart({...product, finalPrice: product.finalPrice || product.sellingPrice})}
                  className="p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- INFO PANEL --- */}
      <div className="mt-8 px-2 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                {product.brand || 'Handcrafted Artisan'}
              </span>
              <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500">
                In Stock
              </span>
            </div>
            
            <Link href={`/furnitureecommerce/products/${product.id}`}>
              <h2 className="text-xl font-serif font-medium tracking-tight text-zinc-900 dark:text-white leading-tight">
                {product.name}
              </h2>
            </Link>
          </div>

          <div className="text-right">
            {discount ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-zinc-400 line-through tracking-tighter mb-0.5">${product.sellingPrice}</span>
                <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">${product.finalPrice}</span>
              </div>
            ) : (
              <span className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">${product.sellingPrice}</span>
            )}
          </div>
        </div>

        {/* SPEC TILES */}
        <div className="flex items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <CubeIcon className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Material</p>
              <p className="text-[10px] font-bold dark:text-zinc-300 tracking-tight mt-1 truncate max-w-[80px]">Solid Oak</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div>
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Rating</p>
              <p className="text-[10px] font-bold dark:text-zinc-300 tracking-tight mt-1">4.9 / 5.0</p>
            </div>
          </div>

          <Link href={`/furnitureecommerce/products/${product.id}`} className="ml-auto p-2 hover:translate-x-1 transition-transform">
             <ChevronRightIcon className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;