'use client';

import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

export default function ProductCard({ product }: { product: MarketListingForm }) {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#8B4513';
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(62,39,35,0.15)] border border-stone-100"
    >
      {/* Image Container */}
      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-stone-50">
        <Link href={`/ecommerce/products/${product.id}`}>
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            loader={loader}
            fill
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {discount && (
          <div className="absolute top-4 left-4 bg-[#F3A852] text-[#3E2723] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {discount}% Crunch
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-6 px-2 space-y-1">
        <div className="flex justify-between items-start">
          <Link href={`/ecommerce/products/${product.id}`}>
            <h4 className="text-lg font-black text-[#3E2723] tracking-tight group-hover:text-[#8B4513] transition-colors line-clamp-1">
              {product.name}
            </h4>
          </Link>
        </div>
        
        <p className="text-xs text-stone-400 font-medium">Stone-ground • Organic</p>

        <div className="flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#3E2723]">${product.finalPrice?.toFixed(2)}</span>
            {product.sellingPrice && product.sellingPrice > product.finalPrice && (
              <span className="text-xs line-through text-stone-300 font-bold">${product.sellingPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Dynamic Action Button */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => addToCart(product)}
                  className="w-12 h-12 rounded-2xl bg-[#3E2723] text-white flex items-center justify-center hover:bg-[#8B4513] transition-colors shadow-lg"
                >
                  <PlusIcon className="w-6 h-6" />
                </motion.button>
              ) : (
                <motion.div
                  key="qty"
                  initial={{ width: 48, opacity: 0 }}
                  animate={{ width: 110, opacity: 1 }}
                  exit={{ width: 48, opacity: 0 }}
                  className="h-12 bg-stone-100 rounded-2xl flex items-center justify-between px-2 overflow-hidden border border-stone-200"
                >
                  <button onClick={() => decreaseQuantity(product.id)} className="w-8 h-8 rounded-xl hover:bg-white flex items-center justify-center text-[#3E2723] transition-colors">
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="font-black text-[#3E2723] text-sm">{quantity}</span>
                  <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-xl hover:bg-white flex items-center justify-center text-[#3E2723] transition-colors">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}