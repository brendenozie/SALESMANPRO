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
  ShieldCheckIcon,
  TruckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import ProductCard from '@/components/site/layouts/EcommerceEarphonesLayout/body/components/ProductCard';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Prevent window hydration boundary mismatches safely
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Safely handle JSON arrays or structures from Prisma raw data
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

  // 2. Classify option arrays into dynamic categorical groups
  const groupedOptions = useMemo(() => {
    const groups: Record<string, VariantOption[]> = {};
    normalizedOptions.forEach((opt) => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, [normalizedOptions]);

  // 3. Set default configuration combinations based on the first variations available
  useEffect(() => {
    const initialSelection: Record<string, string> = {};
    Object.entries(groupedOptions).forEach(([category, options]) => {
      if (options.length > 0) {
        initialSelection[category] = options[0].name;
      }
    });
    setSelectedOptions(initialSelection);
  }, [groupedOptions]);

  // 4. Calculate dynamic price adjustments from active variants
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

  const liveFinalPrice = (product.finalPrice || 0) + livePriceSurcharge;
  const liveSellingPrice = (product.sellingPrice || 0) + livePriceSurcharge;

  // 5. Generate a unique key identifier matching this specific product configuration
  const currentCartItemId = useMemo(() => {
    const optionSignature = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join('-');
    return optionSignature ? `${product.id}-${optionSignature}` : product.id;
  }, [product.id, selectedOptions]);

  // 6. Look up line-item counts tied directly to this exact configuration key
  const activeVariantQuantity = useMemo(() => {
    return cart.find((item: any) => {
      const signature = item.cartItemId || (item.selectedOptions
        ? `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
        : item.id);
      return signature === currentCartItemId;
    })?.quantity || 0;
  }, [cart, currentCartItemId]);

  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url || (currentImages[mainIndex] as unknown as string) || '/placeholder.png';

  // State mutations passing configuration objects downstream to the central context
  const handleAddItem = () => {
    addToCart({
      ...product,
      finalPrice: liveFinalPrice,
      sellingPrice: liveSellingPrice,
      cartItemId: currentCartItemId,
      selectedOptions: { ...selectedOptions },
    });
  };

  const handleSubtractItem = () => {
    if (typeof decreaseQuantity === 'function') {
      decreaseQuantity(currentCartItemId, selectedOptions);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 ">
      <Head>
        <title>{product.name} | Earphones Duka</title>
      </Head>

      {/* Floating Back Button */}
      <nav className="fixed top-24 left-4 z-40 md:left-8">
        <motion.button 
          whileHover={{ x: -4 }}
          className="p-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xl"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </motion.button>
      </nav>

      <main className="max-w-[1440px] mx-auto px-4 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: STUDIO VIEWPORT */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-square md:aspect-[4/3] bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl group">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-emerald-500/10 blur-[120px] rounded-full" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="relative w-full h-full p-12"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain p-8 md:p-16 drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Thumbnail Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
                {currentImages.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setMainIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden transition-all duration-500 ${
                      idx === mainIndex ? 'ring-2 ring-emerald-500 scale-110 shadow-lg' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url || img} alt="thumb" fill className="object-cover" loader={loader} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO BENTO */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Bento Cell */}
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {product.productCategory?.name || 'Audio Elite'}
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-4 h-4" />
                  <span className="text-xs font-bold text-zinc-500">4.9 (120+ Reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-b from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mt-6">
                <span className="text-5xl font-black text-emerald-500 tracking-tighter tabular-nums">
                  KSh {liveFinalPrice.toLocaleString()}
                </span>
                {liveSellingPrice > liveFinalPrice && (
                  <span className="text-xl line-through text-zinc-400 font-medium tabular-nums">
                    KSh {liveSellingPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* DYNAMIC VARIANT OPTION CHOICE CELLS */}
            {Object.keys(groupedOptions).length > 0 && (
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                {Object.entries(groupedOptions).map(([category, options]) => (
                  <div key={category} className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block">
                      Choose {category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => {
                        const isSelected = selectedOptions[category] === opt.name;
                        return (
                          <button
                            key={opt.name}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [category]: opt.name }))}
                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border duration-200 ${
                              isSelected
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent shadow-md'
                                : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500'
                            }`}
                          >
                            <span className="mr-1">{opt.name}</span>
                            {opt.extraPrice && opt.extraPrice > 0 ? (
                              <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                (+KSh {opt.extraPrice})
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

            {/* Description Bento Cell */}
            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">The Sound Experience</h3>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {product.description || "Precision-engineered for clarity. Experience studio-grade audio with our flagship wireless technology."}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase">1 Year Warranty</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm">
                  <TruckIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase">Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* CTA ACTION CENTER */}
            <div className="p-8 bg-zinc-900 dark:bg-emerald-500 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20">
              <div className="flex items-center justify-between gap-6">
                {activeVariantQuantity > 0 ? (
                  <div className="flex-1 flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/10">
                    <button onClick={handleSubtractItem} className="p-4 hover:bg-white/10 rounded-xl transition-colors">
                      <MinusIcon className="w-6 h-6 text-white" />
                    </button>
                    <div className="text-center font-black text-white">
                      <span className="text-xl block leading-none tabular-nums">{activeVariantQuantity}</span>
                      <span className="text-[8px] uppercase tracking-widest text-white/60 mt-0.5 block font-black">This Configuration</span>
                    </div>
                    <button onClick={handleAddItem} className="p-4 hover:bg-white/10 rounded-xl transition-colors">
                      <PlusIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddItem}
                    className="w-full py-6 bg-white text-zinc-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl"
                  >
                    <ShoppingBagIcon className="w-5 h-5 text-emerald-500 dark:text-zinc-900" />
                    Add Configuration To Cart
                  </motion.button>
                )}
              </div>
              <p className="text-[9px] text-center text-white/50 font-bold uppercase tracking-widest mt-6">
                Secure M-Pesa Checkout Available
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER RELATED SECTION */}
        {related?.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-20 border-t border-zinc-200 dark:border-zinc-800 mt-20">
            <h2 className="text-2xl font-black mb-10">Complete your setup</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      
      {mounted && (
        <WhatsAppInquiry 
          productName={`${product.name} (${Object.entries(selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ') || 'Default Configuration'})`}
          productPrice={liveFinalPrice}
          productUrl={window.location.href}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}