/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  HeartIcon, 
  ArrowRightIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon,
  GlobeAltIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { StarIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import ProductCard from '@/components/site/layouts/FashionLayout/body/components/ProductCard';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';
import { resolveProductMedia } from '@/lib/product-media-resolver';

type ImageObj = { url: string };

interface StructuredOption {
  category: string;
  name: string;
  extraPrice?: number;
}

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
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const highlightColor = '#E5FF00'; // Electric Neon Lime

  // 1. Group Multi-Variant Options Dynamically by Category
  const groupedOptions = useMemo(() => {
    const groups: Record<string, StructuredOption[]> = {};
    
    // Attempt parsing from the primary flexible JSON option array
    if (Array.isArray(product.option) && product.option.length > 0) {
      product.option.forEach((opt: any) => {
        const casted = opt as StructuredOption;
        if (casted && casted.category) {
          if (!groups[casted.category]) groups[casted.category] = [];
          groups[casted.category].push(casted);
        }
      });
    } 
    
    // Fallback to model fields if primary option JSON array is empty
    if (Object.keys(groups).length === 0) {
      if (Array.isArray(product.size) && product.size.length > 0) {
        groups['Size'] = product.size.map(s => ({ category: 'Size', name: s, extraPrice: 0 }));
      }
      if (Array.isArray(product.color) && product.color.length > 0) {
        groups['Color'] = product.color.map(c => ({ category: 'Color', name: c, extraPrice: 0 }));
      }
    }

    return groups;
  }, [product.option, product.size, product.color]);

  // 2. Active Compound Configuration Fingerprint State
  const [selectedOptions, setSelectedOptions] = useState<Record<string, StructuredOption>>({});

  // Auto-initialize options configuration with first entries to reduce friction
  useEffect(() => {
    const initialSelections: Record<string, StructuredOption> = {};
    Object.entries(groupedOptions).forEach(([category, options]) => {
      if (options.length > 0) {
        initialSelections[category] = options[0];
      }
    });
    setSelectedOptions(initialSelections);
  }, [groupedOptions]);

  // 3. Dynamic Compound Price Calculator (Base Price + Premium Option Surcharges)
  const dynamicPrices = useMemo(() => {
    const baseSellingPrice = product.sellingPrice || 0;
    const baseFinalPrice = product.finalPrice ?? baseSellingPrice;
    
    const totalExtraPrice = Object.values(selectedOptions).reduce((acc, curr) => {
      return acc + (curr.extraPrice || 0);
    }, 0);

    return {
      finalPrice: baseFinalPrice + totalExtraPrice,
      sellingPrice: baseSellingPrice + totalExtraPrice
    };
  }, [product.finalPrice, product.sellingPrice, selectedOptions]);

  // 4. Cart Identification Sync Engine (Deep Signature Lookup)
  const matchingCartItem = useMemo(() => {
    return cart.find((item: any) => {
      if (item.id !== product.id) return false;
      
      const itemOptions = item.selectedOptions || {};
      const targetCategories = Object.keys(groupedOptions);
      
      // Enforce full matching signature parity across all option keys
      return targetCategories.every(key => itemOptions[key]?.name === selectedOptions[key]?.name);
    });
  }, [cart, product.id, selectedOptions, groupedOptions]);

  const quantity = matchingCartItem?.quantity || 0;

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const mediaItems = useMemo(() => {
    if (resolvedMedia.allMedia && resolvedMedia.allMedia.length > 0) {
      return resolvedMedia.allMedia;
    }
    return [{ 
      type: 'image' as const, 
      url: resolvedMedia.primaryImageUrl || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80' 
    }];
  }, [resolvedMedia]);

  const currentMediaItem = mediaItems[mainIndex] || mediaItems[0];

  const handleVariantQuantityIncrement = () => {
    const requiredCategoriesCount = Object.keys(groupedOptions).length;
    const selectedCategoriesCount = Object.keys(selectedOptions).length;

    if (selectedCategoriesCount < requiredCategoriesCount) {
      setValidationError('Please configure all variants before adding to bag.');
      return;
    }

    setValidationError(null);
    
    // Push item signature directly down to the shared application state context
    addToCart({ 
      ...product, 
      sellingPrice: dynamicPrices.sellingPrice,
      finalPrice: dynamicPrices.finalPrice,
      selectedOptions // Injected straight into item signature space
    });
  };

  const handleVariantQuantityDecrement = () => {
    if (matchingCartItem) {
      decreaseQuantity(matchingCartItem.cartId || matchingCartItem.id); 
    }
  };

  const handleScrollRelated = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 min-h-screen font-sans selection:bg-[#E5FF00] selection:text-black antialiased transition-colors duration-300 pb-24 lg:pb-12">
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-8">
        
        {/* BREADCRUMB TEXT */}
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-6 hidden sm:block">
          Fashion / Curated Atelier / {product.productCategory?.name || 'Ready-To-Wear'}
        </div>

        {/* --- EDITORIAL WORKSPACE LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14">
          
          {/* LEFT STAGE: VISUAL CANVAS */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 shadow-sm transition-colors duration-300">
              
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <span className="backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-50 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 flex items-center gap-1.5 shadow-sm">
                  <SparklesIcon className="h-3 w-3 text-amber-500 animate-pulse" />
                  Atelier Original
                </span>
                {currentMediaItem?.type === 'video' && (
                  <span className="backdrop-blur-md bg-black/70 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                    <VideoCameraIcon className="h-3 w-3 text-emerald-400" />
                    Video Showcase
                  </span>
                )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full relative flex items-center justify-center bg-black"
                >
                  {currentMediaItem?.type === 'video' ? (
                    <video
                      src={currentMediaItem.url}
                      poster={currentMediaItem.posterUrl || resolvedMedia.primaryImageUrl}
                      controls
                      playsInline
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={currentMediaItem?.url || resolvedMedia.primaryImageUrl}
                      alt={product.name}
                      loader={loader}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-top selection:bg-transparent"
                      priority
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute bottom-6 right-6 backdrop-blur-md bg-zinc-950/70 text-white text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-md border border-white/10 select-none z-20">
                {(mainIndex + 1).toString().padStart(2, '0')} / {mediaItems.length.toString().padStart(2, '0')}
              </div>
            </div>

            {/* Interactive Dynamic Filmstrip Rail */}
            <div className="grid grid-cols-5 gap-3.5">
              {mediaItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative aspect-[3/4] overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-900 border transition-all duration-300 ${
                    mainIndex === idx 
                      ? 'ring-2 ring-zinc-950 dark:ring-white border-transparent scale-[1.02] shadow-sm' 
                      : 'opacity-60 dark:opacity-40 hover:opacity-100 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <Image 
                    src={item.type === 'video' ? (item.posterUrl || item.thumbnailUrl || resolvedMedia.primaryImageUrl) : (item.thumbnailUrl || item.url)} 
                    alt="Lookbook context frame" 
                    loader={loader} 
                    fill 
                    className="object-cover object-top" 
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <VideoCameraIcon className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT STAGE: METRIC ENGINE & VARIANT BALANCER */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 h-fit space-y-6 lg:pl-4">
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                  // {product.productCategory?.name || 'COLLECTION EXTRAORDINAIRE'}
                </span>
                <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md transition-colors duration-300">
                  <StarIcon className="h-3 w-3 text-zinc-950 dark:text-amber-400" />
                  <span className="text-[10px] font-black tracking-wider text-zinc-800 dark:text-zinc-300">4.8</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase tracking-tight leading-[0.95] text-zinc-950 dark:text-zinc-50">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 pt-1">
                <span className="text-2xl sm:text-3xl font-bold tracking-tighter text-zinc-950 dark:text-zinc-50">
                  KES {dynamicPrices.finalPrice.toLocaleString()}
                </span>
                {dynamicPrices.sellingPrice > dynamicPrices.finalPrice && (
                  <span className="text-sm line-through text-zinc-400 dark:text-zinc-500 font-bold">
                    KES {dynamicPrices.sellingPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 w-full transition-colors duration-300" />

            {/* DYNAMIC MULTI-VARIANT ATTRIBUTE SPECIFICATION GRID */}
            <div className="space-y-5">
              {validationError && (
                <p className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider animate-pulse">
                  {validationError}
                </p>
              )}

              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      {category} Selection
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2.5">
                    {options.map((opt) => {
                      const isActive = selectedOptions[category]?.name === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => {
                            setSelectedOptions(prev => ({ ...prev, [category]: opt }));
                            setValidationError(null);
                          }}
                          className={`min-h-[3.5rem] py-2 px-1 flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all relative overflow-hidden ${
                            isActive 
                              ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-50 dark:text-zinc-950 dark:border-white shadow-md' 
                              : 'bg-white dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                        >
                          <span className="truncate max-w-full px-1">{opt.name}</span>
                          {opt.extraPrice && opt.extraPrice > 0 ? (
                            <span className={`text-[8px] font-medium mt-0.5 ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              +KES {opt.extraPrice}
                            </span>
                          ) : null}
                          {isActive && (
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-[3px]" 
                              style={{ backgroundColor: highlightColor }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Action Workspace */}
            <div className="hidden sm:flex flex-col gap-3 pt-2">
              {quantity > 0 ? (
                <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                  <button 
                    onClick={handleVariantQuantityDecrement} 
                    className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors rounded-xl text-zinc-500"
                  >
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <div className="flex flex-col items-center text-center px-4 max-w-[60%]">
                    <span className="text-xl font-black text-zinc-950 dark:text-zinc-50">{quantity}</span>
                    <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider truncate max-w-full">
                      In Bag ({Object.values(selectedOptions).map(o => o.name).join(' / ')})
                    </span>
                  </div>
                  <button 
                    onClick={handleVariantQuantityIncrement} 
                    className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors rounded-xl text-zinc-950 dark:text-white"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleVariantQuantityIncrement}
                  className="w-full h-16 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-[0.2em] group shadow-xl transition-colors hover:bg-zinc-800 dark:hover:opacity-90"
                >
                  <ShoppingBagIcon className="h-4 w-4 transition-transform group-hover:rotate-6" />
                  Add to Luxury Bag
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              )}
              
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full h-16 border rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest transition-all ${
                  isWishlisted 
                    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-300'
                }`}
              >
                <HeartIcon className={`h-4 w-4 transition-transform active:scale-125 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Deep Specification Narratives */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-300 space-y-3">
               <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">// Tailoring Narrative</h4>
               <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed font-normal">
                 {product.description || "Designed for the bold. This piece combines urban utility with high-street elegance, featuring our signature breathable fabric and tailored silhouette."}
               </p>
            </div>

            {/* Dynamic Value Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-1 transition-colors duration-300">
                    <GlobeAltIcon className="h-4 w-4 text-zinc-400" />
                    <p className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400">Logistics Wide</p>
                    <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">24-48h Dispatch</p>
                </div>
                <div className="p-3.5 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-1 transition-colors duration-300">
                    <ArrowPathIcon className="h-4 w-4 text-zinc-400" />
                    <p className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400">Guarantees</p>
                    <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">7-Day Return</p>
                </div>
                <div className="p-3.5 bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 rounded-xl space-y-1 transition-colors duration-300">
                    <SparklesIcon className="h-4 w-4 text-zinc-400" />
                    <p className="text-[9px] font-black uppercase text-zinc-500 dark:text-zinc-400">Atelier Standard</p>
                    <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200">100% Authentic</p>
                </div>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC STYLED SCROLL SLIDER CONTAINER (RELATED ITEMS) --- */}
        {related && related.length > 0 && (
          <section className="mt-20 sm:mt-28 border-t border-zinc-100 dark:border-zinc-900 pt-12 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
               <div>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-zinc-950 dark:text-zinc-50">Style Coordination</h2>
                  <p className="text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-widest mt-1">Curated Outfit Alternatives From Our Stylists</p>
               </div>
               <div className="flex gap-2.5 self-end">
                  <button onClick={() => handleScrollRelated('left')} className="p-3 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleScrollRelated('right')} className="p-3 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-full hover:bg-zinc-950 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm">
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
               </div>
            </div>
            
            <div 
              ref={scrollContainerRef}
              className="flex gap-5 overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory scroll-smooth"
            >
              {related.map((r) => (
                <div key={r.id} className="w-[45%] sm:w-[30%] lg:w-[22%] shrink-0 snap-start">
                  <ProductCard product={r} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* --- MOBILE ACTION BOTTOM OVERLAY TRAY --- */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200/60 dark:border-zinc-900 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] flex gap-3 items-center transition-colors duration-300">
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`p-4 border rounded-xl flex items-center justify-center transition-colors ${
            isWishlisted 
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-950 text-red-600' 
              : 'border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900'
          }`}
        >
          <HeartIcon className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-600' : ''}`} />
        </button>
        
        {quantity > 0 ? (
          <div className="flex-1 flex items-center justify-between p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button onClick={handleVariantQuantityDecrement} className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded-lg">
              <MinusIcon className="h-4 w-4" />
            </button>
            <div className="text-center truncate px-2">
              <span className="text-sm font-black block leading-none text-zinc-950 dark:text-zinc-50">{quantity}</span>
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight block mt-1 truncate">
                {Object.values(selectedOptions).map(o => o.name).join('/')}
              </span>
            </div>
            <button onClick={handleVariantQuantityIncrement} className="p-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleVariantQuantityIncrement}
            className="flex-1 h-14 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
          >
            <ShoppingBagIcon className="h-4 w-4" />
            Bag Options
          </button>
        )}
      </div>

      {/* WhatsApp Inquiry Engine */}
      {currentUrl && (
        <WhatsAppInquiry 
          productName={`${product.name} (${Object.values(selectedOptions).map(o => o.name).join(' / ')})`}
          productPrice={dynamicPrices.finalPrice}
          productUrl={currentUrl}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}