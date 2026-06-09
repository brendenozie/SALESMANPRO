/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  HeartIcon,
  SparklesIcon,
  TruckIcon,
  SunIcon,
  BeakerIcon,
  PlusCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { GiftIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceFlowersLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const primary = '#EC4899'; // Rose Pink
  const accent = '#10B981'; // Stem Green

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as any[]) || [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex];

  // Existing states
  const [size, setSize] = useState<'standard' | 'deluxe' | 'premium'>('standard');
  const [includeVase, setIncludeVase] = useState(false);
  
  // Dynamic Pricing Logic
  const sizeMultipliers = { standard: 1, deluxe: 1.5, premium: 2.2 };
  const vasePrice = 1500;
  const basePrice = product.finalPrice || 0;
  const currentTotalPrice = (basePrice * sizeMultipliers[size]) + (includeVase ? vasePrice : 0);

  const sizes = [
    { id: 'standard', label: 'Standard', desc: 'As Pictured' },
    { id: 'deluxe', label: 'Deluxe', desc: 'More Blooms' },
    { id: 'premium', label: 'Premium', desc: 'Maximum Impact' },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFD] dark:bg-[#0A0505] text-zinc-900 dark:text-zinc-50 overflow-x-hidden">
      
      {/* DECORATIVE AMBIENCE */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-100 dark:bg-pink-900/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-50 dark:bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* --- LEFT: FLORAL PORTRAIT (7 COLS) --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group aspect-[4/5] rounded-[3rem] overflow-hidden bg-white dark:bg-zinc-900 border border-pink-100/50 dark:border-zinc-800 shadow-2xl shadow-pink-500/5">
              
              {/* Seasonal Badge */}
              <div className="absolute top-8 left-8 z-10">
                <div className="px-4 py-2 bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-pink-100 dark:border-white/10 rounded-2xl flex items-center gap-2 shadow-sm">
                  <SparklesIcon className="w-4 h-4 text-pink-500" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-pink-600 dark:text-pink-300">Freshly Picked</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, filter: 'blur(15px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full relative"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Interaction Bar */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-zinc-400 hover:text-pink-500 transition-colors">
                  <HeartIcon className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsLightboxOpen(true)}
                  className="px-6 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-2xl flex items-center gap-2 shadow-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-pink-500 transition-all"
                >
                  View Full Detail
                </button>
              </div>
            </div>

            {/* Organic Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative min-w-[100px] h-[100px] rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                    mainIndex === idx ? 'border-pink-400 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url || img} alt="thumb" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: BOUQUET CONTROLS (5 COLS) --- */}
          <div className="lg:col-span-5 space-y-10">
            <header className="space-y-4">
              <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-pink-500/60">
                <span>Collections</span>
                <span>/</span>
                <span className="text-pink-500">{product.productCategory?.name}</span>
              </nav>

              <h1 className="text-5xl lg:text-6xl font-serif italic tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="text-4xl font-light tracking-tighter text-zinc-900 dark:text-zinc-100">
                  KSh {product.finalPrice?.toLocaleString()}
                </div>
                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 text-pink-400 fill-current" />)}
                  <span className="text-[10px] font-bold text-zinc-400 ml-1">4.9/5 Rating</span>
                </div>
              </div>
            </header>

            {/* 1. PREMIUM SIZE SELECTOR */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
            <SparklesIcon className="w-3 h-3" /> Select Arrangement Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            {sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSize(s.id as any)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                  size === s.id 
                    ? 'border-pink-400 bg-pink-50/50 dark:bg-pink-900/10 shadow-lg' 
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-pink-200'
                }`}
              >
                {size === s.id && (
                  <motion.div layoutId="check" className="absolute top-2 right-2">
                    <CheckCircleIcon className="w-4 h-4 text-pink-500" />
                  </motion.div>
                )}
                <p className={`text-[10px] font-black uppercase tracking-widest ${size === s.id ? 'text-pink-600' : 'text-zinc-400'}`}>
                  {s.label}
                </p>
                <p className="text-[9px] font-medium text-zinc-500 mt-1">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. THE VASE CROSS-SELL (BENTO STYLE) */}
        <motion.div 
          animate={{ borderColor: includeVase ? '#F472B6' : 'rgba(0,0,0,0.05)' }}
          className="p-5 bg-white dark:bg-zinc-900 border-2 rounded-[2.5rem] shadow-xl shadow-pink-500/5 flex items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden flex-shrink-0">
               {/* Replace with actual vase image */}
               <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-zinc-400 uppercase">Glass Vase</div>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest">Crystal Glass Vase</h4>
              <p className="text-[10px] text-zinc-500">+ KSh {vasePrice.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => setIncludeVase(!includeVase)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              includeVase 
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
            }`}
          >
            {includeVase ? 'Added' : <><PlusCircleIcon className="w-4 h-4" /> Add</>}
          </button>
        </motion.div>

            {/* GIFTING HUB BENTO */}
            <div className="p-8 bg-pink-50/50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-pink-100 dark:border-zinc-800 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 flex items-center gap-2">
                  <GiftIcon className="w-3 h-3" /> Personalize Your Gift
                </label>
                <textarea 
                  placeholder="Write a sweet note to go with the flowers..."
                  className="w-full bg-white dark:bg-black/50 border border-pink-100 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center bg-white dark:bg-black/50 rounded-2xl border border-pink-100 dark:border-zinc-800 px-2">
                  <button onClick={() => decreaseQuantity(product.id)} className="p-3 text-zinc-400 hover:text-pink-500 transition-colors">
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{quantity || 1}</span>
                  <button onClick={() => addToCart(product)} className="p-3 text-zinc-400 hover:text-pink-500 transition-colors">
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ y: -4, shadow: '0 20px 40px rgba(236,72,153,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-pink-500 hover:bg-pink-400 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-colors py-4 shadow-xl shadow-pink-500/20"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Add to Bouquet
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 border-t border-pink-100 dark:border-zinc-800">
                <div className="flex flex-col items-center gap-1">
                  <TruckIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[9px] font-bold uppercase text-zinc-500">Same Day Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <HeartIcon className="w-5 h-5 text-pink-500" />
                  <span className="text-[9px] font-bold uppercase text-zinc-500">Hand-Tied</span>
                </div>
              </div>
            </div>

            {/* CARE INSTRUCTIONS (FLORAL INTEL) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl space-y-2">
                <SunIcon className="w-5 h-5 text-orange-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Light</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Indirect sunlight is best for these blooms.</p>
              </div>
              <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl space-y-2">
                <BeakerIcon className="w-5 h-5 text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Water</h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Change water every 2 days for longevity.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">The Narrative</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {product.description || "A masterfully curated arrangement that speaks the language of the heart. Perfect for celebrations, apologies, or simply making a Tuesday unforgettable."}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* COMPLIMENTARY BLOOMS */}
      <section className="bg-pink-50/30 dark:bg-zinc-900/30 py-24 border-t border-pink-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.5em] mb-4">Complete the Surprise</h2>
          <h3 className="text-4xl font-serif italic italic tracking-tight">Pairs Beautifully With</h3>
        </div>
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar pb-8">
          <div className="flex gap-8 min-w-max">
            {related.slice(0, 4).map(r => (
              <div key={r.id} className="w-[300px]">
                <ProductCard product={r as any} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-black flex items-center justify-center p-6 md:p-12"
          >
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-10 right-10 text-zinc-400 hover:text-pink-500 uppercase tracking-widest text-[10px] font-bold">
              Close Detail [✕]
            </button>
            <div className="relative w-full h-full">
              <Image src={currentImage} alt="zoom" fill className="object-contain" loader={loader} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
    </div>
  );
}