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
  HeartIcon, 
  CheckBadgeIcon,
  ArchiveBoxIcon,
  ArrowsPointingOutIcon,
  SparklesIcon,
  ScaleIcon,
  SwatchIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/FurnitureLayout/body/components/ProductCard';
import { MarketListingForm } from '@/types/typings';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

type ImageObj = { url: string };

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

  // Protect against SSR window hydration runtime crashes
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url;

  return (
    <div className="bg-[#fafaf9] dark:bg-stone-950 text-[#1c1917] dark:text-stone-100 min-h-screen font-sans selection:bg-stone-700 dark:selection:bg-stone-300 selection:text-white dark:selection:text-stone-950 antialiased transition-colors duration-300 pb-24 sm:pb-12">
      <Head>
        <title>{product.name} | Artisanal Furniture Store</title>
      </Head>

      <div className="max-w-[1600px] mx-auto pt-24 sm:pt-32 pb-20 px-4 sm:px-8 lg:px-12">
        
        {/* --- ARCHITECTURAL STUDIO GALLERY & CURATION AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT COMPONENT: PATTERNED CANVAS GALLERY (Col 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative group aspect-[4/5] md:aspect-[16/11] overflow-hidden rounded-[2rem] bg-white dark:bg-stone-900 shadow-[0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-none border border-stone-200/60 dark:border-stone-800/80 transition-colors duration-300">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.215, 0.61, 0.355, 1] }}
                  className="w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Minimal Interactive Utility Overlays */}
              <button className="absolute top-5 right-5 p-3.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:scale-105 active:scale-95 duration-300">
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>

              <div className="absolute bottom-5 left-5 px-4 py-2 bg-stone-900/80 dark:bg-stone-100/90 backdrop-blur-md rounded-full text-[10px] font-mono tracking-widest uppercase text-stone-50 dark:text-stone-950 shadow-sm mix-blend-normal">
                {mainIndex + 1} // {currentImages.length}
              </div>
            </div>

            {/* Micro Thumbnail Grid Matrix */}
            <div className="grid grid-cols-4 gap-3">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 border bg-white dark:bg-stone-900 ${
                    mainIndex === idx 
                      ? 'border-stone-800 dark:border-stone-200 shadow-md ring-2 ring-stone-800/10 dark:ring-stone-200/10 scale-[1.02]' 
                      : 'opacity-60 dark:opacity-40 hover:opacity-100 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <Image src={img.url} alt="Architectural thumbnail perspective" loader={loader} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COMPONENT: STUDIO CURATION DETAILS (Col 8-12) */}
          <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-8">
            <header className="space-y-3">
              <nav className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 flex items-center gap-2">
                <span>Atelier Collections</span>
                <span>/</span>
                <span className="text-stone-800 dark:text-stone-200">{product.productCategory?.name || 'Interior Essentials'}</span>
              </nav>
              
              <h1 className="text-4xl sm:text-5xl font-serif text-stone-900 dark:text-stone-50 tracking-tight leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="text-2xl sm:text-3xl font-light tracking-tight text-stone-800 dark:text-stone-200">
                  KES {(product.finalPrice ?? product.sellingPrice ?? 0).toLocaleString()}
                </div>
                {product.sellingPrice > (product.finalPrice || 0) && (
                  <span className="text-sm line-through text-stone-400 dark:text-stone-600 font-medium">
                    KES {product.sellingPrice.toLocaleString()}
                  </span>
                )}
                <div className="h-1.5 w-1.5 bg-stone-300 dark:bg-stone-700 rounded-full" />
                <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 px-3 py-1 rounded-full border border-stone-200/60 dark:border-stone-800">
                  <StarIcon className="h-3.5 w-3.5 text-amber-500 fill-current" />
                  <span className="text-[11px] font-bold tracking-tight text-stone-700 dark:text-stone-300">4.9 Internal Review</span>
                </div>
              </div>
            </header>

            <div className="space-y-6">
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed text-base sm:text-lg font-light">
                {product.description || "A timeless silhouette crafted from sustainably sourced solid oak. Designed to bring a sense of natural tranquility to your living space."}
              </p>

              {/* Studio Guarantees Ribbon */}
              <div className="flex flex-col gap-3.5 py-6 border-y border-stone-200/70 dark:border-stone-800/80 transition-colors duration-300">
                 <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                    <CheckBadgeIcon className="h-5 w-5 text-stone-400 dark:text-stone-600" />
                    <span>Hand-finished architectural tailoring in East Africa</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                    <ArchiveBoxIcon className="h-5 w-5 text-stone-400 dark:text-stone-600" />
                    <span>Complimentary white-glove room placements inside Nairobi</span>
                 </div>
              </div>
            </div>

            {/* ACTION INTEGRATION WORKSPACE */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex-1">
                {quantity > 0 ? (
                  <div className="flex items-center justify-between border-2 border-stone-900 dark:border-stone-100 rounded-full p-1 h-16 bg-white dark:bg-stone-900">
                    <button 
                      onClick={() => decreaseQuantity(product.id)} 
                      className="p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-semibold font-mono">{quantity}</span>
                    <button 
                      onClick={() => addToCart(product)} 
                      className="p-3 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToCart(product)}
                    className="w-full h-16 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-lg shadow-stone-900/5 dark:shadow-none"
                  >
                    Add to Collection
                  </motion.button>
                )}
              </div>
              
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`h-16 w-16 flex items-center justify-center border rounded-full transition-all bg-white dark:bg-stone-900 ${
                  isWishlisted 
                    ? 'border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 text-red-500' 
                    : 'border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-400'
                }`}
              >
                <HeartIcon className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* --- THE BENTO SPECIFICATION GRID SECTION --- */}
        <section className="mt-28 sm:mt-36">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-50">Craftsmanship In Focus</h2>
              <p className="text-stone-500 dark:text-stone-400 font-light text-base sm:text-lg mt-2">
                Every piece undergoes strict spatial evaluations ensuring premium wood-grain alignments and long-term durability metrics.
              </p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-stone-200/80 dark:bg-stone-800 mx-12 mb-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5 auto-rows-[220px]">
            
            {/* Structural Material Insight Highlight Box */}
            <div className="sm:col-span-2 lg:col-span-3 lg:row-span-2 relative overflow-hidden rounded-[2rem] border border-stone-200/70 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm transition-colors duration-300 flex flex-col justify-end p-6 sm:p-10 min-h-[300px] lg:min-h-0">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent z-10" />
              <Image 
                src={currentImages[1]?.url || currentImage} 
                loader={loader}
                alt="Material Detail Grain Focus" 
                fill 
                className="object-cover transition-transform duration-[2s] hover:scale-105"
              />
              <div className="relative z-20 text-stone-100">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400 mb-2 block">// Core Material Profile</span>
                <h3 className="text-3xl font-serif mb-3 text-white">Solid Kiln-Dried Oak</h3>
                <p className="max-w-md text-stone-300 font-light text-sm leading-relaxed">
                  Harvested from responsible ecosystems and slowly conditioned across 4 weeks to eradicate internal stress lines, framing absolute geometric permanence.
                </p>
              </div>
            </div>

            {/* Metric Dimension Unit 1 */}
            <BentoCard 
              title="Total Silhouette Height" 
              value="85.5 cm" 
              icon={({className}: any) => (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className={className}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18m0 0l-3.75-3.75M12 21l3.75 3.75" />
                </svg>
              )}
            />

            {/* Metric Dimension Unit 2 */}
            <BentoCard 
              title="Architectural Width" 
              value="210 cm" 
              icon={({className}: any) => (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className={className}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18m0 0l-3.75 3.75M21 12l-3.75-3.75" />
                </svg>
              )}
            />

            {/* Solid Structural Max Load Weight Tile */}
            <div className="p-6 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-950 rounded-[2rem] flex flex-col justify-between transition-colors duration-300">
              <div className="h-11 w-11 border border-stone-800 dark:border-stone-200 rounded-full flex items-center justify-center">
                <ScaleIcon className="h-5 w-5 text-stone-400 dark:text-stone-500" />
              </div>
              <div>
                <h4 className="text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">Structural Threshold</h4>
                <p className="text-3xl font-serif">320 kg</p>
                <p className="text-[9px] text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-1.5 font-medium">Calibrated Stress Testing Verified</p>
              </div>
            </div>

            {/* Metric Finish Profile */}
            <BentoCard 
              className="lg:col-span-2"
              title="Atelier Surface Finish" 
              value="Natural Matte Protective Wax" 
              icon={SwatchIcon}
            />

            {/* Minimal Technical Verification Blueprint Slate */}
            <div className="sm:col-span-2 lg:col-span-1 bg-stone-100 dark:bg-stone-900/50 rounded-[2rem] p-6 border border-dashed border-stone-300 dark:border-stone-800 flex items-center justify-center text-center transition-colors duration-300">
              <div className="space-y-3">
                  <p className="text-stone-500 dark:text-stone-400 font-serif italic text-sm leading-relaxed">
                    "Every joint is precision mortised for a lifetime of family narratives."
                  </p>
                  <div className="flex justify-center gap-1.5">
                    {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-stone-300 dark:bg-stone-700" />)}
                  </div>
              </div>
            </div>

          </div>
        </section>

        {/* --- COMPLETE THE LOOK ARCHITECTURAL COMPILATIONS --- */}
        {related && related.length > 0 && (
          <section className="mt-28 sm:mt-36 border-t border-stone-200/60 dark:border-stone-900 pt-16 transition-colors duration-300">
            <div className="flex items-baseline justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-900 dark:text-stone-50">Complete the Environment</h2>
                <p className="text-stone-400 dark:text-stone-500 text-xs uppercase tracking-widest mt-1">Coordinated Essentials Handpicked For This Layout</p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors border-b border-stone-200 pb-1">
                Discover Catalog
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.slice(0, 4).map(r => (
                <div key={r.id} className="group">
                   <ProductCard product={r} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* --- MOBILE COMPACT STICKY TRANSACTION BAR --- */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-stone-950/80 backdrop-blur-lg border-t border-stone-200/80 dark:border-stone-900 z-50 flex gap-3 items-center shadow-[0_-10px_30px_rgba(0,0,0,0.03)] dark:shadow-none transition-colors duration-300">
        <div className="flex-1">
          {quantity > 0 ? (
            <div className="flex items-center justify-between border border-stone-900 dark:border-stone-700 rounded-xl p-1 h-14 bg-white dark:bg-stone-900">
              <button onClick={() => decreaseQuantity(product.id)} className="px-4 text-stone-700 dark:text-stone-300">
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="font-semibold font-mono text-sm">{quantity}</span>
              <button onClick={() => addToCart(product)} className="px-4 text-stone-700 dark:text-stone-300">
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="w-full h-14 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-transform"
            >
              Add To Collection
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`h-14 w-14 flex items-center justify-center border rounded-xl transition-colors bg-white dark:bg-stone-900 ${
            isWishlisted 
              ? 'border-red-200 dark:border-red-950 text-red-500 bg-red-50/40 dark:bg-red-950/10' 
              : 'border-stone-200 dark:border-stone-800 text-stone-500'
          }`}
        >
          <HeartIcon className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Dynamic WhatsApp Communications Relay */}
      {currentUrl && (
        <WhatsAppInquiry 
          productName={product.name}
          productPrice={product.finalPrice || product.sellingPrice || 0}
          productUrl={currentUrl}
          phoneNumber="254712345678"
        />
      )}
      
    </div>
  );
}

/* --- ISOLATED REUSABLE SUBCOMPONENT: STUDIO BENTO TILE --- */

const BentoCard = ({ title, value, icon: Icon, className = "" }: { title: string; value: string; icon: React.ComponentType<{ className?: string }>; className?: string }) => (
  <div className={`p-6 bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 rounded-[2rem] flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(0,0,0,0.03)] dark:hover:shadow-none transition-all duration-500 group ${className}`}>
    <div className="flex justify-between items-start">
      <div className="p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl group-hover:bg-stone-900 dark:group-hover:bg-stone-100 group-hover:text-white dark:group-hover:text-stone-950 transition-colors duration-500 text-stone-500 dark:text-stone-400">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-300 dark:text-stone-600 group-hover:text-stone-400 dark:group-hover:text-stone-500 transition-colors">Spec Profile</span>
    </div>
    <div>
      <h4 className="text-stone-400 dark:text-stone-500 text-[10px] font-bold uppercase tracking-widest mb-0.5">{title}</h4>
      <p className="text-xl font-serif text-stone-800 dark:text-stone-200 leading-tight">{value}</p>
    </div>
  </div>
);