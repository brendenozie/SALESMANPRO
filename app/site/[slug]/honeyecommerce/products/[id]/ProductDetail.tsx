/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon } from '@heroicons/react/24/solid';
import { 
  SunIcon, 
  BeakerIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  CheckBadgeIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceHoneyLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Artisanal fallback choices if product.option array is empty in MongoDB
const DEFAULT_HONEY_OPTIONS = [
  { category: 'Volume & Packaging', name: '250g Glass Hex Jar', extraPrice: 0 },
  { category: 'Volume & Packaging', name: '500g Drip-Free Squeeze', extraPrice: 450 },
  { category: 'Volume & Packaging', name: '1kg Premium Infusion Tub', extraPrice: 1100 },
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Normalize choice variants safely from the JSON array
  const availableOptions = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_HONEY_OPTIONS;
  }, [product.option]);

  // Track currently active user selection choice
  const [selectedOption, setSelectedOption] = useState(availableOptions[0]);

  // Compute active item quantity explicitly matching the active choice profile inside the cart
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // Gather all variations of this specific base product currently inside the cart
  const stagedProductVariants = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

      const currentImages = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80'];

  const currentImage = currentImages[mainIndex]?.url || currentImages[mainIndex] || 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80';

  // Dynamic price evaluation factoring the specific variant selection modifier
  const basePrice = product.finalPrice || product.sellingPrice || 0;
  const variantTotalPrice = basePrice + (selectedOption?.extraPrice || 0);

  // Encapsulates a distinct composite payload for tracking mutations
  const variantPayload = useMemo(() => {
    return {
      ...product,
      selectedOption,
      customCartId: `${product.id}-${selectedOption?.name.replace(/\s+/g, '-').toLowerCase() || 'default'}`
    };
  }, [product, selectedOption]);

  return (
    <div className="min-h-screen bg-[#FFFCF5] text-stone-800 selection:bg-amber-200 mt-32">
      <Head>
        <title>{product.name} | Honey Duka Artisanal</title>
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT: ORGANIC GALLERY */}
          <div className="relative lg:sticky lg:top-40">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-60 animate-pulse" />
            
            <motion.div 
              layoutId="product-image"
              className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_50px_rgba(245,158,11,0.15)] border border-amber-100/50 cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-cover p-8"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-amber-200 flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-900">100% Raw</span>
              </div>
            </motion.div>

            {/* Thumbnail Strip */}
            <div className="flex mt-8 gap-4 justify-center overflow-x-auto py-1">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden transition-all duration-300 border-2 bg-white flex-shrink-0 ${
                    idx === mainIndex ? 'border-amber-500 ring-4 ring-amber-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img.url || (img as any)} alt="thumb" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: ARTISANAL DETAILS */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                {product.productCategory?.name || 'Wildflower Harvest'}
              </div>
              <h1 className="text-5xl font-extrabold text-stone-900 tracking-tight leading-none">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-5 w-5" />)}
                </div>
                <span className="text-sm font-medium text-stone-400">4.9 (120+ Bee-lovers)</span>
              </div>
            </motion.div>

            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-black text-amber-600 tracking-tighter transition-all">
                KSh {variantTotalPrice.toLocaleString()}
              </span>
              {product.sellingPrice && product.sellingPrice > variantTotalPrice && (
                <span className="text-stone-300 line-through text-xl">
                  KSh {product.sellingPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Harvest Specs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-100 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><MapPinIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Source</p>
                  <p className="text-sm font-bold text-stone-700">{product.brand || 'Rift Valley'}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-100 flex items-center gap-3 shadow-sm">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><BeakerIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Process</p>
                  <p className="text-sm font-bold text-stone-700">Cold Pressed</p>
                </div>
              </div>
            </div>

            <p className="text-stone-500 leading-relaxed font-medium">
              {product.description || "Sun-drenched wildflowers meet artisanal harvesting. Our honey is never heated, ensuring every drop retains its natural enzymes and floral complexity."}
            </p>

            {/* MODERN ARTISANAL BENTO SELECTION PICKER */}
            <section className="space-y-3 bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-stone-400">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-amber-600" />
                  <span>Select Blend / Size Variant</span>
                </div>
                <span className="text-amber-600">Options Available</span>
              </div>
              
              <div className="space-y-2">
                {availableOptions.map((opt: any, index: number) => {
                  const isSelected = selectedOption?.name === opt.name;
                  const targetQty = cart.find((item: any) => 
                    item.id === product.id && 
                    item.selectedOption?.name === opt.name
                  )?.quantity || 0;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500'
                          : 'border-stone-100 bg-stone-50/50 hover:border-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-0.5 rounded-full border ${isSelected ? 'bg-amber-500 border-amber-500 text-white' : 'border-stone-300 text-transparent'}`}>
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-800">{opt.name}</span>
                            {targetQty > 0 && (
                              <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {targetQty} in jar
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tight">{opt.category || 'Specification'}</span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-stone-900">
                        {opt.extraPrice === 0 ? 'Base Price' : `+KSh ${opt.extraPrice.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* DYNAMIC CART MIX MATRIX OVERVIEW */}
            <AnimatePresence>
              {stagedProductVariants.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-5 bg-stone-900 text-stone-100 rounded-3xl space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-stone-400">
                    <span className="flex items-center gap-1.5">
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-amber-400" /> 
                      Current Staged Configuration Mix
                    </span>
                    <span className="text-amber-400 font-black">{stagedProductVariants.length} Variant Allocation(s)</span>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                    {stagedProductVariants.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-stone-800 p-3 rounded-xl border border-stone-700/60 text-xs">
                        <span className="font-medium text-stone-200 tracking-wide">{item.selectedOption?.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-stone-400 font-black text-[11px]">Qty: {item.quantity}</span>
                          <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-700">
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

            {/* Purchase Interaction Hub */}
            <div className="pt-2 space-y-4">
              <div className="flex gap-4">
                {currentVariantQuantity > 0 ? (
                  <div className="flex items-center bg-stone-100 rounded-2xl p-1 shadow-inner flex-1 justify-between">
                    <button 
                      onClick={() => decreaseQuantity(variantPayload)} 
                      className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-600 hover:text-amber-600 transition-colors"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <div className="text-center px-4">
                      <span className="font-black text-xl text-stone-800 block">{currentVariantQuantity}</span>
                      <span className="text-[9px] font-bold uppercase text-stone-400 tracking-widest block">Selected Config Qty</span>
                    </div>
                    <button 
                      onClick={() => addToCart(variantPayload)} 
                      className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm text-stone-600 hover:text-amber-600 transition-colors"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01, backgroundColor: '#d97706' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToCart(variantPayload)}
                    className="flex-1 h-16 bg-amber-500 text-white rounded-[1.25rem] font-black text-lg shadow-[0_10px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-3 transition-colors"
                  >
                    <ShoppingBagIcon className="h-6 w-6" />
                    Add Variation to Jar
                  </motion.button>
                )}
                
                <button className="w-16 h-16 rounded-[1.25rem] border-2 border-stone-100 flex items-center justify-center text-stone-300 hover:text-red-500 hover:border-red-50 transition-all flex-shrink-0 bg-white shadow-sm">
                  <HeartIcon className="h-7 w-7" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-stone-400 uppercase tracking-widest pt-2">
                <span className="flex items-center gap-2"><SunIcon className="h-4 w-4 text-amber-400" /> Sustainably Farmed</span>
                <span className="w-1 h-1 bg-stone-200 rounded-full" />
                <span className="flex items-center gap-2"><CheckBadgeIcon className="h-4 w-4 text-amber-400" /> Lab Tested</span>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED HARVESTS */}
        <section className="mt-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-stone-900">Sweet Pairings</h2>
              <p className="text-stone-400 font-medium">Hand-picked from our latest harvest</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <ProductCard key={r.id} product={r as any} />
            ))}
          </div>
        </section>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-stone-900/95 backdrop-blur-xl flex items-center justify-center p-6 cursor-zoom-out"
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white font-bold tracking-widest text-xs">CLOSE ✕</button>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative aspect-square w-full max-w-3xl">
              <Image src={currentImage} alt="Honey detail" fill className="object-contain" loader={loader} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WhatsAppInquiry 
        productName={`${product.name} (${selectedOption?.name})`}
        productPrice={variantTotalPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}