/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  InformationCircleIcon,
  FireIcon,
  CheckBadgeIcon,
  ScaleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import Link from 'next/link';
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

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url;

  return (
    <div className="bg-white dark:bg-[#080808] text-stone-900 dark:text-stone-100 min-h-screen pb-20 relative overflow-hidden pt-32 transition-colors duration-500">
      <Head>
        <title>{product.name} | Premium Meat Duka</title>
      </Head>

      {/* --- BREADCRUMBS & VERIFICATION --- */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <nav className="text-[10px] uppercase font-black tracking-[0.3em] text-stone-400 flex gap-2">
          <Link href="/" className="hover:text-red-600">Home</Link> 
          <span className="text-stone-200">/</span> 
          <span className="text-red-600">{product.productCategory?.name || 'Artisan Cuts'}</span>
        </nav>
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-100 dark:border-red-900/30 rounded-full text-[10px] font-black uppercase tracking-widest">
          <CheckBadgeIcon className="h-4 w-4" />
          Certified Prime Grade
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT: VISUAL SHOWCASE */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/5 shadow-2xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Dark Overlay Gradient for text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />

            {/* Sale Badge */}
            {product.sellingPrice > (product.finalPrice || 0) && (
              <div className="absolute top-8 left-8 bg-red-600 text-white px-6 py-2 rounded-2xl text-xs font-black shadow-xl shadow-red-900/40 tracking-widest uppercase">
                Limited Offer
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-28 h-28 rounded-3xl overflow-hidden flex-shrink-0 border-2 transition-all duration-500 ${
                  mainIndex === idx 
                    ? 'border-red-600 shadow-2xl shadow-red-900/20 scale-105' 
                    : 'border-stone-200 dark:border-white/5 bg-stone-100 dark:bg-stone-900'
                }`}
              >
                <Image src={img.url} alt="thumb" loader={loader} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 dark:bg-stone-900 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 border border-stone-200 dark:border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              Availability: {product.stock || 'High Demand'}
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-stone-900 dark:text-white leading-[0.9]">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-4">
              <div className="text-4xl font-black text-red-600 tracking-tighter">
                KES {(product.finalPrice || 0).toLocaleString()}
              </div>
              {product.sellingPrice > (product.finalPrice || 0) && (
                <span className="text-xl line-through text-stone-300 dark:text-stone-700 font-bold">
                   KES {product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
            {product.description || "Expertly hand-carved by our master butchers. Sourced from grass-fed cattle in the Rift Valley, aged to perfection for unparalleled tenderness and marbling."}
          </p>

          {/* --- MEAT SPECS GRID --- */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Maturity', val: '21 Days Aged', icon: ClockIcon },
              { label: 'Cut Type', val: 'Primal Cut', icon: FireIcon },
              { label: 'Avg Weight', val: 'Per 500g', icon: ScaleIcon },
              { label: 'Sourcing', val: 'Local Farms', icon: ShieldCheckIcon },
            ].map((spec, i) => (
              <div key={i} className="bg-stone-50 dark:bg-stone-900/50 p-5 rounded-[2rem] border border-stone-200 dark:border-white/5 flex items-center gap-4 transition-colors hover:border-red-600/20">
                <div className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm text-red-600">
                  <spec.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-stone-400 tracking-widest leading-none mb-1">{spec.label}</p>
                  <p className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-tighter">{spec.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- ACTION BAR --- */}
          <div className="pt-8 space-y-6">
            {quantity > 0 ? (
              <div className="flex items-center justify-between bg-stone-100 dark:bg-stone-900 p-3 rounded-3xl border border-stone-200 dark:border-white/5 shadow-inner">
                <button onClick={() => decreaseQuantity(product.id)} className="h-14 w-14 flex items-center justify-center bg-white dark:bg-stone-800 rounded-2xl shadow-sm hover:text-red-600 transition-all active:scale-95">
                  <MinusIcon className="h-6 w-6" />
                </button>
                <span className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">{quantity} Packs Selected</span>
                <button onClick={() => addToCart(product)} className="h-14 w-14 flex items-center justify-center bg-white dark:bg-stone-800 rounded-2xl shadow-sm hover:text-red-600 transition-all active:scale-95">
                  <PlusIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="w-full h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center gap-4 text-sm font-black tracking-[0.3em] shadow-2xl shadow-red-900/30 hover:bg-red-700 transition-all uppercase"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                Add to Order
              </motion.button>
            )}
            
            <div className="flex items-center justify-center gap-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><TruckIcon className="w-4 h-4" /> Next-Day Delivery</span>
              <span className="w-1 h-1 rounded-full bg-stone-200 dark:bg-stone-800" />
              <span className="flex items-center gap-1.5"><InformationCircleIcon className="w-4 h-4" /> Eco-Packaging</span>
            </div>
          </div>
        </div>
      </main>

      {/* --- PREPARATION GUIDE --- */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-stone-950 rounded-[4rem] p-12 md:p-20 text-white grid grid-cols-1 md:grid-cols-2 gap-20 items-center overflow-hidden relative">
           <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[150px] rounded-full" />
           
           <div className="space-y-10 relative z-10">
              <h2 className="text-5xl md:text-6xl font-black leading-[0.85] tracking-tighter">Chef's Selection <br/> <span className="text-red-600 italic font-serif font-light">Prep Guide</span></h2>
              <ul className="space-y-6">
                  {[
                    'Temper to room temperature for 30 mins before cooking.',
                    'Pat dry with a paper towel for the perfect crust.',
                    'Season generously with sea salt and cracked pepper.',
                    'Rest the meat for half its cooking time for maximum juice.'
                  ].map((text, i) => (
                    <li key={i} className="flex gap-4 items-start group">
                      <div className="h-8 w-8 rounded-xl bg-red-600/20 border border-red-600/30 flex-shrink-0 flex items-center justify-center text-xs font-black text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">0{i+1}</div>
                      <p className="text-stone-400 text-lg font-medium group-hover:text-white transition-colors">{text}</p>
                    </li>
                  ))}
              </ul>
           </div>
           
           <div className="relative aspect-square rounded-[3rem] overflow-hidden border border-white/10 shadow-3xl">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent z-10" />
              <Image src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" alt="Searing Steak" fill className="object-cover" loader={loader} />
              <div className="absolute bottom-10 left-10 z-20 max-w-xs">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-2">Master the Sear</p>
                  <p className="text-2xl font-bold tracking-tight">"The key to perfection is heat, patience, and a heavy pan."</p>
              </div>
           </div>
        </div>
      </section>

      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
    </div>
  );
}