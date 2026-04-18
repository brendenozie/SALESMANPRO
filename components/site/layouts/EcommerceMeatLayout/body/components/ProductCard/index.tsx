'use client';

import React from 'react';
import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ShoppingBagIcon, FireIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
  index?: number;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

// Custom WhatsApp Icon with a professional "Meat Specialist" vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Butcher Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi Master Butcher! I'm interested in the "${product.name}". Can you confirm the cut date and if I can get it custom sliced?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice 
    ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100) 
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white dark:bg-[#0f0f0f] p-3 rounded-[2.5rem] border border-stone-100 dark:border-stone-800/50 hover:shadow-2xl hover:border-red-500/20 transition-all duration-500"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-stone-100 dark:bg-stone-900 mb-5">
        <Link href={`/meatecommerce/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/400'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            loader={loader}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Butcher's Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {discount && (
            <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-xl">
              {discount}% OFF
            </div>
          )}
          <div className="bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white px-2.5 py-1 rounded-full shadow-lg border border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] font-black uppercase tracking-widest">Premium Grade</span>
          </div>
        </div>

        {/* WhatsApp Consultation */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-20 p-2.5 bg-white/95 text-[#25D366] rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="Ask the Butcher"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow px-3 pb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Cut: Fresh Daily</span>
          {product.isTrending && <FireIcon className="w-3.5 h-3.5 text-orange-500" />}
        </div>
        
        <Link href={`/meatecommerce/products/${product.id}`}>
          <h4 className="text-base font-black text-stone-900 dark:text-stone-100 tracking-tight leading-tight group-hover:text-red-600 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h4>
        </Link>
        <p className="text-[10px] text-stone-500 font-medium mb-4 italic">100% Grass-Fed • Vacuum Sealed</p>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-lg font-black text-stone-950 dark:text-white tracking-tighter">
            KES {(product.finalPrice || product.sellingPrice)?.toLocaleString()}
          </span>
          {discount && (
            <span className="text-[10px] line-through text-stone-400 font-bold italic">
              {product.sellingPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Action Tray */}
        <div className="mt-auto relative h-12">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="in-cart"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between bg-stone-950 dark:bg-red-700 rounded-2xl h-full px-1 shadow-lg"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="w-4 h-4" /> : <MinusIcon className="w-4 h-4" />}
                </button>
                <span className="text-white font-black text-xs tabular-nums">WT: {quantity} KG</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addToCart(product)}
                className="w-full h-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-white border border-stone-200 dark:border-stone-800 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-300 shadow-sm"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Order Pack
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;