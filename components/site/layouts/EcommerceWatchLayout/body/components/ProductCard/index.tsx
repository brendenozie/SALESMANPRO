'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;
  const imageSrc = images?.[0] || 'https://via.placeholder.com/600';

  // WhatsApp Link Helper
  const whatsappNumber = "1234567890"; // Replace with your actual number
  const message = encodeURIComponent(`Hi! I'm interested in the ${name} ($${finalPrice}). Is it still available?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-transparent"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f3f3] rounded-sm mb-6">
        <Link href={`/watchecommerce/products/${product.id}`}>
          <Image
            src={imageSrc}
            alt={name}
            loader={({ src }) => src}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </Link>

        {/* WhatsApp Floating Button (Top Right) */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md  duration-300 hover:bg-[#25D366] hover:text-white text-[#25D366] z-10"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>

        {/* Floating Badges */}
        {sellingPrice > (finalPrice || 0) && (
          <div className="absolute top-4 left-4 bg-white px-3 py-1 shadow-sm">
            <p className="text-[10px] font-bold tracking-tighter uppercase text-red-600">
              Limited Edition
            </p>
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
          {quantity === 0 ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => addToCart(product)}
                className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
              >
                <ShoppingBagIcon className="w-4 h-4" /> Add to Bag
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white p-1">
              <button onClick={() => decreaseQuantity(product.id)} className="p-2 hover:bg-gray-100"><MinusIcon className="w-4 h-4" /></button>
              <span className="font-bold text-sm">{quantity}</span>
              <button onClick={() => addToCart(product)} className="p-2 hover:bg-gray-100"><PlusIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className="text-center">
        <div className="flex justify-center mb-2">
          <div className="flex text-amber-500">
            {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 fill-current" />)}
          </div>
        </div>

        <Link href={`/watchecommerce/products/${product.id}`}>
          <h4 className="text-lg font-serif italic text-gray-900 group-hover:text-[#c5a059] transition-colors line-clamp-1 px-2">
            {name}
          </h4>
        </Link>

        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-light tracking-wider text-gray-900">
              ${(finalPrice ?? 0).toLocaleString()}
            </span>
            {sellingPrice > (finalPrice || 0) && (
              <span className="text-sm line-through text-gray-400">
                ${sellingPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Subtle Inquire Link */}
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#c5a059] transition-colors mt-1"
          >
            Inquire via WhatsApp
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;