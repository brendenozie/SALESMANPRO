'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, ShoppingCartIcon, StarIcon, BoltIcon,
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon } from '@heroicons/react/24/solid';
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


export default function GhubaProductCard({ product, toggleLike, likedItems,  }: any) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  
  // WhatsApp Retail Config
  const whatsappNumber = `${ storeFormData?.contactPhone || "254700000000"}`;
  const message = encodeURIComponent(`I'd like to order: ${product.name}. Is this available for delivery today?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="relative p-1.5 sm:p-4 group h-full"
    >
      <div 
        onClick={() => router.push(`/ghuba/productlist/${product.id}`)}
        className="relative h-full cursor-pointer bg-white dark:bg-[#0F0F0F] border border-zinc-200 dark:border-zinc-800 rounded-[1.2rem] sm:rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_40px_-10px_rgba(230,57,70,0.15)] flex flex-col"
      >
        
        {/* --- IMAGE HEADER --- */}
        <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0">
          {/* Discount Badge - Scaled for Mobile */}
          {product.discount > 0 && (
            <div className="absolute top-2 sm:top-4 left-0 z-20 bg-[#E63946] text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-4 py-0.5 sm:py-1 rounded-r-full shadow-lg">
              {product.discount}% OFF
            </div>
          )}

          <Image
            width={400}
            height={400}
            loader={loaderProp}
            src={imageError ? 'https://via.placeholder.com/400x400?text=Image+Not+Found' : product.images[0]}
            alt={product.title || 'Product Image'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setImageError(true)}
          />


          {/* Quick Action Overlay - Subtle on Mobile */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
             <span className="bg-white text-black font-black text-[8px] sm:text-[10px] uppercase tracking-widest px-4 py-2 sm:px-6 sm:py-3 rounded-full translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
               View Specs
             </span>
          </div>

          {/* Wishlist Button - Scaled down for 2-col mobile */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(product.id); }}
            className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-20 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl backdrop-blur-md border border-white/20 transition-all active:scale-90 ${
              likedItems[product.id]
                ? "bg-[#E63946] text-white"
                : "bg-black/20 text-white hover:bg-black/40"
            }`}
          >
            <HeartIcon className="h-4 w-4 sm:h-5 sm:h-5" />
          </button>
        </div>

        {/* --- PRODUCT INFO --- */}
        <div className="p-3 sm:p-6 flex flex-col flex-grow justify-between gap-2 sm:gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-1">
              <h3 className="text-[11px] sm:text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white line-clamp-2 leading-tight h-14 ">
                {product.name || product.title}
              </h3>
              
              {/* Condition Badge - Only show icon on mobile to save space */}
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md shrink-0">
                 <BoltIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E63946]" />
                 <span className="hidden sm:block text-[8px] font-black dark:text-zinc-300 uppercase">New</span>
              </div>
            </div>

            {/* Rating - Hidden on very small mobile if necessary, or scaled down */}
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-2 w-2 sm:h-3 sm:w-3 ${i < product.rating ? "text-[#E63946]" : "text-zinc-300 dark:text-zinc-800"}`}
                />
              ))}
              <span className="text-[8px] text-zinc-400 font-bold ml-1 sm:ml-2 uppercase">({product.reviews || 24})</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto">
            <div className="flex flex-col">
              <span className="text-[8px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Price</span>
              <span className="text-sm sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 sm:mt-1 italic">
                <span className="text-[9px] sm:text-sm not-italic mr-0.5 font-bold">KSH</span>{product.finalPrice.toLocaleString()}
              </span>
            </div>

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
                      className="w-full flex items-center justify-center gap-3 py-4 text-black dark:text-white border  rounded-2xl font-black text-[10px] uppercase tracking-widest  transition-all duration-300 shadow-sm "
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Add to Cart
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
          </div>
              
          {/* Quick Contact Overlay */}
          <div className=" flex items-end justify-center ">
            <a 
              href={whatsappUrl}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#25D366] text-white py-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Order via WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#E63946]/20 to-transparent shrink-0" />
      </div>
    </motion.div>
  );
}