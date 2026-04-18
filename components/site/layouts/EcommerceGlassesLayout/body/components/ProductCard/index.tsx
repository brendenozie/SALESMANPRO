'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for high-end eyewear
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D4C4F';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Configuration - Focused on Styling & Fit
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hello! I'm eyeing the "${product.name}" frames. Could you tell me if these fit a round face shape? I'm also curious about prescription options.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  return (
    <motion.div className="group relative flex flex-col bg-white overflow-hidden transition-all duration-500">
      {/* 1. High-Fashion Image Wrapper */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F9F6F2]">
        <Link href={`/glassesecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/600x800'}
            alt={product.name || 'Product Image'}
            fill
            loader={loader}
            className="object-cover transition-transform duration-1000 group-hover:scale-110 "
          />
        </Link>

        {/* Minimalist Labels */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          {discount && (
            <span className="bg-[#F3A852] text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">
              -{discount}%
            </span>
          )}
          <span className="bg-white/80 backdrop-blur-sm text-black text-[8px] font-bold px-2 py-1 uppercase tracking-[0.2em] border border-gray-100">
            Limited Edition
          </span>
        </div>

        {/* Floating WhatsApp Stylist Button */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-black transition-all duration-300 hover:bg-white hover:scale-110"
          title="Consult Stylist"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center justify-between bg-white/95 backdrop-blur-xl p-2 rounded-none border border-gray-100 shadow-2xl"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)} 
                  className="p-2 hover:text-[#F3A852] transition-colors"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="text-xs font-black tracking-widest">{quantity}</span>
                <button 
                  onClick={() => addToCart(product)} 
                  className="p-2 hover:text-[#F3A852] transition-colors"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <button 
                onClick={() => addToCart(product)}
                className="w-full py-4 bg-[#0D4C4F] text-white text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-black transition-all"
              >
                <ShoppingBagIcon className="h-4 w-4" /> Add to Bag
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Product Info Section */}
      <div className="pt-5 pb-10 px-1">
        <div className="flex justify-between items-baseline mb-2">
          <Link href={`/glassesecommerce/products/${product.id}`} className="flex-1">
            <h4 className="text-[14px] font-bold text-gray-900 uppercase tracking-tight group-hover:text-[#0D4C4F] transition-colors">
              {product.name}
            </h4>
          </Link>
          <div className="flex flex-col items-end">
             <span className="text-[15px] font-serif italic text-gray-900">
               Kes {(product.finalPrice ?? 0).toLocaleString()}
             </span>
             {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
               <span className="text-[10px] line-through text-gray-300">
                 Kes {product.sellingPrice.toLocaleString()}
               </span>
             )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <StarIcon className="h-2.5 w-2.5 text-[#F3A852]" />
            <span className="text-[9px] text-gray-400 uppercase tracking-[0.1em] font-medium">Handcrafted Acetate</span>
          </div>
          
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-black text-gray-800 uppercase tracking-widest hover:text-[#0D4C4F] transition-colors"
          >
            <WhatsAppIcon className="w-3 h-3" /> Order Via WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;