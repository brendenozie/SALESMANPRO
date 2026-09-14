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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ProductCard({ product }: ProductCardProps) {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
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

  const activeVariantQuantity = useMemo(() => {
    return cart.find((item: any) => {
      if (hasOptions) {
        return item.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions);
      }
      return item.id === product.id;
    })?.quantity || 0;
  }, [cart, selectedOptions, product.id, hasOptions]);

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
  const message = encodeURIComponent(`Inquiry on Product SKU: ${product.id.slice(0, 8).toUpperCase()} ("${name}"). Please share availability details.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  const discount = sellingPrice && finalPrice && sellingPrice > finalPrice
    ? Math.round(((sellingPrice - finalPrice) / sellingPrice) * 100)
    : null;
    
  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const imageSrc = resolvedMedia.primaryImageUrl || 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189';

  return (
    <>
      <div className="group relative flex flex-col w-full bg-white dark:bg-[#0c0c0e] border border-zinc-200 dark:border-zinc-800/80 rounded-md overflow-hidden hover:shadow-xl transition-all duration-300">
        
        {/* --- Card Top Media Wrapper --- */}
        <div className="relative h-60 w-full overflow-hidden bg-zinc-100 dark:bg-[#121215] flex items-center justify-center">
          <Link href={`/automotiveecommerce/products/${product.id}`} className="absolute inset-0 z-10">
            <Image
              src={imageSrc}
              alt={name}
              loader={({src})=>src}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {/* Micro Tactical Status Tabs */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-20 pointer-events-none">
            {discount && (
              <span className="bg-red-600 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded-sm shadow-md uppercase tracking-tight">
                -{discount}% FLUID
              </span>
            )}
            <span className="bg-zinc-900/90 dark:bg-black/80 text-amber-400 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1 backdrop-blur-xs border-l-2 border-amber-500">
              <ShieldCheckIcon className="w-2.5 h-2.5" /> CERTIFIED
            </span>
            {resolvedMedia.hasVideo && (
              <span className="bg-amber-500 text-black font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-xs flex items-center gap-1 shadow-md">
                <VideoCameraIcon className="w-2.5 h-2.5 text-black" /> VIDEO
              </span>
            )}
          </div>

          {/* Standalone Tech Metrics Panel */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-[8px] text-amber-400 font-mono font-bold uppercase">
                <BoltIcon className="w-3 h-3" /> HEAVY DUTY
              </div>
              <div className="flex items-center gap-1 text-[8px] text-zinc-300 font-mono font-bold uppercase">
                <WrenchScrewdriverIcon className="w-3 h-3" /> TRACK-SPEC
              </div>
            </div>
            <span className="text-[8px] text-zinc-400 font-mono">ID: {product.id.slice(0, 5).toUpperCase()}</span>
          </div>
        </div>

        {/* --- Card Meta Details Base --- */}
        <div className="p-4 flex flex-col flex-grow bg-white dark:bg-[#0c0c0e]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              OEM COMPATIBLE
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase">STOCKED</span>
            </div>
          </div>

          <Link href={`/automotiveecommerce/products/${product.id}`} className="block mb-3">
            <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 line-clamp-2 uppercase tracking-tight hover:text-[var(--primary-color)] transition-colors duration-200 leading-tight">
              {name}
            </h4>
          </Link>

          <div className="mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-end justify-between">
            <div className="flex flex-col">
              {discount && (
                <span className="text-[10px] line-through text-zinc-400 font-mono">
                  KES {sellingPrice?.toLocaleString()}
                </span>
              )}
              <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tighter">
                KES {activeBasePrice.toLocaleString()}
              </span>
            </div>

            {/* Micro WhatsApp Bridge Trigger */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-[#25D366] dark:hover:text-[#25D366] rounded-md transition-colors"
              title="Direct Desk Desk Inquiry"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* --- Multi-Path Manifest Operations Footer --- */}
        <div className="px-4 pb-4 bg-white dark:bg-[#0c0c0e]">
          <AnimatePresence mode="wait">
            {totalProductQuantity > 0 ? (
              <motion.button
                key="in-manifest"
                whileTap={{ scale: 0.97 }}
                onClick={hasOptions ? openOptionSelector : handleAddToCart}
                className="w-full py-2.5 rounded-md font-mono font-black text-[10px] uppercase tracking-wider flex items-center justify-between px-3 transition-colors shadow-inner"
                style={{ backgroundColor: primaryColor, color: '#000' }}
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingBagIcon className="w-3.5 h-3.5 text-black" />
                  {hasOptions ? 'EDIT SPECS' : 'STAGED'}
                </span>
                <span className="bg-black/15 text-black text-[9px] px-1.5 py-0.5 rounded-sm font-bold">
                  QTY: {totalProductQuantity}
                </span>
              </motion.button>
            ) : (
              <motion.button
                key="add-fresh"
                whileTap={{ scale: 0.97 }}
                onClick={hasOptions ? openOptionSelector : handleAddToCart}
                className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-700 font-mono font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 rounded-md transition-colors border border-transparent dark:border-zinc-700"
              >
                <ShoppingBagIcon className="w-3.5 h-3.5" />
                {hasOptions ? 'CONFIGURE SPECS' : 'ADD TO MANIFEST'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Technical Hazard Edge Bar */}
        <div className="h-[3px] w-full flex">
          <div className="h-full w-1/3 bg-[var(--primary-color)]" />
          <div className="h-full w-1/3 bg-zinc-900" />
          <div className="h-full w-1/3 bg-[var(--primary-color)]" />
        </div>
      </div>

      {/* --- SPECIFICATION ASSIGNMENT DRAWER (MODAL) --- */}
      <AnimatePresence>
        {isModalOpen && hasOptions && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0f0f12] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col z-10 text-zinc-900 dark:text-zinc-100"
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono font-black text-amber-500 tracking-widest uppercase block mb-0.5">
                    Component Profiler
                  </span>
                  <h3 className="text-md font-black uppercase tracking-tight line-clamp-1">{name}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[45vh] overflow-y-auto">
                {Object.entries(groupedCategories).map(([optionKey, variantItems]) => (
                  <div key={optionKey} className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold uppercase text-zinc-400">
                      SET PARAMETER: {optionKey}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {variantItems.map((variant) => {
                        const isSelected = selectedOptions[optionKey] === variant.name;
                        return (
                          <button
                            key={variant.name}
                            type="button"
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [optionKey]: variant.name }))}
                            className={`p-3 text-left transition-all border rounded-md flex flex-col justify-between h-14 ${
                              isSelected
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-transparent shadow-md'
                                : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase font-sans tracking-tight">{variant.name}</span>
                            {variant.extraPrice > 0 && (
                              <span className={`text-[9px] font-mono block ${isSelected ? 'text-amber-400 dark:text-amber-600' : 'text-blue-500'}`}>
                                + KES {variant.extraPrice.toLocaleString()}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-zinc-50 dark:bg-zinc-900/20 border-t border-zinc-100 dark:border-zinc-900">
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">TOTAL CONFIG PRICE:</span>
                  <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-white font-mono">
                    KES {liveCalculatedPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 rounded-md overflow-hidden">
                    <button
                      type="button"
                      disabled={activeVariantQuantity === 0}
                      onClick={() => decreaseQuantity(currentCompositeKey)}
                      className="p-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-20"
                    >
                      <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="px-2 font-mono font-bold text-xs text-zinc-900 dark:text-white">
                      {activeVariantQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="p-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleCommitSelection}
                    className="flex-grow py-3 rounded-md font-mono font-black text-[10px] uppercase tracking-wider text-center text-white bg-zinc-900 dark:bg-white dark:text-black transition-colors"
                    style={activeVariantQuantity > 0 ? { backgroundColor: primaryColor, color: '#000' } : {}}
                  >
                    {activeVariantQuantity > 0 ? 'UPDATE MANIFEST' : 'CONFIRM SPECIFICATIONS'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}