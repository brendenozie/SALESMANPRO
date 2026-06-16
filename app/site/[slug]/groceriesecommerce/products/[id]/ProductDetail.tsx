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
  ShoppingBagIcon,
  CheckBadgeIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/solid';
import { 
  SparklesIcon, 
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';

import ProductCard from '@/components/site/layouts/EcommerceGroceriesLayout/body/components/ProductCard';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Fallback configuration options if product.option is not supplied from MongoDB
const DEFAULT_GROWER_OPTIONS = [
  { category: 'Preparation', name: 'Standard Pack', extraPrice: 0 },
  { category: 'Preparation', name: 'Pre-washed & Chopped', extraPrice: 150 },
  { category: 'Preparation', name: 'Organic Certified', extraPrice: 300 },
];

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);

  // Extract structured options from the schema model, fallback if undefined
  const availableOptions = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_GROWER_OPTIONS;
  }, [product.option]);

  // Set initial selected variant config state
  const [selectedOption, setSelectedOption] = useState(availableOptions[0]);

  const primary = '#059669'; // Emerald 600
  const accent = '#F59E0B'; // Amber 500

  // Identify state quantity for this unique composite variant combination
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // Track all variants of this single base item currently sitting inside the user's cart
  const stagedProductVariants = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

  const currentImages = (product.images as any[])?.length ? product.images : [{ url: '/placeholder-food.png' }];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex];

  // Calculate distinct configuration price string
  const basePrice = product.finalPrice || product.sellingPrice || 0;
  const variantTotalPrice = basePrice + (selectedOption?.extraPrice || 0);

  // Generate unique payload containing custom fingerprint signatures for cart verification
  const variantPayload = {
    ...product,
    selectedOption,
    // Formulates a clean index string matching standard multi-tenant cart layouts
    customCartId: `${product.id}-${selectedOption?.name.replace(/\s+/g, '-').toLowerCase()}`
  };

  return (
    <div className="min-h-screen bg-[#FCFDFB] dark:bg-[#0A0C0B] text-slate-900 dark:text-slate-100 font-sans">
      <Head>
        <title>{product.name} | Groceries Duka Fresh</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: FRESHNESS DISPLAY */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative group aspect-square bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden border border-emerald-100 dark:border-emerald-900/30 shadow-2xl shadow-emerald-500/5">
              {/* Natural Sunlight Glow */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/10 blur-[100px] rounded-full" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-400/10 blur-[100px] rounded-full" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="relative w-full h-full flex items-center justify-center p-8 md:p-16"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Minimal Gallery Strip */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
                {currentImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`group relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                      idx === mainIndex ? 'ring-2 ring-emerald-500 ring-offset-4 dark:ring-offset-zinc-900' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url || img} alt="grocery thumb" fill className="object-cover group-hover:scale-110 transition-transform" loader={loader}/>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: MARKET DETAILS */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50/60 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-lg tracking-wide">
                  {product.productCategory?.name || 'Fresh Produce'}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                  Verified Fresh
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    KSh {variantTotalPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Price per Selected Customization</span>
                </div>
                {product.sellingPrice > product.finalPrice && (
                  <div className="px-3 py-2 bg-rose-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-rose-500/20">
                    SAVE {Math.round(((product.sellingPrice - product.finalPrice)/product.sellingPrice)*100)}%
                  </div>
                )}
              </div>
            </div>

            {/* Info Bento Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl">
                <ClockIcon className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shelf Life</p>
                <p className="text-sm font-bold">5-7 Days Fresh</p>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl">
                <MapPinIcon className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source</p>
                <p className="text-sm font-bold">Local Farms</p>
              </div>
            </div>

            {/* DYNAMIC VARIANT VARIATION OPTIONS SELECTOR */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                <span>Select Product Variation</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {availableOptions.map((opt: any, index: number) => {
                  const specificOptionQty = cart.find((item: any) => 
                    item.id === product.id && 
                    item.selectedOption?.name === opt.name
                  )?.quantity || 0;

                  const isSelected = selectedOption?.name === opt.name;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-600'
                          : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'}`}>
                          <CheckIcon className={`w-3 h-3 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{opt.name}</span>
                            {specificOptionQty > 0 && (
                              <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {specificOptionQty} staged
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{opt.category || 'Variant Option'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                        {opt.extraPrice === 0 ? 'Base Price' : `+KSh ${opt.extraPrice}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* STAGED LISTING MATRIX - COMPONENT VIEW FOR MULTIPLE DISTINCT VARIATIONS */}
            <AnimatePresence>
              {stagedProductVariants.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/80 rounded-[2rem] space-y-3"
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Staged Configurations</span>
                    <span className="text-emerald-600 font-black">{stagedProductVariants.length} Unique Configs</span>
                  </div>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {stagedProductVariants.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs shadow-sm">
                        <div className="flex items-center gap-2">
                          <SparklesIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span className="font-bold">{item.selectedOption?.name || 'Standard Setup'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-bold">Qty: {item.quantity}</span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => decreaseQuantity(item)}
                              className="p-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded transition-colors"
                            >
                              <MinusIcon className="w-3 h-3 text-slate-500" />
                            </button>
                            <button 
                              onClick={() => addToCart(item)}
                              className="p-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded transition-colors"
                            >
                              <PlusIcon className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="prose prose-slate dark:prose-invert">
              <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {product.description || "Hand-picked and sourced directly from sustainable local farms to ensure peak nutritional value and taste for your kitchen."}
              </p>
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 bg-emerald-50 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex items-center gap-6">
                {currentVariantQuantity > 0 ? (
                  <div className="flex-1 flex items-center justify-between bg-white dark:bg-zinc-800 p-2 rounded-2xl border border-emerald-200 shadow-sm h-[60px]">
                    <button 
                      onClick={() => decreaseQuantity(variantPayload)} 
                      className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-black text-center tracking-wide">
                      {currentVariantQuantity} Selected Variant
                    </span>
                    <button 
                      onClick={() => addToCart(variantPayload)} 
                      className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(variantPayload)}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Add Configuration To Basket
                  </motion.button>
                )}
              </div>
              <p className="text-center text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mt-4">
                Delivered within 2 hours in Nairobi
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* RECENTLY PICKED SECTION */}
      <section className="bg-white dark:bg-[#050505] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif font-bold italic">Perfect Pairings</h2>
              <p className="text-slate-500 font-medium">Items usually bought with this</p>
            </div>
            <button className="text-emerald-600 font-bold text-sm underline underline-offset-8">View Market</button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {related?.slice(0, 5).map((item) => (
              <motion.div key={item.id} whileHover={{ y: -8 }} className="group">
                <ProductCard product={item} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WhatsAppInquiry 
        productName={`${product.name} (${selectedOption?.name})`}
        productPrice={variantTotalPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}