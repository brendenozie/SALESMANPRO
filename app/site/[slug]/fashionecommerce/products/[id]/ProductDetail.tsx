/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
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
  const { addToCart, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');

  // Fashion Brand Palette: High Contrast Mono + Electric Accent
  const accent = '#000000'; // Black
  const highlight = '#E5FF00'; // Electric Lime for "Fashion Forward" pop

  const currentImages = (product.images as ImageObj[])?.length 
    ? (product.images as ImageObj[]) 
    : [{ url: '/placeholder-image.png' }];
  
  const currentImage = currentImages[mainIndex]?.url;

  return (
    <div className="bg-white text-black min-h-screen font-sans selection:bg-black selection:text-white">
      <Head>
        <title>{product.name} | Duka Fashion</title>
      </Head>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* --- EDITORIAL LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT: THE LOOKBOOK (Col 1-8) */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Dynamic View */}
              <div className="md:col-span-2 relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="w-full h-full"
                  >
                    <Image
                      src={currentImage}
                      alt={product.name}
                      loader={loader}
                      fill
                      className="object-cover"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Pips */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {currentImages.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setMainIndex(i)}
                            className={`h-1 transition-all duration-300 ${mainIndex === i ? 'w-12 bg-black' : 'w-4 bg-black/20'}`} 
                        />
                    ))}
                </div>
              </div>

              {/* Secondary Details Grid (Magazine Style) */}
              {currentImages.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative aspect-[3/4] overflow-hidden rounded-sm hidden md:block">
                    <Image src={img.url} alt="Detail" loader={loader} fill className="object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: THE ATELIER (Col 9-12) */}
          <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit space-y-8 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">New Collection</span>
                <div className="flex items-center gap-1">
                  <StarIcon className="h-3 w-3 text-black" />
                  <span className="text-[10px] font-black underline italic">4.8 RATINGS</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                {product.name}
              </h1>
              <p className="text-2xl font-medium tracking-tight mt-4">
                KES {(product.finalPrice ?? 0).toLocaleString()}
              </p>
            </div>

            <div className="h-px bg-gray-100 w-full" />

            {/* Size Picker */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold uppercase tracking-widest">Select Size</label>
                <button className="text-[10px] underline text-gray-400 hover:text-black">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-14 flex items-center justify-center text-sm font-bold border transition-all ${
                      selectedSize === size ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="flex flex-col gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="w-full h-16 bg-black text-white flex items-center justify-center gap-3 font-black uppercase text-sm tracking-widest group"
              >
                <ShoppingBagIcon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                Add to Bag
                <ArrowRightIcon className="h-4 w-4" />
              </motion.button>
              
              <button className="w-full h-16 border border-gray-200 flex items-center justify-center gap-3 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-colors">
                <HeartIcon className="h-5 w-5" />
                Move to Wishlist
              </button>
            </div>

            {/* Product Story */}
            <div className="pt-8 space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest">The Story</h4>
               <p className="text-gray-500 text-sm leading-relaxed font-light">
                 {product.description || "Designed for the bold. This piece combines urban utility with high-street elegance, featuring our signature breathable fabric and tailored silhouette."}
               </p>
            </div>

            {/* Trust Badge / Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="p-4 bg-gray-50 rounded-sm space-y-1">
                    <p className="text-[10px] font-bold uppercase">Delivery</p>
                    <p className="text-[10px] text-gray-400">24-48 Hours</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm space-y-1">
                    <p className="text-[10px] font-bold uppercase">Returns</p>
                    <p className="text-[10px] text-gray-400">Easy 7-day swap</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- TRENDING NOW: HORIZONTAL SCROLL --- */}
        {related && related.length > 0 && (
          <section className="mt-32">
            <div className="flex items-end justify-between mb-10">
               <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic">Style With</h2>
                  <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Curated by our stylists</p>
               </div>
               <div className="flex gap-2">
                  <button className="p-4 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button className="p-4 border border-gray-200 rounded-full hover:bg-black hover:text-white transition-all">
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
               </div>
            </div>
            
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-10">
              {related.map(r => (
                <div key={r.id} className="min-w-[300px] md:min-w-[400px] group cursor-pointer">
                   <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 rounded-sm">
                      <Image 
                        src={r.images[0]?.url || r.images[0]} 
                        alt={r.name} 
                        loader={loader}
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                      <div className="absolute bottom-4 right-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                         <button className="h-12 w-12 bg-white flex items-center justify-center rounded-full shadow-xl">
                            <PlusIcon className="h-5 w-5" />
                         </button>
                      </div>
                   </div>
                   <div className="mt-4 flex justify-between items-start">
                      <h3 className="font-bold uppercase text-sm tracking-tight">{r.name}</h3>
                      <p className="font-medium text-sm">KES {r.finalPrice?.toLocaleString()}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}