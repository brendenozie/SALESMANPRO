'use client';

import React from 'react';
import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ShoppingBagIcon, FireIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
  index?: number;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const getQuantity = (id: string) => cart.find((item: any) => item.id === id)?.quantity || 0;
  const quantity = getQuantity(product.id);

  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white dark:bg-[#0f0f0f] p-3 rounded-[2.5rem] border border-stone-100 dark:border-stone-800/50 hover:shadow-2xl hover:border-red-500/20 transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-stone-100 dark:bg-stone-900 mb-5">
        <Link href={`/meatecommerce/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            loader={loader}
          />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Dynamic Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md">
              {discount}% OFF
            </div>
          )}
          {product.isTrending && (
            <div className="bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white p-1.5 rounded-full shadow-lg border border-stone-100 dark:border-stone-800">
              <FireIcon className="w-3 h-3 text-orange-500" />
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow px-3 pb-2">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-base font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight group-hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h4>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg font-black text-stone-950 dark:text-white tracking-tighter">
            KES {(product.finalPrice || product.sellingPrice)?.toLocaleString()}
          </span>
          {discount && (
            <span className="text-[10px] line-through text-stone-400 font-bold italic">
              {product.sellingPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Tray: High-End Interactive UI */}
        <div className="mt-auto relative h-12">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="in-cart"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between bg-stone-950 dark:bg-red-600 rounded-2xl h-full px-1 shadow-lg"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
                </button>
                <span className="text-white font-black text-xs tabular-nums">{quantity}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(product)}
                className="w-full h-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-800 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-stone-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add to Cart
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;