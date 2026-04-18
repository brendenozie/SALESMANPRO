'use client';

import { MinusIcon, PlusIcon, ShoppingBagIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for a soft, elegant aesthetic
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [isHovered, setIsHovered] = useState(false);
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp "Florist Consultation" Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hi! I'm interested in the "${product.name}" bouquet. Do you offer same-day delivery, and can I include a custom handwritten note?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const imageSrc = product.images?.[0] || 'https://via.placeholder.com/600x800';

  return (
    <div 
      className="group relative flex flex-col bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-50">
        <Link href={`/flowersecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={product.name}
            loader={loader}
            fill
            className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </Link>
        
        {/* Soft Status Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {product.sellingPrice! > product.finalPrice! && (
            <div className="bg-rose-50/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-100 shadow-sm">
              <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                Seasonal Offer
              </span>
            </div>
          )}
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">
              Freshly Picked
            </span>
          </div>
        </div>

        {/* WhatsApp Icon Float */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md text-[#25D366] rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
          title="Ask the Florist"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Action Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/10 flex items-center justify-center p-6"
            >
              {quantity === 0 ? (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  onClick={(e) => { e.preventDefault(); addToCart(product); }}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Add to Bag</span>
                </motion.button>
              ) : (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-between p-1.5"
                >
                  <button onClick={() => decreaseQuantity(product.id)} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <MinusIcon className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-bold text-slate-900 text-sm">{quantity}</span>
                  <button onClick={() => addToCart(product)} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <PlusIcon className="w-4 h-4 text-slate-600" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Section */}
      <div className="mt-6 flex flex-col items-center text-center">
        <Link href={`/flowersecommerce/products/${product.id}`}>
          <h4 className="text-lg font-serif italic text-slate-900 group-hover:text-rose-500 transition-colors duration-500">
            {product.name}
          </h4>
        </Link>
        
        <div className="flex items-center gap-3 mt-2">
          <span className="text-slate-900 font-bold tracking-tight">
            Kes {(product.finalPrice ?? 0).toLocaleString()}
          </span>
          {product.sellingPrice! > product.finalPrice! && (
            <span className="text-slate-300 line-through text-xs font-medium">
              Kes {product.sellingPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Interactive Bloom Indicator */}
        <div className="flex items-center gap-4 mt-5 group-hover:gap-8 transition-all duration-700">
          <div className="h-[1px] w-6 bg-slate-200 group-hover:bg-rose-200" />
          <a 
            href={whatsappUrl}
            target="_blank"
            className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors"
          >
            Custom Order
          </a>
          <div className="h-[1px] w-6 bg-slate-200 group-hover:bg-rose-200" />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;