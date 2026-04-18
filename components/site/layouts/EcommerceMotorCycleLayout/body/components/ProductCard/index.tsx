'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

// Elegant, minimal WhatsApp Icon for luxury branding
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  // Luxury Theme Settings
  const primary = "#1a1a1a"; 
  const accent = "#c5a059"; // Champagne Gold

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // WhatsApp Showroom Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const message = encodeURIComponent(`EXECUTIVE INQUIRY: I am interested in viewing the "${name}". Please provide details on financing and showroom availability.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const imageSrc = images?.[0] || 'https://via.placeholder.com/600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-transparent"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f9f9f9] rounded-sm mb-6 border border-gray-100/50">
        <Link href={`/motorcycleecommerce/products/${product.id}`}>
          <Image
            src={imageSrc}
            alt={name}
            loader={loader}
            fill
            className="object-cover grayscale-[20%] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </Link>

        {/* Floating Luxury Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {sellingPrice > finalPrice && (
            <div className="bg-black text-white px-3 py-1.5 shadow-xl border-l-2 border-[#c5a059]">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase">
                Limited Edition
              </p>
            </div>
          )}
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 shadow-sm border border-gray-100">
             <CheckBadgeIcon className="w-3 h-3 text-[#c5a059]" />
             <span className="text-[8px] font-black uppercase tracking-tighter text-gray-600">Certified Authentic</span>
          </div>
        </div>

        {/* Showroom WhatsApp Link */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 z-20 p-2.5 bg-white shadow-2xl text-[#25D366] rounded-full transition-all duration-500 hover:scale-110 border border-gray-100"
          title="Speak with a Consultant"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>

        {/* Quick Add Overlay - Slide Up Transition */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/80 to-transparent">
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#c5a059] hover:text-white transition-all duration-300"
            >
              <ShoppingBagIcon className="w-4 h-4" /> Secure Purchase
            </button>
          ) : (
            <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm p-1 shadow-2xl">
              <button onClick={() => decreaseQuantity(product.id)} className="p-3 hover:bg-gray-100 transition-colors"><MinusIcon className="w-4 h-4" /></button>
              <span className="font-black text-xs tracking-widest text-gray-900">BAG: {quantity}</span>
              <button onClick={() => addToCart(product)} className="p-3 hover:bg-gray-100 transition-colors"><PlusIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="text-center px-4">
        <div className="flex justify-center items-center gap-1.5 mb-3">
            <div className="flex text-[#c5a059]">
              {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-2.5 h-2.5 fill-current" />)}
            </div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 pl-2">Premium Rating</span>
        </div>
        
        <Link href={`/motorcycleecommerce/products/${product.id}`}>
          <h4 className="text-lg font-serif italic text-gray-900 group-hover:text-[#c5a059] transition-colors duration-500 line-clamp-1">
            {name}
          </h4>
        </Link>

        <div className="mt-3 flex items-baseline justify-center gap-3">
          <span className="text-xl font-light tracking-[0.1em] text-gray-900">
            Kes {(finalPrice ?? 0).toLocaleString()}
          </span>
          {sellingPrice > finalPrice && (
            <span className="text-xs line-through text-gray-300 font-medium">
              Kes {sellingPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Showroom Link Footer */}
        <div className="mt-4 flex justify-center">
            <a 
              href={whatsappUrl} 
              target="_blank"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 hover:text-black transition-colors py-2 border-b border-transparent hover:border-[#c5a059] flex gap-1 "
            >
              <WhatsAppIcon className="w-3 h-3 inline-block mr-1" /> Order Via Whatsapp
            </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;