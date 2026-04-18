'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  BoltIcon,
  TrashIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Industrial WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B';

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // WhatsApp "Hardware Specialist" Inquiry
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`TECH_SPEC_REQUEST: I'm inquiring about SKU: ${product.id.slice(0, 8).toUpperCase()} ("${name}"). Do you have a technical data sheet or compatibility guide for this?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0] || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden hover:shadow-2xl"
    >
      {/* --- IMAGE / SPECS OVERLAY --- */}
      <div className="relative h-72 w-full overflow-hidden bg-[#F4F4F5] dark:bg-zinc-900/50">
        {/* Zebra Pattern Background for Industrial feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)` }} />
        
        <Link href={`/hardwareecommerce/products/${product.id}`} className="block h-full w-full relative z-10">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loader={loader}
            className="object-contain transition-transform duration-700 group-hover:scale-105 p-8"
          />
        </Link>

        {/* Industrial Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
          {discount && (
            <div className="bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase tracking-tighter">
              -{discount}% Off
            </div>
          )}
          <div className="bg-zinc-900 text-amber-500 text-[9px] font-black px-2 py-1 flex items-center gap-1 border-l-2 border-amber-500">
             <ShieldCheckIcon className="w-3 h-3" />
             QC PASSED
          </div>
        </div>

        {/* Technical Support WhatsApp */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-20 p-2.5 bg-white shadow-xl text-[#25D366] rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-zinc-900"
          title="Consult Technical Specialist"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Quick Spec Bottom Bar */}
        <div className="absolute bottom-0 left-0 w-full bg-zinc-900/90 backdrop-blur-md py-2.5 px-4 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
          <div className="flex gap-4">
             <div className="flex items-center gap-1.5 text-amber-400">
                <BoltIcon className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase">Heavy Duty</span>
             </div>
             <div className="flex items-center gap-1.5 text-zinc-400">
                <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                <span className="text-[8px] font-black uppercase">Serviceable</span>
             </div>
          </div>
          <span className="text-[8px] text-zinc-500 font-mono">REF: {product.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="p-5 flex flex-col flex-grow bg-white dark:bg-[#0A0A0A]">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">
             Commercial Supply
           </span>
           <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Ready to Ship</span>
           </div>
        </div>

        <Link href={`/hardwareecommerce/products/${product.id}`}>
          <h4 className="text-md font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight line-clamp-2 leading-snug group-hover:underline decoration-2 decoration-amber-500 transition-all mb-4">
            {name}
          </h4>
        </Link>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
              Kes {(finalPrice ?? sellingPrice ?? 0).toLocaleString()}
            </span>
            {discount && (
              <span className="text-xs line-through text-zinc-400 font-bold decoration-red-500/50">
                Kes {sellingPrice?.toLocaleString()}
              </span>
            )}
          </div>

          {/* --- INDUSTRIAL BUTTONS --- */}
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center bg-zinc-900 border-2 border-zinc-900"
              >
                <button
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-3.5 text-white hover:bg-zinc-800 transition-colors"
                >
                  {quantity === 1 ? <TrashIcon className="h-5 w-5" /> : <MinusIcon className="h-5 w-5" />}
                </button>
                <div className="flex-grow text-center flex flex-col leading-none">
                  <span className="text-white font-black text-sm">{quantity}</span>
                  <span className="text-[7px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">Bulk Units</span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="p-3.5 text-white hover:bg-zinc-800 transition-colors border-l border-zinc-800"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="w-full py-4 bg-zinc-900 text-white dark:bg-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-amber-500 dark:hover:bg-amber-500 hover:text-black transition-all"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add to Manifest
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Industrial Warning Stripe Detail */}
      <div className="h-1 w-full flex">
         <div className="h-full flex-grow bg-amber-500" />
         <div className="h-full flex-grow bg-zinc-900" />
         <div className="h-full flex-grow bg-amber-500" />
         <div className="h-full flex-grow bg-zinc-900" />
      </div>
    </motion.div>
  );
};

export default ProductCard;