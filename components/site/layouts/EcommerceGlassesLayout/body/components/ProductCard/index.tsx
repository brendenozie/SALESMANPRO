'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D4C4F';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  return (
    <motion.div className="group relative flex flex-col bg-white overflow-hidden">
      {/* Image Wrapper */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9F6F2]">
        <Link href={`/ecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/600x800'}
            alt={product.name}
            fill
            loader={loader}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* Minimalist Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {discount && (
            <span className="bg-[#F3A852] text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-2 rounded-lg border border-gray-100 shadow-xl">
              <button onClick={() => decreaseQuantity(product.id)} className="p-2 hover:text-[#F3A852]"><MinusIcon className="h-4 w-4" /></button>
              <span className="text-sm font-bold">{quantity}</span>
              <button onClick={() => addToCart(product)} className="p-2 hover:text-[#F3A852]"><PlusIcon className="h-4 w-4" /></button>
            </div>
          ) : (
            <button 
              onClick={() => addToCart(product)}
              className="w-full py-3 bg-[#0D4C4F] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              <ShoppingBagIcon className="h-4 w-4" /> Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="pt-4 pb-8">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-tight truncate flex-1">
            {product.name}
          </h4>
          <span className="text-[13px] font-serif italic text-gray-500">
            ${(product.finalPrice ?? 0).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`h-2.5 w-2.5 ${i < 4 ? 'text-[#F3A852]' : 'text-gray-200'}`} />
          ))}
          <span className="text-[9px] text-gray-400 uppercase tracking-tighter ml-1">Premium Acetate</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;