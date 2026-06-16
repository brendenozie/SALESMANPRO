/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/solid';
import { 
  ShoppingCartIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommercePetsLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Curated fallbacks matching your JSON structure if options aren't pre-populated in the DB
const DEFAULT_PET_VARIANTS = [
  { category: 'Size & Volume', name: 'Standard Pack (Starter)', extraPrice: 0 },
  { category: 'Size & Volume', name: 'Value Bundle (Double Care)', extraPrice: 850 },
  { category: 'Size & Volume', name: 'Breeder Mega Box (Pro Scale)', extraPrice: 2200 },
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

  // 1. Normalize available variations from JSON options schema
  const availableVariants = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_PET_VARIANTS;
  }, [product.option]);

  // 2. Track the currently active option configuration state
  const [selectedOption, setSelectedOption] = useState(availableVariants[0]);

  // 3. Compute cart quantities isolated by specific option combinations
  const currentVariantQuantity = useMemo(() => {
    return cart.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // 4. Group all existing configured iterations of this base product for overview rendering
  const completeProductBuildsInCart = useMemo(() => {
    return cart.filter((item: any) => item.id === product.id);
  }, [cart, product.id]);

  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url ?? '/placeholder-image.png';

  // 5. Compute dynamic prices based on base costs plus selection offsets
  const baseListingPrice = product.finalPrice || product.sellingPrice || 0;
  const computedActivePrice = baseListingPrice + (selectedOption?.extraPrice || 0);

  // 6. Wrap base layout variables and selection context as a single transaction object
  const bundledVariantPayload = useMemo(() => {
    return {
      ...product,
      selectedOption,
      // Unique signature hook to help tracking mechanisms map items perfectly
      cartVariantSignature: `${product.id}_${selectedOption?.name.toLowerCase().replace(/\s+/g, '_')}`
    };
  }, [product, selectedOption]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] selection:bg-blue-100 mt-32">
      <Head>
        <title>{product.name} | Pets Duka Kenya</title>
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Breadcrumb - Playful Style */}
        <nav className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-8 bg-white w-fit px-4 py-2 rounded-full shadow-sm border border-slate-100">
          <span className="hover:text-blue-500 cursor-pointer">Shop</span>
          <span>/</span>
          <span className="hover:text-blue-500 cursor-pointer">{product.productCategory?.name || 'Pet Supplies'}</span>
          <span>/</span>
          <span className="text-blue-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          {/* LEFT: INTERACTIVE GALLERY */}
          <div className="space-y-6 lg:sticky lg:top-10">
            <motion.div 
              layoutId="product-hero"
              className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-white shadow-2xl shadow-blue-100 border-4 border-white group cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                  className="w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-contain p-8"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Top Rated
                </div>
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Pet Safe
                </div>
              </div>

              {/* Floating Action Buttons */}
              <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl text-slate-600 hover:text-red-500 hover:scale-110 transition-all">
                  <HeartIcon className="h-5 w-5" />
                </button>
                <button className="p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl text-slate-600 hover:text-blue-500 hover:scale-110 transition-all">
                  <ShareIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>

            {/* Thumbnail Carousel */}
            <div className="flex gap-4 overflow-x-auto py-2 px-1 no-scrollbar">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 transition-all border-4 ${
                    idx === mainIndex ? 'border-blue-500 scale-105 shadow-lg' : 'border-white hover:border-blue-200'
                  }`}
                >
                  <Image src={img.url ?? (img as any)} alt="thumb" fill className="object-cover" loader={loader} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: BENTO CONTENT BOXES */}
          <div className="space-y-6">
            
            {/* Box 1: Title & Price */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-orange-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-4 w-4" />)}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">120+ Paw-some Reviews</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-black text-slate-800 leading-tight mb-6">
                {product.name}
              </h1>

              <div className="flex items-center gap-6">
                <div className="text-5xl font-black text-blue-600 tracking-tighter">
                  <span className="text-2xl mr-1 italic">KSh</span>
                  {computedActivePrice.toLocaleString()}
                </div>
                {product.sellingPrice && product.sellingPrice > computedActivePrice && (
                  <div className="flex flex-col">
                    <span className="text-slate-300 line-through font-bold">{product.sellingPrice.toLocaleString()}</span>
                    <span className="text-orange-500 text-xs font-black italic">Save KSh {(product.sellingPrice - computedActivePrice).toLocaleString()}!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: Description & Quick Info */}
            <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-800 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Product Highlights
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium mb-6">
                {product.description || "Premium quality gear designed for your best friend. Durable, safe, and tested for maximum tail wags."}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl flex items-center gap-3 shadow-sm">
                  <TruckIcon className="h-5 w-5 text-blue-500" />
                  <span className="text-[10px] font-bold uppercase leading-none">Fast Delivery<br/><span className="text-slate-400 text-[8px]">Within Nairobi</span></span>
                </div>
                <div className="bg-white p-4 rounded-3xl flex items-center gap-3 shadow-sm">
                  <ArrowPathIcon className="h-5 w-5 text-orange-500" />
                  <span className="text-[10px] font-bold uppercase leading-none">Easy Return<br/><span className="text-slate-400 text-[8px]">7 Day Policy</span></span>
                </div>
              </div>
            </div>

            {/* --- BENTO OPTION PICKER GRID --- */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-600" />
                  <span>Select Product Variant Tier</span>
                </div>
                <span className="text-blue-600">Price Adjustments</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {availableVariants.map((opt: any, index: number) => {
                  const isCurrentSelection = selectedOption?.name === opt.name;
                  
                  // Query configuration-specific totals straight from context lists
                  const optionCartMatch = cart.find((item: any) => 
                    item.id === product.id && 
                    item.selectedOption?.name === opt.name
                  );
                  const optionCount = optionCartMatch?.quantity || 0;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                        isCurrentSelection
                          ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20'
                          : 'border-slate-100 bg-slate-50/50 hover:border-blue-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-0.5 rounded-full border ${isCurrentSelection ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-transparent'}`}>
                          <CheckIcon className="w-3 h-3 stroke-[3.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-800">{opt.name}</span>
                            {optionCount > 0 && (
                              <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                {optionCount} selected
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{opt.category || 'Supplies Tier'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                        {opt.extraPrice === 0 ? 'Base Price' : `+KSh ${opt.extraPrice.toLocaleString()}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- MULTI-VARIANT LIVE BUILD MANIFEST OVERVIEW --- */}
            <AnimatePresence>
              {completeProductBuildsInCart.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 8 }}
                  className="bg-slate-900 text-slate-100 p-6 rounded-[2.5rem] shadow-2xl space-y-4 border border-slate-800"
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2">
                      <Squares2X2Icon className="w-4 h-4 text-orange-400 animate-spin-slow" />
                      Current Combination Build Setup
                    </span>
                    <span className="text-orange-400 font-extrabold">{completeProductBuildsInCart.length} Active Configurations</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {completeProductBuildsInCart.map((cartItem: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-800/60 p-3.5 rounded-xl border border-slate-800 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-slate-200">{cartItem.selectedOption?.name || 'Standard Setup'}</span>
                          <span className="text-[10px] font-bold text-blue-400">KSh {(baseListingPrice + (cartItem.selectedOption?.extraPrice || 0)).toLocaleString()} each</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-black text-[10px]">Packs: {cartItem.quantity}</span>
                          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 shadow-inner">
                            <button 
                              type="button"
                              onClick={() => decreaseQuantity(cartItem)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => addToCart(cartItem)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
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

            {/* Box 3: Action Area */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
              <div className="flex flex-col sm:flex-row gap-4">
                {currentVariantQuantity > 0 ? (
                  <div className="flex items-center justify-between bg-slate-100 rounded-3xl p-2 h-16 w-full sm:w-56 border border-slate-200/60 shadow-inner">
                    <button 
                      type="button"
                      onClick={() => decreaseQuantity(bundledVariantPayload)} 
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-600 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <div className="text-center px-2">
                      <span className="font-black text-xl block leading-none">{currentVariantQuantity}</span>
                      <span className="text-[7px] font-black uppercase text-slate-400 tracking-wider mt-0.5 block">This Option</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => addToCart(bundledVariantPayload)} 
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full sm:w-fit" />
                )}

                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => addToCart(bundledVariantPayload)}
                  className="flex-1 h-16 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {currentVariantQuantity > 0 ? 'Add Additional Pack' : 'Add Option to Paws-ket'}
                </motion.button>
              </div>
              <p className="text-center mt-4 text-[10px] font-bold text-slate-400 italic">
                Free shipping on orders above KSh 5,000! 🐾
              </p>
            </div>

          </div>
        </div>

        {/* RELATED SECTION - Rounded Cards */}
        {related.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Similar Goodies</h2>
              <div className="h-1 flex-1 mx-6 bg-slate-100 rounded-full hidden sm:block" />
              <button className="text-blue-600 font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.slice(0, 4).map(r => (
                <div key={r.id} className="hover:-translate-y-2 transition-transform duration-300">
                  <ProductCard product={r as any} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-all"
            >
              <PlusIcon className="h-6 w-6 rotate-45" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative max-w-4xl w-full aspect-square bg-white rounded-[3rem] p-10 shadow-2xl"
            >
              <Image src={currentImage} alt="Zoomed view" fill className="object-contain p-10" loader={loader} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <WhatsAppInquiry 
        productName={`${product.name} (${selectedOption?.name})`}
        productPrice={computedActivePrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />
    </div>
  );
}