'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [mainLoaded, setMainLoaded] = useState(false);
  
  const primary = '#10B981'; // Emerald
  const secondary = '#065f46'; 

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as {url: string}[])?.length ? product.images : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url;

  const handleAddToCart = () => addToCart({ ...product, finalPrice: product.finalPrice ?? product.sellingPrice });

  return (
    <div className="bg-[#F8FAFC] dark:bg-stone-950 min-h-screen pb-24">
      <Head>
        <title>{product.name} | Duka Yangu</title>
      </Head>

      {/* 1. ULTRA-SLEEK NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-gray-100 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>
          <div className="hidden md:flex items-center gap-8">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">SKU: {product.id?.substring(0, 8)}</span>
             <button className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-all">
                <ShareIcon className="w-5 h-5" />
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* 2. THE GALLERY (Bentogrid Style) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white dark:bg-stone-900 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    fill
                    className="object-cover cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                    priority
                    loader={loader}
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Discount Tag */}
              {product.sellingPrice > (product.finalPrice || 0) && (
                <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                  Save {Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
                </div>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 transition-all ${
                    idx === mainIndex ? 'ring-2 ring-emerald-500 scale-95' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="thumb" fill className="object-cover" 
                    loader={loader}/>
                </button>
              ))}
            </div>
          </div>

          {/* 3. THE INFO PANEL (Glassmorphism) */}
          <div className="lg:col-span-5 space-y-10">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <ShieldCheckIcon className="w-3 h-3" /> Verified Duka
              </div>
              <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter leading-[0.9] text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-5 h-5" />)}
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">4.8 (120+ Orders)</span>
              </div>
            </header>

            <div className="p-8 bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-stone-800 space-y-8">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black tracking-tighter text-emerald-600">
                  KES {product.finalPrice?.toLocaleString()}
                </span>
                {product.sellingPrice > (product.finalPrice || 0) && (
                  <span className="text-xl line-through text-gray-400 font-bold">
                    {product.sellingPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-gray-500 dark:text-stone-400 text-sm leading-relaxed font-medium">
                {product.description || "Premium quality sourced directly. High endurance and sleek finishing for the modern lifestyle."}
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-stone-800/50">
                  <TruckIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Fast Nairobi <br/> Delivery</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-stone-800/50">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">2 Year <br/> Warranty</span>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="pt-6">
                {quantity > 0 ? (
                  <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-stone-800 rounded-2xl">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => decreaseQuantity(product.id)} className="w-14 h-14 rounded-xl bg-white dark:bg-stone-700 flex items-center justify-center shadow-md">
                      <MinusIcon className="w-6 h-6" />
                    </motion.button>
                    <span className="text-2xl font-black">{quantity}</span>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleAddToCart} className="w-14 h-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <PlusIcon className="w-6 h-6" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, translateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full py-6 rounded-[1.5rem] bg-emerald-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-4 group"
                  >
                    <ShoppingBagIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Add to Cart
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. EXPLORE MORE (Related) */}
        {related?.length > 0 && (
          <section className="mt-32">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2 block">Curated for you</span>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">You Might <br/> Also Like</h2>
              </div>
              <button className="text-sm font-black uppercase tracking-widest border-b-2 border-emerald-500 pb-1">View All</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 5. THE STICKY MOBILE BAR (Conversion Master) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:hidden">
         <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-4 shadow-2xl flex items-center justify-between">
            <div className="pl-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total</p>
               <p className="text-xl font-black">KES {product.finalPrice?.toLocaleString()}</p>
            </div>
            <button 
              onClick={handleAddToCart}
              className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20"
            >
              {quantity > 0 ? `In Cart (${quantity})` : 'Add to Cart'}
            </button>
         </div>
      </div>

      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
    </div>
  );
}