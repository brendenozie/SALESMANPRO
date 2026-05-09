/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon } from '@heroicons/react/24/solid';
import { 
  SunIcon, 
  BeakerIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  CheckBadgeIcon
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

  const AMBER = '#F59E0B';
  const SAGE = '#10B981';

  return (
    <div className="min-h-screen bg-[#FFFCF5] text-stone-800 selection:bg-amber-200  mt-32">
      <Head>
        <title>{product.name} | Honey Duka Artisanal</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: ORGANIC GALLERY */}
          <div className="relative">
            {/* Decorative Background Element */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-60 animate-pulse" />
            
            <motion.div 
              layoutId="product-image"
              className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(245,158,11,0.15)] border border-amber-100/50"
              onClick={() => setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-cover p-8"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Badge */}
              <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-amber-200 flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-900">100% Raw</span>
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            <div className="flex mt-8 gap-4 justify-center">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                    idx === mainIndex ? 'border-amber-500 ring-4 ring-amber-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url} alt="thumb" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: ARTISANAL DETAILS */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-tighter">
                {product.productCategory?.name || 'Wildflower Harvest'}
              </div>
              <h1 className="text-5xl font-extrabold text-stone-900 tracking-tight leading-none">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5" />)}
                </div>
                <span className="text-sm font-medium text-stone-400">4.9 (120+ Bee-lovers)</span>
              </div>
            </motion.div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-amber-600 tracking-tighter">
                KSh {product.finalPrice?.toLocaleString()}
              </span>
              {product.sellingPrice && product.sellingPrice > (product.finalPrice || 0) && (
                <span className="text-stone-300 line-through text-xl">KSh {product.sellingPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Harvest Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-100 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><MapPinIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Source</p>
                  <p className="text-sm font-bold text-stone-700">Rift Valley</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-100 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><BeakerIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Process</p>
                  <p className="text-sm font-bold text-stone-700">Cold Pressed</p>
                </div>
              </div>
            </div>

            <p className="text-stone-500 leading-relaxed font-medium">
              {product.description || "Sun-drenched wildflowers meet artisanal harvesting. Our honey is never heated, ensuring every drop retains its natural enzymes and floral complexity."}
            </p>

            {/* Purchase Interaction */}
            <div className="pt-6 space-y-4">
              <div className="flex gap-4">
                {quantity > 0 ? (
                  <div className="flex items-center bg-stone-100 rounded-2xl p-1 shadow-inner">
                    <button onClick={() => decreaseQuantity(product.id)} className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-600 hover:text-amber-600 transition-colors">
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-8 font-black text-xl text-stone-800">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-600 hover:text-amber-600 transition-colors">
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#d97706' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="flex-1 h-16 bg-amber-500 text-white rounded-[1.25rem] font-black text-lg shadow-[0_10px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 transition-colors"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />
                    Add to Jar
                  </motion.button>
                )}
                
                <button className="w-16 h-16 rounded-[1.25rem] border-2 border-stone-100 flex items-center justify-center text-stone-300 hover:text-red-500 hover:border-red-50 transition-all">
                  <HeartIcon className="h-8 w-8" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-stone-400 uppercase tracking-widest pt-2">
                <span className="flex items-center gap-2"><SunIcon className="h-4 w-4 text-amber-400" /> Sustainably Farmed</span>
                <span className="w-1 h-1 bg-stone-200 rounded-full" />
                <span className="flex items-center gap-2"><CheckBadgeIcon className="h-4 w-4 text-amber-400" /> Lab Tested</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED HARVESTS */}
        <section className="mt-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-stone-900">Sweet Pairings</h2>
              <p className="text-stone-400 font-medium">Hand-picked from our latest harvest</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </section>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white font-bold tracking-tighter">CLOSE ✕</button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative aspect-square w-full max-w-3xl">
              <Image src={currentImage} alt="Honey detail" fill className="object-contain" loader={loader} />
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