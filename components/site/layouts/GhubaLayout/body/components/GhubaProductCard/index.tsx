'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon, 
  BoltIcon,
  CheckBadgeIcon,
  ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';

const loaderProp = ({ src, width, quality }: any) => {
  const params = [`w=${width || 400}`];
  if (quality) params.push(`q=${quality}`);
  return `${src}?${params.join('&')}`;
};

// WhatsApp Icon for Quick Retail Inquiry
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function GhubaProductCard({ product, toggleLike, likedItems, }: any) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  // WhatsApp Retail Config
  const whatsappNumber = `{ storeFormData?.contactPhone || "254700000000"}`;
  const message = encodeURIComponent(`I'd like to order: ${product.name}. Is this available for delivery today?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative p-1 sm:p-2 group h-full"
    >
      <div 
        className="relative h-full cursor-pointer bg-white dark:bg-[#0A0A0A] border border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col"
      >
        
        {/* --- VISUAL HEADER --- */}
        <div 
          onClick={() => router.push(`/ghuba/productlist/${product.id}`)}
          className="relative aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-900 shrink-0"
        >
          {/* Status Badges */}
          <div className="absolute top-2 left-0 z-20 flex flex-col gap-1 items-start">
            {product.discount > 0 && (
              <div className="bg-[#E63946] text-white text-[7px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-r-lg shadow-lg">
                -{product.discount}%
              </div>
            )}
            <div className="bg-emerald-500 text-white text-[7px] sm:text-[9px] font-black px-2 py-1 rounded-r-lg shadow-md flex items-center gap-1">
              <CheckBadgeIcon className="w-2 sm:w-3 h-2 sm:h-3" />
              IN STOCK
            </div>
          </div>

          <Image
            width={400}
            height={400}
            loader={loaderProp}
            src={imageError ? 'https://via.placeholder.com/400x400?text=Retail+Item' : product.images?.[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={() => setImageError(true)}
          />

          {/* Quick Contact Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
             <a 
               href={whatsappUrl}
               target="_blank"
               onClick={(e) => e.stopPropagation()}
               className="w-full bg-[#25D366] text-white py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
             >
               <WhatsAppIcon className="w-4 h-4" />
               Order via WA
             </a>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
            className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md border border-white/20 transition-all ${
              likedItems[product.id] ? "bg-[#E63946] text-white" : "bg-white/80 text-zinc-900 hover:bg-[#E63946] hover:text-white"
            }`}
          >
            <HeartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* --- PRODUCT INFO --- */}
        <div className="p-3 sm:p-5 flex flex-col flex-grow">
          <div className="mb-auto">
            <div className="flex justify-between items-start mb-1">
              <h3 
                onClick={() => router.push(`/ghuba/productlist/${product.id}`)}
                className="text-[12px] sm:text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white line-clamp-2 leading-none hover:text-[#E63946] transition-colors"
              >
                {product.name || product.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${i < (product.rating || 5) ? "text-amber-400" : "text-zinc-200"}`}
                  />
                ))}
              </div>
              <span className="text-[8px] font-black text-zinc-400">({product.reviews || '12'})</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              {product.discount > 0 && (
                <span className="text-[8px] font-bold text-zinc-400 line-through leading-none mb-1">
                  KSH {(product.finalPrice * 1.2).toLocaleString()}
                </span>
              )}
              <span className="text-sm sm:text-xl font-black text-zinc-900 dark:text-white leading-none tracking-tighter italic">
                <span className="text-[8px] sm:text-[10px] not-italic mr-0.5 text-[#E63946]">KSH</span>
                {product.finalPrice.toLocaleString()}
              </span>
            </div>

            {/* <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl hover:bg-[#E63946] dark:hover:bg-[#E63946] hover:text-white transition-all shadow-lg"
            >
              <ShoppingCartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button> */}
             {/* Action Tray */}
                    <div className="mt-auto">
                      <AnimatePresence mode="wait">
                        {quantity > 0 ? (
                          <motion.div 
                            key="in-cart"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-between bg-slate-900 rounded-2xl p-1 shadow-xl"
                          >
                            <button 
                              onClick={() => decreaseQuantity(product.id)}
                              className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                              {quantity === 1 ? <TrashIcon className="w-4 h-4 text-red-400" /> : <MinusIcon className="w-4 h-4" />}
                            </button>
                            <span className="text-white font-black text-sm">{quantity}</span>
                            <button 
                              onClick={() => addToCart(product)}
                              className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                              <PlusIcon className="w-4 h-4 text-emerald-400" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.button
                            key="add-btn"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => addToCart(product)}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all duration-300 shadow-sm hover:shadow-emerald-200"
                          >
                            <ShoppingBagIcon className="w-4 h-4" />
                            Harvest to Cart
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}