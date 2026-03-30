'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  // Luxury Theme Overrides
  const primary = "#1a1a1a"; // Deep Onyx
  const accent = "#c5a059"; // Champagne Gold

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;
  const imageSrc = images?.[0] || 'https://via.placeholder.com/600';

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
            src={imageSrc || 'https://images.unsplash.com/photo-1600185364436-1bafc9e8e5c3?auto=format&fit=crop&w=600&q=80'}
            alt={name}
            loader={({ src }) => src}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </Link>

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
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-white text-black py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
            >
              <ShoppingBagIcon className="w-4 h-4" /> Add to Bag
            </button>
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

        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="text-xl font-light tracking-wider text-gray-900">
            ${(finalPrice ?? 0).toLocaleString()}
          </span>
          {sellingPrice > (finalPrice || 0) && (
            <span className="text-sm line-through text-gray-400">
              ${sellingPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;