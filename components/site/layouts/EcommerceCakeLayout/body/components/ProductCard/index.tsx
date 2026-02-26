'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
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
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const { name, images, finalPrice, sellingPrice } = product;
  
  const discount = sellingPrice && finalPrice != null && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white rounded-2xl transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50"
    >
      {/* 1. Image Section with Boutique Labels */}
      <Link href={`/ecommerce/products/${product.id}`} className="relative h-80 w-full overflow-hidden bg-gray-50">
        <Image
          src={imageSrc}
          alt={name}
          fill
          loader={loader}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Minimalist Discount Badge */}
        {discount !== null && (
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-amber-100">
            <span className="text-[10px] font-black tracking-widest text-amber-700">-{discount}% OFF</span>
          </div>
        )}

        {/* Floating Add to Cart Button (Mobile Quick Action) */}
        <button 
          onClick={(e) => { e.preventDefault(); addToCart(product); }}
          className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-amber-500 hover:text-white"
        >
          <ShoppingBagIcon className="w-5 h-5" />
        </button>
      </Link>

      {/* 2. Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 tracking-tight line-clamp-1 group-hover:text-amber-700 transition-colors">
              {name}
            </h4>
            <div className="flex items-center gap-1 mt-1">
              <StarIcon className="w-3 h-3 text-amber-500" />
              <span className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Artisan Choice</span>
            </div>
          </div>
        </div>

        {/* 3. Elegant Pricing & Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
             {sellingPrice && finalPrice && sellingPrice > finalPrice && (
              <span className="text-[10px] line-through text-gray-300 font-medium">
                ${sellingPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-black text-gray-900">
              ${(finalPrice ?? 0).toFixed(2)}
            </span>
          </div>

          {/* Boutique Quantity Controls */}
          <div className="flex items-center">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1"
                >
                  <button
                    onClick={() => decreaseQuantity(product.id)}
                    className="p-1.5 hover:text-amber-600 transition-colors"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-3 text-sm font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="p-1.5 hover:text-amber-600 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                  className="px-5 py-2 rounded-full border-2 border-amber-600 text-amber-700 text-xs font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all"
                >
                  Add
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;