'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon, ShoppingCartIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Stealth-style WhatsApp Icon for Tech/Audio vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#1d4ed8';
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Config - Tech Support Focused
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`AUDIO_INQUIRY: I'm interested in the "${product.name}". How is the bass response and active noise cancellation (ANC) performance?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = product.sellingPrice && product.finalPrice && product.sellingPrice > product.finalPrice
      ? Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)
      : null;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-[#0a0a0a] rounded-[2rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      {/* Media Container */}
      <div className="relative h-80 w-full bg-[#111] overflow-hidden">
        <Link href={`/earphonesecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={product.images?.[0] || 'https://via.placeholder.com/300'}
            alt={product.name}
            fill
            loader={loader}
            className="object-contain p-8 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
          />
        </Link>
        
        {/* Dark Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60 pointer-events-none" />

        {/* Badge Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {discount && (
            <div className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter italic">
              -{discount}% OFF
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-md text-white/70 text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">
            Original Global
          </div>
        </div>

        {/* Floating WhatsApp Comms Icon */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/5 backdrop-blur-md text-[#25D366] rounded-full border border-white/10 transition-all duration-300 hover:scale-110"
          title="Speak to Audio Expert"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <h4 className="text-lg font-bold text-white uppercase tracking-tighter leading-tight line-clamp-1">
            {product.name}
          </h4>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 text-white/40 text-[10px] font-bold tracking-widest uppercase">
            <StarIcon className="w-3 h-3" style={{ color: primary }} />
            <span>Studio Grade</span>
          </div>
          <a 
            href={whatsappUrl}
            target="_blank"
            className="text-[9px] font-mono font-bold text-[#25D366] uppercase hover:underline transition-colors flex items-center gap-1"
          >
            <WhatsAppIcon className='w-4 h-4'/> Order Via Whatsapp
          </a>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-white font-black text-xl italic leading-none">
              Kes {(product.finalPrice ?? 0).toLocaleString()}
            </span>
            {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
              <span className="text-white/30 line-through text-[10px] mt-1">
                Kes {product.sellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {quantity > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex items-center bg-white/5 rounded-full p-1 border border-white/10"
                >
                  <button onClick={() => decreaseQuantity(product.id)} className="p-2 text-white hover:text-red-500 transition-colors">
                    {quantity === 1 ? <TrashIcon className="h-4 w-4" /> : <MinusIcon className="h-4 w-4" />}
                  </button>
                  <span className="px-2 text-white font-bold text-xs">{quantity}</span>
                  <button onClick={() => addToCart(product)} className="p-2 text-white hover:text-white/100 transition-colors">
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-2xl text-black transition-all shadow-xl hover:shadow-white/10"
                  style={{ backgroundColor: quantity === 0 ? 'white' : primary }}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;