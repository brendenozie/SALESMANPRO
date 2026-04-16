'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  HeartIcon,
  EyeIcon
} from '@heroicons/react/24/solid'; // Using Solid Icons as per preference
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0]?.url || images?.[0] || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative bg-white dark:bg-zinc-900 rounded-[0rem] border border-zinc-100 dark:border-zinc-800/50 p-3 transition-all duration-500 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    >
      {/* --- IMAGE CONTAINER --- */}
      <div className="relative aspect-[10/12] w-full overflow-hidden rounded-[0rem] bg-zinc-50 dark:bg-zinc-800/50">
        <Link href={`/bookecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f'}
            alt={name}
            fill
            loader={loader}
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <div className="bg-teal-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Quick Action Sidebar */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <button className="p-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full text-zinc-900 dark:text-white shadow-xl hover:bg-teal-500 hover:text-white transition-all">
            <HeartIcon className="w-4 h-4" />
          </button>
          <Link href={`/bookecommerce/products/${product.id}`}>
            <div className="p-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full text-zinc-900 dark:text-white shadow-xl hover:bg-teal-500 hover:text-white transition-all">
              <EyeIcon className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Dynamic Add/Quantity Overlay */}
        <div className="absolute bottom-3 inset-x-3">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => addToCart(product)}
                className="w-full py-3.5 bg-zinc-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-zinc-900  font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add to Cart
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center justify-between bg-teal-600 p-1.5 shadow-2xl"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                </button>
                <span className="font-black text-white text-sm">{quantity}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- DETAILS AREA --- */}
      <div className="px-2 pt-4 pb-2 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
              New Edition
            </p>
            <Link href={`/bookecommerce/products/${product.id}`}>
              <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                {name}
              </h4>
            </Link>
          </div>
          <div className="flex flex-col items-end">
             {discount && (
                <span className="text-[10px] line-through text-zinc-400">
                  KES {sellingPrice?.toLocaleString()}
                </span>
             )}
             <span className="text-base font-black text-zinc-900 dark:text-white">
                KES {(finalPrice || sellingPrice)?.toLocaleString()}
             </span>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800">
           <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Availability: In Stock</span>
           </div>
           <span className="text-[9px] font-mono text-zinc-300 dark:text-zinc-700">#BK-{product.id?.toString().slice(-4)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;