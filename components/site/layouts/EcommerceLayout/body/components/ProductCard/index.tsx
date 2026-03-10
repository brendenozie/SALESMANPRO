'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import QuickViewModal from '@/components/site/QuickViewModal';

interface ProductCardProps {
  product: MarketListingForm;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#f43f5e';

  const quantity = cart.find((item: MarketListingForm) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const imageSrc = images?.[0] || 'https://via.placeholder.com/300';
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative flex flex-col bg-white dark:bg-gray-900 rounded-[2rem] shadow-sm hover:shadow-2xl dark:shadow-none dark:hover:bg-gray-800/50 transition-all duration-500 overflow-hidden group border border-slate-100 dark:border-gray-800"
    >
      {/* Image Section */}
      <Link href={`/ecommerce/products/${product.id}`} className="block relative h-72 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
          loader={({ src }) => src}
        />
        
        {discount && (
          <div 
            className="absolute top-4 left-4 z-10 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider"
            style={{ backgroundColor: secondary }}
          >
            {discount}% OFF
          </div>
        )}

        {/* New Hover Trigger */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full shadow-2xl hover:bg-indigo-600 hover:text-white transition-all"
            >
              Quick View
            </button>
          </div>
      </Link>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate mb-1">
            {name}
          </h4>
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'opacity-30'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">4.8 Rating</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ${(finalPrice ?? 0).toFixed(2)}
          </span>
          {sellingPrice && sellingPrice > (finalPrice ?? 0) && (
            <span className="text-sm line-through text-slate-400">
              ${sellingPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Cart Logic */}
        <div className="mt-auto">
          {quantity > 0 ? (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-gray-800 p-1 rounded-xl border border-slate-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => decreaseQuantity(product.id)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-slate-600 dark:text-gray-300"
                >
                  {quantity === 1 ? <TrashIcon className="h-4 w-4 text-rose-500" /> : <MinusIcon className="h-4 w-4" />}
                </button>
                <span className="text-sm font-black dark:text-white">{quantity}</span>
                <button
                  onClick={() => addToCart(product)}
                  className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors text-slate-600 dark:text-gray-300"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => removeFromCart(product.id)}
                className="pr-3 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 transition-colors"
              >
                Clear
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              className="w-full py-3 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all"
              style={{ backgroundColor: primary }}
            >
              Add To Cart
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>

          {/* The Modal */}
 {showQuickView &&         
    <QuickViewModal 
      isOpen={showQuickView} 
      onClose={() => setShowQuickView(false)} 
      product={product} 
      primaryColor={primary} 
    />}
    </>
  );
};

export default ProductCard;