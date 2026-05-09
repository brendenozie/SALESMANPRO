/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FireIcon, 
  ClockIcon, 
  HandRaisedIcon, 
  InformationCircleIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import WhatsAppInquiry from '@/components/site/layouts/EcommerceLayout/body/components/WhatsAppInquiry';

const loader = ({ src }: { src: string }) => src;

export default function RestaurantDishDetail({ product, storeFormData }: any) {
  const [quantity, setQuantity] = useState(1);
  const primaryColor =  '#e11d48'; // Default Rose/Red storeFormData?.themeSettings?.primaryColor ||

  // Mock culinary details
  const dietary = ['Gluten Free', 'Organic', 'Spicy'];
  const ingredients = ['Aged Ribeye', 'Truffle Butter', 'Smoked Paprika', 'Maldon Salt'];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#080808] transition-colors duration-500 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        
        {/* --- LEFT: THE CULINARY CANVAS --- */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-0 h-[60vh] lg:h-screen flex items-center justify-center p-8 lg:p-20 overflow-hidden">
          {/* Decorative Ambient Glow */}
          <div 
            className="absolute w-[600px] h-[600px] blur-[150px] opacity-20 rounded-full" 
            style={{ backgroundColor: primaryColor }}
          />
          
          <div className="relative w-full max-w-xl aspect-square">
            <motion.div
              initial={{ rotate: -20, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full relative"
            >
              <Image
                src={product.images[0]?.url || product.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000'}
                alt={product.name}
                fill
                className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_35px_35px_rgba(255,255,255,0.05)]"
                loader={loader}
                priority
              />
            </motion.div>

            {/* Floating Nutrition Badges */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute top-10 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-1">
                <FireIcon className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-black dark:text-white">640 kcal</span>
              </div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Per Serving</p>
            </motion.div>
          </div>
        </div>

        {/* --- RIGHT: THE MENU EXPERIENCE --- */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-[#0c0c0c] p-8 lg:p-24 flex flex-col justify-center border-l border-zinc-100 dark:border-zinc-900 relative z-10 shadow-2xl">
          <div className="max-w-lg mx-auto lg:mx-0">
            
            {/* Header: Identity & Ethos */}
            <header className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                  <StarSolid className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-black dark:text-white">4.9 Rare Find</span>
                </div>
                <div className="flex gap-2">
                  {dietary.map(d => (
                    <span key={d} className="text-[10px] font-bold text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full">{d}</span>
                  ))}
                </div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-zinc-900 dark:text-white mb-6 leading-[1.1] italic">
                {product.name || "Charred Octopus w/ Truffle"}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-medium dark:text-zinc-100">KSh {product.finalPrice?.toLocaleString() || '2,450'}</span>
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">In Stock</span>
              </div>
            </header>

            {/* Description & Chef's Note */}
            <section className="mb-12">
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-8">
                {product.description || "A masterclass in texture. Slow-braised for six hours then finished over an open flame for that perfect smokiness."}
              </p>
              
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border-l-4" style={{ borderLeftColor: primaryColor }}>
                <div className="flex items-center gap-3 mb-2">
                  <HandRaisedIcon className="w-5 h-5 text-zinc-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Chef's Secret</span>
                </div>
                <p className="text-sm italic text-zinc-600 dark:text-zinc-300">"We source our seafood daily from the coast to ensure that briny freshness is never lost."</p>
              </div>
            </section>

            {/* Ingredients Tags */}
            <section className="mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4" /> Key Ingredients
              </h3>
              <div className="flex flex-wrap gap-3">
                {ingredients.map(ing => (
                  <span key={ing} className="px-5 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-xs font-medium dark:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors">
                    {ing}
                  </span>
                ))}
              </div>
            </section>

            {/* Sticky Action Footer */}
            <footer className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex items-center gap-6">
                {/* Quantity Selector */}
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full p-2">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-sm">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Order Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 h-16 rounded-[2rem] text-white font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all"
                  style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px ${primaryColor}33` }}
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Add to My Order
                </motion.button>

                <button className="w-16 h-16 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors">
                  <HeartIcon className="w-6 h-6 text-zinc-400 group-hover:text-rose-500 transition-colors" />
                </button>
              </div>

              <div className="mt-8 flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-zinc-300" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">25-30 Mins Prep</span>
                </div>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <StarSolid className="w-4 h-4 text-zinc-300" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Award Winning</span>
                </div>
              </div>
            </footer>

          </div>
        </div>
      </div>

      {/* --- PAIRING / CROSS-SELL SECTION --- */}
      <section className="px-8 lg:px-24 py-32 bg-zinc-50 dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <h2 className="text-4xl lg:text-6xl font-serif font-bold text-zinc-900 dark:text-white italic leading-tight">
              Perfect <br/> <span className="font-light not-italic text-zinc-400">Accompaniments</span>
            </h2>
            <p className="text-zinc-500 max-w-xs text-sm font-light leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-800 pl-6">
              Our Sommelier recommends these pairings to enhance the profile of your selection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* You'd map through related products here */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden mb-6 bg-white dark:bg-zinc-900 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                  <Image src={`https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=600`} alt="Pairing" fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700" loader={loader} />
                </div>
                <h4 className="text-lg font-bold dark:text-white mb-2 tracking-tight">Classic Vintage Cabernet</h4>
                <p className="text-xs text-zinc-400 uppercase tracking-widest font-black">KSh 1,200</p>
              </div>
            ))}
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