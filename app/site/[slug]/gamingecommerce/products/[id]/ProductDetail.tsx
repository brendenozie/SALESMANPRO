/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewfinderCircleIcon,
  CpuChipIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { ShoppingBagIcon, BoltIcon, ShareIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceGamingLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('intel');

  const primary = '#10B981'; // Gamin Duka Emerald
  
  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as any[]) || [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex];

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* BACKGROUND GLOW DECOR */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          
          {/* --- LEFT: DYNAMIC VIEWPORT (7 COLS) --- */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative group aspect-[4/5] md:aspect-square rounded-[3rem] overflow-hidden bg-gradient-to-b from-zinc-900/50 to-black border border-white/5 shadow-2xl">
              
              {/* Overlay HUD Elements */}
              <div className="absolute top-8 left-8 z-10 space-y-2">
                <div className="px-3 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase">System Online</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, x: 20, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(20px)' }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="w-full h-full relative p-8 md:p-16 flex items-center justify-center"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain transform group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Lightbox Trigger */}
              <button 
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-8 right-8 w-14 h-14 bg-emerald-500 text-black flex items-center justify-center rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <ViewfinderCircleIcon className="w-7 h-7" />
              </button>
            </div>

            {/* Thumbnail Navigation - Tactical Strip */}
            <div className="flex gap-4 p-2 bg-zinc-900/30 backdrop-blur-md rounded-[2rem] border border-white/5 overflow-x-auto no-scrollbar">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative min-w-[80px] md:min-w-[100px] aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${
                    mainIndex === idx ? 'ring-2 ring-emerald-500' : 'opacity-40 hover:opacity-100 scale-95'
                  }`}
                >
                  <Image src={img.url || img} alt="thumb" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: CONTROL CENTER (5 COLS) --- */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            
            <header className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md border border-emerald-500/20">
                  Gaming Grade
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 fill-current" />)}
                  <span className="text-[10px] text-zinc-500 ml-2 font-bold">(128 Reviews)</span>
                </div>
              </div>

              <h1 className="text-5xl xl:text-6xl font-black tracking-tighter leading-[0.9] bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                {product.name}
              </h1>

              <div className="flex items-center gap-6">
                <div className="text-4xl font-black text-emerald-500">
                  KSh {product.finalPrice?.toLocaleString()}
                </div>
                {product.sellingPrice > (product.finalPrice || 0) && (
                  <div className="text-xl text-zinc-600 line-through font-bold">
                    {product.sellingPrice?.toLocaleString()}
                  </div>
                )}
              </div>
            </header>

            {/* ACTION CARD */}
            <div className="p-8 bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-zinc-500 uppercase">Availability</span>
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> In Stock
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black text-zinc-500 uppercase">Delivery</span>
                  <span className="text-sm font-bold">24-48 Hours</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Tactical Loadout</span>
                  <span className="text-xs font-bold text-emerald-500">{quantity || 0} In Bag</span>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center bg-zinc-800/50 rounded-2xl border border-white/10 p-1">
                    <button onClick={() => decreaseQuantity(product.id)} className="p-4 hover:bg-white/5 rounded-xl transition-colors">
                      <MinusIcon className="w-5 h-5 text-zinc-400" />
                    </button>
                    <span className="px-6 font-black text-xl">{quantity || 1}</span>
                    <button onClick={() => addToCart(product)} className="p-4 hover:bg-white/5 rounded-xl transition-colors">
                      <PlusIcon className="w-5 h-5 text-emerald-500" />
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(16,185,129,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 group"
                  >
                    <ShoppingBagIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Deploy to Cart
                  </motion.button>
                </div>
              </div>
            </div>

            {/* SPECS / INTEL TABS */}
            <div className="space-y-6">
              <div className="flex gap-8 border-b border-white/5">
                {[
                  { id: 'intel', label: 'Technical Intel', icon: <CpuChipIcon className="w-3 h-3"/> },
                  { id: 'mission', label: 'Mission Specs', icon: <FireIcon className="w-3 h-3"/> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all relative ${
                      activeTab === tab.id ? 'text-emerald-500' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="text-sm leading-relaxed text-zinc-400 font-medium">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {activeTab === 'intel' ? (
                      <p>{product.description || "High-bandwidth interface designed for zero-latency execution. Features advanced thermal management and custom Gamin Duka architecture."}</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-y-4">
                        <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-zinc-600">Protocol</span><span className="text-zinc-200">G-DUKA v2.4</span></div>
                        <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-zinc-600">Classification</span><span className="text-zinc-200">{product.productCategory?.name}</span></div>
                        <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-zinc-600">Origin</span><span className="text-zinc-200">Vault 7</span></div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER ACTION STRIP */}
      <section className="bg-zinc-900/50 backdrop-blur-xl border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-2">Upgrade Hardware</h2>
              <h3 className="text-4xl font-black tracking-tighter">Related Modules</h3>
            </div>
            <div className="flex gap-3">
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"><ChevronLeftIcon className="w-5 h-5"/></button>
              <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"><ChevronRightIcon className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </div>
      </section>

      {/* IMMERSIVE LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black backdrop-blur-3xl flex items-center justify-center p-6 md:p-20"
          >
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-8 right-8 p-4 bg-zinc-900 rounded-full border border-white/10 text-white">
              ✕
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