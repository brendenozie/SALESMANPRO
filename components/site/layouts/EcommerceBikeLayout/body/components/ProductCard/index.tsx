'use client';

import { MinusIcon, PlusIcon, BoltIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Custom WhatsApp Icon with a high-performance/racing vibe
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || "#FF6B00";
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;
  
  // WhatsApp "Mechanic Support" Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`BIKE_INQUIRY: I'm looking at the "${name}". Could you confirm the frame size availability and if it comes pre-assembled?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const imageSrc = images?.[0] || 'https://via.placeholder.com/600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-gray-100 p-5 transition-all duration-500 hover:shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] hover:-translate-y-2"
    >
      {/* Tactical Header: ID & WhatsApp */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
          SKU: {product.id.slice(-8).toUpperCase()}
        </span>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 bg-gray-50 rounded-full text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm"
          title="Consult Mechanic"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
      </div>

      {/* Price Badge - Floating Impact */}
      <div className="absolute top-16 right-6 z-10 flex flex-col items-end pointer-events-none">
        <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
          Kes {(finalPrice ?? 0).toLocaleString()}
        </span>
        {sellingPrice > (finalPrice ?? 0) && (
          <span className="text-[10px] line-through text-red-500 font-bold uppercase tracking-widest mt-1">
            Kes {sellingPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Image / Mechanical Backdrop */}
      <div className="relative aspect-[4/3] w-full mb-6 overflow-hidden bg-[#FBFBFB] rounded-xl border border-gray-50">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
        
        <Link href={`/bikeecommerce/products/${product.id}`} className="block h-full w-full">
          <Image
            src={imageSrc}
            alt={name}
            loader={loader}
            fill
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
          />
        </Link>

        {/* Technical Callout */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
           <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm text-[8px] text-white px-2.5 py-1.5 rounded-none font-black uppercase tracking-widest">
             <BoltIcon className="w-3 h-3 text-yellow-400" /> Pro Grade Components
           </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: primary }}>
            2026 Racing Series
          </span>
          <a 
            href={whatsappUrl}
            target="_blank"
            className="text-[8px] font-bold text-green-500 flex items-center gap-1 hover:text-black transition-colors"
          >
            <WhatsAppIcon className="w-3 h-3" /> ORDER VIA WHATSAPP
          </a>
        </div>
        
        <Link href={`/bikeecommerce/products/${product.id}`}>
          <h4 className="text-xl font-black italic uppercase tracking-tighter text-gray-900 leading-tight mt-1 group-hover:underline decoration-primary-color decoration-2" style={{ textDecorationColor: primary }}>
            {name}
          </h4>
        </Link>

        {/* Functional Footer */}
        <div className="mt-auto pt-8 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => addToCart(product)}
                className="flex items-center gap-4 group/btn w-full"
              >
                <div className="w-12 h-12 rounded-full border-2 border-gray-900 flex items-center justify-center transition-all group-hover/btn:bg-black group-hover/btn:text-white group-hover/btn:scale-110">
                  <PlusIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none">Add to Build</span>
                  <span className="text-[8px] text-gray-400 uppercase mt-1">In Stock • Ready to Ride</span>
                </div>
              </motion.button>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center bg-gray-900 text-white rounded-full p-1.5 w-full justify-between shadow-lg"
              >
                <button 
                  onClick={() => decreaseQuantity(product.id)} 
                  className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="font-black text-sm tracking-tighter">QTY: {quantity}</span>
                <button 
                  onClick={() => addToCart(product)} 
                  className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
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