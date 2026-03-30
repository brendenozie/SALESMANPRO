"use client";

import { MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';


const loader = ({ src }: { src: string }) => src;

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const imageSrc = product.images?.[0] || 'https://via.placeholder.com/600x800';

  return (
    <div 
      className="group relative flex flex-col bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/flowersecommerce/products/${product.id}`} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src={imageSrc}
          alt={product.name}
          loader={loader}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        
        {/* Subtle Discount Tag */}
        {product.sellingPrice! > product.finalPrice! && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
              Special Offer
            </span>
          </div>
        )}

        {/* Modern Hover Action Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/5 flex items-center justify-center p-6"
            >
              {quantity === 0 ? (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  onClick={(e) => { e.preventDefault(); addToCart(product); }}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-800 transition-colors"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Add to Bag</span>
                </motion.button>
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full bg-white rounded-xl shadow-2xl flex items-center justify-between p-2"
                >
                  <button onClick={() => decreaseQuantity(product.id)} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <MinusIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-bold text-slate-900">{quantity}</span>
                  <button onClick={() => addToCart(product)} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <PlusIcon className="w-4 h-4 text-slate-600" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Details Section */}
      <div className="mt-6 flex flex-col items-center text-center">
        <Link href={`/flowersecommerce/products/${product.id}`}>
          <h4 className="text-lg font-serif italic text-slate-900 group-hover:text-rose-500 transition-colors duration-300">
            {product.name}
          </h4>
        </Link>
        
        <div className="flex items-center gap-3 mt-2">
          <span className="text-slate-900 font-bold tracking-tight">
            ${(product.finalPrice ?? 0).toFixed(2) || product.sellingPrice?.toFixed(2) || 'N/A'}
          </span>
          {product.sellingPrice! > product.finalPrice! && (
            <span className="text-slate-400 line-through text-sm">
              ${product.sellingPrice?.toFixed(2)}
            </span>
          )}
        </div>

        {/* Decorative Stem Line */}
        <div className="h-[1px] w-8 bg-slate-200 mt-4 group-hover:w-16 group-hover:bg-rose-300 transition-all duration-500" />
      </div>
    </div>
  );
};

export default ProductCard;