'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const AVAILABLE_SIZES = ['7', '8', '9', '10', '11', '12'];

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const [isSelectingSize, setIsSelectingSize] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b'; 
  
  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  // WhatsApp Config
  const whatsappNumber = "1234567890"; // Update with actual number
  const message = encodeURIComponent(`Hi, I'm interested in the ${product.name} (KES ${product.finalPrice?.toLocaleString()}). Do you have size UK ${selectedSize || '...'} in stock?`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!selectedSize) {
      setIsSelectingSize(true);
      return;
    }
    addToCart({ ...product, finalPrice: (product.finalPrice || product.sellingPrice || 0), selectedSize });
    setIsSelectingSize(false);
  };

  return (
    <motion.div
      className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-3 transition-all duration-500 group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]"
    >
      {/* Badge Tags */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        {product.isNewArrival && (
          <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            New
          </span>
        )}
        {product.isDiscounted && (
          <span className="bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            -{Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Floating WhatsApp Action (Top Right) */}
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-20 p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg text-[#25D366] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
      >
        <WhatsAppIcon className="w-5 h-5" />
      </a>

      {/* Image Container */}
      <div className="relative h-72 w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50">
        <Link href={`/ecommerceshoes/products/${product.id}`} className="block h-full w-full">
          <Image
            src={(product.images?.[0] as any)?.url || product.images?.[0] || 'https://via.placeholder.com/600'}
            alt={product.name}
            loader={loader}
            fill
            className="object-contain p-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3"
          />
        </Link>

        {/* Size Selector Overlay */}
        <AnimatePresence>
          {isSelectingSize && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 flex flex-col justify-center items-center"
            >
              <button 
                onClick={() => setIsSelectingSize(false)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-md"
              >
                <XMarkIcon className="w-4 h-4 text-zinc-500" />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Select UK Size</p>
              <div className="grid grid-cols-3 gap-2 w-full">
                {AVAILABLE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border-2 text-xs font-black transition-all ${
                      selectedSize === size 
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <button
                disabled={!selectedSize}
                onClick={handleAddToCart}
                className="mt-6 w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
              >
                Confirm Size
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <div className='h-10 mb-4'>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
              {product.category?.name || "Premium Footwear"}
            </p>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
              {product.name}
            </h4>
          </div>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
            <StarIcon className="w-3 h-3 text-zinc-900 dark:text-white" />
            <span className="text-[10px] font-black dark:text-white">4.8</span>
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-black text-zinc-900 dark:text-white">
            KES {product.finalPrice?.toLocaleString() || product.sellingPrice?.toLocaleString() || '0'}
          </span>
          {product.isDiscounted && (
            <span className="text-sm font-bold text-zinc-400 line-through">
              KES {product.sellingPrice?.toLocaleString() || '0'}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="qty-control"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl"
              >
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => decreaseQuantity(product.id)} 
                    className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm hover:scale-105 transition-transform"
                  >
                    {quantity === 1 ? <TrashIcon className="h-4 w-4 text-red-500" /> : <MinusIcon className="h-4 w-4 text-zinc-900 dark:text-white" />}
                  </button>
                  <span className="w-10 text-center font-black text-sm dark:text-white">{quantity}</span>
                  <button 
                    onClick={() => addToCart({ ...product, finalPrice: (product.finalPrice || product.sellingPrice || 0), selectedSize })} 
                    className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm hover:scale-105 transition-transform"
                  >
                    <PlusIcon className="h-4 w-4 text-zinc-900 dark:text-white" />
                  </button>
                </div>
                <span className="pr-4 text-[9px] font-black uppercase text-zinc-400">UK {selectedSize}</span>
              </motion.div>
            ) : (
              <div className="flex gap-2">
                <motion.button
                  key="add-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="flex-[4] flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-zinc-500/20"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  {isSelectingSize ? 'Select Size' : 'Add to Cart'}
                </motion.button>

                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center bg-[#25D366] text-white rounded-[1.5rem] shadow-lg shadow-green-500/20"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </motion.a>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;