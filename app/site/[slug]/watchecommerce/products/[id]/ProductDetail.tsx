/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon } from '@heroicons/react/24/solid';
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  ArrowRightIcon, 
  ShoppingBagIcon 
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

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

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91'; // Fallback to a default image if URL is missing

  const GOLD = '#D4AF37';
  const SLATE = '#0F172A';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-amber-500/30 mt-32">
      <Head>
        <title>{product.name} | Watch Duka Premium</title>
      </Head>

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
          
          {/* LEFT: THE SHOWCASE (Visuals) */}
          <div className="lg:col-span-7 relative bg-gradient-to-b from-slate-900 to-black lg:border-r border-slate-800/50">
            <div className="sticky top-0 h-full flex flex-col justify-center p-6 lg:p-12">
              
              {/* Main Display */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-square w-full max-w-2xl mx-auto group cursor-crosshair"
                onClick={() => setIsLightboxOpen(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl opacity-30" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full z-10"
                  >
                    <Image
                      src={currentImage}
                      alt={product.name}
                      loader={loader}
                      fill
                      className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Sophisticated Thumbnails */}
              <div className="mt-12 flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-500 border-2 ${
                      idx === mainIndex ? 'border-amber-500 scale-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-slate-800 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url? img.url : img} alt="thumb" fill className="object-cover" loader={loader} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: THE SPECIFICATIONS (Details) */}
          <div className="lg:col-span-5 p-8 lg:p-16 flex flex-col justify-center">
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-[1px] w-8 bg-amber-500" />
                  <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">Masterpiece Collection</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-serif font-light tracking-tight leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3 w-3" />)}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Certified Authenticity</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-4 py-6 border-y border-slate-800/50">
                <span className="text-4xl font-medium text-white tracking-tighter">
                  KSh {product.finalPrice?.toLocaleString()}
                </span>
                {product.sellingPrice && product.sellingPrice > (product.finalPrice || 0) && (
                  <span className="text-slate-600 line-through text-lg">KSh {product.sellingPrice.toLocaleString()}</span>
                )}
              </div>

              {/* Watch Specs Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Movement</span>
                  </div>
                  <p className="text-sm font-medium">Automatic Calibre</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Warranty</span>
                  </div>
                  <p className="text-sm font-medium">2-Year International</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 leading-relaxed text-sm font-light italic">
                {product.description || "A symphony of engineering and elegance. This timepiece represents the pinnacle of craftsmanship, designed for those who value every second."}
              </p>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  {quantity > 0 ? (
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-full h-16 px-2">
                      <button onClick={() => decreaseQuantity(product.id)} className="w-12 h-12 flex items-center justify-center hover:text-amber-500 transition-colors">
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-6 font-bold text-lg">{quantity}</span>
                      <button onClick={addToCart} className="w-12 h-12 flex items-center justify-center hover:text-amber-500 transition-colors">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addToCart}
                      className="flex-1 h-16 bg-white text-black rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-500 transition-all"
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                      Acquire Timepiece
                    </motion.button>
                  )}
                  <button className="h-16 w-16 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all group">
                    <HeartIcon className="h-6 w-6 text-slate-500 group-hover:text-red-500" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] px-2">
                  <span className="flex items-center gap-1"><SparklesIcon className="h-3 w-3" /> Complimentary Polishing</span>
                  <span className="flex items-center gap-1"><ArrowRightIcon className="h-3 w-3" /> Secure Delivery</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>

        {/* RELATED SECTION - Editorial Style */}
        <section className="p-8 lg:p-16 border-t border-slate-900 bg-black">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="text-3xl font-serif mb-2">The Curation</h2>
            <p className="text-slate-500 text-sm tracking-[.3em] uppercase">Other timepieces of interest</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <div key={r.id} className="opacity-80 hover:opacity-100 transition-opacity">
                <ProductCard product={r as any} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* LIGHTBOX (Lux Version) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#020617]/98 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-10 right-10 text-slate-400 hover:text-white uppercase text-xs tracking-widest font-black"
            >
              Close [esc]
            </button>
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative w-full h-full max-w-5xl"
            >
              <Image src={currentImage || 'https://images.unsplash.com/photo-1523275335684-37898b6760e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA==&auto=format&fit=crop&w=1000&q=80'} alt="Precision view" fill className="object-contain" loader={loader} />
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