"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  SparklesIcon, 
  HeartIcon, 
  HandRaisedIcon,
  PlusIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

/* --- 1. DATA & TYPES --- */
const STEMS = [
  { id: "r1", name: "Red Rose", meaning: "Deep Love & Passion", price: 150, color: "bg-rose-600", img: "https://images.unsplash.com/photo-1548849010-199106093159?auto=format&fit=crop&w=300&q=80" },
  { id: "l1", name: "White Lily", meaning: "Purity & Rebirth", price: 200, color: "bg-stone-100", img: "https://images.unsplash.com/photo-1511119255288-75c6c06834cb?auto=format&fit=crop&w=300&q=80" },
  { id: "t1", name: "Yellow Tulip", meaning: "Cheerful Thoughts", price: 120, color: "bg-amber-400", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80" },
  { id: "e1", name: "Eucalyptus", meaning: "Protection & Abundance", price: 80, color: "bg-emerald-200", img: "https://images.unsplash.com/photo-1596145601000-bc1081541812?auto=format&fit=crop&w=300&q=80" },
];

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;



export default function FlowersArtisanPage() {
  const [bouquet, setBouquet] = useState<{id: string, name: string}[]>([]);
  const [activeTab, setActiveTab] = useState<"builder" | "meanings">("builder");

  const addToBouquet = (stem: typeof STEMS[0]) => {
    if (bouquet.length < 12) {
      setBouquet([...bouquet, { id: Math.random().toString(), name: stem.name }]);
    }
  };

  const removeFromBouquet = (id: string) => {
    setBouquet(bouquet.filter(item => item.id !== id));
  };

  return (
    <main className="bg-[#fffdfb] min-h-screen pt-32 pb-24 text-slate-900 overflow-hidden">
      
      {/* 1. THE ROMANTIC "ABOUT US" SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <span className="w-8 h-px bg-rose-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-400">The Artisan Florist</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-light tracking-tighter leading-[0.9] mb-10">
              Grown in <br />
              <span className="italic font-serif text-rose-500">The Rift.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
              Based in Nairobi, we partner with independent growers in Naivasha to bring you stems that are still dew-kissed when they reach your door. We believe every petal tells a story.
            </p>

            <div className="flex gap-12">
               <div className="group">
                  <div className="text-4xl font-serif italic text-rose-400 mb-2 group-hover:translate-y-[-5px] transition-transform">01.</div>
                  <h4 className="text-xs font-black uppercase tracking-widest">Hand Picked</h4>
               </div>
               <div className="group">
                  <div className="text-4xl font-serif italic text-rose-400 mb-2 group-hover:translate-y-[-5px] transition-transform">02.</div>
                  <h4 className="text-xs font-black uppercase tracking-widest">Earth Friendly</h4>
               </div>
            </div>
          </motion.div>

          <div className="relative">
             <motion.div 
               initial={{ clipPath: "inset(10% 10% 10% 10% round 4rem)" }}
               animate={{ clipPath: "inset(0% 0% 0% 0% round 4rem)" }}
               transition={{ duration: 1.5, ease: "circOut" }}
               className="relative aspect-square shadow-2xl overflow-hidden"
             >
                <Image src="https://images.unsplash.com/photo-1523694559442-ef7448b0b9b3?auto=format&fit=crop&w=1200&q=80" alt="Floral Workshop" fill className="object-cover" loader={imageLoader} />
             </motion.div>
             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-rose-100 rounded-full blur-3xl -z-10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2. THE INTERACTIVE HUB (BUILDER & MEANINGS) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[4rem] border border-rose-100 shadow-[0_50px_100px_-20px_rgba(251,113,133,0.1)] p-8 md:p-16">
          
          {/* Navigation Toggle */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex bg-rose-50 p-2 rounded-full border border-rose-100">
               <button 
                 onClick={() => setActiveTab("builder")}
                 className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'builder' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
               >
                 Bouquet Builder
               </button>
               <button 
                 onClick={() => setActiveTab("meanings")}
                 className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'meanings' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'}`}
               >
                 Flower Meanings
               </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "builder" ? (
              <motion.div 
                key="builder" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-16"
              >
                {/* Selection Area */}
                <div>
                  <h3 className="text-3xl font-light mb-2 italic font-serif">Compose your story</h3>
                  <p className="text-slate-400 text-sm mb-10">Add up to 12 stems to create your bespoke arrangement.</p>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {STEMS.map((stem) => (
                      <button 
                        key={stem.id}
                        onClick={() => addToBouquet(stem)}
                        className="group relative p-4 rounded-[2rem] border border-slate-50 hover:border-rose-200 transition-all text-left bg-white"
                      >
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                           <Image src={stem.img} alt={stem.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" loader={imageLoader} />
                           <div className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
                              <PlusIcon className="w-4 h-4 text-rose-500" />
                           </div>
                        </div>
                        <p className="font-bold text-slate-800">{stem.name}</p>
                        <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest">KSh {stem.price} / stem</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Area */}
                <div className="bg-rose-50/30 rounded-[3rem] p-10 border border-rose-100 flex flex-col items-center justify-between min-h-[500px] relative">
                   <div className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-300 block mb-4">Your Arrangement</span>
                      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                        {bouquet.length === 0 ? (
                           <p className="text-slate-300 italic py-20">The vase is empty...</p>
                        ) : (
                          bouquet.map((item) => (
                            <motion.div 
                              key={item.id} 
                              layoutId={item.id}
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }} 
                              className="px-4 py-2 bg-white rounded-full text-[10px] font-bold border border-rose-100 flex items-center gap-2"
                            >
                               {item.name}
                               <XMarkIcon className="w-3 h-3 cursor-pointer text-rose-300" onClick={() => removeFromBouquet(item.id)} />
                            </motion.div>
                          ))
                        )}
                      </div>
                   </div>

                   <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${bouquet.length > 0 ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-100 text-slate-300 pointer-events-none'}`}>
                     Order This Bouquet — {bouquet.length} Stems
                   </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="meanings" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {STEMS.map((stem) => (
                  <div key={stem.id} className="text-center group">
                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-6 shadow-lg">
                       <Image src={stem.img} alt={stem.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" loader={imageLoader} />
                       <div className="absolute inset-0 bg-rose-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8">
                          <p className="text-white text-sm font-medium leading-relaxed italic">"{stem.meaning}"</p>
                       </div>
                    </div>
                    <h4 className="text-lg font-serif italic">{stem.name}</h4>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}