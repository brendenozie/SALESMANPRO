/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useMemo, useState } from 'react';
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

  // Soft Baby Palette
  const primaryPink = '#F9A8D4'; // Soft Rose
  const primaryBlue = '#BAE6FD'; // Sky Blue
  const accentLavender = '#E8E8FF';

  const quantity = useMemo(() => cart.find((c: any) => c.id === product.id)?.quantity || 0, [cart, product.id]);
  const currentImages = (product.images as any[])?.length ? product.images : [{ url: '/placeholder.png' }];
  const currentImage = currentImages[mainIndex]?.url;

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
        
        {/* LEFT: THE GALLERY (Col 1-7) */}
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

        {/* RIGHT: THE DETAILS (Col 8-12) */}
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
              <span className="text-4xl font-black text-pink-400">
                KES {product.finalPrice?.toLocaleString()}
              </span>
              {product.sellingPrice > (product.finalPrice || 0) && (
                <span className="px-3 py-1 bg-blue-100 text-blue-500 rounded-full text-[10px] font-black uppercase">
                  Save KES {(product.sellingPrice - (product.finalPrice || 0)).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-500 text-lg leading-relaxed italic">
            "Designed with love and safety in mind. Made from 100% hypoallergenic materials to keep your little one cozy and happy all day long."
          </p>

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

          {/* --- CTA AREA --- */}
          <div className="pt-4 space-y-6">
            {quantity > 0 ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-[2.5rem] shadow-xl shadow-pink-100 border border-pink-50">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => decreaseQuantity(product.id)} className="h-14 w-14 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-pink-500 transition-colors">
                  <MinusIcon className="h-6 w-6" />
                </motion.button>
                <span className="text-2xl font-black text-slate-800">{quantity}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => addToCart(product)} className="h-14 w-14 flex items-center justify-center bg-pink-100 rounded-full text-pink-500 hover:bg-pink-200 transition-colors">
                  <PlusIcon className="h-6 w-6" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(249 168 214 / 0.4)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => addToCart(product)}
                className="w-full h-20 bg-gradient-to-r from-pink-300 to-pink-400 text-white rounded-[2.5rem] flex items-center justify-center gap-4 text-xl font-black shadow-2xl shadow-pink-200"
              >
                <ShoppingBagIcon className="h-7 w-7" />
                Add to Nursery
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


      <WhatsAppInquiry 
        productName={product.name}
        productPrice={product.finalPrice || product.sellingPrice || 0}
        productUrl={window.location.href}
        phoneNumber = "254712345678"
      />
    </div>
  );
}