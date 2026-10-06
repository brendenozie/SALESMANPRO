'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  BoltIcon,
  XMarkIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { MarketListingForm, VariantOptionItem } from '@/types/typings';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { resolveProductMedia } from '@/lib/product-media-resolver';
import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  product: MarketListingForm;
}

const loader = ({ src }: { src: string }) => src;

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B';
  const { name, images, finalPrice, sellingPrice, option } = product;

  const rawOptionsList = useMemo(() => (option || []) as VariantOptionItem[], [option]);

  const groupedCategories = useMemo(() => {
    const groups: Record<string, VariantOptionItem[]> = {};
    rawOptionsList.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [rawOptionsList]);

  const hasOptions = Object.keys(groupedCategories).length > 0;

  const currentSurcharge = useMemo(() => {
    let totalSurcharge = 0;
    Object.entries(selectedOptions).forEach(([catKey, chosenVal]) => {
      const match = groupedCategories[catKey]?.find((v) => v.name === chosenVal);
      if (match) totalSurcharge += match.extraPrice || 0;
    });
    return totalSurcharge;
  }, [selectedOptions, groupedCategories]);

  const activeBasePrice = finalPrice ?? sellingPrice ?? 0;
  const liveCalculatedPrice = activeBasePrice + currentSurcharge;

  const currentCompositeKey = useMemo(() => {
    if (!hasOptions) return product.id;
    const sortedOptions = Object.keys(selectedOptions)
      .sort()
      .reduce((acc, key) => ({ ...acc, [key]: selectedOptions[key] }), {});
    return `${product.id}-${JSON.stringify(sortedOptions)}`;
  }, [selectedOptions, product.id, hasOptions]);

  const totalProductQuantity = useMemo(() => {
    return cart
      .filter((item: any) => item.id === product.id)
      .reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
  }, [cart, product.id]);

  const openOptionSelector = () => {
    if (hasOptions) {
      const defaults: Record<string, string> = {};
      Object.entries(groupedCategories).forEach(([category, variants]) => {
        if (variants.length > 0) defaults[category] = variants[0].name;
      });
      setSelectedOptions(defaults);
    }
    setIsModalOpen(true);
  };

  const handleAddToCart = () => {
    addToCart({
      ...product,
      uid: currentCompositeKey,
      finalPrice: liveCalculatedPrice,
      selectedOptions: hasOptions ? { ...selectedOptions } : undefined
    });
  };

  const handleCommitSelection = () => {
    handleAddToCart();
    setIsModalOpen(false);
  };

  const whatsappNumber = `${storeFormData?.contactPhone || "254732771353"}`;
  const message = encodeURIComponent(`Inquiry on SKU: ${product.id.slice(0, 8).toUpperCase()} ("${name}"). Looking for current availability status.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative flex flex-col bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-lg overflow-hidden transition-all duration-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-xl text-zinc-900 dark:text-zinc-100"
      >
        {/* Visual Frame Image Cover Wrapper */}
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100/60 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-center p-6">
          <Link href={`/hardwareecommerce/products/${product.id}`} className="absolute inset-0 z-10">
            <Image decoding="async"
              src={imageSrc}
              alt={name}
              fill
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Badges Layout Layer */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
            {discount && (
              <div className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-sm tracking-tight uppercase">
                -{discount}% VALUE
              </div>
            )}
            <div className="bg-zinc-950 dark:bg-white text-white dark:text-black text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1 border border-zinc-800 dark:border-zinc-200">
               <ShieldCheckIcon className="w-2.5 h-2.5 text-green-500" />
               VERIFIED
            </div>
            {resolvedMedia.hasVideo && (
              <div className="bg-amber-500 text-black text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1 shadow-sm">
                <VideoCameraIcon className="w-2.5 h-2.5 text-black" />
                VIDEO
              </div>
            )}
          </div>

          {/* WhatsApp Quick Action Ring */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-20 p-2 bg-white dark:bg-zinc-900 shadow-md text-[#25D366] rounded-full border border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-950 dark:hover:bg-white group-hover:scale-110 duration-300"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" />
          </a>

          {/* Hover Specifications Slide Overlay */}
          <div className="absolute bottom-0 left-0 w-full bg-zinc-950/90 backdrop-blur-md py-2 px-3 flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 font-mono text-[9px]">
            <div className="flex gap-2.5 text-zinc-300">
               <div className="flex items-center gap-1">
                  <BoltIcon className="w-3 h-3 text-amber-400" />
                  <span>HEAVY DUTY</span>
               </div>
            </div>
            <span className="text-zinc-500">ID: {product.id.slice(0, 5).toUpperCase()}</span>
          </div>
        </div>

        {/* Dynamic Card Info Content */}
        <div className="p-4 flex flex-col flex-grow bg-white dark:bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-1">
             <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
               Hardware Supply
             </span>
             <div className="flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
               <span className="text-[9px] font-semibold text-zinc-400 uppercase">Stocked</span>
             </div>
          </div>

          <Link href={`/hardwareecommerce/products/${product.id}`} className="mb-3">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight line-clamp-1 group-hover:text-amber-500 transition-colors duration-200">
              {name}
            </h4>
          </Link>

          <div className="mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-lg font-black text-zinc-950 dark:text-white tabular-nums tracking-tight">
                Kes {activeBasePrice.toLocaleString()}
              </span>
              {discount && (
                <span className="text-[10px] line-through text-zinc-400 font-medium tracking-tight">
                  Kes {sellingPrice?.toLocaleString()}
                </span>
              )}
            </div>

            {/* Micro-Interaction Requisition Action Trigger */}
            <div className="w-1/2">
              <AnimatePresence mode="wait">
                {totalProductQuantity > 0 ? (
                  <motion.button 
                    key="active-manifest"
                    whileTap={{ scale: 0.95 }}
                    onClick={hasOptions ? openOptionSelector : handleAddToCart}
                    className="w-full py-2.5 rounded text-black font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingBagIcon className="w-3.5 h-3.5" />
                    <span>In Cart ({totalProductQuantity})</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="idle-manifest"
                    whileTap={{ scale: 0.95 }}
                    onClick={hasOptions ? openOptionSelector : handleAddToCart}
                    className="w-full py-2.5 rounded bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>{hasOptions ? 'Configure' : 'Add'}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- SPECIFICATION SELECTION MODAL --- */}
      <AnimatePresence>
        {isModalOpen && hasOptions && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            />

            {/* Modal Architecture Frame Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col z-10 text-zinc-900 dark:text-white"
            >
              {/* Box Top Header */}
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-black tracking-widest text-zinc-400 block mb-0.5">SPECIFICATION PANEL</span>
                  <h3 className="text-md font-bold uppercase tracking-tight line-clamp-1">{name}</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors border border-zinc-200 dark:border-zinc-800 rounded"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Selection Content Scroller Loop */}
              <div className="p-5 space-y-4 max-h-[40vh] overflow-y-auto">
                {Object.entries(groupedCategories).map(([optionKey, variantItems]) => (
                  <div key={optionKey} className="space-y-2">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Select {optionKey}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {variantItems.map((variant) => {
                        const isSelected = selectedOptions[optionKey] === variant.name;
                        return (
                          <button
                            key={variant.name}
                            type="button"
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [optionKey]: variant.name }))}
                            className={`p-3 text-xs font-bold uppercase tracking-tight text-left transition-all border rounded flex flex-col justify-between h-14 ${
                              isSelected
                                ? 'bg-zinc-950 text-white dark:bg-white dark:text-black border-zinc-950 dark:border-white shadow-md'
                                : 'bg-zinc-50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                            }`}
                          >
                            <span>{variant.name}</span>
                            {variant.extraPrice > 0 && (
                              <span className={`text-[9px] block font-mono ${isSelected ? 'text-amber-400 dark:text-zinc-600' : 'text-blue-600 dark:text-blue-400'}`}>
                                + Kes {variant.extraPrice.toLocaleString()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Footer Pricing Breakdown */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-800/80 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-zinc-400">Total Adjusted Cost:</span>
                  <div className="text-right">
                    <span className="text-xl font-black tracking-tight tabular-nums">
                      Kes {liveCalculatedPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCommitSelection}
                  className="w-full py-3 rounded text-black font-black text-xs uppercase tracking-widest transition-transform active:scale-98 shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  Confirm Specifications
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}