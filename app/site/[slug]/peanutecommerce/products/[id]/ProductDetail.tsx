/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon } from '@heroicons/react/24/solid';
import { 
  FireIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  ShoppingBagIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  LayersIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommercePeanutsLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Fallback high-end variants if options aren't provisioned yet in the database JSON fields
const DEFAULT_PEANUT_VARIANTS = [
  { category: 'Packaging', name: '250g Hand-Stamped Craft Pouch', extraPrice: 0 },
  { category: 'Packaging', name: '500g Artisanal Glass Jar', extraPrice: 450 },
  { category: 'Packaging', name: '1kg Roastery Collector Tin', extraPrice: 1100 },
];

export function ProductDetail({
  product,
  related,
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Normalize variant lists from JSON database field
  const structuralOptions = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_PEANUT_VARIANTS;
  }, [product.option]);

  // Track currently active variant user configuration selection
  const [selectedOption, setSelectedOption] = useState(structuralOptions[0]);

  // Compute quantity specifically for the active variant
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // Retrieve all variations of this specific base product currently in the cart
  const activeProductManifestInCart = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url || '/placeholder-image.png';

  // Dynamic price evaluation relative to current choice parameters
  const basePrice = product.finalPrice || product.sellingPrice || 0;
  const currentTotalPrice = basePrice + (selectedOption?.extraPrice || 0);

  // Pack item configuration payload to match context actions seamlessly
  const currentVariantPayload = useMemo(() => {
    return {
      ...product,
      selectedOption,
      // Dynamic fallback string compound mapping to safely separate keys if needed downstream
      customCartId: `${product.id}-${selectedOption?.name.toLowerCase().replace(/\s+/g, '-')}`
    };
  }, [product, selectedOption]);

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-stone-900 selection:bg-orange-200 mt-32">
      <Head>
        <title>{product.name} | Peanut Duka Premium</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* GALLERY: EARTHENWARE STYLE */}
          <div className="lg:sticky lg:top-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-[5/6] rounded-[3rem] overflow-hidden bg-white shadow-[20px_20px_60px_#e5e0da,-20px_-20px_60px_#ffffff] border border-stone-100"
            >
              <Image
                src={currentImage}
                alt={product.name}
                loader={loader}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onClick={() => setIsLightboxOpen(true)}
              />
              
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                {currentImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`h-1.5 transition-all rounded-full ${idx === mainIndex ? 'w-8 bg-orange-600' : 'w-2 bg-stone-300'}`}
                  />
                ))}
              </div>

              <div className="absolute top-8 left-8">
                <div className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                  <FireIcon className="h-4 w-4" /> Freshly Roasted
                </div>
              </div>
            </motion.div>

            {/* Nut Origin Preview */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {currentImages.slice(0, 3).map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setMainIndex(idx)}
                  className={`cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${idx === mainIndex ? 'border-orange-600 scale-95' : 'border-transparent opacity-70'}`}
                >
                  <Image src={img.url || (img as any)} alt="detail" fill className="object-cover" loader={loader} />
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT: THE ROASTERY DETAILS */}
          <div className="flex flex-col h-full pt-4 space-y-8">
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">
                <span>Shop</span> <span className="text-orange-300">/</span>
                <span>{product.productCategory?.name || 'Hand-Picked Nuts'}</span>
              </nav>

              <h1 className="text-5xl lg:text-6xl font-black text-stone-900 leading-[0.9] tracking-tighter mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
                  <StarIcon className="h-4 w-4 text-orange-500" />
                  <span className="font-bold text-sm">4.8</span>
                </div>
                <span className="text-stone-400 text-sm font-semibold uppercase tracking-wider underline decoration-orange-200 decoration-2 underline-offset-4 cursor-pointer">
                  84 Verified Reviews
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-stone-900">KSh {currentTotalPrice.toLocaleString()}</span>
              {product.sellingPrice && product.sellingPrice > currentTotalPrice && (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold">
                  SAVE {Math.round(((product.sellingPrice - currentTotalPrice) / product.sellingPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Nut Specs Grid */}
            <div className="grid grid-cols-2 gap-px bg-stone-200 border border-stone-200 rounded-3xl overflow-hidden">
              <div className="bg-white p-6 flex flex-col gap-1">
                <SparklesIcon className="h-5 w-5 text-orange-600" />
                <span className="text-[10px] font-black uppercase text-stone-400 pt-2">Selection Profile</span>
                <span className="font-bold text-stone-800 truncate">{selectedOption?.name}</span>
              </div>
              <div className="bg-white p-6 flex flex-col gap-1">
                <GlobeAltIcon className="h-5 w-5 text-orange-600" />
                <span className="text-[10px] font-black uppercase text-stone-400 pt-2">Origin</span>
                <span className="font-bold text-stone-800">{product.brand || 'Western Kenya'}</span>
              </div>
            </div>

            <p className="text-lg text-stone-600 leading-relaxed font-medium">
              {product.description || "Slow-roasted in small batches to unlock the natural oils and peak nuttiness. Perfectly salted, protein-packed, and guaranteed to satisfy your crunch cravings."}
            </p>

            {/* --- BENTO OPTION SELECTOR BLOCK --- */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-400">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-orange-600" />
                  <span>Choose Batch Variation Weight</span>
                </div>
                <span className="text-orange-600 font-extrabold">Price Shift Matrix</span>
              </div>

              <div className="space-y-2">
                {structuralOptions.map((opt: any, idx: number) => {
                  const isChosen = selectedOption?.name === opt.name;
                  const activeCountInCart = cart.find((item: any) => 
                    item.id === product.id && 
                    item.selectedOption?.name === opt.name
                  )?.quantity || 0;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        isChosen
                          ? 'border-orange-600 bg-orange-50/20 ring-1 ring-orange-600'
                          : 'border-stone-100 bg-stone-50/50 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-0.5 rounded-full border ${isChosen ? 'bg-orange-600 border-orange-600 text-white' : 'border-stone-300 text-transparent'}`}>
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-stone-800">{opt.name}</span>
                            {activeCountInCart > 0 && (
                              <span className="bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                {activeCountInCart} in basket
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">{opt.category || 'Roastery Pack'}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-stone-900">
                        {opt.extraPrice === 0 ? 'Standard Base' : `+KSh ${opt.extraPrice.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- STAGED MANIFEST: LIVE ORDER BASKET MIX OVERVIEW --- */}
            <AnimatePresence>
              {activeProductManifestInCart.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="bg-stone-900 text-stone-100 p-6 rounded-[2.5rem] shadow-xl space-y-3"
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-400">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      Active Selection Build Summary
                    </span>
                    <span className="text-orange-400 font-black">{activeProductManifestInCart.length} Unique Variant Tiers</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {activeProductManifestInCart.map((item: any, itemIdx: number) => (
                      <div key={itemIdx} className="flex items-center justify-between bg-stone-800/80 p-3.5 rounded-xl border border-stone-800 text-xs">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-200">{item.selectedOption?.name || 'Default Variant'}</span>
                          <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tight">KSh {(basePrice + (item.selectedOption?.extraPrice || 0)).toLocaleString()} each</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-stone-400 font-bold text-[10px]">Qty: {item.quantity}</span>
                          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-700">
                            <button 
                              onClick={() => decreaseQuantity(item)}
                              className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => addToCart(item)}
                              className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                            >
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTION AREA */}
            <div className="space-y-6">
              <div className="flex gap-4">
                {currentVariantQuantity > 0 ? (
                  <div className="flex items-center justify-between flex-1 bg-stone-900 text-white rounded-[2rem] p-2 shadow-xl">
                    <button 
                      onClick={() => decreaseQuantity(currentVariantPayload)} 
                      className="w-16 h-16 flex items-center justify-center hover:bg-stone-800 rounded-full transition-colors"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                      <span className="font-black text-2xl block leading-none">{currentVariantQuantity}</span>
                      <span className="text-[8px] font-black uppercase text-orange-400 tracking-widest mt-1 block">Active Batch Tier Packs</span>
                    </div>
                    <button 
                      onClick={() => addToCart(currentVariantPayload)} 
                      className="w-16 h-16 flex items-center justify-center hover:bg-stone-800 rounded-full transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToCart(currentVariantPayload)}
                    className="flex-1 h-20 bg-stone-900 text-white rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 group"
                  >
                    <ShoppingBagIcon className="h-6 w-6 text-orange-500 group-hover:rotate-12 transition-transform" />
                    Add Selected Variant To Batch
                  </motion.button>
                )}

                <button className="w-20 h-20 rounded-[2rem] border-2 border-stone-200 flex items-center justify-center text-stone-300 hover:text-orange-600 hover:border-orange-100 transition-all bg-white flex-shrink-0">
                  <HeartIcon className="h-8 w-8" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-stone-400 bg-stone-100/50 p-4 rounded-2xl border border-dashed border-stone-200">
                <ShieldCheckIcon className="h-5 w-5 text-stone-400" />
                <span>PACKED IN A PEANUT-ONLY FACILITY • NO ADDED PRESERVATIVES</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED ROASTS */}
        <div className="mt-32">
          <div className="h-px bg-stone-200 w-full mb-16" />
          <h3 className="text-3xl font-black text-stone-900 mb-10">You might also crave...</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </div>
      </div>
      
      <WhatsAppInquiry 
        productName={`${product.name} (${selectedOption?.name})`}
        productPrice={currentTotalPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}