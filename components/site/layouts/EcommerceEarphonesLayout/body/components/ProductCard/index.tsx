'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
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
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#1d4ed8';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Media Container */}
      <Link href={`/ecommerce/products/${product.id}`} className="relative h-80 w-full bg-[#111]">
        <Image
          src={product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          fill
          loader={loader}
          className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        
        {/* Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />

        {/* Badge Overlay */}
        {discount && (
          <div className="absolute top-4 left-4 bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic">
            -{discount}% OFF
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-white uppercase tracking-tighter leading-tight line-clamp-2">
            {product.name}
          </h4>
        </div>

        <div className="flex items-center gap-1 mb-6 text-white/40 text-[10px] font-bold tracking-widest uppercase">
          <StarIcon className="w-3 h-3 text-primary-color" style={{ color: primary }} />
          <span>4.9 Series</span>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-white font-black text-xl italic leading-none">
              ${(product.finalPrice ?? 0).toFixed(2)}
            </span>
            {product.sellingPrice && (
              <span className="text-white/30 line-through text-[10px] mt-1">
                ${product.sellingPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center bg-white/5 rounded-full p-1 border border-white/10"
                >
                  <button onClick={() => decreaseQuantity(product.id)} className="p-2 text-white hover:text-red-500">
                    {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                  </button>
                  <span className="px-2 text-white font-bold text-xs">{quantity}</span>
                  <button onClick={() => addToCart(product)} className="p-2 text-white hover:text-primary-color">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl text-black hover:bg-primary-color hover:text-white transition-all shadow-xl"
                  style={{ '--hover-bg': primary } as any}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
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