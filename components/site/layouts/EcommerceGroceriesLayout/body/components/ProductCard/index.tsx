'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#16a34a';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
    : null;

  return (
    <motion.div 
      className="relative flex flex-col h-full bg-white rounded-[2rem] border border-gray-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] group"
    >
      {/* Image Wrapper */}
      <div className="relative h-64 w-full p-4 overflow-hidden">
        <Link href={`/ecommerce/products/${product.id}`} className="block h-full w-full relative rounded-2xl overflow-hidden bg-gray-50">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
          />
          
          <AnimatePresence>
            {discount && (
              <motion.span 
                initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg z-10"
              >
                SAVE {discount}%
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Info Wrapper */}
      <div className="px-6 pb-6 flex flex-col flex-grow">
        <div className="mb-4">
          <div className="flex items-center gap-1 text-yellow-400 mb-1">
            <StarIcon className="w-3.5 h-3.5" />
            <span className="text-xs font-bold text-gray-500">4.8 (120)</span>
          </div>
          <Link href={`/ecommerce/products/${product.id}`}>
            <h4 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">
              {product.name}
            </h4>
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-gray-900">
              ${(product.finalPrice ?? 0).toFixed(2)}
            </span>
            {discount && (
              <span className="text-sm text-gray-400 line-through font-medium">
                ${product.sellingPrice?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Contextual Action Button */}
          <div className="relative h-12 w-32 flex items-center justify-end">
            <AnimatePresence mode="wait">
              {quantity === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => addToCart(product)}
                  className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  <PlusIcon className="w-6 h-6" />
                </motion.button>
              ) : (
                <motion.div
                  key="stepper"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '100%' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center justify-between bg-gray-100 rounded-2xl p-1 w-full"
                >
                  <button 
                    onClick={() => decreaseQuantity(product.id)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="font-black text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-gray-600"
                  >
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
};

export default ProductCard;