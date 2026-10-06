'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';

interface QuickViewProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketListingForm;
  primaryColor: string;
}

export default function QuickViewModal({ isOpen, onClose, product, primaryColor }: QuickViewProps) {
  const { addToCart } = useStateContext();
  const [selectedImage, setSelectedImage] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle Mounting for Portal (SSR Safety)
  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!mounted) return null;

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/600'];

  // Portal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white dark:bg-gray-900 shadow-2xl border border-slate-100 dark:border-gray-800 no-scrollbar"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-20 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white backdrop-blur-md transition-all shadow-sm"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Left: Visuals */}
              <div className="w-full md:w-1/2 p-4 md:p-8 bg-slate-50 dark:bg-gray-800/30">
                <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-700">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full"
                  >
                    <Image decoding="async"
                      src={images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-contain p-6"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </motion.div>
                </div>
                
                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          selectedImage === idx ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60'
                        }`}
                      >
                        <Image decoding="async" src={img} alt="" fill className="object-cover"  />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Info */}
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full">
                    Exclusive Item
                  </span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mt-4">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    (142 Reviews)
                  </span>
                </div>

                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                  {product.description || "Sophisticated design meets modern functionality. This piece is crafted from premium materials, ensuring both durability and a refined finish for your retail collection."}
                </p>

                <div className="flex items-center gap-4 mb-10">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">
                    ${(product.finalPrice ?? 0).toFixed(2)}
                  </span>
                  {product.sellingPrice && product.sellingPrice > (product.finalPrice ?? 0) && (
                    <span className="text-xl line-through text-slate-300 dark:text-gray-600 font-bold">
                      ${product.sellingPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      addToCart({...product, finalPrice: product.finalPrice ?? product.sellingPrice});
                      onClose();
                    }}
                    className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.15em] shadow-xl transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    Add to Bag
                  </motion.button>
                  <button className="p-4 rounded-2xl border border-slate-200 dark:border-gray-700 text-slate-400 hover:text-rose-500 transition-colors">
                    <HeartIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}