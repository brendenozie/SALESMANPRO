'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceShoesLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const AVAILABLE_SIZES = ['7', '8', '9', '10', '11', '12'];

export default function ProductDetail({
  product,
  related,
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Hydration-safe retrieval of window location coordinates
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const accentColor = '#DFFF00';  // High-visibility Volt Performance Green

  const currentImages = (product.images as ImageObj[])?.length 
    ? (product.images as ImageObj[]) 
    : [{ url: 'https://via.placeholder.com/600' }];
    
  const currentImage = currentImages[mainIndex]?.url;

  const quantity = useMemo(() => {
    return cart.find((c: any) => c.id === product.id && c.selectedSize === selectedSize)?.quantity || 0;
  }, [cart, product.id, selectedSize]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      document.getElementById('size-selector-frame')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSizeError(false);
    addToCart({ 
      ...product, 
      finalPrice: product.finalPrice ?? product.sellingPrice,
      selectedSize 
    });
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setMainIndex((prev) => (prev + 1) % currentImages.length);
    } else if (info.offset.x > swipeThreshold) {
      setMainIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen selection:bg-[#DFFF00] selection:text-black font-sans antialiased overflow-x-hidden transition-colors duration-300">
      
      {/* MASTER CONTAINER GRID */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] lg:h-[90vh] lg:max-h-[900px]">
        
        {/* LEFT STAGE: INTERACTIVE MEDIA GALLERY SUITE */}
        <div className="lg:col-span-7 relative bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden border-b border-zinc-100 dark:border-zinc-800 lg:border-b-0 lg:border-r transition-colors duration-300">
          
          {/* Dynamic Technical Structural Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black text-zinc-900/[0.03] dark:text-white/[0.02] italic tracking-tighter select-none pointer-events-none uppercase transition-colors duration-300">
            {product.productCategory?.name || 'PERFORMANCE'}
          </div>

          {/* Interactive Core Main Presentation Node */}
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[420px] lg:max-w-[520px] flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 0.92, rotate: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.95, rotate: -6 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                className="w-full h-full relative cursor-grab active:cursor-grabbing drop-shadow-[0_30px_50px_rgba(16,185,129,0.12)] dark:drop-shadow-[0_30px_50px_rgba(16,185,129,0.18)]"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-contain select-none pointer-events-none"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Touch Swipe Multi-indicator Dots (Mobile Screen Focus) */}
          <div className="flex gap-1.5 mt-2 mb-6 lg:hidden z-20">
            {currentImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  mainIndex === idx ? 'w-6 bg-zinc-900 dark:bg-[#DFFF00]' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Floating Glass Control Ribbon */}
          <div className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 flex items-center gap-3 p-2 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl z-20 overflow-x-auto max-w-full no-scrollbar shadow-sm transition-colors duration-300">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  mainIndex === idx 
                    ? 'ring-2 ring-zinc-950 dark:ring-[#DFFF00] scale-105 shadow-md' 
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt="Thumbnail context" loader={loader} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT STAGE: PRODUCT INFORMATION ENGINE */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-950 p-5 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar pb-32 lg:pb-12 transition-colors duration-300">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* Contextual Badging Frame */}
            <div className="flex justify-between items-center mb-5 gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-500/20 transition-colors duration-300">
                // {product.productCategory?.name || 'PREMIUM RELEASE'}
              </span>
              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300">4.9</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium hidden sm:inline">(142 orders)</span>
              </div>
            </div>

            {/* Core Structural Identifiers */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-[0.95] mb-4 text-zinc-950 dark:text-zinc-50">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6 sm:mb-8 border-b border-zinc-100 dark:border-zinc-900/80 pb-5 transition-colors duration-300">
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50">
                KES {(product.finalPrice ?? product.sellingPrice ?? 0).toLocaleString()}
              </span>
              {product.sellingPrice > (product.finalPrice || 0) && (
                <span className="text-base line-through text-zinc-400 dark:text-zinc-500 font-bold">
                  KES {product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Narrative Matrix */}
            <div className="mb-6 sm:mb-8">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">// SPECIFICATION DESIGN</h5>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl font-medium">
                {product.description || "Engineered specifically for maximum kinetic displacement and premium track-to-street versatility. Features specialized high-rebound support matrices and a weather-proof adaptive knit upper framing layout system."}
              </p>
            </div>

            {/* INTEGRATED PREMIUM INLINE SIZE SELECTOR */}
            <div id="size-selector-frame" className={`mb-6 sm:mb-8 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border transition-all duration-300 ${sizeError ? 'border-red-500 bg-red-500/5' : 'border-zinc-200/60 dark:border-zinc-900'}`}>
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Select UK Size</h5>
                {sizeError && <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider animate-pulse">Size selection mandatory</span>}
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {AVAILABLE_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      style={{ backgroundColor: isSelected ? accentColor : undefined }}
                      className={`py-3 text-xs font-black rounded-xl border transition-all duration-200 ${
                        isSelected 
                          ? 'text-zinc-950 border-transparent shadow-md' 
                          : 'bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 active:bg-zinc-100 dark:active:bg-zinc-900'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIONS SYSTEM: INLINE DESKTOP HUB */}
            <div className="hidden lg:block space-y-4">
              {quantity > 0 ? (
                <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                  <button onClick={() => decreaseQuantity(product.id)} className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black text-zinc-950 dark:text-zinc-50">{quantity}</span>
                    <span className="text-[9px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">UK Size {selectedSize}</span>
                  </div>
                  <button onClick={handleAddToCart} className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors rounded-xl text-emerald-600 dark:text-emerald-400">
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleAddToCart}
                  className="group w-full py-5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all hover:bg-zinc-800 dark:hover:bg-[#DFFF00] shadow-xl"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  Secure This Pair
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              )}
            </div>

            {/* TRUST DISPLACEMENT INDICATORS */}
            <div className="grid grid-cols-2 gap-3 mt-4 sm:mt-6">
              <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 flex flex-col gap-2.5 transition-colors duration-300">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 leading-tight">100% Authentic<br/><span className="text-zinc-400 dark:text-zinc-500 font-medium text-[9px]">Verified Source Matrix</span></span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 flex flex-col gap-2.5 transition-colors duration-300">
                <TruckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 leading-tight">Flash Dispatch<br/><span className="text-zinc-400 dark:text-zinc-500 font-medium text-[9px]">Nairobi Wide Execution</span></span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* MOBILE-ONLY STICKY TRANSACTION FOOTER TRAY */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200/80 dark:border-t-zinc-800/80 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.045)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)] flex gap-3 items-center transition-colors duration-300">
        {quantity > 0 ? (
          <div className="flex-1 flex items-center justify-between p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            <button onClick={() => decreaseQuantity(product.id)} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg shadow-sm">
              <MinusIcon className="h-4 w-4" />
            </button>
            <div className="text-center">
              <span className="text-sm font-black block leading-none text-zinc-950 dark:text-zinc-50">{quantity}</span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">UK {selectedSize}</span>
            </div>
            <button onClick={handleAddToCart} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 rounded-lg shadow-sm">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            style={{ backgroundColor: selectedSize ? accentColor : undefined }}
            className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all duration-200 ${
              selectedSize 
                ? 'text-zinc-950 border-transparent shadow-lg shadow-emerald-500/5' 
                : 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 active:bg-zinc-800 dark:active:bg-zinc-200'
            }`}
          >
            <ShoppingBagIcon className="h-4 w-4" />
            {selectedSize ? `Secure Size UK ${selectedSize}` : 'Choose Size & Secure'}
          </button>
        )}
      </div>

      {/* --- RELATED GRID MATRICES --- */}
      {related && related.length > 0 && (
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-2 block">// THE SELECTION REVOLUTION</span>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">You Might Also Like</h2>
              </div>
              <button className="self-start sm:self-auto text-[10px] font-black uppercase tracking-widest border-b-2 border-zinc-950 dark:border-emerald-400 pb-1 text-zinc-800 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                View All Gear
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hydration-safe dynamically updated WhatsApp Inquiry Engine */}
      {currentUrl && (
        <WhatsAppInquiry 
          productName={product.name}
          productPrice={product.finalPrice || product.sellingPrice || 0}
          productUrl={currentUrl}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}