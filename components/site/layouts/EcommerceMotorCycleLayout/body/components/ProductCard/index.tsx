'use client';

import { MinusIcon, PlusIcon, StarIcon, ShoppingBagIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import React, { useState, useEffect, useMemo } from 'react';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { motion, AnimatePresence } from 'framer-motion';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import Image from 'next/image';
import { resolveProductMedia } from '@/lib/product-media-resolver';

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ProductCard: React.FC<{ product: MarketListingForm }> = ({ product }) => {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
  const { storeFormData } = useStoreContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const { name, images, finalPrice, sellingPrice } = product;

  // 1. Process variants safely based on the unified array model
  const rawOptions = product.option;
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

  // Group items by category to render matching layout groups
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

  // 2. Initialize default configurations safely on layout pass
  useEffect(() => {
    if (hasOptions) {
      const initial: Record<string, string> = {};
      Object.entries(groupedOptions).forEach(([cat, names]) => {
        if (names.length > 0) initial[cat] = names[0];
      });
      setSelectedOptions(initial);
    }
  }, [groupedOptions, hasOptions]);

  // 3. Dynamic surcharge pricing accumulation calculation
  const totalSurcharge = useMemo(() => {
    let surcharge = 0;
    Object.entries(selectedOptions).forEach(([cat, val]) => {
      const match = activeVariants.find(v => v.category === cat && v.name === val);
      if (match) surcharge += match.extraPrice || 0;
    });
    return surcharge;
  }, [selectedOptions, activeVariants]);

  const currentFinalPrice = (finalPrice ?? 0) + totalSurcharge;
  const currentSellingPrice = (sellingPrice ?? 0) + totalSurcharge;

  // 4. Stable and deterministic key matching configuration signature
  const currentKeySignature = hasOptions && Object.keys(selectedOptions).length > 0
    ? `${product.id}-${Object.entries(selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
    : product.id;

  // Track quantity for the CURRENT variant configuration state
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => {
      const itemKey = item.cartItemId || (item.selectedOptions
        ? `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
        : item.id);
      return itemKey === currentKeySignature;
    })?.quantity || 0;
  }, [cart, currentKeySignature]);

  // Calculate global total quantities of this product ID across all variations
  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((sum: number, item: any) => sum + item.quantity, 0);
  }, [cart, product.id]);

  // WhatsApp Showroom Link configuration
  const whatsappNumber = `${storeFormData?.contactPhone || "254732 771 353"}`;
  const whatsappMsg = encodeURIComponent(`EXECUTIVE INQUIRY: I am looking at the "${name}" with configuration options: ${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Standard'}. Total pricing evaluated: Kes ${currentFinalPrice.toLocaleString()}.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://via.placeholder.com/600';

  const handleOpenSelector = () => {
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addToCart({ ...product, finalPrice: currentFinalPrice, sellingPrice: currentSellingPrice });
    }
  };

  const handleCommitSelection = () => {
    addToCart({
      ...product,
      finalPrice: currentFinalPrice,
      sellingPrice: currentSellingPrice,
      cartItemId: currentKeySignature,
      selectedOptions: { ...selectedOptions }
    });
  };

  return (
    <>
      <div className="group bg-transparent">
        {/* Image Display Wrapper Frame */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f9f9f9] dark:bg-stone-900 rounded-sm mb-6 border border-stone-100 dark:border-stone-800/50">
          <Link href={`/motorcycleecommerce/products/${product.id}`}>
            <Image
              src={imageSrc}
              alt={name}
              loader={loader}
              fill
              className="object-cover grayscale-[20%] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {resolvedMedia.hasVideo && (
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 shadow-xl border-l-2 border-[#c5a059] flex items-center gap-1.5 text-white">
                <VideoCameraIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Video</span>
              </div>
            )}
            {currentSellingPrice > currentFinalPrice && (
              <div className="bg-black text-white px-3 py-1.5 shadow-xl border-l-2 border-[#c5a059]">
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase">Limited Edition</p>
              </div>
            )}
            <div className="bg-white/90 dark:bg-stone-950/90 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 shadow-sm border border-stone-100 dark:border-stone-800">
               <CheckBadgeIcon className="w-3 h-3 text-[#c5a059]" />
               <span className="text-[8px] font-black uppercase tracking-tighter text-stone-600 dark:text-stone-400">Certified Authentic</span>
            </div>
          </div>

          {/* WhatsApp Action Link */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-4 z-20 p-2.5 bg-white dark:bg-stone-900 shadow-2xl text-[#25D366] rounded-full transition-all duration-500 hover:scale-110 border border-stone-100 dark:border-stone-800"
            title="Speak with a Consultant"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </a>

          {/* Interaction Slide-Up Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {hasOptions ? (
              /* Prioritize Option Modal Portal when variant options exist */
              <button
                onClick={handleOpenSelector}
                className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#c5a059] hover:text-white transition-all duration-300 shadow-xl"
              >
                <ShoppingBagIcon className="w-4 h-4" /> 
                {totalProductQuantity > 0 ? `Configure Build (${totalProductQuantity} in Bag)` : 'Configure Build'}
              </button>
            ) : totalProductQuantity === 0 ? (
              /* Standard Direct-to-Bag flow if no sub-options exist */
              <button
                onClick={handleOpenSelector}
                className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#c5a059] hover:text-white transition-all duration-300"
              >
                <ShoppingBagIcon className="w-4 h-4" /> Secure Purchase
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-1 shadow-2xl border border-stone-200 dark:border-stone-800">
                <button 
                  onClick={() => decreaseQuantity(currentKeySignature, selectedOptions)} 
                  className="p-3 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="font-black text-xs tracking-widest text-stone-900 dark:text-stone-100">BAG: {totalProductQuantity}</span>
                <button 
                  onClick={handleCommitSelection} 
                  className="p-3 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Metadata Deck Layout */}
        <div className="text-center px-4">
          <div className="flex justify-center items-center gap-1.5 mb-3">
              <div className="flex text-[#c5a059]">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-2.5 h-2.5 fill-current" />)}
              </div>
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest border-l border-stone-200 dark:border-stone-800 pl-2">Premium Rating</span>
          </div>
          
          <Link href={`/motorcycleecommerce/products/${product.id}`}>
            <h4 className="text-lg font-serif italic text-stone-900 dark:text-stone-100 group-hover:text-[#c5a059] transition-colors duration-500 line-clamp-1">
              {name}
            </h4>
          </Link>

          <div className="mt-3 flex items-baseline justify-center gap-3">
            <span className="text-xl font-light tracking-[0.1em] text-stone-900 dark:text-white">
              Kes {currentFinalPrice.toLocaleString()}
            </span>
            {currentSellingPrice > currentFinalPrice && (
              <span className="text-xs line-through text-stone-300 dark:text-stone-600 font-medium">
                Kes {currentSellingPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-4 flex justify-center">
              <a 
                href={whatsappUrl} 
                target="_blank"
                className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 hover:text-black dark:hover:text-white transition-colors py-2 border-b border-transparent hover:border-[#c5a059] flex gap-1"
              >
                <WhatsAppIcon className="w-3 h-3 inline-block mr-1" /> Order Via Whatsapp
              </a>
          </div>
        </div>
      </div>

      {/* Configuration Customizer Modal Window Workspace */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-md overflow-hidden bg-white dark:bg-[#0D0D0D] border border-stone-200 dark:border-stone-800 rounded-none p-8 shadow-2xl z-10 text-stone-900 dark:text-stone-100"
            >
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-stone-100 dark:border-stone-900 pb-5 mb-6">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#c5a059] uppercase">Bespoke Specifications</span>
                  <h3 className="text-xl font-serif italic mt-1">{name}</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic Categories Mapping Layout Matrix */}
              <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
                {Object.entries(groupedOptions).map(([optionKey, values]) => (
                  <div key={optionKey} className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-400 block">
                      Select {optionKey}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {values.map((val) => {
                        const isSelected = selectedOptions[optionKey] === val;
                        
                        // Discover surcharge adjustment label information context
                        const matchingVariant = activeVariants.find(v => v.category === optionKey && v.name === val);
                        const extraPrice = matchingVariant?.extraPrice || 0;

                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [optionKey]: val }))}
                            className={`p-3 text-left border text-[11px] font-bold uppercase transition-all flex flex-col justify-between tracking-wider rounded-none min-h-[62px] ${
                              isSelected
                                ? 'bg-black dark:bg-[#c5a059] border-black dark:border-[#c5a059] text-white'
                                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="truncate">{val}</span>
                              {isSelected && <CheckIcon className="w-3.5 h-3.5 text-white stroke-[3] flex-shrink-0 ml-2" />}
                            </div>
                            {extraPrice > 0 && (
                              <span className={`text-[9px] mt-1 tracking-normal normal-case font-normal ${isSelected ? 'text-stone-200' : 'text-[#c5a059]'}`}>
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

              {/* Save Selection and Actions Configuration Deck */}
              <div className="border-t border-stone-100 dark:border-stone-900 pt-6 mt-6 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Calculated Build Subtotal:</span>
                  <span className="text-xl font-light tracking-wide">Kes {currentFinalPrice.toLocaleString()}</span>
                </div>

                {currentVariantQuantity === 0 ? (
                  <button
                    onClick={handleCommitSelection}
                    className="w-full py-4 bg-[#1a1a1a] hover:bg-[#c5a059] dark:bg-stone-900 dark:hover:bg-[#c5a059] text-white font-black uppercase tracking-[0.25em] text-[10px] transition-all shadow-xl active:scale-[0.99]"
                  >
                    Add Configured Build to Bag
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-900 p-1 border border-stone-200 dark:border-stone-800 w-full shadow-inner">
                    <button 
                      onClick={() => decreaseQuantity(currentKeySignature, selectedOptions)} 
                      className="p-3.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex justify-center items-center flex-1"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="font-black text-[10px] tracking-widest text-stone-900 dark:text-stone-100 px-4 text-center select-none flex-shrink-0">
                      IN BAG: {currentVariantQuantity}
                    </span>
                    <button 
                      onClick={handleCommitSelection} 
                      className="p-3.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex justify-center items-center flex-1"
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
};

export default ProductCard;