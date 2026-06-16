/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  BoltIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);  

  // Bike Duka Theme: Carbon Black & Racing Red
  const primary = '#EF4444'; // Red 500
  const dark = '#09090B'; // Zinc 950

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const   const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];

    const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80';


  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 selection:bg-red-500 selection:text-white">
      <Head>
        <title>{product.name} | Pro Performance Bike Duka</title>
      </Head>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: THE MACHINE SHOWCASE */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group aspect-[16/10] bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
              {/* Speed Accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[80px]" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="relative w-full h-full p-10"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Angle Selector */}
              <div className="absolute bottom-6 left-6 flex gap-3">
                {currentImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === mainIndex ? 'border-red-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url || img} alt="bike angle" fill className="object-cover" loader={loader} />
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Specs Bento */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <ChartBarIcon className="w-5 h-5 text-red-500 mb-2" />
                <h4 className="text-[10px] uppercase tracking-tighter font-bold text-zinc-400">Frame Weight</h4>
                <p className="text-lg font-black italic">8.2 KG</p>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <BoltIcon className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-[10px] uppercase tracking-tighter font-bold text-zinc-400">Aero Rating</h4>
                <p className="text-lg font-black italic">ELITE</p>
              </div>
              <div className="p-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500 mb-2" />
                <h4 className="text-[10px] uppercase tracking-tighter font-bold text-zinc-400">Groupset</h4>
                <p className="text-lg font-black italic">Carbon Pro</p>
              </div>
            </div>
          </div>

          {/* RIGHT: CONFIGURATION & ADD-TO-CART */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-[2px] w-8 bg-red-500" />
                <span className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Professional Grade</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 py-2">
                <span className="text-4xl font-black">KSh {product.finalPrice?.toLocaleString()}</span>
                {product.sellingPrice > product.finalPrice && (
                  <span className="text-xl text-zinc-400 line-through decoration-red-500/50">KSh {product.sellingPrice}</span>
                )}
              </div>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium border-l-4 border-zinc-200 dark:border-zinc-800 pl-4">
              {product.description || "Engineered for maximum velocity. This machine features a lightweight aerodynamic frame and precision-tuned components for competitive racing."}
            </p>

            {/* Configurator Preview */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Select Frame Size</h3>
              <div className="flex gap-2">
                {['S', 'M', 'L', 'XL'].map((size) => (
                  <button key={size} className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-zinc-200 dark:border-zinc-800 font-bold hover:border-red-500 transition-colors focus:bg-red-500 focus:text-white focus:border-red-500">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Group */}
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {quantity > 0 ? (
                  <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-2xl">
                    <button onClick={() => decreaseQuantity(product.id)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-800 rounded-xl shadow-sm">
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-black w-8 text-center">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="w-12 h-12 flex items-center justify-center bg-red-500 text-white rounded-xl shadow-lg">
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, skewX: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(product)}
                    className="flex-1 py-5 bg-red-600 text-white rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 italic"
                  >
                    <BoltIcon className="w-5 h-5" />
                    Secure Yours Now
                  </motion.button>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-6 py-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                  Lifetime Frame Warranty
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400">
                  <BoltIcon className="w-4 h-4 text-amber-500" />
                  Free Track Tuning
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    {/* TECHNICAL SPECIFICATIONS ACCORDION */}
    <section className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-100 dark:border-zinc-800">
      <div className="max-w-4xl">
        <button 
          onClick={() => setIsSpecsOpen(!isSpecsOpen)}
          className="group flex items-center justify-between w-full py-6 text-left focus:outline-none"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Technical Blueprint</h2>
          </div>
          <motion.div
            animate={{ rotate: isSpecsOpen ? 180 : 0 }}
            className="text-zinc-400"
          >
            <PlusIcon className="w-6 h-6" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isSpecsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden mb-12">
                {[
                  { label: "Tire Width", value: "28mm (700c)", icon: "🔘" },
                  { label: "Brake Type", value: "Hydraulic Disc (Shimano)", icon: "🛑" },
                  { label: "Frame Material", value: "T800 Carbon Fiber", icon: "💎" },
                  { label: "Geometry", value: "Aggressive Aero / Racing", icon: "📐" },
                  { label: "Drivetrain", value: "12-Speed Electronic", icon: "⚙️" },
                  { label: "Max Payload", value: "115 KG", icon: "⚖️" },
                ].map((spec, i) => (
                  <div key={i} className="bg-white dark:bg-[#050505] p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{spec.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-red-500 transition-colors">{spec.label}</span>
                    </div>
                    <span className="font-black italic text-zinc-900 dark:text-zinc-100">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Geometry Blueprint Note */}
              <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <h4 className="font-black uppercase italic text-red-500">Pro-Fit Geometry</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    The {product.name} utilizes a compact rear triangle and an integrated cockpit to maximize power transfer. Every millimeter is optimized for Kenyan road conditions—balancing high-speed stability with responsive cornering.
                  </p>
                </div>
                <div className="relative w-full md:w-48 h-32 opacity-30 invert dark:invert-0">
                  {/* This could be a wireframe SVG of a bike frame */}
                  <Image 
                    src={currentImage}
                    alt="Geometry wireframe" 
                    fill 
                    className="object-contain"
                    loader={loader}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>

      {/* ACCESSORIES CROSS-SELL */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 py-20 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Essential Gear</h2>
            <div className="h-1 w-20 bg-red-500 mt-2" />
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
            {related?.map((item) => (
              <motion.div 
                key={item.id} 
                className="min-w-[280px] snap-start bg-white dark:bg-zinc-950 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 group"
              >
                <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900">
                  <Image src={item.images[0]?.url} alt={item.name} loader={loader} fill className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="font-black uppercase italic text-sm mb-1">{item.name}</h4>
                <p className="text-red-500 font-black text-sm">KSh {item.finalPrice}</p>
                <button 
                  onClick={() => addToCart(item)}
                  className="mt-4 w-full py-3 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Quick Add
                </button>
              </motion.div>
            ))}
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