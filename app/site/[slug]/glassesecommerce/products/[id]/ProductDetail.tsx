/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, EyeIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { 
  CheckBadgeIcon, 
  ArrowsPointingOutIcon, 
  SunIcon, 
  BeakerIcon,
  SparklesIcon, 
  HashtagIcon,
  CheckIcon,
  InformationCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceGlassesLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const LENS_OPTIONS = [
  { id: 'clear', name: 'Standard Clear', price: 0, description: 'Anti-reflective coating included.', icon: <BeakerIcon className="w-5 h-5" /> },
  { id: 'blue', name: 'Blue Light Shield', price: 1500, description: 'Protects against digital eye strain.', icon: <SparklesIcon className="w-5 h-5" /> },
  { id: 'sun', name: 'Photochromic', price: 3500, description: 'Transitions to dark in sunlight.', icon: <SunIcon className="w-5 h-5" /> },
];

const loader = ({ src }: { src: string }) => src;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [selectedLens, setSelectedLens] = useState(LENS_OPTIONS[0]);

  // Track quantity for the currently active variant combination
  const currentVariantQuantity = useMemo(() => {
    return cart.find(
      (item: any) => item.id === product.id && item.selectedLens?.id === selectedLens.id
    )?.quantity || 0;
  }, [cart, product.id, selectedLens.id]);

  // Aggregate all configurations of this product currently in the selection list
  const activeProductVariants = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

    const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];

  const totalPrice = (product.finalPrice || 0) + selectedLens.price;

  // Build a distinct payload ensuring mutation checks read both properties
  const variantPayload = {
    ...product,
    selectedLens,
    // Add a unique identifier combining properties if context requires a fallback match key
    customCartId: `${product.id}-${selectedLens.id}`
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-500 font-sans">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-screen relative">
        
        {/* --- LEFT: IMMERSIVE VISUAL STAGE --- */}
        <div className="w-full lg:w-3/5 lg:sticky lg:top-0 h-[60vh] lg:h-screen flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden">
          {/* Animated Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-zinc-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative w-full max-w-2xl aspect-[16/10] group">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full relative"
              >
                <Image
                  src={currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  loader={loader}
                  fill
                  className="object-contain drop-shadow-2xl dark:brightness-90 transition-all duration-500"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Glassmorphic Spec Overlay */}
            <AnimatePresence>
              {showSpecs && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  className="absolute inset-0 bg-white/40 dark:bg-black/40 flex items-center justify-center p-4 z-20 rounded-[2rem]"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white/90 dark:bg-zinc-900/90 shadow-2xl rounded-3xl p-8 max-w-sm w-full border border-white dark:border-zinc-800"
                  >
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-zinc-400">Technical Measurements</h4>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                      {[{ l: 'Lens Width', v: '52mm' }, { l: 'Bridge', v: '18mm' }, { l: 'Temple', v: '145mm' }, { l: 'Vertical', v: '42mm' }].map((s) => (
                        <div key={s.l}>
                          <p className="text-[10px] text-zinc-400 uppercase font-bold mb-1">{s.l}</p>
                          <p className="text-lg font-medium dark:text-white">{s.v}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setShowSpecs(false)} className="mt-8 w-full py-4 bg-zinc-900 dark:bg-white dark:text-black text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">
                      Hide Blueprint
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Nav & Action */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex gap-3">
              {currentImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setMainIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${mainIndex === i ? 'w-12 bg-zinc-900 dark:bg-white' : 'w-2 bg-zinc-300 dark:bg-zinc-800'}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setShowSpecs(true)}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <HashtagIcon className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
              Engineering Specs
            </button>
          </div>
        </div>

        {/* --- RIGHT: CONFIGURATION & LUXURY DETAIL --- */}
        <div className="w-full lg:w-2/5 bg-white dark:bg-[#0f0f0f] p-8 lg:p-20 lg:min-h-screen border-l border-zinc-100 dark:border-zinc-900 relative z-10 shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
          <div className="max-w-md mx-auto lg:mx-0">
            
            <header className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Exclusive Edition</span>
                <div className="flex items-center gap-1.5">
                  <StarIcon className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-black dark:text-white">4.9</span>
                </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-zinc-900 dark:text-white mb-4 italic">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-medium dark:text-zinc-100">KSh {totalPrice.toLocaleString()}</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest">Pricing in KES</span>
              </div>
            </header>

            {/* LENS SELECTION (The Experience) */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">01. Lens Customization</h3>
                <InformationCircleIcon className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="space-y-3">
                {LENS_OPTIONS.map((opt) => {
                  // Figure out if this specific option has been chosen already
                  const optionQty = cart.find(
                    (item: any) => item.id === product.id && item.selectedLens?.id === opt.id
                  )?.quantity || 0;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedLens(opt)}
                      className={`w-full group relative flex items-center p-5 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
                        selectedLens.id === opt.id 
                        ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-black shadow-xl shadow-zinc-200 dark:shadow-none translate-x-2' 
                        : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className={`p-2.5 rounded-2xl mr-4 transition-colors ${selectedLens.id === opt.id ? 'bg-white/10 dark:bg-black/10' : 'bg-white dark:bg-zinc-800 shadow-sm'}`}>
                        {opt.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold tracking-tight">{opt.name}</p>
                          {optionQty > 0 && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-wide ${selectedLens.id === opt.id ? 'bg-white text-black' : 'bg-zinc-900 text-white dark:bg-white dark:text-black'}`}>
                              {optionQty} Added
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] font-medium leading-relaxed ${selectedLens.id === opt.id ? 'text-zinc-300 dark:text-zinc-500' : 'text-zinc-500'}`}>
                          {opt.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-black tracking-tighter">{opt.price === 0 ? 'INCL' : `+${opt.price}`}</span>
                        {selectedLens.id === opt.id && <CheckIcon className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CURATED FRAME COLOR */}
            <section className="mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">02. Frame Finish</h3>
              <div className="flex gap-4">
                {currentImages.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setMainIndex(i)}
                    className={`relative w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 group ${
                      mainIndex === i ? 'border-zinc-900 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-40 grayscale hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="colorway" fill className="object-cover" loader={loader} />
                  </button>
                ))}
              </div>
            </section>

            {/* SHOWCASE ACTIVE CONFIGURATIONS FOR THIS PRODUCT */}
            <AnimatePresence>
              {activeProductVariants.length > 0 && (
                <motion.section 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mb-12 p-5 bg-zinc-50 dark:bg-zinc-900/40 rounded-[2rem] border border-zinc-100 dark:border-zinc-800/60"
                >
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center justify-between">
                    <span>Staged Configurations</span>
                    <span className="text-blue-500 font-bold">{activeProductVariants.length} Active</span>
                  </h3>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {activeProductVariants.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-medium dark:text-zinc-200">{item.selectedLens?.name || 'Base Config'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-bold">Qty: {item.quantity}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => decreaseQuantity(item)}
                              className="p-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-md transition-colors"
                            >
                              <MinusIcon className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            </button>
                            <button 
                              onClick={() => addToCart(item)}
                              className="p-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-md transition-colors"
                            >
                              <PlusIcon className="w-3 h-3 text-zinc-600 dark:text-zinc-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* FLOATING ACTION AREA */}
            <footer className="sticky bottom-8 lg:static">
              <div className="p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl lg:shadow-none lg:bg-transparent lg:border-none lg:p-0">
                <div className="flex gap-3">
                  {currentVariantQuantity > 0 ? (
                    <div className="flex-[4] h-16 bg-zinc-950 dark:bg-white text-white dark:text-black rounded-[2rem] flex items-center justify-between px-6 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
                      <button 
                        onClick={() => decreaseQuantity(variantPayload)}
                        className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>
                      <span className="text-sm tracking-widest">{currentVariantQuantity} Staged Pair{currentVariantQuantity > 1 ? 's' : ''}</span>
                      <button 
                        onClick={() => addToCart(variantPayload)}
                        className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(variantPayload)}
                      className="flex-[4] h-16 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3"
                    >
                      <ShoppingBagIcon className="w-5 h-5" />
                      Reserve Configuration
                    </motion.button>
                  )}
                  
                  <button className="flex-1 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-[2rem] flex items-center justify-center group">
                    <EyeIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                  <CheckBadgeIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Authentic</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
                  <ArrowsPointingOutIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Free Fitting</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* --- RELEVANT CURATION SECTION --- */}
      <section className="px-8 lg:px-20 py-32 bg-zinc-50 dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <h2 className="text-5xl font-light tracking-tighter dark:text-white italic">Complete <br/>the Vision</h2>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              View All <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </div>
      </section>

      <WhatsAppInquiry 
        productName={`${product.name} (${selectedLens.name})`}
        productPrice={totalPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}