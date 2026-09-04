'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
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
  const { cart, addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const [selectedImage, setSelectedImage] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Track the active working selection matrix
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Handle Mounting for Portal (SSR Safety)
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => { 
      document.body.style.overflow = 'unset'; 
    };
  }, [isOpen]);

  // Group variant array by category
  const groupedVariants = useMemo(() => {
    const options = (product.option || []) as any[];
    return options.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
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

  // Track all items with this product ID in the cart
  const stagedProductLinesInCart = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

  // Check the quantity of the currently selected combination
  const currentActiveCombinationQuantity = useMemo(() => {
    const match = stagedProductLinesInCart.find((item: any) => {
      if (!item.selectedOptions) return false;
      return Object.entries(selectedVariants).every(([cat, val]) => item.selectedOptions[cat] === val);
    });
    return match?.quantity || 0;
  }, [stagedProductLinesInCart, selectedVariants]);

  // Price calculations with option surcharges
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

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/600'];

  const handleAddActiveCombination = () => {
    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions: { ...selectedVariants }, 
    });
  };

  const handleDecreaseLineItem = (lineItem: any) => {
    decreaseQuantity(lineItem);
  };

  const handleRemoveLineItem = (lineItem: any) => {
    removeFromCart(lineItem);
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xl"
          />

          {/* Architectural Lightbox Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-5xl my-auto rounded-[3rem] bg-white dark:bg-[#0c0c0c] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-zinc-100 dark:border-zinc-900/60 overflow-hidden z-10"
          >
            {/* Elegant Close Target */}
            <button
              onClick={onClose}
              className="absolute right-8 top-8 z-20 p-3 rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800 transition-colors shadow-sm"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto no-scrollbar">
              
              {/* --- LEFT COLUMN: GALLERY & RUNNING BAG OVERVIEW --- */}
              <div className="w-full md:w-1/2 p-6 md:p-10 bg-[#F7F7F7] dark:bg-[#080808] flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900">
                <div>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-[#EFEFEF] dark:bg-zinc-900">
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
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loader={({ src }) => src}
                        priority
                      />
                    </motion.div>
                  </div>
                  
                  {/* Premium Thumbnail Strip */}
                  {images.length > 1 && (
                    <div className="mt-5 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {images.map((img: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ${
                            selectedImage === idx ? 'scale-[1.03] shadow-md' : 'border-transparent opacity-40 hover:opacity-70'
                          }`}
                          style={{ borderColor: selectedImage === idx ? primaryColor : 'transparent' }}
                        >
                          <Image src={img?.url || img || ''} alt="" fill className="object-cover" loader={({ src }) => src} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RUNNING CONFIGURATION LINES LIST */}
                {stagedProductLinesInCart.length > 0 && (
                  <div className="mt-10 border-t border-zinc-200/50 dark:border-zinc-800/80 pt-8">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-4 flex items-center justify-between">
                      <span>Configured Setups inside Bag</span>
                      <span className="bg-zinc-200/60 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 px-2.5 py-0.5 rounded-md font-bold text-[8px]">
                        {stagedProductLinesInCart.length} Versions
                      </span>
                    </h4>
                    
                    <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                      {stagedProductLinesInCart.map((line: any, index: number) => {
                        const lineOptionsLabel = Object.entries(line.selectedOptions || {})
                          .map(([cat, val]) => `${val}`)
                          .join(' / ');
                        
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between bg-white dark:bg-[#0f0f0f] p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-900 text-xs"
                          >
                            <div className="flex flex-col space-y-1 max-w-[55%]">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate tracking-tight">
                                {lineOptionsLabel || 'Standard Spec Setup'}
                              </span>
                              <span className="text-[10px] font-medium text-zinc-400">
                                KES {(line.finalPrice ?? line.sellingPrice ?? 0).toLocaleString()} / piece
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-9 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex items-center border border-zinc-200/60 dark:border-zinc-800 p-0.5">
                                <button
                                  onClick={() => handleDecreaseLineItem(line)}
                                  className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <span className="font-black text-zinc-800 dark:text-zinc-100 px-2 text-center min-w-[24px] text-[10px]">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() => addToCart(line)}
                                  className="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveLineItem(line)}
                                className="p-2 rounded-xl text-zinc-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900 transition-colors"
                                title="Purge layout bundle"
                              >
                                <TrashIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* --- RIGHT COLUMN: SPECIFICATION SELECTION MATRIX --- */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-white dark:bg-[#0c0c0c]">
                <div>
                  <div className="mb-6">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 block mb-2">
                      Studio Quickview Spec Matrix
                    </span>
                    <h3 className="text-2xl md:text-3xl font-serif font-medium text-zinc-900 dark:text-white leading-tight">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-light mb-8">
                    {product.description || "Configure sizes, premium raw wood variants, and architectural fabric adjustments directly via the localized configuration portal options."}
                  </p>

                  {/* Dynamic Variant Option Clusters */}
                  {Object.keys(groupedVariants).length > 0 && (
                    <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-zinc-900">
                      {Object.entries(groupedVariants).map(([category, options]) => (
                        <div key={category} className="space-y-3">
                          <h5 className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
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
                                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                    isSelected
                                      ? "text-white shadow-md scale-[1.02]"
                                      : "bg-zinc-50/50 border-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                                  }`}
                                  style={isSelected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                >
                                  {opt.name}
                                  {opt.extraPrice > 0 && ` (+KES ${opt.extraPrice.toLocaleString()})`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkout Pricing Footer Summary */}
                <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                      Active Setup Cost
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                        KES {calculatedPrices.finalPrice.toLocaleString()}
                      </span>
                      {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                        <span className="text-sm line-through text-zinc-400 tracking-tight">
                          KES {calculatedPrices.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddActiveCombination}
                      style={{ backgroundColor: primaryColor }}
                      className="flex-1 flex items-center justify-center gap-2.5 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl hover:brightness-95 transition-all"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Add Combo Configuration ({currentActiveCombinationQuantity})
                    </motion.button>
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/40 dark:border-zinc-800/80 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Dismiss
                    </button>
                  </div>
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