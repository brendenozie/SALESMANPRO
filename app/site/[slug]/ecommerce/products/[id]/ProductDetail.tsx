/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  ShareIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowLeftIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';
import { resolveProductMedia } from '@/lib/product-media-resolver';

interface VariantOption {
  category: string;
  name: string;
  extraPrice?: number;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export function ProductDetail({ product, related }: { product: MarketListingForm; related: MarketListingForm[] }) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  
  // Safely extract window location and set mount state to prevent Next.js SSR hydration errors
  useEffect(() => {
    setCurrentUrl(window.location.href);
    setMounted(true);
  }, []);

  // 1. Safely parse and normalize product options from Prisma schema structure
  const normalizedOptions = useMemo<VariantOption[]>(() => {
    if (!product.option) return [];
    if (typeof product.option === 'string') {
      try {
        return JSON.parse(product.option);
      } catch {
        return [];
      }
    }
    return product.option as unknown as VariantOption[];
  }, [product.option]);

  // 2. Group available options by their category labels (e.g., Size, Color)
  const groupedOptions = useMemo(() => {
    const groups: Record<string, VariantOption[]> = {};
    normalizedOptions.forEach((opt) => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, [normalizedOptions]);

  // 3. Automatically select the first option of each category as a default configuration
  useEffect(() => {
    const initialSelection: Record<string, string> = {};
    Object.entries(groupedOptions).forEach(([category, options]) => {
      if (options.length > 0) {
        initialSelection[category] = options[0].name;
      }
    });
    setSelectedOptions(initialSelection);
  }, [groupedOptions]);

  // 4. Calculate live dynamic price adjustments based on selected attributes
  const livePriceSurcharge = useMemo(() => {
    let extra = 0;
    Object.entries(selectedOptions).forEach(([category, selectedValue]) => {
      const match = normalizedOptions.find(
        (o) => o.category === category && o.name === selectedValue
      );
      if (match?.extraPrice) extra += match.extraPrice;
    });
    return extra;
  }, [selectedOptions, normalizedOptions]);

  const liveFinalPrice = (product.finalPrice || product.sellingPrice || 0) + livePriceSurcharge;
  const liveSellingPrice = (product.sellingPrice || 0) + livePriceSurcharge;

  // 5. Generate a unique identity key representing this specific selection combination
  const currentCartItemId = useMemo(() => {
    const optionSignature = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join('-');
    return optionSignature ? `${product.id}-${optionSignature}` : product.id;
  }, [product.id, selectedOptions]);

  // 6. Look up line-item counts tied explicitly to this current variations match pattern
  const activeVariantQuantity = useMemo(() => {
    return cart.find((item: any) => {
      const itemSignature = item.cartItemId || (item.selectedOptions
        ? `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
        : item.id);
      return itemSignature === currentCartItemId;
    })?.quantity || 0;
  }, [cart, currentCartItemId]);

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const mediaGallery = resolvedMedia.gallery;
  const currentMedia = mediaGallery[mainIndex] || mediaGallery[0];

  // 7. Context mutations forwarding custom compound objects downstream
  const handleAddToCart = () => {
    addToCart({
      ...product,
      finalPrice: liveFinalPrice,
      sellingPrice: liveSellingPrice,
      cartItemId: currentCartItemId,
      selectedOptions: { ...selectedOptions },
    });
  };

  const handleDecreaseQuantity = () => {
    if (typeof decreaseQuantity === 'function') {
      decreaseQuantity(currentCartItemId, selectedOptions);
    }
  };

  const hasDiscount = liveSellingPrice > liveFinalPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((liveSellingPrice - liveFinalPrice) / liveSellingPrice) * 100)
    : 0;

  // Render a clean fallback string formatting active items for messaging integrations
  const variantTextString = Object.entries(selectedOptions)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen pb-32 transition-colors duration-300">
      <Head>
        <title>{product.name} | Duka Yangu</title>
      </Head>

      {/* FIXED HEADER ACTION BAR */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto noble-spacing px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" /> Back
          </button>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 hidden sm:inline">
              SKU: {product.id?.substring(0, 8)}
            </span>
            <button 
              onClick={() => navigator.share?.({ title: product.name, url: currentUrl }).catch(() => {})}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-full transition-all active:scale-95"
              aria-label="Share product"
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-8 lg:gap-16">
          
          {/* PHOTO INTERACTIVE LAB MATRIX */}
          <div className="lg:col-span-7 w-full">
            <div className="relative aspect-square sm:aspect-[4/5] sm:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden bg-white dark:bg-zinc-900 shadow-md sm:shadow-xl transition-colors">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full relative"
                >
                  {currentMedia?.type === 'VIDEO' ? (
                    <div className="w-full h-full bg-black flex items-center justify-center">
                      <video
                        src={currentMedia.url}
                        poster={currentMedia.posterUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <Image
                      src={currentMedia?.url || ''}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      loader={loader}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              {hasDiscount && (
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-red-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg z-10 animate-pulse">
                  Save {discountPercentage}%
                </div>
              )}

              {/* MOBILE INTERACTIVE PAGE PIN DOTS */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 sm:hidden z-10">
                {mediaGallery.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === mainIndex ? 'w-5 bg-emerald-500' : 'w-1.5 bg-white/60'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* DESKTOP THUMBNAILS PANEL */}
            <div className="hidden sm:flex gap-3 overflow-x-auto no-scrollbar py-4 px-1">
              {mediaGallery.map((item, idx) => {
                const thumbUrl = item.thumbnailUrl || item.posterUrl || item.url;
                return (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all bg-white dark:bg-zinc-900 shadow-sm ${
                      idx === mainIndex ? 'ring-2 ring-emerald-500 scale-95 opacity-100' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={thumbUrl} alt={`Thumbnail view ${idx + 1}`} fill className="object-cover" loader={loader}/>
                    {item.type === 'VIDEO' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                        <VideoCameraIcon className="w-5 h-5 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* VITAL CORE CONTENT DESCRIPTION MATRIX */}
          <div className="lg:col-span-5 px-4 sm:px-0 pt-6 sm:pt-0 space-y-6 sm:space-y-8">
            <header className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                <ShieldCheckIcon className="w-3.5 h-3.5" /> Verified Store
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase italic">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  4.8 (120+ Orders)
                </span>
              </div>
            </header>

            {/* DYNAMIC VARIATION CHOICE MATRIX */}
            {Object.keys(groupedOptions).length > 0 && (
              <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800/80 shadow-sm space-y-6">
                {Object.entries(groupedOptions).map(([category, options]) => (
                  <div key={category} className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500 block">
                      Choose {category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => {
                        const isSelected = selectedOptions[category] === opt.name;
                        return (
                          <button
                            key={opt.name}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [category]: opt.name }))}
                            className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
                              isSelected
                                ? 'bg-slate-950 dark:bg-white text-white dark:text-zinc-950 border-transparent shadow-sm scale-[1.02]'
                                : 'bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 border-slate-200/60 dark:border-zinc-700/60 hover:border-emerald-500'
                            }`}
                          >
                            <span className="mr-1">{opt.name}</span>
                            {opt.extraPrice && opt.extraPrice > 0 ? (
                              <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`}>
                                (+KES {opt.extraPrice})
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800/80 space-y-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                  KES {liveFinalPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg line-through text-slate-400 font-bold tabular-nums">
                    {liveSellingPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-slate-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                {product.description || "Premium quality sourced directly. High endurance and sleek finishing tailored perfectly to elevate the modern lifestyle frame."}
              </p>

              {/* TRUST SIGNALS GRID CONTAINER */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <TruckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 leading-tight">Fast Nairobi <br/> Delivery</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 leading-tight">Authentic <br/> Guarantee</span>
                </div>
              </div>

              {/* DESKTOP EXCLUSIVE ACTION PANEL CONTROL MODULE */}
              <div className="pt-4 hidden sm:block">
                {activeVariantQuantity > 0 ? (
                  <div className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-2xl border border-slate-200/40 dark:border-zinc-700/40">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleDecreaseQuantity} className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-700 text-slate-800 dark:text-white flex items-center justify-center shadow-sm">
                      <MinusIcon className="w-5 h-5" />
                    </motion.button>
                    <div className="text-center">
                      <span className="text-xl font-black text-slate-900 dark:text-white block tabular-nums">{activeVariantQuantity}</span>
                      <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 dark:text-zinc-500">Selected Option</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <PlusIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAddToCart}
                    className="w-full py-4.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-colors group"
                  >
                    <ShoppingBagIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Add Configuration to Cart
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED SHOWCASE CARDS MATRIX */}
        {related?.length > 0 && (
          <section className="mt-20 sm:mt-28 md:mt-32 px-4 sm:px-0">
            <div className="flex items-end justify-between mb-8 sm:mb-12">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1 block">Curated for you</span>
                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight italic">You Might Also Like</h2>
              </div>
              <button className="text-xs font-black uppercase tracking-widest text-emerald-500 border-b-2 border-emerald-500 pb-1 hover:text-emerald-600 transition-colors">
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r as any} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* RE-ENGINEERED SMART MOBILE FLOATING ACTION HUB */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90">
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-4">
          <div className="pl-2 shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Total Price</p>
            <p className="text-lg font-black text-slate-950 dark:text-white tabular-nums">
              KES {((activeVariantQuantity || 1) * liveFinalPrice).toLocaleString()}
            </p>
          </div>
          
          <div className="flex-1 max-w-[200px]">
            {activeVariantQuantity > 0 ? (
              <div className="flex items-center justify-between bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 border border-slate-200/50 dark:border-zinc-700/50">
                <button 
                  onClick={handleDecreaseQuantity} 
                  className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-700 text-slate-800 dark:text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform"
                  aria-label="Decrease item quantity"
                >
                  <MinusIcon className="w-4 h-4" />
                </button>
                <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">{activeVariantQuantity}</span>
                <button 
                  onClick={handleAddToCart} 
                  className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                  aria-label="Increase item quantity"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAddToCart}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-4 rounded-xl font-black uppercase text-[11px] tracking-wider shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Add Config
              </button>
            )}
          </div>
        </div>
      </div>

      {mounted && currentUrl && (
        <WhatsAppInquiry 
          productName={`${product.name} ${variantTextString ? `(${variantTextString})` : ''}`}
          productPrice={liveFinalPrice}
          productUrl={currentUrl}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}