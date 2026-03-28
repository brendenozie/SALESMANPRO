/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, EyeIcon } from '@heroicons/react/24/solid';
import { 
  CheckBadgeIcon, 
  ArrowsPointingOutIcon, 
  SunIcon, 
  BeakerIcon,
  ShoppingBagIcon ,  
  SparklesIcon, 
  HashtagIcon,
  CheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';

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
  const currentImage = currentImages[mainIndex]?.url;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Head>
        <title>{product.name} | Optical Clarity Duka</title>
      </Head>

      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row min-h-[90vh]">
          
          {/* LEFT: EDITORIAL GALLERY */}
          <div className="w-full lg:w-3/5 bg-zinc-50 relative">
            <div className="sticky top-0 h-screen flex items-center justify-center p-8 lg:p-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="relative w-full aspect-[16/10] group cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain mix-blend-multiply"
                    priority
                  />
                  <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/5 transition-colors duration-300 rounded-3xl" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation overlay */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-200 shadow-sm">
                {currentImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === mainIndex ? 'w-10 bg-zinc-900' : 'w-2 bg-zinc-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: SPECIFICATIONS & LUXURY PURCHASE */}
          <div className="w-full lg:w-2/5 p-8 lg:p-16 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto lg:mx-0 w-full">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">Premium Eyewear</span>
                <div className="h-px flex-1 bg-zinc-100" />
              </div>

              <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-zinc-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-8">
                <div className="flex text-zinc-900">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < 4 ? 'fill-current' : 'text-zinc-200'}`} />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-400">4.9 RATING</span>
              </div>

              <div className="text-3xl font-medium mb-10">
                KSh {product.finalPrice?.toLocaleString()}
                <span className="text-sm text-zinc-400 font-normal ml-3">Inc. VAT</span>
              </div>

              {/* Lens Tech Cards */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                  <SunIcon className="h-5 w-5 text-zinc-900 mb-2" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Protection</p>
                  <p className="text-sm font-semibold">UV400 Shield</p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50">
                  <BeakerIcon className="h-5 w-5 text-zinc-900 mb-2" />
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Lens Type</p>
                  <p className="text-sm font-semibold">Anti-Reflective</p>
                </div>
              </div>

              <p className="text-zinc-500 leading-relaxed mb-12 font-light text-lg">
                {product.description || "Designed for the modern visionary. High-grade acetate frames paired with precision-engineered lenses for ultimate clarity and lightweight comfort."}
              </p>

              {/* CART ACTIONS */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  {quantity > 0 ? (
                    <div className="flex flex-1 items-center justify-between bg-zinc-100 rounded-2xl p-2 border border-zinc-200">
                      <button onClick={() => decreaseQuantity(product.id)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all">
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-lg">{quantity}</span>
                      <button onClick={() => addToCart(product)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all">
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => addToCart(product)}
                      className="flex-[3] h-16 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-zinc-200"
                    >
                      <ShoppingBagIcon className="h-5 w-5" />
                      Add to Collection
                    </motion.button>
                  )}
                  
                  <button className="flex-1 h-16 border border-zinc-200 rounded-2xl flex items-center justify-center hover:bg-zinc-50 transition-colors">
                    <EyeIcon className="h-6 w-6 text-zinc-400" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-6 py-6 border-t border-zinc-100 mt-8">
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <CheckBadgeIcon className="h-4 w-4 text-emerald-500" /> 2 Year Warranty
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <ArrowsPointingOutIcon className="h-4 w-4 text-sky-500" /> Free Fitting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED CURATION */}
        <section className="px-8 lg:px-16 py-24 bg-zinc-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-light tracking-tight mb-12 italic">Complete the Look</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.slice(0, 4).map(r => (
                <div key={r.id} className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-100">
                  <ProductCard product={r as any} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ProductDetailv2 product={product} related={related} />

    </div>
  );
}


/* eslint-disable react-hooks/rules-of-hooks */



// --- Types for the Customizer ---
type LensOption = {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
};

const LENS_OPTIONS: LensOption[] = [
  { id: 'clear', name: 'Standard Clear', price: 0, description: 'Anti-reflective coating included.', icon: <BeakerIcon className="w-5 h-5" /> },
  { id: 'blue', name: 'Blue Light Shield', price: 1500, description: 'Protects against digital eye strain.', icon: <SparklesIcon className="w-5 h-5" /> },
  { id: 'sun', name: 'Photochromic', price: 3500, description: 'Transitions to dark in sunlight.', icon: <SunIcon className="w-5 h-5" /> },
];

function ProductDetailv2({ product, related }: any) {
  const [selectedLens, setSelectedLens] = useState(LENS_OPTIONS[0]);
  const [mainIndex, setMainIndex] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);

  const totalPrice = (product.finalPrice || 0) + selectedLens.price;

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-zinc-900 font-sans">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        
        {/* LEFT: VISUAL SHOWCASE */}
        <div className="w-full lg:w-3/5 lg:sticky lg:top-0 h-fit lg:h-screen flex flex-col items-center justify-center p-6 lg:p-20">
          <div className="relative w-full aspect-[16/10] group">
            <motion.img
              key={mainIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={product.images[mainIndex]?.url}
              className="w-full h-full object-contain mix-blend-multiply"
            />
            
            {/* Internal Dimensions Overlay (Glassmorphism) */}
            <AnimatePresence>
              {showSpecs && (
                <motion.div 
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/40 flex items-center justify-center p-6"
                >
                  <div className="bg-white/90 shadow-2xl rounded-3xl p-8 max-w-sm w-full border border-white">
                    <h4 className="text-xs font-black uppercase tracking-widest mb-6">Frame Dimensions (mm)</h4>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { label: 'Lens Width', value: '52' },
                        { label: 'Bridge', value: '18' },
                        { label: 'Temple', value: '145' },
                        { label: 'Frame Height', value: '42' },
                      ].map((s) => (
                        <div key={s.label}>
                          <p className="text-[10px] text-zinc-400 uppercase font-bold">{s.label}</p>
                          <p className="text-xl font-medium">{s.value}mm</p>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setShowSpecs(false)}
                      className="mt-8 w-full py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold"
                    >
                      Close Specs
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowSpecs(true)}
            className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            <HashtagIcon className="w-4 h-4" /> View Technical Measurements
          </button>
        </div>

        {/* RIGHT: CONFIGURATION & CHECKOUT */}
        <div className="w-full lg:w-2/4 bg-white p-8 lg:p-16 border-l border-zinc-100 shadow-2xl">
          <div className="max-w-md">
            <header className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-black uppercase tracking-widest">Handcrafted Acetate</span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-4 h-4" />
                  <span className="text-xs font-bold text-zinc-900">4.9</span>
                </div>
              </div>
              <h1 className="text-4xl font-light tracking-tight mb-2">{product.name}</h1>
              <p className="text-2xl font-medium text-zinc-900">KSh {totalPrice.toLocaleString()}</p>
            </header>

            {/* STEP 1: LENS SELECTION */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest">1. Select Lens Type</h3>
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                  <InformationCircleIcon className="w-3 h-3" /> PRESCRIPTION READY
                </span>
              </div>
              
              <div className="space-y-3">
                {LENS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedLens(opt)}
                    className={`w-full flex items-center p-4 rounded-2xl border transition-all duration-300 ${
                      selectedLens.id === opt.id 
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' 
                      : 'border-zinc-100 hover:border-zinc-300 bg-zinc-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mr-4 ${selectedLens.id === opt.id ? 'bg-white/20' : 'bg-white'}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold">{opt.name}</p>
                      <p className={`text-[10px] ${selectedLens.id === opt.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {opt.description}
                      </p>
                    </div>
                    <div className="text-xs font-bold">
                      {opt.price === 0 ? 'FREE' : `+${opt.price}`}
                    </div>
                    {selectedLens.id === opt.id && <CheckIcon className="w-5 h-5 ml-4" />}
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 2: FRAME COLOR (THUMBNAILS) */}
            <section className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6">2. Frame Curation</h3>
              <div className="flex gap-4">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setMainIndex(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      mainIndex === i ? 'border-zinc-900 scale-110 shadow-md' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </section>

            {/* PURCHASE */}
            <footer className="pt-8 border-t border-zinc-100">
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-16 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Complete Order
                </motion.button>
              </div>
              <p className="mt-6 text-center text-[10px] text-zinc-400 font-medium">
                ESTIMATED DELIVERY: 2-3 BUSINESS DAYS WITHIN NAIROBI
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}