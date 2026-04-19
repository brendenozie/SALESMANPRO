'use client';

import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon, MinusIcon, ShoppingCartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for Nut Butter Brand
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ProductCard({ product }: { product: MarketListingForm }) {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#8B4513';
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  
  // WhatsApp Configuration
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm interested in your "${product.name}". Is it stone-ground? I'd love to know about the texture!`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(62,39,35,0.15)] border border-stone-100 h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-64 w-full rounded-[2rem] overflow-hidden bg-stone-50">
        <Link href={`/peanutecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            loader={loader}
            fill
            className="transition-transform duration-700 group-hover:scale-110 object-cover object-center "
          />
        </Link>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {discount && (
            <div className="bg-[#F3A852] text-[#3E2723] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              {discount}% Crunch
            </div>
          )}
        </div>

        {/* WhatsApp Float */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-md text-[#128C7E] rounded-full shadow-sm transition-all duration-300 hover:scale-110"
          title="Ask the Roaster"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      {/* Content */}
      <div className="mt-6 px-2 space-y-1 flex-grow">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Small Batch</span>
            <div className="h-1 w-1 rounded-full bg-stone-200" />
            <a 
              href={whatsappUrl} 
              target="_blank" 
              className="text-[9px] font-black text-[#128C7E] uppercase hover:underline transition-colors flex items-center gap-1"
            >
              <WhatsAppIcon className="w-3 h-3 inline-block" /> Order Via WhatsApp
            </a>
          </div>
        </div>

        <Link href={`/peanutecommerce/products/${product.id}`}>
          <h4 className="text-lg font-black text-[#3E2723] tracking-tight group-hover:text-[#8B4513] transition-colors line-clamp-1">
            {product.name}
          </h4>
        </Link>
        
        <p className="text-xs text-stone-400 font-medium italic">Freshly Roasted • No Added Sugar</p>

        <div className="flex items-center justify-between pt-6 mt-auto">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#3E2723]">
              Kes {(product.finalPrice ?? 0).toLocaleString()}
            </span>
            {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
              <span className="text-xs line-through text-stone-300 font-bold">
                Kes {product.sellingPrice.toLocaleString()}
              </span>
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