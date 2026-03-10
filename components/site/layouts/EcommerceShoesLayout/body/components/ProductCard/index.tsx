'use client';

import { MinusIcon, PlusIcon, StarIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { MarketListingForm } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Mock sizes - in a real app, these would come from product.variants or product.sizes
const AVAILABLE_SIZES = ['7', '8', '9', '10', '11', '12'];

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const [isSelectingSize, setIsSelectingSize] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const quantity = cart.find((item: any) => item.id === product.id)?.quantity || 0;

  const handleAddToCart = () => {
    // If the product requires a size and we haven't picked one, show selector
    if (!selectedSize) {
      setIsSelectingSize(true);
      return;
    }
    // Add to cart with the selected size meta-data
    addToCart({ ...product, finalPrice: (product.finalPrice || 0), selectedSize });
    setIsSelectingSize(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 dark:border-slate-800"
    >
      {/* Quick Add Size Overlay */}
      <AnimatePresence>
        {isSelectingSize && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Select Size</span>
              <button onClick={() => setIsSelectingSize(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {AVAILABLE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    selectedSize === size 
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900' 
                    : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-500 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              disabled={!selectedSize}
              onClick={handleAddToCart}
              className="mt-auto w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primary }}
            >
              Confirm & Add
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Section */}
      <Link href={`/ecommerceshoes/products/${product.id}`} className="block relative h-64 bg-gray-50 dark:bg-slate-800/50">
        <Image
          src={(product.images?.[0] as any)?.url || product.images?.[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          loader={loader}
          fill
          className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
        />
      </Link>

      {/* Details Section */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
          {selectedSize && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-gray-500">
              Size: {selectedSize}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-yellow-500 mb-4">
          <StarIcon className="w-4 h-4" />
          <span className="text-xs font-bold text-gray-900 dark:text-white">4.5</span>
        </div>

        <div className="text-2xl font-black mb-6" style={{ color: primary }}>
          ${(product.finalPrice ?? 0).toFixed(2)}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="qty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl"
              >
                <div className="flex items-center">
                  <button onClick={() => decreaseQuantity(product.id)} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all">
                    {quantity === 1 ? <TrashIcon className="h-5 w-5 text-red-500" /> : <MinusIcon className="h-5 w-5 text-gray-600 dark:text-slate-300" />}
                  </button>
                  <span className="w-10 text-center font-black dark:text-white">{quantity}</span>
                  <button onClick={() => addToCart({ ...product, finalPrice: (product.finalPrice || 0), selectedSize: selectedSize })} className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all">
                    <PlusIcon className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                  </button>
                </div>
                <button onClick={() => { setSelectedSize(null); removeFromCart(product.id); }} className="px-4 text-[10px] font-black uppercase text-gray-400 hover:text-red-500 transition-colors">
                  Reset
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 transition-all"
                style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
              >
                {isSelectingSize ? 'Picking...' : 'Add to Cart'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;