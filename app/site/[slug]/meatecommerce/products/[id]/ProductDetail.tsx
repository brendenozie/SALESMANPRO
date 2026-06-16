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
  ClockIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import Link from 'next/link';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Theme-appropriate options fallback if product.option is empty in the database
const DEFAULT_MEAT_OPTIONS = [
  { category: 'Cut Selection', name: 'Standard 500g Fresh Cut', extraPrice: 0 },
  { category: 'Cut Selection', name: 'Premium 1kg Master Butcher Cut', extraPrice: 1200 },
  { category: 'Cut Selection', name: 'Aged 2kg Family Reserve Slab', extraPrice: 3100 },
];

export function ProductDetail({
  product,
  related,
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);

  // Safe normalization for flexible option data sets
  const availableOptions = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_MEAT_OPTIONS;
  }, [product.option]);

  // Track the active variant choice selection
  const [selectedOption, setSelectedOption] = useState(availableOptions[0]);

  // Find quantity for the specific option variation currently selected
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // Gather all variants belonging to this base product model inside the global cart
  const stagedProductVariants = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url || '/placeholder.png';

  // Dynamic pricing calculation reflecting variant add-on costs
  const basePrice = product.finalPrice || product.sellingPrice || 0;
  const variantTotalPrice = basePrice + (selectedOption?.extraPrice || 0);

  // Structural proxy payload combining base data with variant metadata for precise mutations
  const variantPayload = useMemo(() => {
    return {
      ...product,
      selectedOption,
      // unique fingerprint string ensuring separate line items in downstream actions
      customCartId: `${product.id}-${selectedOption?.name.replace(/\s+/g, '-').toLowerCase() || 'default'}`
    };
  }, [product, selectedOption]);

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
            
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent opacity-60" />

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
                <Image src={img.url || (img as any)} alt="thumb" loader={loader} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT INFO & VARIANT CONFIGURATION */}
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
                KES {variantTotalPrice.toLocaleString()}
              </div>
              {product.sellingPrice && product.sellingPrice > variantTotalPrice && (
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
              { label: 'Avg Weight', val: selectedOption?.name || 'Per 500g', icon: ScaleIcon },
              { label: 'Sourcing', val: product.brand || 'Local Farms', icon: ShieldCheckIcon },
            ].map((spec, i) => (
              <div key={i} className="bg-stone-50 dark:bg-stone-900/50 p-5 rounded-[2rem] border border-stone-200 dark:border-white/5 flex items-center gap-4 transition-colors hover:border-red-600/20">
                <div className="p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm text-red-600">
                  <spec.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-stone-400 tracking-widest leading-none mb-1">{spec.label}</p>
                  <p className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-tighter truncate max-w-[140px]">{spec.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- BENTO VARIANT CHIP SELECTOR --- */}
          <section className="space-y-3 bg-stone-50 dark:bg-stone-900/40 p-6 rounded-[2.5rem] border border-stone-200 dark:border-white/5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-400">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-red-600" />
                <span>Configure Cut & Weight Variant</span>
              </div>
              <span className="text-red-600">Options Matrix</span>
            </div>
            
            <div className="space-y-2.5">
              {availableOptions.map((opt: any, index: number) => {
                const isSelected = selectedOption?.name === opt.name;
                const allocationQty = cart.find((item: any) => 
                  item.id === product.id && 
                  item.selectedOption?.name === opt.name
                )?.quantity || 0;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/10 dark:bg-red-950/10 ring-1 ring-red-600'
                        : 'border-stone-200 dark:border-white/5 bg-white dark:bg-stone-900/60 hover:border-red-600/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-0.5 rounded-full border ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-stone-300 dark:border-stone-700 text-transparent'}`}>
                        <CheckIcon className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{opt.name}</span>
                          {allocationQty > 0 && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              {allocationQty} Active
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tight">{opt.category || 'Specification'}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-stone-900 dark:text-white">
                      {opt.extraPrice === 0 ? 'Base Tier' : `+KES ${opt.extraPrice.toLocaleString()}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* --- STAGED SELECTION MIX OVERVIEW --- */}
          <AnimatePresence>
            {stagedProductVariants.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-5 bg-stone-950 text-stone-100 rounded-[2rem] space-y-3 border border-white/5 shadow-xl"
              >
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-red-500" /> 
                    Current Order Manifest Allocation
                  </span>
                  <span className="text-red-500 font-black">{stagedProductVariants.length} Active Configurations</span>
                </div>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {stagedProductVariants.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-stone-900 p-3 rounded-xl border border-stone-800 text-xs">
                      <span className="font-medium text-stone-300">{item.selectedOption?.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-400 font-black text-[10px]">Packs: {item.quantity}</span>
                        <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800">
                          <button 
                            onClick={() => decreaseQuantity(item)}
                            className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
                          >
                            <MinusIcon className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => addToCart(item)}
                            className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
                          >
                            <PlusIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* --- ACTION CONTROLS HUB --- */}
          <div className="pt-4 space-y-6">
            {currentVariantQuantity > 0 ? (
              <div className="flex items-center justify-between bg-stone-100 dark:bg-stone-900 p-2 rounded-[2rem] border border-stone-200 dark:border-white/5 shadow-inner">
                <button 
                  onClick={() => decreaseQuantity(variantPayload)} 
                  className="h-14 w-14 flex items-center justify-center bg-white dark:bg-stone-800 rounded-2xl shadow-sm hover:text-red-600 transition-all active:scale-95 text-stone-700 dark:text-stone-300"
                >
                  <MinusIcon className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <span className="text-lg font-black text-stone-900 dark:text-white block tracking-tighter">{currentVariantQuantity} Packs</span>
                  <span className="text-[8px] font-black uppercase text-stone-400 tracking-widest block">Active Configuration Cut</span>
                </div>
                <button 
                  onClick={() => addToCart(variantPayload)} 
                  className="h-14 w-14 flex items-center justify-center bg-white dark:bg-stone-800 rounded-2xl shadow-sm hover:text-red-600 transition-all active:scale-95 text-stone-700 dark:text-stone-300"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => addToCart(variantPayload)}
                className="w-full h-20 bg-red-600 text-white rounded-[2rem] flex items-center justify-center gap-4 text-sm font-black tracking-[0.3em] shadow-2xl shadow-red-900/30 hover:bg-red-700 transition-all uppercase"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                Add Selection to Order
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
        productName={`${product.name} (${selectedOption?.name})`}
        productPrice={variantTotalPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}