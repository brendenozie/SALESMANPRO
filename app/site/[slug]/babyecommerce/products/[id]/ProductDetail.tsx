/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  HandThumbUpIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { StarIcon, PlusIcon, MinusIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

interface VariantOption {
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  // Safeguard window access for SSR/Hydration matching
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Safely parse option array from database schema
  const productOptions = useMemo<VariantOption[]>(() => {
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

  // 2. Map options into searchable category groups
  const groupedOptions = useMemo(() => {
    const groups: Record<string, VariantOption[]> = {};
    productOptions.forEach((opt) => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, [productOptions]);

  // 3. Set default variant selections on component layout load
  useEffect(() => {
    const initialSelection: Record<string, string> = {};
    Object.entries(groupedOptions).forEach(([category, options]) => {
      if (options.length > 0) {
        initialSelection[category] = options[0].name;
      }
    });
    setSelectedOptions(initialSelection);
  }, [groupedOptions]);

  // 4. Compute weight-based dynamic surcharges
  const variantSurcharge = useMemo(() => {
    let extra = 0;
    Object.entries(selectedOptions).forEach(([category, chosenValue]) => {
      const match = productOptions.find(
        (o) => o.category === category && o.name === chosenValue
      );
      if (match?.extraPrice) extra += match.extraPrice;
    });
    return extra;
  }, [selectedOptions, productOptions]);

  const liveFinalPrice = (product.finalPrice || 0) + variantSurcharge;
  const liveSellingPrice = (product.sellingPrice || 0) + variantSurcharge;

  // 5. Construct a deterministic compound key to uniquely identify this variant configuration
  const currentCartItemId = useMemo(() => {
    const sortedString = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join('-');
    return sortedString ? `${product.id}-${sortedString}` : product.id;
  }, [product.id, selectedOptions]);

  // 6. Read the quantity specific to this exact variation sequence from the global state
  const variantQuantity = useMemo(() => {
    return cart.find((item: any) => {
      const itemSignature = item.cartItemId || (item.selectedOptions
        ? `${item.id}-${Object.entries(item.selectedOptions).sort(([a], [b]) => a.localeCompare(b)).map(([cat, val]) => `${cat}:${val}`).join('-')}`
        : item.id);
      return itemSignature === currentCartItemId;
    })?.quantity || 0;
  }, [cart, currentCartItemId]);

    const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];

  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80';

  // Interceptors to pass complete line-item configuration payloads
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
    // Falls back gracefully regardless of whether context tracks item via compound string or discrete objects
    if (typeof decreaseQuantity === 'function') {
      decreaseQuantity(currentCartItemId, selectedOptions);
    }
  };

  return (
    <div className="bg-[#FAF9F6] text-[#4A4A4A] min-h-screen pb-20 font-sans">
      <Head>
        <title>{product.name} | Gentle Care for Your Little One</title>
      </Head>

      {/* --- FLOATING BREADCRUMB --- */}
      <nav className="max-w-7xl mx-auto px-4 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-pink-100 text-[11px] font-bold uppercase tracking-widest text-pink-400">
          <span>Nursery</span> <span className="text-pink-200">/</span> 
          <span>{product.productCategory?.name || 'Essential'}</span> <span className="text-pink-200">/</span>
          <span className="text-slate-400">{product.name}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* LEFT: THE GALLERY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(249,168,212,0.15)] border-4 border-white group">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full p-12"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            
            <button className="absolute top-8 right-8 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:text-pink-500 transition-colors">
              <HeartIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center gap-4 overflow-x-auto py-2">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  mainIndex === idx ? 'border-pink-300 scale-110 shadow-lg' : 'border-transparent bg-white opacity-60'
                }`}
              >
                <Image src={img.url} alt="thumb" loader={loader} fill className="object-cover p-2" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: THE DETAILS */}
        <div className="lg:col-span-5 space-y-8 lg:pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
              </div>
              <span className="text-xs font-bold text-slate-400">(120+ Happy Parents)</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-[1.1]">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-4xl font-black text-pink-400 tabular-nums">
                KES {liveFinalPrice.toLocaleString()}
              </span>
              {liveSellingPrice > liveFinalPrice && (
                <span className="px-3 py-1 bg-blue-100 text-blue-500 rounded-full text-[10px] font-black uppercase">
                  Save KES {(liveSellingPrice - liveFinalPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-500 text-lg leading-relaxed italic">
            "Designed with love and safety in mind. Made from 100% hypoallergenic materials to keep your little one cozy and happy all day long."
          </p>

          {/* --- OPTIONS VARIANT SELECTOR GRID --- */}
          {Object.keys(groupedOptions).length > 0 && (
            <div className="p-6 bg-white border border-pink-100/60 rounded-[2.5rem] shadow-[0_15px_35px_rgba(249,168,212,0.05)] space-y-6">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="space-y-2.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                    Choose {category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const isSelected = selectedOptions[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [category]: opt.name }))}
                          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all border duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-r from-pink-300 to-pink-400 text-white border-transparent shadow-md shadow-pink-300/20 scale-[1.02]'
                              : 'bg-slate-50/60 text-slate-600 border-slate-100 hover:border-pink-200 hover:bg-white'
                          }`}
                        >
                          <span className="mr-1">{opt.name}</span>
                          {opt.extraPrice && opt.extraPrice > 0 ? (
                            <span className={`text-[10px] font-medium tracking-tight ${isSelected ? 'text-pink-100' : 'text-pink-400'}`}>
                              (+Kes {opt.extraPrice})
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

          {/* --- TRUST BENTO GRID --- */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Non-Toxic', icon: ShieldCheckIcon, color: 'bg-green-50 text-green-600' },
              { label: 'Ultra Soft', icon: SparklesIcon, color: 'bg-purple-50 text-purple-600' },
              { label: 'Mom Approved', icon: FaceSmileIcon, color: 'bg-blue-50 text-blue-600' },
              { label: 'Easy Clean', icon: HandThumbUpIcon, color: 'bg-orange-50 text-orange-600' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} p-4 rounded-[2rem] flex flex-col items-center justify-center text-center gap-2 border-b-4 border-black/5`}>
                <item.icon className="h-6 w-6" />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>

          {/* --- CTA METHOD CONTROLS --- */}
          <div className="pt-4 space-y-6">
            {variantQuantity > 0 ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-[2.5rem] shadow-xl shadow-pink-100 border border-pink-50">
                <motion.button 
                  whileTap={{ scale: 0.9 }} 
                  onClick={handleSubtractItem} 
                  className="h-14 w-14 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-pink-500 transition-colors"
                >
                  <MinusIcon className="h-6 w-6" />
                </motion.button>
                <div className="text-center">
                  <span className="text-2xl font-black text-slate-800 block leading-none">{variantQuantity}</span>
                  <span className="text-[9px] font-black text-pink-400/70 uppercase tracking-widest block mt-1">This Variant</span>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }} 
                  onClick={handleAddItem} 
                  className="h-14 w-14 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 hover:bg-pink-200 transition-colors"
                >
                  <PlusIcon className="h-6 w-6" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(249 168 214 / 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddItem}
                className="w-full h-20 bg-gradient-to-r from-pink-300 to-pink-400 text-white rounded-[2.5rem] flex items-center justify-center gap-4 text-xl font-black shadow-2xl shadow-pink-200"
              >
                <ShoppingBagIcon className="h-7 w-7" />
                Add Variation to Nursery
              </motion.button>
            )}
            
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <CheckCircleIcon className="h-4 w-4 text-blue-400" />
                Free Delivery
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                <CheckCircleIcon className="h-4 w-4 text-blue-400" />
                7-Day Returns
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- CUTE FOOTER SECTION --- */}
      <section className="max-w-5xl mx-auto px-4 mt-24">
        <div className="bg-blue-50 rounded-[4rem] p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-200/40 rounded-full blur-3xl" />
          
          <SparklesIcon className="h-12 w-12 text-blue-300 mx-auto" />
          <h2 className="text-3xl font-black text-slate-800">Only the best for your bundle of joy</h2>
          <p className="max-w-xl mx-auto text-slate-500 font-medium">
            Every product in the Baby Duka is hand-picked by our team of pediatric experts and parents to ensure ultimate comfort and safety.
          </p>
          <div className="pt-4">
             <button className="px-8 py-4 bg-white text-blue-500 rounded-full font-black shadow-sm hover:shadow-md transition-all">
                View Safety Certifications
             </button>
          </div>
        </div>
      </section>

      {mounted && (
        <WhatsAppInquiry 
          productName={`${product.name} (${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Standard'})`}
          productPrice={liveFinalPrice}
          productUrl={window.location.href}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}