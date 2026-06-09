'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  ShareIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  
  // Safely extract window location after client mount to prevent Next.js SSR hydration errors
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = () => addToCart({ ...product, finalPrice: product.finalPrice ?? product.sellingPrice });

  // Calculate dynamic discount metrics
  const hasDiscount = product.sellingPrice > (product.finalPrice || 0);
  const discountPercentage = hasDiscount 
    ? Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)
    : 0;

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-32 transition-colors duration-300">
      <Head>
        <title>{product.name} | Duka Yangu</title>
      </Head>

      {/* FIXED HEADER ACTION BAR */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto noble-spacing px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" /> Back
          </button>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 hidden sm:inline">
              SKU: {product.id?.substring(0, 8)}
            </span>
            <button 
              onClick={() => navigator.share?.({ title: product.name, url: currentUrl }).catch(() => {})}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-full transition-all active:scale-95"
              aria-label="Share product"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-8 lg:gap-16">
          
          {/* PHOTO INTERACTIVE LAB MATRIX */}
          <div className="lg:col-span-7 w-full">
            {/* Aspect control shifts dynamically from fluid screen bounds on mobile devices up to balanced shapes on desktop layout */}
            <div className="relative aspect-square sm:aspect-[4/5] sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-md sm:shadow-xl transition-colors">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    loader={loader}
                  />
                </motion.div>
              </AnimatePresence>
              
              {hasDiscount && (
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-red-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg z-10 animate-pulse">
                  Save {discountPercentage}%
                </div>
              )}

              {/* MOBILE INTERACTIVE PAGE PIN DOTS */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:hidden z-10">
                {currentImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === mainIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/60'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* DESKTOP THUMBNAILS PANEL */}
            <div className="hidden sm:flex gap-3 overflow-x-auto no-scrollbar py-4 px-1">
              {currentImages.map((img, idx) => {
                const thumbUrl = img?.url || img;
                return (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all bg-white dark:bg-zinc-900 shadow-sm ${
                      idx === mainIndex ? 'ring-2 ring-emerald-500 scale-95 opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={thumbUrl} alt={`Thumbnail view ${idx + 1}`} fill className="object-cover" loader={loader}/>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VITAL CORE CONTENT DESCRIPTION MATRIX */}
          <div className="lg:col-span-5 px-4 sm:px-0 pt-6 sm:pt-0 space-y-6 sm:space-y-8">
            <header className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                <ShieldCheckIcon className="w-3.5 h-3.5" /> Verified Store
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase italic">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  4.8 (120+ Orders)
                </span>
              </div>
            </header>

            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800/80 space-y-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  KES {product.finalPrice?.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg line-through text-slate-400 font-bold">
                    {product.sellingPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                {product.description || "Premium quality sourced directly. High endurance and sleek finishing tailored perfectly to elevate the modern lifestyle frame."}
              </p>

              {/* TRUST SIGNALS GRID CONTAINER */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <TruckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 leading-tight">Fast Nairobi <br/> Delivery</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 leading-tight">Authentic <br/> Guarantee</span>
                </div>
              </div>

              {/* DESKTOP EXCLUSIVE ACTION PANEL CONTROL MODULE */}
              <div className="pt-4 hidden sm:block">
                {quantity > 0 ? (
                  <div className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => decreaseQuantity(product.id)} className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-700 text-slate-800 dark:text-white flex items-center justify-center shadow-sm">
                      <MinusIcon className="w-5 h-5" />
                    </motion.button>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{quantity}</span>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <PlusIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAddToCart}
                    className="w-full py-4.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-colors group"
                  >
                    <ShoppingBagIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED SHOWCASE CARDS MATRIX */}
        {related?.length > 0 && (
          <section className="mt-20 sm:mt-28 md:mt-32 px-4 sm:px-0">
            <div className="flex items-end justify-between mb-8 sm:mb-12">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1 block">Curated for you</span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight italic">You Might Also Like</h2>
              </div>
              <button className="text-xs font-black uppercase tracking-widest text-emerald-500 border-b-2 border-emerald-500 pb-1 hover:text-emerald-600 transition-colors">
                View All
              </button>
            </div>
            
            {/* Clean responsive scrolling row layout for smaller viewports expanding into structured grid maps on desktops */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* RE-ENGINEERED SMART MOBILE FLOATING ACTION HUB */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
          <div className="pl-2 shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Total Price</p>
            <p className="text-lg font-black text-slate-950 dark:text-white">KES {((quantity || 1) * (product.finalPrice || product.sellingPrice || 0)).toLocaleString()}</p>
          </div>
          
          <div className="flex-1 max-w-[200px]">
            {quantity > 0 ? (
              /* SMART TRANSFORMATION: Inline quantity configuration hub directly on the floating banner overlay */
              <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 border border-slate-200/50 dark:border-zinc-700/50">
                <button 
                  onClick={() => decreaseQuantity(product.id)} 
                  className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-700 text-slate-800 dark:text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                  aria-label="Decrease item quantity"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="text-base font-black text-slate-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={handleAddToCart} 
                  className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                  aria-label="Increase item quantity"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-black uppercase text-[11px] tracking-wider shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add To Cart
              </button>
            )}
          </div>
        </div>
      </div>

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