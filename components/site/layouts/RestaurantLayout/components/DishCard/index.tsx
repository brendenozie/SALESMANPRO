'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';
import {
  ShoppingBagIcon,
  PlusIcon,
  EyeIcon,
  StarIcon,
  MinusIcon,
  FireIcon,
  ClockIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/solid';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface DishCardProps {
  dish: MarketListingForm;
}

const DishCard: React.FC<DishCardProps> = React.memo(({ dish }) => {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const { storeFormData } = useStoreContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // 1. Safe Processing of Culinary Variant Arrays
  const rawOptions = dish.option;
  const activeVariants = useMemo(() => {
    if (!rawOptions) return [];
    if (typeof rawOptions === 'string') {
      try {
        return JSON.parse(rawOptions) as VariantOptionItem[];
      } catch {
        return [];
      }
    }
    return rawOptions as VariantOptionItem[];
  }, [rawOptions]);

  // Group variant sub-items by category
  const groupedOptions = useMemo(() => {
    const groups: Record<string, string[]> = {};
    activeVariants.forEach((v) => {
      if (!groups[v.category]) groups[v.category] = [];
      if (!groups[v.category].includes(v.name)) {
        groups[v.category].push(v.name);
      }
    });
    return groups;
  }, [activeVariants]);

  const hasOptions = Object.keys(groupedOptions).length > 0;

  // 2. Hydrate Default Variants Setup
  useEffect(() => {
    if (hasOptions) {
      const initial: Record<string, string> = {};
      Object.entries(groupedOptions).forEach(([category, names]) => {
        if (names.length > 0) initial[category] = names[0];
      });
      setSelectedOptions(initial);
    }
  }, [groupedOptions, hasOptions]);

  // 3. Accumulate Dynamic Surcharge Configurations
  const totalSurcharge = useMemo(() => {
    let surcharge = 0;
    Object.entries(selectedOptions).forEach(([cat, val]) => {
      const match = activeVariants.find((v) => v.category === cat && v.name === val);
      if (match) surcharge += match.extraPrice || 0;
    });
    return surcharge;
  }, [selectedOptions, activeVariants]);

  const currentFinalPrice = (dish.finalPrice ?? 0) + totalSurcharge;
  const currentSellingPrice = (dish.sellingPrice ?? 0) + totalSurcharge;

  // 4. Matrix Generation for Match Signatures
  const currentKeySignature = hasOptions && Object.keys(selectedOptions).length > 0
    ? `${dish.id}-${Object.entries(selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
    : dish.id;

  // Find exact configuration state count matches
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => {
      const itemKey = item.cartItemId || (item.selectedOptions
        ? `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
        : item.id);
      return itemKey === currentKeySignature;
    })?.quantity || 0;
  }, [cart, currentKeySignature]);

  // Compute full global volume of basic product matches in plate
  const totalDishQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === dish.id)
      .reduce((sum: number, item: any) => sum + item.quantity, 0);
  }, [cart, dish.id]);

  // WhatsApp "Kitchen Concierge" Configuration
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const customMessage = encodeURIComponent(
    `DIETARY INQUIRY: I'm looking at the "${dish.name}" configured with: ${
      Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Standard Build'
    }. Total Evaluated Price: Kes ${currentFinalPrice.toLocaleString()}. Could the chef let me know if this can be prepared gluten-free or without nuts?`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${customMessage}`;

  const handleActionDispatch = () => {
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addToCart({ ...dish, finalPrice: currentFinalPrice, sellingPrice: currentSellingPrice });
    }
  };

  const handleCommitSelection = () => {
    addToCart({
      ...dish,
      finalPrice: currentFinalPrice,
      sellingPrice: currentSellingPrice,
      cartItemId: currentKeySignature,
      selectedOptions: { ...selectedOptions }
    });
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative flex flex-col bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] p-4 border border-transparent hover:border-orange-500/20 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-500 hover:shadow-2xl"
      >
        {/* Image Core Layer */}
        <div className="relative aspect-[16/11] w-full rounded-[2rem] overflow-hidden mb-6 shadow-inner z-0">
          <Image
            src={dish.images?.[0] || "/placeholder-food.jpg"}
            alt={dish.name}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-95 group-hover:brightness-105"
          />
          
          {/* Floating Culinary Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-3 py-2 rounded-full flex items-center gap-1.5 shadow-lg hover:bg-green-600 transition-colors"
              title="Ask Kitchen Concierge"
            >
              <WhatsAppIcon className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Order On Whatsapp</span>
            </a>
          </div>

          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-orange-100 dark:border-zinc-800">
              <FireIcon className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Bestseller</span>
            </div>
            <div className="bg-green-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <HandThumbUpIcon className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Fresh Prep</span>
            </div>
          </div>

          {/* View Recipe Portal Overlay Trigger */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
            <button 
              onClick={() => window.open(`/restaurent/products/${dish.id}`, '_blank')}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-2xl hover:bg-orange-500 hover:text-white transition-all"
              title="View Recipe Details"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Details Deck */}
        <div className="px-2 pb-2 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[1.1] h-14 overflow-hidden group-hover:text-orange-600 transition-colors">
              {dish.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full shadow-md">
              <StarIcon className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-black">4.9</span>
            </div>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-6 font-medium leading-relaxed italic">
            "{dish.description || "A symphony of seasonal flavors curated by our master chef."}"
          </p>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <ClockIcon className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Ready: 15m</span>
              </div>
              <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Hot Serve</span>
            </div>
            
            <div className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
              <span className="text-[10px] font-bold mr-1 text-orange-500 uppercase">Kes</span>
              {currentFinalPrice.toLocaleString()}
            </div>
          </div>

          {/* Interactive Action Pod Block */}
          <div className="mt-auto">
            <AnimatePresence mode="wait">
              {hasOptions ? (
                /* Variant Selector Workspace Button */
                <motion.button
                  key="configure"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleActionDispatch}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  {totalDishQuantity > 0 ? `Customize Build (${totalDishQuantity} on Plate)` : 'Customize Dish'}
                </motion.button>
              ) : totalDishQuantity > 0 ? (
                /* Standard counter controls when no variants exist */
                <motion.div 
                  key="qty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center justify-between bg-zinc-900 dark:bg-orange-600 rounded-2xl p-1.5 shadow-xl"
                >
                  <button 
                    onClick={() => decreaseQuantity(currentKeySignature, selectedOptions)} 
                    className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-white">{totalDishQuantity} Portion{totalDishQuantity > 1 ? 's' : ''}</span>
                    <span className="text-[7px] font-black text-white/70 uppercase tracking-[0.2em]">In your Plate</span>
                  </div>
                  <button 
                    onClick={handleCommitSelection} 
                    className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                /* Standard Immediate Buy Direct Add Trigger Button */
                <motion.button
                  key="add"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleActionDispatch}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white transition-all"
                >
                  <ShoppingBagIcon className="w-4 h-4" />
                  Add to Order
                </motion.button>
              )}
            </AnimatePresence>

            {/* Order On Line Linkage */}
            <div className="mt-3 flex items-center justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex uppercase items-center gap-1 text-sm text-[#25D366] hover:underline transition-all font-bold"
              >
                <WhatsAppIcon className="w-4 h-4" /> Order Via WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Heatwave detail underline ring asset accent */}
        <div className="absolute -bottom-1 inset-x-12 h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent blur-sm" />
      </motion.div>

      {/* Culinary Recipe Configuration Modal Workspace */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="relative w-full max-w-md overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] p-8 shadow-2xl z-10 text-zinc-900 dark:text-zinc-100"
            >
              {/* Header section layout details */}
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5 mb-6">
                <div>
                  <span className="text-[9px] font-black tracking-[0.2em] text-orange-600 uppercase">Chef Spec Customization</span>
                  <h3 className="text-2xl font-black tracking-tight mt-1">{dish.name}</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Map Generation Loop for Food Specifications Variants Matrix */}
              <div className="space-y-6 max-h-[45vh] overflow-y-auto pr-1">
                {Object.entries(groupedOptions).map(([optionKey, values]) => (
                  <div key={optionKey} className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 block">
                      Choose Your {optionKey}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {values.map((val) => {
                        const isSelected = selectedOptions[optionKey] === val;
                        const matchingVariant = activeVariants.find((v) => v.category === optionKey && v.name === val);
                        const extraPrice = matchingVariant?.extraPrice || 0;

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSelectedOptions((prev) => ({ ...prev, [optionKey]: val }))}
                            className={`p-3.5 text-left border text-xs font-bold uppercase transition-all flex flex-col justify-between tracking-tight rounded-2xl min-h-[68px] ${
                              isSelected
                                ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/10'
                                : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{val}</span>
                              {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3] flex-shrink-0 ml-2" />}
                            </div>
                            {extraPrice > 0 && (
                              <span className={`text-[9px] mt-1 font-medium tracking-normal normal-case ${isSelected ? 'text-orange-100' : 'text-orange-600'}`}>
                                + Kes {extraPrice.toLocaleString()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Commit Workspace Controls Deck footer block */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-6 mt-6 space-y-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Calculated Prep Price:</span>
                  <div className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">
                    <span className="text-xs font-bold mr-1 text-orange-500 uppercase">Kes</span>
                    {currentFinalPrice.toLocaleString()}
                  </div>
                </div>

                {currentVariantQuantity === 0 ? (
                  <button
                    onClick={handleCommitSelection}
                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-[0.25em] text-[10px] rounded-2xl transition-all shadow-xl hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white active:scale-[0.99]"
                  >
                    Add Custom Mix To Order
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-100 dark:border-zinc-800 w-full shadow-inner">
                    <button 
                      onClick={() => decreaseQuantity(currentKeySignature, selectedOptions)} 
                      className="p-3 text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors flex justify-center items-center flex-1"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="font-black text-xs tracking-widest text-zinc-900 dark:text-zinc-100 px-4 text-center select-none flex-shrink-0">
                      IN BAG: {currentVariantQuantity}
                    </span>
                    <button 
                      onClick={handleCommitSelection} 
                      className="p-3 text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-xl transition-colors flex justify-center items-center flex-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});

DishCard.displayName = 'DishCard';

export default DishCard;