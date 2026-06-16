/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  HandThumbUpIcon, 
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CpuChipIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon, PlusIcon, MinusIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Fallback industrial option definitions if product.option array is empty in MongoDB
const DEFAULT_HARDWARE_OPTIONS = [
  { category: 'Grade & Build', name: 'Standard Carbon Steel', extraPrice: 0 },
  { category: 'Grade & Build', name: 'Pro-Series Reinforced Alloy', extraPrice: 1850 },
  { category: 'Grade & Build', name: 'Industrial Titanium Coated', extraPrice: 4200 },
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

  // Parse structured configuration options from database or use precision hardware fallbacks
  const availableOptions = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_HARDWARE_OPTIONS;
  }, [product.option]);

  // Tracks the active variation combination selected by the user
  const [selectedOption, setSelectedOption] = useState(availableOptions[0]);

  // Computes active variant quantity in cart using a composite match key
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // Filters out all instances/variations of this specific base product inside the cart
  const stagedProductVariants = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

  const currentImages = (product.images as any[])?.length ? product.images : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url || '/placeholder.png';

  // Dynamic price evaluation factoring the specific variant selection modifier
  const basePrice = product.finalPrice || product.sellingPrice || 0;
  const variantTotalPrice = basePrice + (selectedOption?.extraPrice || 0);

  // Encapsulates a distinct composite payload for mutation/addition handling in context layer
  const variantPayload = {
    ...product,
    selectedOption,
    customCartId: `${product.id}-${selectedOption?.name.replace(/\s+/g, '-').toLowerCase()}`
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-800 min-h-screen pb-20 font-sans antialiased">
      <Head>
        <title>{product.name} | Premium Industrial & Hardware Solutions</title>
      </Head>

      {/* --- PREMIUM FLOATING BREADCRUMB --- */}
      <nav className="max-w-7xl mx-auto px-4 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/[0.02] backdrop-blur-md rounded-xl border border-slate-200/60 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <span>Hardware & Tools</span> <span className="text-slate-300">/</span> 
          <span>{product.productCategory?.name || 'Equipment'}</span> <span className="text-slate-300">/</span>
          <span className="text-amber-600">{product.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        
        {/* LEFT: STUDIO SHOWCASE GALLERY (Col 1-7) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.02)] group flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full p-12 relative flex items-center justify-center"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            
            <button className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-md rounded-xl border border-slate-100 shadow-sm hover:text-amber-500 transition-colors z-10">
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Precision Navigation Thumbnails */}
          <div className="flex gap-3 overflow-x-auto py-1">
            {currentImages.map((img: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition-all duration-200 flex-shrink-0 ${
                  mainIndex === idx ? 'border-slate-800 scale-105 shadow-md' : 'border-slate-200/60 opacity-70 hover:opacity-100'
                }`}
              >
                <Image src={img.url || img} alt="thumb" loader={loader} fill className="object-cover p-1.5" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: SPECIFICATION & VARIANT MATRIX (Col 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3.5 w-3.5" />)}
              </div>
              <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">(4.9/5 • 180+ Verified Trades)</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                KES {variantTotalPrice.toLocaleString()}
              </span>
              {product.sellingPrice > (product.finalPrice || 0) && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-black tracking-wider uppercase">
                  Save KES {(product.sellingPrice - (product.finalPrice || 0)).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {product.description && (
            <p className="text-slate-500 text-sm leading-relaxed font-medium">
              {product.description}
            </p>
          )}

          {/* RUGGED BENTO SELECTION PICKER */}
          <section className="space-y-2.5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-1.5">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-500" />
                <span>Configure Component Variant</span>
              </div>
              <span className="text-amber-600 font-bold">Options Available</span>
            </div>
            
            <div className="space-y-2">
              {availableOptions.map((opt: any, index: number) => {
                const isSelected = selectedOption?.name === opt.name;
                const specificQty = cart.find((item: any) => 
                  item.id === product.id && 
                  item.selectedOption?.name === opt.name
                )?.quantity || 0;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-slate-800 bg-slate-900/[0.01] ring-1 ring-slate-800 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-0.5 rounded-md border ${isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 text-transparent'}`}>
                        <CheckIcon className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{opt.name}</span>
                          {specificQty > 0 && (
                            <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              {specificQty} in kit
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{opt.category || 'Specification'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      {opt.extraPrice === 0 ? 'Base Pricing' : `+KES ${opt.extraPrice.toLocaleString()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* DYNAMIC STAGED MIX OVERVIEW (Shows assorted item configurations concurrently) */}
          <AnimatePresence>
            {stagedProductVariants.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3 shadow-inner"
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1"><ArrowPathIcon className="w-3 h-3 animate-spin text-amber-500" /> Current Manifest Mix</span>
                  <span className="text-amber-500 font-black">{stagedProductVariants.length} Active Config(s)</span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
                  {stagedProductVariants.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700/60 text-xs">
                      <span className="font-medium text-slate-200 tracking-wide">{item.selectedOption?.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-black text-[11px]">Qty: {item.quantity}</span>
                        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-700">
                          <button 
                            onClick={() => decreaseQuantity(item)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <MinusIcon className="w-3 h-3 stroke-[2.5]" />
                          </button>
                          <button 
                            onClick={() => addToCart(item)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          >
                            <PlusIcon className="w-3 h-3 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- INDUSTRIAL SPEC BADGES BENTO --- */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Industrial Grade', icon: WrenchScrewdriverIcon, style: 'bg-slate-100 border border-slate-200 text-slate-700' },
              { label: 'Heavy Duty', icon: BoltIcon, style: 'bg-slate-100 border border-slate-200 text-slate-700' },
              { label: 'Contractor Certified', icon: ShieldCheckIcon, style: 'bg-slate-100 border border-slate-200 text-slate-700' },
              { label: 'Laser Precise', icon: CpuChipIcon, style: 'bg-slate-100 border border-slate-200 text-slate-700' },
            ].map((item, i) => (
              <div key={i} className={`${item.style} p-3 rounded-xl flex items-center gap-3`}>
                <item.icon className="h-5 w-5 opacity-80 flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>

          {/* --- TRANSACTION CTA HUB --- */}
          <div className="pt-2 space-y-4">
            {currentVariantQuantity > 0 ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-300 shadow-sm">
                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  onClick={() => decreaseQuantity(variantPayload)} 
                  className="h-12 w-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                >
                  <MinusIcon className="h-5 w-5 stroke-[2.5]" />
                </motion.button>
                <div className="text-center">
                  <span className="text-lg font-black text-slate-900 block leading-none">{currentVariantQuantity}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Active Assembly Qty</span>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  onClick={() => addToCart(variantPayload)} 
                  className="h-12 w-12 flex items-center justify-center bg-slate-900 hover:bg-slate-800 rounded-lg text-white transition-colors"
                >
                  <PlusIcon className="h-5 w-5 stroke-[2.5]" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => addToCart(variantPayload)}
                className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-wider shadow-md shadow-amber-500/10 transition-all"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Add Variation to Order
              </motion.button>
            )}
            
            <div className="flex items-center justify-center gap-5 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                Next-Day Site Delivery
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                Warranty Backed
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- INDUSTRIAL ASSURANCE BANNER --- */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-800/[0.4] rounded-full blur-2xl pointer-events-none" />
          
          <WrenchScrewdriverIcon className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black text-white tracking-tight">Built for Ultimate Field Performance</h2>
          <p className="max-w-2xl mx-auto text-slate-400 text-xs leading-relaxed font-medium">
            Every technical component sourced for the Hardware Duka conforms directly to global industrial deployment standards. Secure premium equipment accompanied by valid merchant verification frameworks.
          </p>
          <div className="pt-2">
             <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition-all tracking-wider uppercase">
                Download Technical Specifications
             </button>
          </div>
        </div>
      </section>

      <WhatsAppInquiry 
        productName={`${product.name} (${selectedOption?.name})`}
        productPrice={variantTotalPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}