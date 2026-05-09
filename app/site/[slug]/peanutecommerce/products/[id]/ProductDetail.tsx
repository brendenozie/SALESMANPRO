/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon } from '@heroicons/react/24/solid';
import { 
  FireIcon, 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  ShoppingBagIcon,
  SparklesIcon
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
  const currentImage = currentImages[mainIndex]?.url;

  // Earthy Palette
  const EARTH = '#78350f'; // Deep Walnut
  const ROAST = '#b45309'; // Roasted Amber

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-stone-900 selection:bg-orange-200  mt-32">
      <Head>
        <title>{product.name} | Peanut Duka Premium</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* GALLERY: EARTHENWARE STYLE */}
          <div className="lg:sticky lg:top-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-[5/6] rounded-[3rem] overflow-hidden bg-white shadow-[20px_20px_60px_#e5e0da,-20px_-20px_60px_#ffffff] border border-stone-100"
            >
              <Image
                src={currentImage}
                alt={product.name}
                loader={loader}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onClick={() => setIsLightboxOpen(true)}
              />
              
              <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                {currentImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`h-1.5 transition-all rounded-full ${idx === mainIndex ? 'w-8 bg-orange-600' : 'w-2 bg-stone-300'}`}
                  />
                ))}
              </div>

              <div className="absolute top-8 left-8">
                <div className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                  <FireIcon className="h-4 w-4" /> Freshly Roasted
                </div>
              </div>
            </motion.div>

            {/* Nut Origin Preview */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {currentImages.slice(0, 3).map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setMainIndex(idx)}
                  className={`cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${idx === mainIndex ? 'border-orange-600 scale-95' : 'border-transparent opacity-70'}`}
                >
                  <Image src={img.url} alt="detail" fill className="object-cover" loader={loader} />
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT: THE ROASTERY DETAILS */}
          <div className="flex flex-col h-full pt-4">
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-6">
              <span>Shop</span> <span className="text-orange-300">/</span>
              <span>{product.productCategory?.name || 'Hand-Picked Nuts'}</span>
            </nav>

            <h1 className="text-5xl lg:text-6xl font-black text-stone-900 leading-[0.9] tracking-tighter mb-6">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100">
                <StarIcon className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-sm">4.8</span>
              </div>
              <span className="text-stone-400 text-sm font-semibold uppercase tracking-wider underline decoration-orange-200 decoration-2 underline-offset-4 cursor-pointer">
                84 Verified Reviews
              </span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-black text-stone-900">KSh {product.finalPrice?.toLocaleString()}</span>
              {product.sellingPrice && product.sellingPrice > (product.finalPrice || 0) && (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold">
                  SAVE {Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Nut Specs Grid */}
            <div className="grid grid-cols-2 gap-px bg-stone-200 border border-stone-200 rounded-3xl overflow-hidden mb-10">
              <div className="bg-white p-6 flex flex-col gap-1">
                <SparklesIcon className="h-5 w-5 text-orange-600" />
                <span className="text-[10px] font-black uppercase text-stone-400 pt-2">Texture</span>
                <span className="font-bold text-stone-800">Extra Crunchy</span>
              </div>
              <div className="bg-white p-6 flex flex-col gap-1">
                <GlobeAltIcon className="h-5 w-5 text-orange-600" />
                <span className="text-[10px] font-black uppercase text-stone-400 pt-2">Origin</span>
                <span className="font-bold text-stone-800">Western Kenya</span>
              </div>
            </div>

            <p className="text-lg text-stone-600 leading-relaxed font-medium mb-10">
              {product.description || "Slow-roasted in small batches to unlock the natural oils and peak nuttiness. Perfectly salted, protein-packed, and guaranteed to satisfy your crunch cravings."}
            </p>

            {/* ACTION AREA */}
            <div className="mt-auto space-y-6">
              <div className="flex gap-4">
                {quantity > 0 ? (
                  <div className="flex items-center bg-stone-900 text-white rounded-[2rem] p-2 shadow-xl">
                    <button onClick={() => decreaseQuantity(product.id)} className="w-12 h-12 flex items-center justify-center hover:bg-stone-800 rounded-full transition-colors">
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="px-8 font-black text-xl">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="w-12 h-12 flex items-center justify-center hover:bg-stone-800 rounded-full transition-colors">
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="flex-1 h-20 bg-stone-900 text-white rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 group"
                  >
                    <ShoppingBagIcon className="h-6 w-6 text-orange-500 group-hover:rotate-12 transition-transform" />
                    Secure Your Roast
                  </motion.button>
                )}

                <button className="w-20 h-20 rounded-[2rem] border-2 border-stone-200 flex items-center justify-center text-stone-300 hover:text-orange-600 hover:border-orange-100 transition-all bg-white">
                  <HeartIcon className="h-8 w-8" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-stone-400 bg-stone-100/50 p-4 rounded-2xl border border-dashed border-stone-200">
                <ShieldCheckIcon className="h-5 w-5 text-stone-400" />
                <span>PACKED IN A PEANUT-ONLY FACILITY • NO ADDED PRESERVATIVES</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED ROASTS */}
        <div className="mt-32">
          <div className="h-px bg-stone-200 w-full mb-16" />
          <h3 className="text-3xl font-black text-stone-900 mb-10">You might also crave...</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
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