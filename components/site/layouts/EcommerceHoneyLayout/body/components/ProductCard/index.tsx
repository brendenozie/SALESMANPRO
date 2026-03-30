'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
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
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#3E2723'; // Dark Cocoa/Brown
  const accent = '#F3A852'; // Honey Gold

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
      ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
      : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-[2rem] p-4 border border-stone-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(62,39,35,0.05)]"
    >
      {/* Image Container */}
      <div className="relative h-64 w-full rounded-[1.5rem] overflow-hidden bg-[#FAF9F6]">
        <Link href={`/honeyecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {discount && (
          <div className="absolute top-3 left-3 bg-[#3E2723] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            -{discount}%
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-4 px-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
           {quantity === 0 && (
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-white/90 backdrop-blur-md text-[#3E2723] py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-[#3E2723] hover:text-white transition-colors"
              >
                <ShoppingBagIcon className="w-4 h-4" /> Quick Add
              </button>
           )}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 px-2 pb-2">
        <div className="flex justify-between items-start mb-2">
           <div>
             <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Premium Harvest</span>
             <h4 className="text-lg font-bold text-[#3E2723] leading-tight mt-1">{name}</h4>
           </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#3E2723]">${(finalPrice ?? 0).toFixed(2)}</span>
            {sellingPrice && sellingPrice > (finalPrice ?? 0) && (
              <span className="text-xs line-through text-stone-300 font-bold">${sellingPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Quantity Controls */}
          {quantity > 0 && (
            <div className="flex-grow flex items-center justify-end gap-3">
              <button 
                onClick={() => decreaseQuantity(product.id)}
                className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50"
              >
                <MinusIcon className="w-3 h-3 text-[#3E2723]" />
              </button>
              <span className="text-sm font-black text-[#3E2723] w-4 text-center">{quantity}</span>
              <button 
                onClick={() => addToCart(product)}
                className="w-8 h-8 rounded-full bg-[#3E2723] flex items-center justify-center hover:bg-[#F3A852]"
              >
                <PlusIcon className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;