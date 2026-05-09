/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  BookmarkSquareIcon,
  ShieldCheckIcon,
  SparklesIcon,
  GlobeAltIcon,
  BookOpenIcon,
  ArrowUturnLeftIcon
} from '@heroicons/react/24/solid'; // Solid Icons per instruction
import { StarIcon, PlusIcon, MinusIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useStateContext } from '@/contexts/ContextProvider';
import { MarketListingForm } from '@/types/typings';
import Link from 'next/link';
import ProductCard from '@/components/site/layouts/EcommerceBookLayout/body/components/ProductCard';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

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

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as any[])?.length ? product.images : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url;

  return (
    <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen pb-20 font-sans transition-colors duration-300">
      <Head>
        <title>{product.name} | Modern Literature Archive</title>
      </Head>

      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="max-w-7xl mx-auto px-6 py-14 flex justify-between items-center">
        <Link href="/bookecommerce/products">
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-teal-500 transition-colors">
            <ArrowUturnLeftIcon className="w-4 h-4" />
            Back to Library
          </button>
        </Link>
        <div className="flex items-center gap-4">
           <button className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-teal-500 hover:text-white transition-all">
             <HeartIcon className="w-5 h-5" />
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* LEFT: GALLERY AREA (Col 1-6) */}
        <div className="lg:col-span-6 sticky top-8">
          <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 shadow-2xl group border border-zinc-100 dark:border-zinc-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full p-8 lg:p-16 flex items-center justify-center"
              >
                <Image
                  src={currentImage}
                  alt={product.name}
                  loader={loader}
                  fill
                  className="object-contain drop-shadow-[30px_50px_80px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_0_50px_rgba(20,184,166,0.2)]"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Thumbnails Grid */}
          <div className="flex gap-4 mt-8 overflow-x-auto pb-4 px-2">
            {currentImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainIndex(idx)}
                className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  mainIndex === idx ? 'border-teal-500 scale-105 shadow-xl' : 'border-transparent opacity-40 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt="thumbnail" loader={loader} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: CONTENT AREA (Col 7-12) */}
        <div className="lg:col-span-6 space-y-10 lg:pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                {product.productCategory?.name || 'Limited Edition'}
              </span>
              <div className="flex items-center gap-1 text-yellow-500">
                <StarIcon className="w-4 h-4" />
                <span className="text-xs font-bold text-zinc-500">4.9 / 120 Reviews</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 pt-2">
              <span className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                KES {product.finalPrice?.toLocaleString()}
              </span>
              {product.sellingPrice > (product.finalPrice || 0) && (
                <div className="flex flex-col">
                  <span className="text-sm line-through text-zinc-400 font-bold">KES {product.sellingPrice?.toLocaleString()}</span>
                  <span className="text-xs font-black text-teal-600 uppercase">Save {Math.round(((product.sellingPrice - (product.finalPrice || 0)) / product.sellingPrice) * 100)}%</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-zinc-500 dark:text-zinc-400 text-xl leading-relaxed font-medium">
            A masterwork of modern storytelling, presented in a premium matte finish with archival-grade paper. A true collector's essential.
          </p>

          {/* --- BENTO METADATA GRID --- */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
             <MetaBox icon={BookOpenIcon} title="Format" value="Hardcover" />
             <MetaBox icon={GlobeAltIcon} title="Language" value="English" />
             <MetaBox icon={BookmarkSquareIcon} title="Pages" value="384" />
          </div>

          {/* --- CTA SECTION --- */}
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col sm:flex-row gap-4">
              {quantity > 0 ? (
                <div className="flex-1 flex items-center justify-between bg-white dark:bg-zinc-800 p-2 rounded-[2.5rem] shadow-sm">
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => decreaseQuantity(product.id)} 
                    className="h-14 w-14 flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded-full hover:bg-teal-500 hover:text-white transition-all"
                  >
                    <MinusIcon className="h-6 w-6" />
                  </motion.button>
                  <span className="text-2xl font-black">{quantity}</span>
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => addToCart(product)} 
                    className="h-14 w-14 flex items-center justify-center bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-all"
                  >
                    <PlusIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="flex-1 h-20 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2.5rem] flex items-center justify-center gap-4 text-xl font-black shadow-2xl transition-all"
                >
                  <ShoppingBagIcon className="h-6 w-6" />
                  Reserve Copy
                </motion.button>
              )}
            </div>
          </div>

          {/* --- TRUST BAR --- */}
          <div className="flex flex-wrap items-center gap-6 pt-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                <ShieldCheckIcon className="w-4 h-4 text-teal-500" /> Secure Checkout
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                <CheckCircleIcon className="w-4 h-4 text-teal-500" /> Premium Shipping
             </div>
          </div>
        </div>
      </main>

      <section className="max-w-7xl mx-auto px-6 mt-32 border-t border-zinc-100 dark:border-zinc-800 pt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
              Curated Selection
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white">
              Readers Also Explored
            </h2>
          </div>
          
          <Link href="/bookecommerce/products">
            <button className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
              View Entire Collection
              <div className="w-8 h-[1px] bg-zinc-200 dark:bg-zinc-700 group-hover:w-12 group-hover:bg-teal-500 transition-all" />
            </button>
          </Link>
        </div>

        {/* Grid Layout for Related Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {related?.slice(0, 4).map((book, idx) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard product={book} /> 
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- REVIEWS / FOOTER SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 mt-32">
        <div className="relative p-12 lg:p-20 rounded-[4rem] bg-teal-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
             <SparklesIcon className="w-full h-full scale-150 rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-6">Join the global library community.</h2>
            <p className="text-teal-100 text-lg mb-10 font-medium">
              Every book in our duka is sourced responsibly and curated by literary experts. We believe in the tactile power of ink on paper.
            </p>
            <button className="px-10 py-5 bg-white text-teal-600 rounded-full font-black hover:scale-105 transition-transform shadow-xl">
              Become a Member
            </button>
          </div>
        </div>
      </section>
      
      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
      
    </div>
  );
}


/* Helper Component for Metadata Grid */
function MetaBox({ icon: Icon, title, value }: any) {
  return (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 space-y-2">
      <Icon className="w-5 h-5 text-teal-500" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{title}</p>
        <p className="text-sm font-bold text-zinc-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}