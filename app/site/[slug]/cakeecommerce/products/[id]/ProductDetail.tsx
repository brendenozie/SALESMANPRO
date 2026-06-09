/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, ShoppingBagIcon, SparklesIcon, ShareIcon, HeartIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceCakeLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Custom theme colors for Cake Duka
const CAKE_THEME = {
  primary: '#D4AF37', // Gold
  secondary: '#3D2B1F', // Deep Cocoa
  accent: '#E91E63', // Raspberry
  cream: '#FFFDF5'
};

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
  const [mainLoaded, setMainLoaded] = useState(false);

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex];

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#3D2B1F] selection:bg-[#D4AF37] selection:text-white">
      <Head>
        <title>{product.name} | Cake Duka Atelier</title>
      </Head>

      {/* Modern Floating Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <nav className="inline-flex items-center space-x-2 py-2 px-4 bg-white/50 backdrop-blur-md rounded-full border border-stone-200 text-[10px] font-black uppercase tracking-widest text-stone-400">
          <span className="hover:text-[#D4AF37] cursor-pointer">Atelier</span>
          <ChevronRightIcon className="h-3 w-3" />
          <span className="hover:text-[#D4AF37] cursor-pointer">{product.productCategory?.name || 'Collections'}</span>
          <ChevronRightIcon className="h-3 w-3" />
          <span className="text-[#3D2B1F]">{product.name}</span>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* LEFT: PREMIUM GALLERY (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="relative group">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-[#D4AF37] opacity-10 blur-[100px] rounded-full" />
              
              <motion.div 
                layoutId="main-image"
                className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-[0_40px_100px_-20px_rgba(61,43,31,0.15)] border border-white/50 cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    <Image
                      src={currentImage}
                      alt={product.name}
                      loader={loader}
                      fill
                      className="object-cover"
                      priority
                      onLoadingComplete={() => setMainLoaded(true)}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Overlays */}
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                  {product.finalPrice && product.sellingPrice && product.sellingPrice > product.finalPrice && (
                    <div className="bg-[#E91E63] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      Save {Math.round(((product.sellingPrice - product.finalPrice) / product.sellingPrice) * 100)}%
                    </div>
                  )}
                  <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-stone-100">
                    <SparklesIcon className="h-3 w-3 text-[#D4AF37]" />
                    Artisan Baked
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 justify-center">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative w-24 h-24 rounded-2xl overflow-hidden transition-all duration-500 flex-shrink-0 ${
                    idx === mainIndex 
                    ? 'ring-2 ring-[#D4AF37] ring-offset-4 scale-110 shadow-xl' 
                    : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="thumb" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: CONTENT (Span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[#D4AF37] font-sans font-bold text-xs uppercase tracking-[0.3em]">
                  {product.productCategory?.name || 'Luxury Collection'}
                </span>
                <div className="flex gap-2">
                   <button className="p-3 bg-white rounded-full border border-stone-100 hover:text-[#E91E63] transition-colors shadow-sm">
                      <HeartIcon className="h-4 w-4" />
                   </button>
                   <button className="p-3 bg-white rounded-full border border-stone-100 hover:text-[#D4AF37] transition-colors shadow-sm">
                      <ShareIcon className="h-4 w-4" />
                   </button>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.9] text-[#3D2B1F]">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < 4 ? 'text-[#D4AF37]' : 'text-stone-200'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">42 verified reviews</span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_-10px_rgba(61,43,31,0.05)] border border-stone-100">
               <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-5xl font-black tracking-tighter text-[#3D2B1F]">
                    KSh {product.finalPrice?.toLocaleString()}
                  </span>
                  {product.sellingPrice && product.sellingPrice > (product.finalPrice || 0) && (
                    <span className="text-xl text-stone-300 line-through decoration-[#E91E63]">
                      {product.sellingPrice.toLocaleString()}
                    </span>
                  )}
               </div>

               <p className="text-stone-500 font-serif italic text-lg leading-relaxed mb-10">
                 {product.description || "A symphony of flavors handcrafted with the finest Kenyan ingredients. Perfect for celebrations that demand the extraordinary."}
               </p>

               {/* Interaction Block */}
               <div className="space-y-4">
                  {quantity > 0 ? (
                    <div className="flex items-center bg-stone-50 rounded-3xl p-2 border border-stone-100">
                      <button onClick={() => decreaseQuantity(product.id)} className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-all">
                        <MinusIcon className="h-6 w-6" />
                      </button>
                      <div className="flex-1 text-center font-black text-2xl">{quantity}</div>
                      <button onClick={addToCart} className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-white transition-all">
                        <PlusIcon className="h-6 w-6" />
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addToCart}
                      className="w-full py-6 bg-[#3D2B1F] text-white rounded-[2rem] font-black font-sans uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-[#3D2B1F]/30 hover:bg-black transition-all"
                    >
                      <ShoppingBagIcon className="h-5 w-5 text-[#D4AF37]" />
                      Reserve Your Cake
                    </motion.button>
                  )}
                  
                  <div className="flex items-center justify-center gap-6 pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                    <span className="flex items-center gap-2 italic underline underline-offset-4 decoration-[#D4AF37]">Next Day Delivery</span>
                    <span>•</span>
                    <span className="flex items-center gap-2 italic">100% Halal</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* RELATED SECTION */}
        {related.length > 0 && (
          <section className="mt-32">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-2">
                <span className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.3em]">Recommendations</span>
                <h2 className="text-4xl font-black tracking-tighter">You Might Also <span className="italic text-stone-400">Crave</span></h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* LUXURY LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-[#3D2B1F]/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-10 right-10 text-white hover:rotate-90 transition-transform duration-500"
            >
              <XMarkIcon className="h-10 w-10" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-5xl w-full aspect-square"
            >
              <Image src={currentImage || 'https://images.unsplash.com/photo-1559526324-402053c3f8e7?ixlib=rb-4.0.0&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80'} alt="lightbox" fill className="object-contain" loader={() => currentImage} />
            </motion.div>
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