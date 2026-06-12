'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
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

  // Track user selection: e.g., { color: "Red", size: "M" }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Handle Mounting for Portal (SSR Safety)
  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Group unified variant array by their categories
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as VariantOptionItem[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, VariantOptionItem[]>);
  }, [product.option]);

  // Pre-select first variant option of each category automatically on mount
  useEffect(() => {
    const initialSelections: Record<string, string> = {};
    Object.entries(groupedVariants).forEach(([category, items]) => {
      if (items.length > 0) {
        initialSelections[category] = items[0].name;
      }
    });
    setSelectedVariants(initialSelections);
  }, [groupedVariants]);

  // Dynamic price calculation adding option surcharges to base cost
  const calculatedPrices = useMemo(() => {
    const baseFinalPrice = product.finalPrice ?? product.sellingPrice ?? 0;
    const baseSellingPrice = product.sellingPrice ?? 0;
    
    let totalSurcharge = 0;
    Object.entries(selectedVariants).forEach(([category, name]) => {
      const match = groupedVariants[category]?.find((v) => v.name === name);
      if (match?.extraPrice) {
        totalSurcharge += match.extraPrice;
      }
    });

    return {
      finalPrice: baseFinalPrice + totalSurcharge,
      sellingPrice: baseSellingPrice > 0 ? baseSellingPrice + totalSurcharge : undefined,
    };
  }, [selectedVariants, groupedVariants, product.finalPrice, product.sellingPrice]);

  if (!mounted) return null;

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/600'];

  // Handle Dynamic Submission to Cart Context
  const handleAddToBag = () => {
    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      // Pass down choice parameters for checkout reference tracking
      selectedOptions: selectedVariants, 
    });
    onClose();
  };

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
                    <Image
                      src={images[selectedImage]?.url || images[selectedImage] || ''}
                      alt={product.name}
                      fill
                      className="object-contain p-6"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loader={({ src }) => src}
                    />
                  </motion.div>
                </div>
                
                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {images.map((img: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          selectedImage === idx ? 'border-indigo-500 scale-105' : 'border-transparent opacity-60'
                        }`}
                      >
                        <Image src={img?.url || img || ''} alt="" fill className="object-cover" loader={({ src }) => src}  />
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

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    (142 Reviews)
                  </span>
                </div>

                <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  {product.description || "Sophisticated design meets modern functionality."}
                </p>

                {/* DYNAMIC RENDER: Active Variants Selection Chips */}
                {Object.keys(groupedVariants).length > 0 && (
                  <div className="border-t border-b border-slate-100 dark:border-gray-800 py-5 my-2 space-y-4">
                    {Object.entries(groupedVariants).map(([category, options]) => (
                      <div key={category} className="space-y-2">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                          Select {category}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {options.map((opt) => {
                            const isSelected = selectedVariants[category] === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => setSelectedVariants({ ...selectedVariants, [category]: opt.name })}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                                  isSelected
                                    ? "text-white shadow-sm scale-[1.02]"
                                    : "bg-transparent border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                                }`}
                                style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                              >
                                {opt.name}
                                {opt.extraPrice > 0 && ` (+KES ${opt.extraPrice})`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Prices Container */}
                <div className="flex items-center gap-4 my-6">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    KES {calculatedPrices.finalPrice.toLocaleString()}
                  </span>
                  {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                    <span className="text-lg line-through text-slate-300 dark:text-gray-600 font-bold">
                      KES {calculatedPrices.sellingPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Interactive Dynamic Action Buttons */}
                <div className="mt-auto flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToBag}
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