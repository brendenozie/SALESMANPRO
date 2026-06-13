'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl my-auto rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-20 p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-900 dark:hover:text-white backdrop-blur-md transition-all shadow-sm"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto no-scrollbar">
              {/* Left: Product Media Gallery & Managed Placements */}
              <div className="w-full md:w-1/2 p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950/40 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
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
                            selectedImage === idx ? 'scale-105' : 'border-transparent opacity-60'
                          }`}
                          style={{ borderColor: selectedImage === idx ? primaryColor : 'transparent' }}
                        >
                          <Image src={img?.url || img || ''} alt="" fill className="object-cover" loader={({ src }) => src} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* STAGED ENTRIES OVERVIEW LIST */}
                {stagedProductLinesInCart.length > 0 && (
                  <div className="mt-8 border-t border-zinc-200/60 dark:border-zinc-800 pt-6">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center justify-between">
                      <span>Configured Selections in Your Bag</span>
                      <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full text-[10px]">
                        {stagedProductLinesInCart.length} Lines
                      </span>
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {stagedProductLinesInCart.map((line: any, index: number) => {
                        const lineOptionsLabel = Object.entries(line.selectedOptions || {})
                          .map(([cat, val]) => `${cat}: ${val}`)
                          .join(' • ');
                        
                        return (
                          <div 
                            key={index} 
                            className="flex items-center justify-between bg-white dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm text-xs"
                          >
                            <div className="flex flex-col space-y-0.5 max-w-[50%]">
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200 truncate">
                                {lineOptionsLabel || 'Default Configuration'}
                              </span>
                              <span className="text-[11px] font-medium text-zinc-400">
                                KES {(line.finalPrice ?? line.sellingPrice ?? 0).toLocaleString()} each
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg flex items-center border border-zinc-200 dark:border-zinc-800 p-0.5">
                                <button
                                  onClick={() => handleDecreaseLineItem(line)}
                                  className="w-6 h-6 rounded-md hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <MinusIcon className="w-3 h-3" />
                                </button>
                                <span className="font-black text-zinc-800 dark:text-zinc-100 px-2 text-center min-w-[20px]">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() => addToCart(line)}
                                  className="w-6 h-6 rounded-md hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => handleRemoveLineItem(line)}
                                className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
                                title="Delete configuration bundle"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Active Specs Configuration Matrix */}
              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between bg-white dark:bg-zinc-900">
                <div>
                  <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      Product Quick View
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight mt-4">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight">
                      (Premium Verified)
                    </span>
                  </div>

                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                    {product.description || "Configure sizes and optional matching metrics using the selection layout choices below."}
                  </p>

                  {/* Dynamic Variant Option Selection Chip Clusters */}
                  {Object.keys(groupedVariants).length > 0 && (
                    <div className="border-t border-b border-zinc-100 dark:border-zinc-800/80 py-5 my-2 space-y-4">
                      {Object.entries(groupedVariants).map(([category, options]) => (
                        <div key={category} className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
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
                                      : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
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
                </div>

                {/* Checkout Staging Calculations Footer Summary */}
                <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
                  <div className="flex flex-col mb-4">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      Active Configuration Price
                    </span>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl font-black text-zinc-900 dark:text-white">
                        KES {calculatedPrices.finalPrice.toLocaleString()}
                      </span>
                      {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                        <span className="text-sm line-through text-zinc-400">
                          KES {calculatedPrices.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAddActiveCombination}
                      style={{ backgroundColor: primaryColor }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-95 transition-all"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Add This Combo ({currentActiveCombinationQuantity})
                    </motion.button>
                    
                    <button
                      onClick={onClose}
                      className="px-6 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      Close
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