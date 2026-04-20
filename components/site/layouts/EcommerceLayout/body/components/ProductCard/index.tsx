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

// Custom WhatsApp Icon
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#f43f5e';

  const quantity = cart.find((item: MarketListingForm) => item.id === product.id)?.quantity || 0;
  const { name, images, finalPrice, sellingPrice } = product;

  // WhatsApp Config
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`; // Update with actual number
  const message = encodeURIComponent(`Hello! I'd like to order: ${name} (Price: $${finalPrice})`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

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

        {/* Floating WhatsApp Action (Top Right) */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-4 right-4 z-30 bg-white/90 dark:bg-gray-800/90 p-2.5 rounded-full shadow-xl text-[#25D366] transition-all duration-300 hover:scale-110"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </a>

        {/* Hover Trigger */}
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

        {/* Cart & WhatsApp Buttons Logic */}
        <div className="mt-auto space-y-3">
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
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="flex-[2] py-3 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all"
                style={{ backgroundColor: primary }}
              >
                Add To Cart
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] flex items-center justify-center rounded-xl shadow-lg transition-all text-white"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </motion.a>
            </div>
          )}
        </div>
      </div>
    </motion.div>

    {showQuickView && (
      <QuickViewModal 
        isOpen={showQuickView} 
        onClose={() => setShowQuickView(false)} 
        product={product} 
        primaryColor={primary} 
      />
    )}
    </>
  );
};

export default ProductCard;