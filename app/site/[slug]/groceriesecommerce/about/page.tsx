"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  SunIcon, 
  HandRaisedIcon, 
  ShoppingBagIcon, 
  ScaleIcon,
  CheckBadgeIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const slideIn = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


export default function GroceryExperiencePage() {
  const [basket, setBasket] = useState<{id: string, name: string, color: string}[]>([]);
  const [activeTab, setActiveTab] = useState<"guide" | "mealkit">("guide");

  const ingredients = [
    { id: "av1", name: "Hass Avocado", ripeness: "Yields to gentle pressure", season: "March - July", color: "bg-emerald-600" },
    { id: "tm1", name: "Roma Tomato", ripeness: "Deep red, firm but heavy", season: "Year Round", color: "bg-rose-500" },
    { id: "mn1", name: "Apple Mango", ripeness: "Sweet aroma at the stem", season: "Dec - March", color: "bg-orange-400" },
  ];

  const addToKit = (item: any) => {
    if (basket.length < 6) {
      setBasket([...basket, { ...item, uniqueId: Math.random().toString() }]);
    }
  };

  return (
    <main className="bg-[#fcfaf8] min-h-screen pt-32 pb-24 text-stone-900 overflow-hidden">
      
      {/* 1. PRODUCE RIPENESS GUIDE (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={slideIn}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-px bg-emerald-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">The Ripeness Standard</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10">
              Picked for <br />
              <span className="italic font-serif font-light text-emerald-600 underline decoration-emerald-100 underline-offset-8">Now.</span>
            </h1>
            
            <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-lg mb-12">
              We don't do "cold storage." Our scouts visit farms in Limuru and Naivasha daily to ensure that what reaches your crate is at its peak nutritional density.
            </p>

            <div className="space-y-6">
               <GuidePoint icon={<SunIcon/>} title="Sun-Ripened" desc="Never forced with gas; matured naturally on the vine." />
               <GuidePoint icon={<ScaleIcon/>} title="Weight Checked" desc="Heavy produce means higher water and nutrient content." />
            </div>
          </motion.div>

          <div className="relative group">
            <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80" 
                alt="Fresh Market Produce" fill className="object-cover transition-transform duration-[5s] group-hover:scale-110"
                loader={imageLoader}
              />
            </div>
            {/* The "Organic" Badge */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white p-4 text-center rotate-12 shadow-xl border-4 border-white">
               <CheckBadgeIcon className="w-6 h-6 mb-1" />
               <span className="text-[8px] font-black uppercase tracking-widest leading-tight">100% Traceable</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WEEKLY MEAL-KIT BUILDER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[4rem] border border-stone-100 p-8 md:p-20 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)]">
          
          {/* Section Toggle */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex bg-stone-50 p-1.5 rounded-full border border-stone-100">
               <button onClick={() => setActiveTab("guide")} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'guide' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}>The Guide</button>
               <button onClick={() => setActiveTab("mealkit")} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mealkit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}>Meal-Kit Builder</button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "guide" ? (
              <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {ingredients.map(item => (
                  <div key={item.id} className="p-10 rounded-[3rem] bg-stone-50 border border-stone-100 hover:bg-white hover:border-emerald-100 transition-all group">
                    <div className={`w-12 h-12 rounded-2xl ${item.color} mb-8 shadow-inner`} />
                    <h4 className="text-2xl font-bold mb-2">{item.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6">{item.season}</p>
                    <div className="pt-6 border-t border-stone-200">
                      <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">How to tell:</p>
                      <p className="text-sm text-stone-600 leading-relaxed italic">"{item.ripeness}"</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="mealkit" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                  <h3 className="text-4xl font-bold mb-4 tracking-tight">Your Weekly <span className="text-emerald-600">Crate.</span></h3>
                  <p className="text-stone-500 mb-10">Select 6 essential items for your curated weekly nutrition kit.</p>
                  
                  <div className="space-y-4">
                    {ingredients.map(item => (
                      <button 
                        key={item.id} 
                        onClick={() => addToKit(item)}
                        className="w-full p-6 rounded-3xl border border-stone-100 flex items-center justify-between hover:border-emerald-500 transition-all bg-stone-50/50 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${item.color} group-hover:rotate-12 transition-transform`} />
                          <span className="font-bold text-stone-800">{item.name}</span>
                        </div>
                        <PlusIcon className="w-5 h-5 text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-900 rounded-[3.5rem] p-12 text-white flex flex-col justify-between min-h-[500px] relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
                   
                   <div className="relative z-10">
                      <div className="flex justify-between items-end mb-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Current Basket</span>
                        <span className="text-2xl font-serif italic">{basket.length}/6</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {basket.map((item: any) => (
                          <motion.div 
                            layout
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            key={item.uniqueId} 
                            className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-3"
                          >
                            {item.name}
                            <XMarkIcon 
                              className="w-3 h-3 cursor-pointer text-emerald-400" 
                              onClick={() => setBasket(basket.filter(b => b.id !== item.uniqueId))} 
                            />
                          </motion.div>
                        ))}
                        {basket.length === 0 && <p className="text-emerald-100/30 italic text-sm py-10">Your crate is waiting to be filled...</p>}
                      </div>
                   </div>

                   <button disabled={basket.length < 6} className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${basket.length === 6 ? 'bg-white text-emerald-900 shadow-xl' : 'bg-white/5 text-emerald-100/20'}`}>
                      {basket.length === 6 ? 'Schedule Delivery' : 'Fill Crate to Continue'}
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function GuidePoint({ icon, title, desc }: any) {
  return (
    <div className="flex gap-6 group">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}