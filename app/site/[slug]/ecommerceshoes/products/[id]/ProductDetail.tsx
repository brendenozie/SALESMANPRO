'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
import ProductCard from '@/components/site/layouts/EcommerceShoesLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

interface StructuredOption {
  category: string;
  name: string;
  extraPrice?: number;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function ProductDetail({
  product,
  related,
}: {
  product: MarketListingForm;
  related: MarketListingForm[];
}) {
  const { addToCart, decreaseQuantity, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const accentColor = '#DFFF00'; // High-visibility Volt Performance Green

  // 1. Group Options Dynamically by Category
  const groupedOptions = useMemo(() => {
    const groups: Record<string, StructuredOption[]> = {};
    
    // Safely parse schema options if they exist
    if (Array.isArray(product.option) && product.option.length > 0) {
      product.option.forEach((opt: any) => {
        const casted = opt as StructuredOption;
        if (casted && casted.category) {
          if (!groups[casted.category]) groups[casted.category] = [];
          groups[casted.category].push(casted);
        }
      });
    } 
    
    // Fallback Matrix to explicit model fields if global schema option json array is empty
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

  // 2. State Management for Multi-Variant Fingerprints
  const [selectedOptions, setSelectedOptions] = useState<Record<string, StructuredOption>>({});

  // Auto-initialize with first available option matrices to reduce checkout friction
  useEffect(() => {
    const initialSelections: Record<string, StructuredOption> = {};
    Object.entries(groupedOptions).forEach(([category, options]) => {
      if (options.length > 0) {
        initialSelections[category] = options[0];
      }
    });
    setSelectedOptions(initialSelections);
  }, [groupedOptions]);

  // 3. Dynamic Compound Price Calculator (Base Price + Selected Variant Premiums)
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

  // 4. Cart Item Signature Verification Engine
  const matchingCartItem = useMemo(() => {
    return cart.find((item: any) => {
      if (item.id !== product.id) return false;
      
      // Ensure precise option matches exist
      const itemOptions = item.selectedOptions || {};
      const expectedKeys = Object.keys(groupedOptions);
      
      return expectedKeys.every(key => itemOptions[key]?.name === selectedOptions[key]?.name);
    });
  }, [cart, product.id, selectedOptions, groupedOptions]);

  const quantity = matchingCartItem?.quantity || 0;

  // const currentImages = (product.images)?.length 
  //   ? (product.images) 
  //   : [{'https://via.placeholder.com/600'];
    
    const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];
  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80';


  const handleVariantQuantityIncrement = () => {
    const totalRequiredCategories = Object.keys(groupedOptions).length;
    const totalSelectedCategories = Object.keys(selectedOptions).length;

    if (totalSelectedCategories < totalRequiredCategories) {
      setValidationError('Please configure all product variants before continuing.');
      document.getElementById('variant-matrix-frame')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setValidationError(null);
    
    // Inject custom unique composite payload signature directly into state tracking framework
    addToCart({ 
      ...product, 
      sellingPrice: dynamicPrices.sellingPrice,
      finalPrice: dynamicPrices.finalPrice,
      selectedOptions // Passed directly down as structural key for mutation detection
    });
  };

  const handleVariantQuantityDecrement = () => {
    if (matchingCartItem) {
      // Pass the specific item matching current configuration context signature back down to state
      decreaseQuantity(matchingCartItem.cartId || matchingCartItem.id); 
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setMainIndex((prev) => (prev + 1) % currentImages.length);
    } else if (info.offset.x > swipeThreshold) {
      setMainIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen selection:bg-[#DFFF00] selection:text-black font-sans antialiased overflow-x-hidden transition-colors duration-300">
      
      {/* MASTER CONTAINER GRID */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] lg:h-[90vh] lg:max-h-[900px]">
        
        {/* LEFT STAGE: INTERACTIVE MEDIA GALLERY SUITE */}
        <div className="lg:col-span-7 relative bg-zinc-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden border-b border-zinc-100 dark:border-zinc-800 lg:border-b-0 lg:border-r transition-colors duration-300">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black text-zinc-900/[0.03] dark:text-white/[0.02] italic tracking-tighter select-none pointer-events-none uppercase transition-colors duration-300">
            {product.productCategory?.name || 'PERFORMANCE'}
          </div>

          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[420px] lg:max-w-[520px] flex items-center justify-center z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 0.92, rotate: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.95, rotate: -6 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                className="w-full h-full relative cursor-grab active:cursor-grabbing drop-shadow-[0_30px_50px_rgba(16,185,129,0.12)] dark:drop-shadow-[0_30px_50px_rgba(16,185,129,0.18)]"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-contain select-none pointer-events-none"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-1.5 mt-2 mb-6 lg:hidden z-20">
            {currentImages.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  mainIndex === idx ? 'w-6 bg-zinc-900 dark:bg-[#DFFF00]' : 'w-1.5 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 flex items-center gap-3 p-2 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl z-20 overflow-x-auto max-w-full no-scrollbar shadow-sm transition-colors duration-300">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                  mainIndex === idx 
                    ? 'ring-2 ring-zinc-950 dark:ring-[#DFFF00] scale-105 shadow-md' 
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <Image src={img.url || img } alt="Thumbnail context" loader={loader} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT STAGE: PRODUCT INFORMATION ENGINE */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-950 p-5 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar pb-32 lg:pb-12 transition-colors duration-300">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            <div className="flex justify-between items-center mb-5 gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-500/20 transition-colors duration-300">
                {product.productCategory?.name || 'PREMIUM RELEASE'}
              </span>
              <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-black text-zinc-700 dark:text-zinc-300">4.9</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium hidden sm:inline">(142 orders)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-[0.95] mb-4 text-zinc-950 dark:text-zinc-50">
              {product.name}
            </h1>

            {/* Price Node Hooks into dynamic computational state */}
            <div className="flex items-baseline gap-3 mb-6 sm:mb-8 border-b border-zinc-100 dark:border-zinc-900/80 pb-5 transition-colors duration-300">
              <span className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-zinc-50">
                KES {dynamicPrices.finalPrice.toLocaleString()}
              </span>
              {dynamicPrices.sellingPrice > dynamicPrices.finalPrice && (
                <span className="text-base line-through text-zinc-400 dark:text-zinc-500 font-bold">
                  KES {dynamicPrices.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">// SPECIFICATION DESIGN</h5>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl font-medium">
                {product.description || "Engineered specifically for maximum kinetic displacement and premium track-to-street versatility."}
              </p>
            </div>

            {/* DYNAMIC VARIABLE VARIANT PICKER MATRIX GRID */}
            <div id="variant-matrix-frame" className="space-y-4 mb-6 sm:mb-8">
              {validationError && (
                <div className="text-xs font-bold text-red-500 dark:text-red-400 uppercase tracking-wider animate-pulse">
                  {validationError}
                </div>
              )}
              
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div 
                  key={category} 
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-900 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
                      Select {category}
                    </h5>
                    {selectedOptions[category] && (
                      <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                        Active: {selectedOptions[category].name}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {options.map((opt) => {
                      const isSelected = selectedOptions[category]?.name === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => {
                            setSelectedOptions(prev => ({ ...prev, [category]: opt }));
                            setValidationError(null);
                          }}
                          style={{ backgroundColor: isSelected ? accentColor : undefined }}
                          className={`py-2.5 px-2 text-[11px] font-black rounded-xl border transition-all duration-200 truncate flex flex-col items-center justify-center ${
                            isSelected 
                              ? 'text-zinc-950 border-transparent shadow-md' 
                              : 'bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/40'
                          }`}
                        >
                          <span>{opt.name}</span>
                          {opt.extraPrice && opt.extraPrice > 0 ? (
                            <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-zinc-900/80' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              +KES {opt.extraPrice.toLocaleString()}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ACTIONS SYSTEM: INLINE DESKTOP HUB */}
            <div className="hidden lg:block space-y-4">
              {quantity > 0 ? (
                <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
                  <button onClick={handleVariantQuantityDecrement} className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-gray-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors rounded-xl text-zinc-500 dark:text-zinc-400">
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <div className="flex flex-col items-center max-w-[60%]">
                    <span className="text-xl font-black text-zinc-950 dark:text-zinc-50">{quantity}</span>
                    <span className="text-[8px] font-bold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider truncate max-w-full">
                      {Object.values(selectedOptions).map(o => o.name).join(' / ')}
                    </span>
                  </div>
                  <button onClick={handleVariantQuantityIncrement} className="p-3 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-gray-800 border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors rounded-xl text-emerald-600 dark:text-emerald-400">
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleVariantQuantityIncrement}
                  className="group w-full py-5 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-3 transition-all hover:bg-zinc-800 dark:hover:bg-[#DFFF00] shadow-xl"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  Add Configuration
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 sm:mt-6">
              <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 flex flex-col gap-2.5 transition-colors duration-300">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 leading-tight">100% Authentic<br/><span className="text-zinc-400 dark:text-zinc-500 font-medium text-[9px]">Verified Source Matrix</span></span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 flex flex-col gap-2.5 transition-colors duration-300">
                <TruckIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 leading-tight">Flash Dispatch<br/><span className="text-zinc-400 dark:text-zinc-500 font-medium text-[9px]">Nairobi Wide Execution</span></span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* MOBILE-ONLY STICKY TRANSACTION FOOTER TRAY */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-200/80 dark:border-t-zinc-800/80 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.045)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.3)] flex gap-3 items-center transition-colors duration-300">
        {quantity > 0 ? (
          <div className="flex-1 flex items-center justify-between p-1 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            <button onClick={handleVariantQuantityDecrement} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg shadow-sm">
              <MinusIcon className="h-4 w-4" />
            </button>
            <div className="text-center max-w-[50%] truncate">
              <span className="text-sm font-black block leading-none text-zinc-950 dark:text-zinc-50">{quantity}</span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter truncate block mt-0.5">
                {Object.values(selectedOptions).map(o => o.name).join(' / ')}
              </span>
            </div>
            <button onClick={handleVariantQuantityIncrement} className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 rounded-lg shadow-sm">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleVariantQuantityIncrement}
            style={{ backgroundColor: Object.keys(selectedOptions).length > 0 ? accentColor : undefined }}
            className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all duration-200 ${
              Object.keys(selectedOptions).length > 0
                ? 'text-zinc-950 border-transparent shadow-lg' 
                : 'bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950'
            }`}
          >
            <ShoppingBagIcon className="h-4 w-4" />
            Secure Configuration
          </button>
        )}
      </div>

      {/* --- RELATED GRID MATRICES --- */}
      {related && related.length > 0 && (
        <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-2 block">// THE SELECTION REVOLUTION</span>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">You Might Also Like</h2>
              </div>
              <button className="self-start sm:self-auto text-[10px] font-black uppercase tracking-widest border-b-2 border-zinc-950 dark:border-emerald-400 pb-1 text-zinc-800 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                View All Gear
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.slice(0, 4).map(r => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

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