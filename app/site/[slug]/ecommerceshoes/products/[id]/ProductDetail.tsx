/* eslint-disable react-hooks/rules-of-hooks */
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
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/solid';
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
  const [mainLoaded, setMainLoaded] = useState(false);

  const primary = '#10B981'; // Emerald
  const accent = '#DFFF00';  // Volt Green (Great for footwear)

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url;

  const handleAddToCart = () => {
    addToCart({ ...product, finalPrice: product.finalPrice ?? product.sellingPrice });
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen selection:bg-[#DFFF00] selection:text-black">
      <Head>
        <title>{product.name} | Premium Collection</title>
      </Head>

      {/* --- HERO SECTION --- */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* LEFT: Kinetic Gallery (Col 1-7) */}
        <div className="lg:col-span-7 relative bg-[#111] flex items-center justify-center p-6 lg:p-20 overflow-hidden">
          {/* Big Background Text */}
          <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black opacity-[0.03] italic pointer-events-none uppercase">
            {product.productCategory?.name || 'DUKA'}
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={mainIndex}
              initial={{ opacity: 0, x: 100, rotate: 10, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, rotate: -5, scale: 1 }}
              exit={{ opacity: 0, x: -100, rotate: -15, scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full aspect-square max-w-2xl drop-shadow-[0_50px_80px_rgba(16,185,129,0.2)]"
            >
              <Image
                src={currentImage}
                alt={product.name}
                loader={loader}
                fill
                className="object-contain"
                priority
                onLoadingComplete={() => setMainLoaded(true)}
              />
            </motion.div>
          </AnimatePresence>

          {/* Thumbnail Strip (Floating Glass) */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl z-20">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                  mainIndex === idx ? 'ring-2 ring-[#DFFF00] scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt="thumb" loader={loader} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: The Purchase Lab (Col 8-12) */}
        <div className="lg:col-span-5 bg-white text-black p-8 lg:p-20 flex flex-col justify-center relative">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {product.productCategory?.name || 'New Arrival'}
              </span>
              <div className="flex items-center gap-1">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-bold">4.8 (120+ Reviews)</span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-4xl font-black">
                KES {(product.finalPrice ?? 0).toLocaleString()}
              </span>
              {product.sellingPrice > (product.finalPrice || 0) && (
                <span className="text-xl line-through text-gray-400 font-bold">
                  KES {product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-500 leading-relaxed mb-12 max-w-md font-medium">
              {product.description || "Engineered for maximum performance and street-ready style. Features a breathable upper and responsive cushioning."}
            </p>

            {/* ACTION BENTO */}
            <div className="space-y-4">
              {quantity > 0 ? (
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-[2rem]">
                  <button onClick={() => decreaseQuantity(product.id)} className="p-4 bg-white rounded-full shadow-sm">
                    <MinusIcon className="h-6 w-6" />
                  </button>
                  <span className="text-2xl font-black">{quantity}</span>
                  <button onClick={handleAddToCart} className="p-4 bg-white rounded-full shadow-sm text-emerald-600">
                    <PlusIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className="group w-full py-8 bg-black text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all hover:bg-emerald-600 shadow-2xl"
                >
                  <ShoppingBagIcon className="h-5 w-5" />
                  Secure This Pair
                  <ArrowRightIcon className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </motion.button>
              )}

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                  <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">100% Authentic <br/> Certified</span>
                </div>
                <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                  <TruckIcon className="h-6 w-6 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Flash Delivery <br/> Nairobi Wide</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- RELATED SECTION --- */}
      {related && related.length > 0 && (
        <section className="py-24 px-6 lg:px-20 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] mb-4 block">The Collection</span>
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">You Might <br/> Also Like</h2>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-emerald-500 pb-2 hover:text-emerald-500 transition-colors">
                View All Gear
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r as any} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}