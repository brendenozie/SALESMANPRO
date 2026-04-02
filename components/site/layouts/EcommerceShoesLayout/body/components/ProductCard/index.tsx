'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const AVAILABLE_SIZES = ['7', '8', '9', '10', '11', '12'];

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const [isSelectingSize, setIsSelectingSize] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b'; // Zinc-900 default
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    if (!selectedSize) {
      setIsSelectingSize(true);
      return;
    }
    addToCart({ ...product, finalPrice: (product.finalPrice || product.sellingPrice || 0), selectedSize });
    setIsSelectingSize(false);
  };

  return (
    <motion.div
      className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-3 transition-all duration-500 group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]"
    >
      {/* Badge Tags */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        {product.isNewArrival && (
          <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            New
          </span>
        )}
        {product.isDiscounted && (
          <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            -{Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative h-72 w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          <Image
            src={(product.images?.[0] as any)?.url || product.images?.[0] || 'https://via.placeholder.com/600'}
            alt={product.name}
            loader={loader}
            fill
            className="object-contain p-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
          />
        </Link>

        {/* Size Selector Overlay */}
        <AnimatePresence>
          {isSelectingSize && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 flex flex-col justify-center items-center"
            >
              <button 
                onClick={() => setIsSelectingSize(false)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-md"
              >
                <XMarkIcon className="w-4 h-4 text-zinc-500" />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Select UK Size</p>
              <div className="grid grid-cols-3 gap-2 w-full">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border-2 text-xs font-black transition-all ${
                      selectedSize === size 
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                disabled={!selectedSize}
                onClick={handleAddToCart}
                className="mt-6 w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
              >
                Confirm Size
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div className='h-10 mb-4'>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
              {product.category?.name || "Premium Footwear"}
            </p>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
              {product.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
            <StarIcon className="w-3 h-3 text-zinc-900 dark:text-white" />
            <span className="text-[10px] font-black dark:text-white">4.8</span>
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-black text-zinc-900 dark:text-white">
            KES {product.finalPrice?.toLocaleString() || product.sellingPrice?.toLocaleString() || '0'}
          </span>
          {product.isDiscounted && (
            <span className="text-sm font-bold text-zinc-400 line-through">
              KES {product.sellingPrice?.toLocaleString() || '0'}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="qty-control"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl"
              >
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => decreaseQuantity(product.id)} 
                    className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm hover:scale-105 transition-transform"
                  >
                    {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4 text-zinc-900 dark:text-white" />}
                  </button>
                  <span className="w-10 text-center font-black text-sm dark:text-white">{quantity}</span>
                  <button 
                    onClick={() => addToCart({ ...product, finalPrice: (product.finalPrice || product.sellingPrice || 0), selectedSize })} 
                    className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm hover:scale-105 transition-transform"
                  >
                    <PlusIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
                  </button>
                </div>
                <span className="pr-4 text-[9px] font-black uppercase text-zinc-400">UK {selectedSize}</span>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-zinc-500/20"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                {isSelectingSize ? 'Select Size' : 'Add to Cart'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;