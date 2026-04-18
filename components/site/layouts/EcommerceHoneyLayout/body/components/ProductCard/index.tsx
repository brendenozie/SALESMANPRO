'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon for Artisan/Natural vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#3E2723'; 
  const accent = '#F3A852'; 

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // WhatsApp Setup
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`Hello! I'm interested in the "${name}". Is this batch recently harvested? I'd love to know more about its flavor profile.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

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
            className="transition-transform duration-700 group-hover:scale-110"
          />
        </Link>
        
        {discount && (
          <div className="absolute top-3 left-3 bg-[#3E2723] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-10">
            -{discount}%
          </div>
        )}

        {/* Floating WhatsApp - Origin Inquiry */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 z-10 p-2.5 bg-white/90 backdrop-blur-sm text-[#128C7E] rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          title="Talk to Beekeeping Expert"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

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
      <div className="mt-6 pb-2">
        <div className="flex justify-between items-start mb-2">
           <div>
             <div className="flex items-center gap-1">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Premium Harvest</span>
               <div className="h-1 w-1 rounded-full bg-stone-200" />
               <a 
                 href={whatsappUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-[9px] font-black text-[#128C7E] uppercase hover:underline transition-colors flex items-center gap-1"
               >
                 <WhatsAppIcon className="w-3 h-3 inline-block" /> Order Via WhatsApp
               </a>
             </div>
             <h4 className="text-lg font-bold text-[#3E2723] leading-tight mt-1">{name}</h4>
           </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#3E2723]">
              Kes {(finalPrice ?? 0).toLocaleString()}
            </span>
            {sellingPrice && sellingPrice > (finalPrice ?? 0) && (
              <span className="text-xs line-through text-stone-300 font-bold">
                Kes {sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <AnimatePresence>
            {quantity > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex-grow flex items-center justify-end gap-3"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)}
                  className="w-8 h-8 rounded-full border border-stone-100 flex items-center justify-center hover:bg-stone-50 transition-colors"
                >
                  <MinusIcon className="w-3 h-3 text-[#3E2723]" />
                </button>
                <span className="text-sm font-black text-[#3E2723] w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-8 h-8 rounded-full bg-[#3E2723] flex items-center justify-center hover:bg-[#F3A852] transition-colors"
                >
                  <PlusIcon className="w-3 h-3 text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;