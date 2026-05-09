/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
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
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import ProductCard from '@/components/site/layouts/EcommerceLayout/body/components/ProductCard';
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
  const [mainLoaded, setMainLoaded] = useState(false);

  // Interior Design Palette: Warm Neutrals
  const primary = '#78716c'; // Stone 600
  const bgSoft = '#fafaf9'; // Stone 50

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as ImageObj[])?.length ? (product.images as ImageObj[]) : [{ url: '/placeholder-image.png' }];
  const currentImage = currentImages[mainIndex]?.url;

  return (
    <div className="bg-[#fafaf9] text-[#1c1917] min-h-screen font-sans selection:bg-[#78716c] selection:text-white mt-36 px-4 sm:px-10">
      <Head>
        <title>{product.name} | Artisanal Furniture</title>
      </Head>

      <div className="max-w-[1600px] mx-auto pt-10 pb-20 px-4 sm:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* --- LEFT: ARCHITECTURAL GALLERY (Col 1-7) --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group aspect-[4/5] md:aspect-[16/10] overflow-hidden rounded-3xl bg-white shadow-sm border border-stone-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mainIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="w-full h-full"
                >
                  <Image
                    src={currentImage}
                    alt={product.name}
                    loader={loader}
                    fill
                    className="object-cover"
                    priority
                    onLoadingComplete={() => setMainLoaded(true)}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Zoom Button */}
              <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-stone-200">
                <ArrowsPointingOutIcon className="h-5 w-5 text-stone-600" />
              </button>

              {/* Image Counter Overlay */}
              <div className="absolute bottom-6 left-6 px-4 py-2 bg-stone-900/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase">
                {mainIndex + 1} / {currentImages.length}
              </div>
            </div>

            {/* Thumbnails Asymmetric Grid */}
            <div className="grid grid-cols-4 gap-4">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainIndex(idx)}
                  className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-500 ${
                    mainIndex === idx ? 'ring-2 ring-stone-800 ring-offset-4' : 'opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                  }`}
                >
                  <Image src={img.url} alt="thumb" loader={loader} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* --- RIGHT: PRODUCT CURATION (Col 8-12) --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-10">
            <header className="space-y-4">
              <nav className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 flex gap-2">
                <span>Collections</span>
                <span>/</span>
                <span className="text-stone-800">{product.productCategory?.name || 'Interior'}</span>
              </nav>
              
              <h1 className="text-5xl md:text-6xl font-serif text-stone-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-6 pt-2">
                <div className="text-3xl font-light text-stone-800">
                  KES {(product.finalPrice ?? 0).toLocaleString()}
                </div>
                <div className="h-1 w-1 bg-stone-300 rounded-full" />
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 text-stone-800 fill-current" />
                  <span className="text-xs font-bold tracking-tighter">4.9 Internal Review</span>
                </div>
              </div>
            </header>

            <div className="space-y-6">
              <p className="text-stone-500 leading-relaxed text-lg font-light">
                {product.description || "A timeless silhouette crafted from sustainably sourced solid oak. Designed to bring a sense of natural tranquility to your living space."}
              </p>

              <div className="flex flex-col gap-4 py-8 border-y border-stone-200">
                 <div className="flex items-center gap-3 text-sm text-stone-600">
                    <CheckBadgeIcon className="h-5 w-5 text-stone-400" />
                    <span>Hand-finished in Kenya</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-stone-600">
                    <ArchiveBoxIcon className="h-5 w-5 text-stone-400" />
                    <span>Free White-Glove Delivery in Nairobi</span>
                 </div>
              </div>
            </div>

            {/* ACTION CENTER */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                {quantity > 0 ? (
                  <div className="flex items-center justify-between border-2 border-stone-800 rounded-full p-1 h-16">
                    <button onClick={() => decreaseQuantity(product.id)} className="p-3 hover:bg-stone-100 rounded-full transition-colors">
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <span className="text-xl font-medium">{quantity}</span>
                    <button onClick={() => addToCart(product)} className="p-3 hover:bg-stone-100 rounded-full transition-colors">
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => addToCart(product)}
                    className="w-full h-16 bg-stone-900 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-stone-800 shadow-xl shadow-stone-200 transition-all"
                  >
                    Add to Collection
                  </motion.button>
                )}
              </div>
              
              <button className="h-16 w-16 flex items-center justify-center border border-stone-200 rounded-full hover:bg-white transition-colors">
                <HeartIcon className="h-6 w-6 text-stone-400 hover:text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* --- The Bento Grid Section --- */}
        <section className="mt-32 max-w-[1600px] mx-auto px-4 sm:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4">Craftsmanship in Detail</h2>
              <p className="text-stone-500 font-light text-lg italic">
                "Design is not just what it looks like and feels like. Design is how it works." — Precise engineering meets organic materials.
              </p>
            </div>
            <div className="hidden md:block h-px flex-1 bg-stone-200 mx-12 mb-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[240px]">
            
            {/* Large Material Focus Card */}
            <div className="md:col-span-2 lg:col-span-3 row-span-2 relative overflow-hidden rounded-[2.5rem] group border border-stone-200 bg-white">
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent z-10" />
              <Image 
                src={currentImages[1]?.url || currentImage} 
                loader={loader}
                alt="Material Detail" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
              />
              <div className="absolute bottom-10 left-10 z-20 text-white">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] mb-3 opacity-80">Primary Material</h4>
                <h3 className="text-4xl font-serif mb-4">Solid Kenyan Oak</h3>
                <p className="max-w-sm text-stone-200 font-light leading-relaxed">
                  Sustainably harvested and kiln-dried for 4 weeks to ensure structural integrity and a rich, natural grain pattern.
                </p>
              </div>
            </div>

            {/* Dimension: Height */}
            <BentoCard 
              title="Total Height" 
              value="85.5 cm" 
              icon={({className}:any) => (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75L12 3m0 0l3.75 3.75M12 3v18m0 0l-3.75-3.75M12 21l3.75 3.75" />
                </svg>
              )}
            />

            {/* Dimension: Width */}
            <BentoCard 
              title="Width" 
              value="210 cm" 
              icon={({className}:any) => (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18m0 0l-3.75 3.75M21 12l-3.75-3.75" />
                </svg>
              )}
            />

            {/* Weight Capacity Card - Full width on small, 1 col on large */}
            <div className="md:col-span-2 lg:col-span-1 p-8 bg-stone-900 text-white rounded-[2rem] flex flex-col justify-between shadow-2xl shadow-stone-300">
              <div className="h-12 w-12 border border-stone-700 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold">KG</span>
              </div>
              <div>
                <h4 className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Max Load</h4>
                <p className="text-3xl font-serif leading-tight">320 kg</p>
                <p className="text-[10px] text-stone-500 uppercase mt-2">Tested for durability</p>
              </div>
            </div>

            {/* Material: Finish */}
            <BentoCard 
              className="lg:col-span-2"
              title="Finish" 
              value="Natural Matte Wax" 
              icon={({className}:any) => (
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l.833 4.242a.75.75 0 001.274.375l3.033-2.426a.75.75 0 01.916 0l3.033 2.426a.75.75 0 001.274-.375l.833-4.242" />
                </svg>
              )}
            />

            {/* Blueprint Quote Card */}
            <div className="md:col-span-4 lg:col-span-1 bg-stone-100 rounded-[2rem] p-8 border border-dashed border-stone-300 flex items-center justify-center text-center">
              <div>
                  <p className="text-stone-400 font-serif italic text-sm">"Every joint is hand-fitted for a lifetime of use."</p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-stone-300" />)}
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- RELATED CURATION --- */}
        {related && related.length > 0 && (
          <section className="mt-40">
            <div className="flex items-baseline justify-between mb-12 border-b border-stone-200 pb-8">
              <h2 className="text-3xl font-serif">Complete the Look</h2>
              <button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900">
                Discover More
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {related.slice(0, 4).map(r => (
                <div key={r.id} className="group cursor-pointer">
                   <div className="aspect-[4/5] relative rounded-2xl overflow-hidden mb-4 bg-white">
                      <Image src={r.images[0]?.url || r.images[0]} alt={r.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" loader={loader}/>
                   </div>
                   <h3 className="font-serif text-lg text-stone-800">{r.name}</h3>
                   <p className="text-stone-400 text-sm">KES {r.finalPrice?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
      
    </div>
  );
}

/* --- Add this component or section below the main product detail grid --- */

const BentoCard = ({ title, value, icon: Icon, className = "" }: any) => (
  <div className={`p-8 bg-white border border-stone-200 rounded-[2rem] flex flex-col justify-between hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 group ${className}`}>
    <div className="flex justify-between items-start">
      <div className="p-3 bg-stone-50 rounded-2xl group-hover:bg-stone-900 group-hover:text-white transition-colors duration-500">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-stone-500">Technical Spec</span>
    </div>
    <div>
      <h4 className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-2xl font-serif text-stone-800 leading-tight">{value}</p>
    </div>
  </div>
);

