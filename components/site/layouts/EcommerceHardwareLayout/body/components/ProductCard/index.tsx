'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  BoltIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
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
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col bg-white dark:bg-[#0A0A0A] border-2 border-gray-100 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-2xl"
    >
      {/* --- IMAGE / SPECS OVERLAY --- */}
      <div className="relative h-72 w-full overflow-hidden bg-gray-50 dark:bg-zinc-900/50 p-4">
        <Link href={`/hardwareecommerce/products/${product.id}`} className="block h-full w-full relative">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            className="object-contain transition-transform duration-500 group-hover:scale-110 p-4"
          />
        </Link>

        {/* Technical Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discount && (
            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 skew-x-[-12deg] shadow-lg">
              SAVE {discount}%
            </div>
          )}
          <div className="bg-zinc-900 dark:bg-amber-500 text-amber-500 dark:text-black text-[9px] font-black px-2 py-1 skew-x-[-12deg] flex items-center gap-1">
             <ShieldCheckIcon className="w-3 h-3" />
             GENUINE STOCK
          </div>
        </div>

        {/* Secondary Action */}
        <button className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500 transition-colors">
          <HeartIcon className="w-5 h-5" />
        </button>

        {/* Quick Spec Bottom Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-zinc-900/80 backdrop-blur-sm py-2 px-4 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-3">
             <BoltIcon className="w-4 h-4 text-amber-400" />
             <WrenchScrewdriverIcon className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-[9px] text-white font-mono tracking-tighter">SKU: {product.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 flex flex-col flex-grow bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-[9px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em]">Hardware Supply</span>
           <div className="h-1 w-1 rounded-full bg-zinc-300" />
           <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">In Stock</span>
        </div>

        <Link href={`/products/${product.id}`}>
          <h4 className="text-md font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors mb-4">
            {name}
          </h4>
        </Link>

        <div className="mt-auto">
          <div className="flex flex-col mb-4">
            {discount && (
              <span className="text-xs line-through text-zinc-400 font-bold decoration-red-500/50">
                {sellingPrice?.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
              </span>
            )}
            <span className="text-2xl font-black text-zinc-900 dark:text-white italic">
              {finalPrice?.toLocaleString('en-KE', { style: 'currency', currency: 'KES' }) || sellingPrice?.toLocaleString('en-KE', { style: 'currency', currency: 'KES' })}
            </span>
          </div>

          {/* --- INDUSTRIAL BUTTONS --- */}
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="flex items-center bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800"
              >
                <button
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-4 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400"
                >
                  {quantity === 1 ? <TrashIcon className="h-5 w-5" /> : <MinusIcon className="h-5 w-5" />}
                </button>
                <span className="flex-grow text-center font-black text-lg dark:text-white font-mono">{quantity}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="p-4 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400 border-l border-zinc-200 dark:border-zinc-800"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(product)}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-black transition-all"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add to Inventory
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Corner Trim */}
      <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500 translate-x-4 -translate-y-4 rotate-45 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform" />
    </motion.div>
  );
};

export default ProductCard;