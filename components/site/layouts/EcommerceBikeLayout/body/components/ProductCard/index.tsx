'use client';

import { MinusIcon, PlusIcon, ShoppingBagIcon, BoltIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || "#FF6B00";
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;
  const imageSrc = images?.[0] || 'https://via.placeholder.com/600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-gray-100 p-4 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2"
    >
      {/* Price Badge - Top Right */}
      <div className="absolute top-6 right-6 z-10 flex flex-col items-end">
        <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
          ${(finalPrice ?? 0).toLocaleString() || sellingPrice.toLocaleString()}
        </span>
        {sellingPrice > finalPrice && (
          <span className="text-[10px] line-through text-gray-400 font-bold uppercase tracking-widest">
            ${sellingPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Image / Mechanical Backdrop */}
      <div className="relative aspect-[4/3] w-full mb-6 overflow-hidden bg-[#F9F9F9]">
        {/* Subtle SVG Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        
        <Link href={`/bikeecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            loader={({ src }) => src}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-2"
          />
        </Link>

        {/* Technical Callout (Visible on Hover) */}
        <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-1 bg-black text-[9px] text-white px-2 py-1 rounded-sm font-black uppercase tracking-tighter">
              <BoltIcon className="w-3 h-3 text-yellow-400" /> Carbon Frame
           </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow">
        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primary }}>
          Series 2026
        </span>
        <Link href={`/bikeecommerce/products/${product.id}`}>
          <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 leading-tight mt-1 group-hover:underline decoration-2">
            {name}
          </h4>
        </Link>

        {/* Functional Footer */}
        <div className="mt-auto pt-6 flex items-center justify-between">
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="flex items-center gap-3 group/btn"
            >
              <div className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all group-hover/btn:bg-black group-hover/btn:text-white">
                <PlusIcon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Add to Build</span>
            </button>
          ) : (
            <div className="flex items-center bg-gray-100 rounded-full p-1 w-full justify-between">
              <button onClick={() => decreaseQuantity(product.id)} className="p-2 hover:bg-white rounded-full transition-colors"><MinusIcon className="w-4 h-4" /></button>
              <span className="font-black text-sm">{quantity}</span>
              <button onClick={() => addToCart(product)} className="p-2 hover:bg-white rounded-full transition-colors"><PlusIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;