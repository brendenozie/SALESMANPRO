/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [mainLoaded, setMainLoaded] = useState(false);

  const primary = '#10B981'; // Emerald 500
  const secondary = '#3B82F6'; // Blue 500

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as any[])?.length ? product.images : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || '/placeholder.png';

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 ">
      <Head>
        <title>{product.name} | Earphones Duka</title>
      </Head>

      {/* Floating Back Button */}
      <nav className="fixed top-24 left-4 z-40 md:left-8">
        <motion.button 
          whileHover={{ x: -4 }}
          className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </motion.button>
      </nav>

      <main className="max-w-[1440px] mx-auto px-4 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: STUDIO VIEWPORT */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square md:aspect-[4/3] bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl group">
              {/* Dynamic Glow Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-emerald-500/10 blur-[120px] rounded-full" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="relative w-full h-full p-12"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain p-8 md:p-16 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                    onLoadingComplete={() => setMainLoaded(true)}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Thumbnail Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
                {currentImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-500 ${
                      idx === mainIndex ? 'ring-2 ring-emerald-500 scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url || img} alt="thumb" fill className="object-cover" loader={loader} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO BENTO */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Bento Cell */}
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {product.productCategory?.name || 'Audio Elite'}
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-4 h-4" />
                  <span className="text-xs font-bold text-zinc-500">4.9 (120+ Reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mt-6">
                <span className="text-5xl font-black text-emerald-500 tracking-tighter">
                  KSh {product.finalPrice?.toLocaleString()}
                </span>
                {product.sellingPrice > (product.finalPrice || 0) && (
                  <span className="text-xl line-through text-zinc-400 font-medium">
                    KSh {product.sellingPrice?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description Bento Cell */}
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">The Sound Experience</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {product.description || "Precision-engineered for clarity. Experience studio-grade audio with our flagship wireless technology."}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase">1 Year Warranty</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">
                  <TruckIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase">Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* CTA ACTION CENTER */}
            <div className="p-8 bg-zinc-900 dark:bg-emerald-500 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20">
              <div className="flex items-center justify-between gap-6">
                {quantity > 0 ? (
                  <div className="flex-1 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                    <button onClick={() => decreaseQuantity(product.id)} className="p-4 hover:bg-white/10 rounded-xl transition-colors">
                      <MinusIcon className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-xl font-black text-white">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="p-4 hover:bg-white/10 rounded-xl transition-colors">
                      <PlusIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="w-full py-6 bg-white text-zinc-900 dark:text-zinc-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Add to Cart
                  </motion.button>
                )}
              </div>
              <p className="text-[9px] text-center text-white/50 font-bold uppercase tracking-widest mt-6">
                Secure M-Pesa Checkout Available
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER RELATED SECTION (Minimal & Clean) */}
      <section className="max-w-7xl mx-auto px-4 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-black mb-10">Complete your setup</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related?.slice(0, 4).map((item) => (
            <motion.div key={item.id} whileHover={{ y: -10 }} className="group cursor-pointer">
              <div className="relative aspect-square bg-white dark:bg-zinc-900 rounded-3xl mb-4 overflow-hidden border border-zinc-100 dark:border-zinc-800 p-6 transition-all group-hover:shadow-xl">
                 <Image src={item.images[0]?.url || item.images[0]} alt={item.name} loader={loader} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-sm truncate">{item.name}</h4>
              <p className="text-emerald-500 font-black text-xs">KSh {item.finalPrice?.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}