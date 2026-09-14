/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, PlusIcon, MinusIcon, HeartIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  SparklesIcon, 
  ArrowRightIcon, 
  ShoppingBagIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceWatchLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import { resolveProductMedia } from '@/lib/product-media-resolver';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Premium fallback tiers if variants are unpopulated in the dataset
const DEFAULT_WATCH_VARIANTS = [
  { category: 'Bezel & Strap Configuration', name: 'Oystersteel Edition', extraPrice: 0 },
  { category: 'Bezel & Strap Configuration', name: 'Fluted 18ct Yellow Gold Bezel', extraPrice: 185000 },
  { category: 'Bezel & Strap Configuration', name: 'Diamond-Set Dial & President Bracelet', extraPrice: 420000 },
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

  const GOLD = '#D4AF37';
  const SLATE = '#0F172A';

  // 1. Parse configuration structures safely from database json array options
  const structuredOptions = useMemo(() => {
    return (product.option && product.option.length > 0) 
      ? (product.option as any[]) 
      : DEFAULT_WATCH_VARIANTS;
  }, [product.option]);

  // 2. Track currently viewed active option configuration
  const [selectedOption, setSelectedOption] = useState(structuredOptions[0]);

  // 3. Compute variant-specific item lookup quantifiers reactively
  const activeVariantQuantityInCart = useMemo(() => {
    return cart?.find((item: any) => 
      item.id === product.id && 
      item.selectedOption?.name === selectedOption?.name
    )?.quantity || 0;
  }, [cart, product.id, selectedOption]);

  // 4. Gather all alternative variant builds of this exact item currently in the cart
  const existingProductBuildsInCart = useMemo(() => {
    return cart?.filter((item: any) => item.id === product.id) || [];
  }, [cart, product.id]);

  // 5. Dynamically scale baseline finances relative to configuration upgrades
  const basePrice = product.finalPrice || product.sellingPrice || 750000;
  const dynamicallyAdjustedPrice = basePrice + (selectedOption?.extraPrice || 0);

  // 6. Package active options alongside base descriptors into a single compound payload
  const currentVariantPayload = useMemo(() => {
    return {
      ...product,
      selectedOption,
      // Provide a unique custom key to help state mutations map accurately
      cartVariantSignature: `${product.id}_${selectedOption?.name.toLowerCase().replace(/\s+/g, '_')}`
    };
  }, [product, selectedOption]);

  const resolvedMedia = useMemo(() => resolveProductMedia(product), [product]);
  const mediaItems = useMemo(() => {
    if (resolvedMedia.allMedia && resolvedMedia.allMedia.length > 0) return resolvedMedia.allMedia;
    return [{ type: 'image' as const, url: resolvedMedia.primaryImageUrl || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91' }];
  }, [resolvedMedia]);

  const currentMediaItem = mediaItems[mainIndex] || mediaItems[0];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-amber-500/30 mt-32">
      <Head>
        <title>{product.name} | Watch Duka Premium</title>
      </Head>

      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-80px)]">
          
          {/* LEFT: THE SHOWCASE (Visuals) */}
          <div className="lg:col-span-7 relative bg-gradient-to-b from-slate-900 to-black lg:border-r border-slate-800/50">
            <div className="sticky top-0 h-full flex flex-col justify-center p-6 lg:p-12">
              
              {/* Main Display */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-square w-full max-w-2xl mx-auto group cursor-pointer flex items-center justify-center"
                onClick={() => setIsLightboxOpen(true)}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl opacity-30" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainIndex}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full z-10 flex items-center justify-center p-4"
                  >
                    {currentMediaItem.type === 'video' ? (
                      <video
                        src={currentMediaItem.url}
                        poster={currentMediaItem.posterUrl || resolvedMedia.primaryImageUrl}
                        controls
                        playsInline
                        autoPlay
                        muted
                        loop
                        className="w-full h-full max-h-[500px] object-contain rounded-2xl drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]"
                      />
                    ) : (
                      <Image
                        src={currentMediaItem.url}
                        alt={product.name}
                        loader={loader}
                        fill
                        className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]"
                        priority
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* Sophisticated Thumbnails */}
              <div className="mt-12 flex justify-center gap-4 overflow-x-auto pb-4 no-scrollbar">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMainIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-500 border-2 ${
                      idx === mainIndex ? 'border-amber-500 scale-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-slate-800 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={item.type === 'video' ? (item.posterUrl || resolvedMedia.primaryImageUrl || 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91') : item.url}
                      alt="thumb"
                      fill
                      className="object-cover"
                      loader={loader}
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <VideoCameraIcon className="w-5 h-5 text-amber-400 drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: THE SPECIFICATIONS (Details) */}
          <div className="lg:col-span-5 p-8 lg:p-16 flex flex-col justify-center space-y-8">
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-[1px] w-8 bg-amber-500" />
                  <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">Masterpiece Collection</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-serif font-light tracking-tight leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3 w-3" />)}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Certified Authenticity</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-4 py-6 border-y border-slate-800/50">
                <span className="text-4xl font-medium text-white tracking-tighter">
                  KSh {dynamicallyAdjustedPrice.toLocaleString()}
                </span>
                {product.sellingPrice && product.sellingPrice > (product.finalPrice || 0) && (
                  <span className="text-slate-600 line-through text-lg">KSh {product.sellingPrice.toLocaleString()}</span>
                )}
              </div>

              {/* Watch Specs Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ClockIcon className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Movement</span>
                  </div>
                  <p className="text-sm font-medium">Automatic Calibre</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheckIcon className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Warranty</span>
                  </div>
                  <p className="text-sm font-medium">2-Year International</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-400 leading-relaxed text-sm font-light italic">
                {product.description || "A symphony of engineering and elegance. This timepiece represents the pinnacle of craftsmanship, designed for those who value every second."}
              </p>

              {/* --- BENTO VARIANT CHANGER --- */}
              <section className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800/60 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                  <div className="flex items-center gap-2">
                    <AdjustmentsHorizontalIcon className="w-4 h-4 text-amber-500" />
                    <span>Select Configuration Tier</span>
                  </div>
                  <span className="text-amber-500">Premium Additions</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {structuredOptions.map((opt: any, idx: number) => {
                    const isSelected = selectedOption?.name === opt.name;
                    
                    // Cross-reference current iteration item against checkout array counts
                    const specificCartMatch = cart?.find((item: any) => 
                      item.id === product.id && 
                      item.selectedOption?.name === opt.name
                    );
                    const matchingCount = specificCartMatch?.quantity || 0;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedOption(opt)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-500/80 bg-slate-900 shadow-lg shadow-amber-500/5'
                            : 'border-slate-800 bg-transparent hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-0.5 rounded-full border ${isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-slate-600 text-transparent'}`}>
                            <CheckIcon className="w-3 h-3 stroke-[3.5]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{opt.name}</span>
                              {matchingCount > 0 && (
                                <span className="bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">
                                  {matchingCount} in bag
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{opt.category || 'Configuration Variant'}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {opt.extraPrice === 0 ? 'Base Setup' : `+KSh ${opt.extraPrice.toLocaleString()}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* --- CART COMPOSITE MANIFEST TRAY --- */}
              <AnimatePresence>
                {existingProductBuildsInCart.length > 0 && (
                  <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-black p-5 rounded-2xl border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span className="flex items-center gap-2">
                        <ListBulletIcon className="w-4 h-4 text-amber-500" />
                        Selected Configurations in Order Bag
                      </span>
                      <span className="text-slate-400">{existingProductBuildsInCart.length} Unique Tier(s)</span>
                    </div>
                    
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {existingProductBuildsInCart.map((cartItem: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-300">{cartItem.selectedOption?.name || 'Standard Setup'}</span>
                            <span className="text-[10px] text-slate-500">KSh {(basePrice + (cartItem.selectedOption?.extraPrice || 0)).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-mono text-[10px]">Qty: {cartItem.quantity}</span>
                            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                              <button 
                                type="button"
                                onClick={() => decreaseQuantity(cartItem)}
                                className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                              >
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => addToCart(cartItem)}
                                className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-colors"
                              >
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  {activeVariantQuantityInCart > 0 ? (
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-full h-16 px-2">
                      <button 
                        type="button"
                        onClick={() => decreaseQuantity(currentVariantPayload)} 
                        className="w-12 h-12 flex items-center justify-center hover:text-amber-500 transition-colors"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <div className="px-4 text-center min-w-[60px]">
                        <span className="block font-bold text-md leading-none">{activeVariantQuantityInCart}</span>
                        <span className="text-[7px] uppercase tracking-widest text-slate-500 font-bold block mt-1">This Tier</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => addToCart(currentVariantPayload)} 
                        className="w-12 h-12 flex items-center justify-center hover:text-amber-500 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => addToCart(currentVariantPayload)}
                    className="flex-1 h-16 bg-white text-black rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-500 hover:text-black transition-all"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {activeVariantQuantityInCart > 0 ? 'Acquire Additional Setup Serving' : 'Acquire Selected Variation'}
                  </motion.button>

                  <button type="button" className="h-16 w-16 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all group">
                    <HeartIcon className="h-6 w-6 text-slate-500 group-hover:text-red-500" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] px-2">
                  <span className="flex items-center gap-1"><SparklesIcon className="h-3 w-3" /> Complimentary Polishing</span>
                  <span className="flex items-center gap-1"><ArrowRightIcon className="h-3 w-3" /> Secure Delivery</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>

        {/* RELATED SECTION - Editorial Style */}
        <section className="p-8 lg:p-16 border-t border-slate-900 bg-black">
          <div className="mb-12 flex flex-col items-center text-center">
            <h2 className="text-3xl font-serif mb-2">The Curation</h2>
            <p className="text-slate-500 text-sm tracking-[.3em] uppercase">Other timepieces of interest</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.slice(0, 4).map(r => (
              <div key={r.id} className="opacity-80 hover:opacity-100 transition-opacity">
                <ProductCard product={r as any} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* LIGHTBOX (Lux Version) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-[#020617]/98 backdrop-blur-2xl flex items-center justify-center p-8"
          >
            <button 
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-10 right-10 text-slate-400 hover:text-white uppercase text-xs tracking-widest font-black"
            >
              Close [esc]
            </button>
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="relative w-full h-full max-w-5xl"
            >
              <Image src={currentImage} alt="Precision view" fill className="object-contain" loader={loader} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <WhatsAppInquiry 
        productName={`${product.name} (${selectedOption?.name || 'Standard Setup'})`}
        productPrice={dynamicallyAdjustedPrice}
        productUrl={typeof window !== 'undefined' ? window.location.href : ''}
        phoneNumber="254712345678"
      />

    </div>
  );
}