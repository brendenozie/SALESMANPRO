/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  InformationCircleIcon,
  BeakerIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

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

  // Prevent SSR hydration mismatch on window metrics
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Parse and safe-cast the database options Json structure
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

  // 2. Group available options into categorized lookup maps
  const groupedOptions = useMemo(() => {
    const groups: Record<string, VariantOption[]> = {};
    productOptions.forEach((opt) => {
      if (!groups[opt.category]) groups[opt.category] = [];
      groups[opt.category].push(opt);
    });
    return groups;
  }, [productOptions]);

  // 3. Hydrate defaults on mount
  useEffect(() => {
    const initialSelection: Record<string, string> = {};
    Object.entries(groupedOptions).forEach(([category, options]) => {
      if (options.length > 0) {
        initialSelection[category] = options[0].name;
      }
    });
    setSelectedOptions(initialSelection);
  }, [groupedOptions]);

  // 4. Calculate dynamic pricing totals based on variant selection weight adjustments
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

  // 5. Generate deterministic signature key for variant state checking
  const currentCartItemId = useMemo(() => {
    const sortedString = Object.entries(selectedOptions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, val]) => `${cat}:${val}`)
      .join('-');
    return sortedString ? `${product.id}-${sortedString}` : product.id;
  }, [product.id, selectedOptions]);

  // 6. Monitor active context line-item metrics for matching configurations
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


  // 7. Enriched Dispatch Interceptors
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
    decreaseQuantity(currentCartItemId, selectedOptions);
  };

  return (
    <div className="bg-[#fcfdfa] text-[#1a2e1a] min-h-screen pb-20 relative overflow-hidden pt-32">
      <Head>
        <title>{product.name} | Reliable Agrovet Solutions</title>
      </Head>

      {/* --- TOP BRAND BAR --- */}
      <div className="max-w-7xl mx-auto px-4 pt-8 flex items-center justify-between">
        <nav className="text-xs uppercase tracking-widest text-emerald-800/60 flex gap-2 font-bold">
          <span>Home</span> / <span>{product.productCategory?.name || 'Supplies'}</span>
        </nav>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase">
          <CheckBadgeIcon className="h-4 w-4" />
          Kanya-Verified Quality
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT: THE PRODUCT SHOWCASE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-emerald-100 shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full p-8"
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
            
            {product.sellingPrice > (product.finalPrice || 0) && (
              <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                OFF
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  mainIndex === idx ? 'border-emerald-600 shadow-md scale-105' : 'border-transparent bg-white'
                }`}
              >
                <Image src={img.url || img} alt="thumb" loader={loader} fill className="object-cover p-2" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: HARVEST INFO */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-bold uppercase tracking-wider">
               Stock: {product.stock || 'In Stock'} Units Available
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-emerald-700 tabular-nums">
                KES {liveFinalPrice.toLocaleString()}
              </div>
              {liveSellingPrice > liveFinalPrice && (
                <span className="text-xl line-through text-slate-400 font-medium tabular-nums">
                   KES {liveSellingPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed font-medium">
            {product.description || "A high-performance solution tailored for robust yields and livestock health. Environmentally stable and optimized for local soil and climate conditions."}
          </p>

          {/* --- DYNAMIC OPTION VARIANT SELECTOR PODS --- */}
          {Object.keys(groupedOptions).length > 0 && (
            <div className="space-y-5 p-5 bg-white border border-emerald-100 rounded-3xl shadow-sm">
              {Object.entries(groupedOptions).map(([category, options]) => (
                <div key={category} className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800/70 block">
                    Select {category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {options.map((opt) => {
                      const isSelected = selectedOptions[category] === opt.name;
                      return (
                        <button
                          key={opt.name}
                          onClick={() => setSelectedOptions(prev => ({ ...prev, [category]: opt.name }))}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/10'
                              : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <span className="mr-1">{opt.name}</span>
                          {opt.extraPrice && opt.extraPrice > 0 ? (
                            <span className={`text-[10px] font-medium tracking-tight ${isSelected ? 'text-emerald-100' : 'text-emerald-600'}`}>
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

          {/* --- TECH SPECS GRID --- */}
          <div className="grid grid-cols-2 gap-px bg-emerald-100 border border-emerald-100 rounded-2xl overflow-hidden shadow-sm">
            {[
              { label: 'Formulation', val: 'Granular/Liquid', icon: BeakerIcon },
              { label: 'Safety Period', val: '14 Days', icon: ShieldCheckIcon },
              { label: 'Target', val: 'Crop/Livestock', icon: InformationCircleIcon },
              { label: 'Delivery', val: 'Countrywide', icon: TruckIcon },
            ].map((spec, i) => (
              <div key={i} className="bg-white p-4 flex items-center gap-3">
                <spec.icon className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{spec.label}</p>
                  <p className="text-xs font-bold text-slate-800">{spec.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* --- ACTION BAR --- */}
          <div className="pt-6 space-y-4">
            {variantQuantity > 0 ? (
              <div className="flex items-center justify-between bg-emerald-50 p-2 rounded-2xl border border-emerald-200 shadow-inner">
                <button 
                  onClick={handleSubtractItem} 
                  className="h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition-colors"
                >
                  <MinusIcon className="h-6 w-6" />
                </button>
                <div className="text-center">
                  <span className="text-xl font-black text-emerald-900 block leading-tight">{variantQuantity} in Cart</span>
                  <span className="text-[9px] font-bold text-emerald-700/60 uppercase tracking-widest block">This Variant</span>
                </div>
                <button 
                  onClick={handleAddItem} 
                  className="h-12 w-12 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-emerald-600 transition-colors"
                >
                  <PlusIcon className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddItem}
                className="w-full h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center gap-3 text-lg font-black shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                ADD VARIANT TO SUPPLIES
              </motion.button>
            )}
            
            <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Secure Checkout • M-Pesa Integration Ready
            </p>
          </div>
        </div>
      </main>

      {/* --- USAGE INSTRUCTIONS --- */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black leading-tight italic">Expert Application <br/> & Usage Guide</h2>
            <ul className="space-y-4">
              {[
                'Mix according to the recommended dosage ratio.',
                'Apply during early morning or late evening.',
                'Store in a cool, dry place away from children.',
                'Wear protective gear during handling.'
              ].map((text, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="h-6 w-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                  <p className="text-slate-300 text-sm">{text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <Image src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=800" alt="Farmer" fill className="object-cover" loader={loader} />
            <div className="absolute bottom-6 left-6 z-20">
               <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Farmer Success Story</p>
               <p className="text-lg font-medium italic">"My yields increased by 40% in one season."</p>
            </div>
          </div>
        </div>
      </section>

      {mounted && (
        <WhatsAppInquiry 
          productName={`${product.name} (${Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Standard Build'})`}
          productPrice={liveFinalPrice}
          productUrl={window.location.href}
          phoneNumber="254712345678"
        />
      )}
    </div>
  );
}