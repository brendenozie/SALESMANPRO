'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { MarketListingForm } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { resolveProductMedia } from '@/lib/product-media-resolver';

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

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const mediaItems = useMemo(() => {
    if (resolvedMedia.allMedia && resolvedMedia.allMedia.length > 0) {
      return resolvedMedia.allMedia;
    }
    return [{ 
      type: 'image' as const, 
      url: resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600x900' 
    }];
  }, [resolvedMedia]);

  const currentMediaItem = mediaItems[selectedImage] || mediaItems[0];

  const handleAddActiveCombination = () => {
    addToCart({
      ...product,
      finalPrice: calculatedPrices.finalPrice,
      sellingPrice: calculatedPrices.sellingPrice || product.sellingPrice,
      selectedOptions: { ...selectedVariants }, 
    });
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 lg:p-12">
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
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 15 }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative w-full max-w-5xl my-auto rounded-[2.5rem] bg-white dark:bg-[#0c0c0c] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-zinc-100 dark:border-zinc-900/60 overflow-hidden z-10 max-h-[90vh] flex flex-col md:flex-row"
          >
            {/* Elegant Close Target */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 z-20 p-3 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800/80 transition-all shadow-sm active:scale-95"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            {/* --- LEFT COLUMN: GALLERY & RUNNING BAG OVERVIEW --- */}
            <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 bg-zinc-50/50 dark:bg-[#080808] flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-900 overflow-y-auto no-scrollbar">
              <div className="space-y-5">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900/50 shadow-sm">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full relative flex items-center justify-center bg-black"
                  >
                    {currentMediaItem?.type === 'video' ? (
                      <video
                        src={currentMediaItem.url}
                        poster={currentMediaItem.posterUrl || resolvedMedia.primaryImageUrl}
                        controls
                        playsInline
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image decoding="async"
                        src={currentMediaItem?.url || resolvedMedia.primaryImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                      />
                    )}
                  </motion.div>
                </div>
                
                {/* Premium Thumbnail Strip */}
                {mediaItems.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x">
                    {mediaItems.map((item, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border transition-all duration-300 snap-start ${
                          selectedImage === idx ? 'scale-[1.02] shadow-md' : 'border-transparent opacity-40 hover:opacity-80'
                        }`}
                        style={{ borderColor: selectedImage === idx ? primaryColor : 'transparent' }}
                      >
                        <Image decoding="async" 
                          src={item.type === 'video' ? (item.posterUrl || item.thumbnailUrl || resolvedMedia.primaryImageUrl) : (item.thumbnailUrl || item.url)} 
                          alt="" 
                          fill 
                          className="object-cover" 
                        />
                        {item.type === 'video' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <VideoCameraIcon className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RUNNING CONFIGURATION LINES LIST */}
              {stagedProductLinesInCart.length > 0 && (
                <div className="mt-8 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-6">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 mb-3.5 flex items-center justify-between">
                    <span>Selections in Wardrobe</span>
                    <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full font-bold text-[8px] border border-zinc-200/20">
                      {stagedProductLinesInCart.length} Variants
                    </span>
                  </h4>
                  
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                    {stagedProductLinesInCart.map((line: any, index: number) => {
                      const lineOptionsLabel = Object.entries(line.selectedOptions || {})
                        .map(([_, val]) => `${val}`)
                        .join(' / ');
                      
                      return (
                        <div 
                          key={index} 
                          className="flex items-center justify-between bg-white dark:bg-[#0f0f0f] p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 text-xs"
                        >
                          <div className="flex flex-col space-y-0.5 max-w-[55%]">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate tracking-tight uppercase text-[11px]">
                              {lineOptionsLabel || 'Default Customization'}
                            </span>
                            <span className="text-[10px] font-medium text-zinc-400">
                              KES {(line.finalPrice ?? line.sellingPrice ?? 0).toLocaleString()} each
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="h-8 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center border border-zinc-200/60 dark:border-zinc-800 p-0.5">
                              <button
                                onClick={() => decreaseQuantity(line)}
                                className="w-6 h-6 rounded-md hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              >
                                <MinusIcon className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-black text-zinc-800 dark:text-zinc-100 px-1.5 text-center min-w-[20px] text-[10px]">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => addToCart(line)}
                                className="w-6 h-6 rounded-md hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                              >
                                <PlusIcon className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(line)}
                              className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 dark:text-zinc-700 dark:hover:text-red-400 transition-colors"
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
            <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-between bg-white dark:bg-[#0c0c0c] overflow-y-auto no-scrollbar">
              <div>
                <div className="mb-5">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500 block mb-1.5">
                    Studio Quick Options
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-wide leading-tight">
                    {product.name}
                  </h3>
                </div>

                <p className="text-zinc-400 dark:text-zinc-500 text-[11px] leading-relaxed font-normal mb-6 max-w-sm">
                  {product.description || "Review lookbook specs, coordinate specific colors, and tailor custom profile sizing parameters directly before building your custom order configuration."}
                </p>

                {/* Dynamic Variant Option Clusters */}
                {Object.keys(groupedVariants).length > 0 && (
                  <div className="space-y-5 pt-5 border-t border-zinc-100 dark:border-zinc-900">
                    {Object.entries(groupedVariants).map(([category, options]) => (
                      <div key={category} className="space-y-2.5">
                        <h5 className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                          Select {category}
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {options.map((opt) => {
                            const isSelected = selectedVariants[category] === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => setSelectedVariants({ ...selectedVariants, [category]: opt.name })}
                                className={`px-4 py-2 rounded-xl text-[11px] font-black tracking-wide uppercase transition-all border ${
                                  isSelected
                                    ? "text-white shadow-sm scale-[1.01]"
                                    : "bg-zinc-50/50 border-zinc-200/60 dark:border-zinc-800/80 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
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
              <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">
                    Calculated Total
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                      KES {calculatedPrices.finalPrice.toLocaleString()}
                    </span>
                    {calculatedPrices.sellingPrice && calculatedPrices.sellingPrice > calculatedPrices.finalPrice && (
                      <span className="text-xs line-through text-zinc-400 tracking-tight opacity-70">
                        KES {calculatedPrices.sellingPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddActiveCombination}
                    style={{ backgroundColor: primaryColor }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg hover:brightness-95 transition-all"
                  >
                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                    Add Combination ({currentActiveCombinationQuantity})
                  </motion.button>
                  
                  <button
                    onClick={onClose}
                    className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Dismiss
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