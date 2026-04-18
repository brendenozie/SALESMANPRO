'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import {
  ShoppingBagIcon,
  HeartIcon,
  PlusIcon,
  EyeIcon,
  StarIcon,
  MinusIcon,
  FireIcon,
  ClockIcon,
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid'; // Using solid for high-contrast visibility

const loader = ({ src }: { src: string }) => src;

interface DishCardProps {
  dish: MarketListingForm;
}

// Minimalist WhatsApp for Concierge Ordering
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const quantity = cart.find((item: any) => item.id === dish.id)?.quantity || 0;

  // WhatsApp "Kitchen Concierge" Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`DIETARY INQUIRY: I'm interested in the "${dish.name}". Could the chef let me know if this can be prepared gluten-free or without nuts?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] p-4 border border-transparent hover:border-orange-500/20 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-500 hover:shadow-2xl"
    >
      {/* Image Core */}
      <div className="relative aspect-[16/11] w-full rounded-[2rem] overflow-hidden mb-6 shadow-inner">
        <Image
          src={dish.images?.[0] || "/placeholder-food.jpg"}
          alt={dish.name}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-95 group-hover:brightness-105"
          loader={loader}
        />
        
        {/* Floating Culinary Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* Whatsapp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-3 py-2 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-green-600 transition-colors"
            title="Ask Kitchen Concierge"
          >
            <WhatsAppIcon className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Order On Whatsapp</span>
          </a>
        </div>

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-orange-100 dark:border-zinc-800">
            <FireIcon className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Bestseller</span>
          </div>
          <div className="bg-green-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <HandThumbUpIcon className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Fresh Prep</span>
          </div>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
          <button 
            onClick={() => window.open(`/restaurent/products/${dish.id}`, '_blank')}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-2xl hover:bg-orange-500 hover:text-white transition-all"
            title="View Recipe Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 pb-2 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[1.1] h-14 overflow-hidden group-hover:text-orange-600 transition-colors">
            {dish.name}
          </h3>
          <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full shadow-md">
            <StarIcon className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-black">4.9</span>
          </div>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-6 font-medium leading-relaxed italic">
          "{dish.description || "A symphony of seasonal flavors curated by our master chef."}"
        </p>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ClockIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Ready: 15m</span>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Hot Serve</span>
          </div>
          
          <div className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
            <span className="text-[10px] font-bold mr-1 text-orange-500 uppercase">Kes</span>
            {dish.finalPrice?.toLocaleString()}
          </div>
        </div>

        {/* --- INTERACTIVE ACTION POD --- */}
        <div className="mt-auto">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="qty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between bg-zinc-900 dark:bg-orange-600 rounded-2xl p-1.5 shadow-xl"
              >
                <button 
                  onClick={() => decreaseQuantity(dish.id)} 
                  className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black text-white">{quantity} Portion{quantity > 1 ? 's' : ''}</span>
                  <span className="text-[7px] font-black text-white/70 uppercase tracking-[0.2em]">In your Plate</span>
                </div>
                <button 
                  onClick={() => addToCart(dish)} 
                  className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(dish)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add to Order
              </motion.button>
            )}
          </AnimatePresence>
          {/* Order Via Whatsapp */}
          <AnimatePresence>
            {(
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center justify-center"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex uppercase items-center gap-1 text-sm text-[#25D366] hover:underline transition-all font-bold "
                >
                  <WhatsAppIcon className="w-4 h-4" /> Order Via WhatsApp
                </a>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Subtle Heatwave Detail */}
      <div className="absolute -bottom-1 inset-x-12 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent blur-sm" />
    </motion.div>
  );
};

export default DishCard;