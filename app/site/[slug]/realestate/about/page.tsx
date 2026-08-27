"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  BanknotesIcon,
  CalculatorIcon,
  PresentationChartLineIcon,
  CubeTransparentIcon, 
  MapIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  PlayIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function RealEstateAboutPage() {
  const [activeLayer, setActiveLayer] = useState(0);

  const layers = [
    { title: "Architectural Vision", desc: "Crafting skylines that define the Nairobi of tomorrow.", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" },
    { title: "Sustainable Living", desc: "Passive cooling and solar integration as standard.", img: "https://images.unsplash.com/photo-1518005020251-58296b8eb17d?q=80&w=2070" },
    { title: "The Golden Mile", desc: "Prime locations in Westlands, Kilimani, and Karen.", img: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070" }
  ];

  return (
    <main className="bg-[#FCFAF7] min-h-screen text-stone-900 overflow-hidden font-sans">
      {/* HERO: CINEMATIC REVEAL */}
      <section className="relative h-screen flex items-center justify-center bg-stone-950">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <Image src={layers[activeLayer].img} alt="Hero" fill className="object-cover transition-all duration-1000" loader={customLoader} />
        </motion.div>
        
        <div className="relative z-10 text-center px-6">
          <motion.span 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.6em] text-stone-400 mb-8 block"
          >
            Est. 2018 — Nairobi, Kenya
          </motion.span>
          <motion.h1 
             initial={{ y: 40, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-7xl md:text-[12rem] font-serif italic text-white leading-none tracking-tighter"
          >
            Beyond <br /> <span className="font-sans not-italic font-black uppercase text-[#E5E1DA]">Structure.</span>
          </motion.h1>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce">
           <div className="w-[1px] h-20 bg-gradient-to-b from-transparent to-white/50" />
        </div>
      </section>

      {/* INTERACTIVE EXPERIENCE: THE "LAYERS" */}
      <section className="max-w-7xl mx-auto px-6 py-48 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-5 space-y-12">
           <div className="flex items-center gap-4">
              <CubeTransparentIcon className="w-8 h-8 text-stone-400" />
              <h2 className="text-4xl font-serif italic">Our Blueprint</h2>
           </div>

           <div className="space-y-4">
              {layers.map((layer, idx) => (
                <button 
                  key={idx}
                  onMouseEnter={() => setActiveLayer(idx)}
                  className={`w-full text-left p-8 rounded-2xl transition-all duration-500 border ${activeLayer === idx ? 'bg-white border-stone-200 shadow-xl' : 'border-transparent opacity-40 grayscale'}`}
                >
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">0{idx + 1}</p>
                   <h3 className="text-2xl font-bold mb-4">{layer.title}</h3>
                   {activeLayer === idx && (
                     <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-stone-500 leading-relaxed italic">
                       {layer.desc}
                     </motion.p>
                   )}
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-7 relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeLayer}
               initial={{ x: 100, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -100, opacity: 0 }}
               transition={{ duration: 0.8, ease: "circOut" }}
               className="absolute inset-0"
             >
                <Image src={layers[activeLayer].img} alt="Tour" fill className="object-cover" loader={customLoader} />
             </motion.div>
           </AnimatePresence>
           <div className="absolute inset-0 bg-stone-950/20" />
           <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 flex justify-between items-center">
              <span className="text-white text-xs font-black uppercase tracking-widest">360° Perspective Available</span>
              <PlayIcon className="w-12 h-12 text-white" />
           </div>
        </div>
      </section>

      <EstateCalculator />

    </main>
  );
}

function EstateCalculator() {
  const [price, setPrice] = useState(15000000); // 15M KES
  const [downpayment, setDownpayment] = useState(20); // 20%
  
  const loanAmount = price * (1 - downpayment / 100);
  const monthlyPayment = (loanAmount * 0.13) / 12; // Simple 13% interest mock
  const projectedROI = (price * 0.08) / 12; // 8% annual yield mock

  return (
    <section className="bg-stone-950 py-32 text-stone-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-24 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 rounded-full mb-8 border border-white/5">
              <CalculatorIcon className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Financial Modeler</span>
           </div>
           <h2 className="text-6xl md:text-8xl font-serif italic mb-6">Capital <span className="font-sans not-italic font-black text-transparent" style={{ WebkitTextStroke: '1px #D6C7AE' }}>Intelligence.</span></h2>
           <p className="text-stone-500 max-w-xl mx-auto text-sm uppercase tracking-widest font-bold">Calculate your legacy, one unit at a time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* INPUTS */}
          <div className="lg:col-span-5 bg-stone-900/50 p-12 rounded-[3rem] border border-white/5 space-y-12">
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Property Value (KES)</label>
                   <span className="font-mono text-amber-500">{price.toLocaleString()}</span>
                </div>
                <input 
                   type="range" min="5000000" max="100000000" step="1000000" 
                   value={price} onChange={(e) => setPrice(Number(e.target.value))}
                   className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Down Payment (%)</label>
                   <span className="font-mono text-amber-500">{downpayment}%</span>
                </div>
                <input 
                   type="range" min="10" max="50" step="5" 
                   value={downpayment} onChange={(e) => setDownpayment(Number(e.target.value))}
                   className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
             </div>

             <div className="pt-12 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-4 text-stone-500 italic text-xs">
                   <BanknotesIcon className="w-5 h-5" />
                   <span>Interest rate fixed at 13% (Standard Bank Rate)</span>
                </div>
             </div>
          </div>

          {/* OUTPUTS: THE "REVENUE" VIEW */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
             <ResultCard 
                label="Monthly Mortgage" 
                value={`KES ${Math.round(monthlyPayment).toLocaleString()}`} 
                icon={<PresentationChartLineIcon className="text-amber-500" />}
                desc="Estimated principal + interest"
             />
             <ResultCard 
                label="Rental Yield (Est)" 
                value={`KES ${Math.round(projectedROI).toLocaleString()}`} 
                icon={<ArrowTrendingUpIcon className="text-emerald-500" />}
                desc="Based on 8% annual ROI in Westlands"
             />
             <div className="md:col-span-2 bg-amber-600 rounded-[2.5rem] p-12 flex flex-col md:flex-row justify-between items-center group cursor-pointer transition-all hover:bg-white hover:text-stone-950">
                <div>
                   <h3 className="text-3xl font-bold italic tracking-tighter mb-2">Request Full Pro-Forma</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Get a detailed 10-year financial projection</p>
                </div>
                <ArrowLongRightIcon className="w-12 h-12 group-hover:translate-x-4 transition-transform" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({ label, value, icon, desc }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] flex flex-col justify-between hover:border-amber-500/50 transition-colors">
       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-12">
          {React.cloneElement(icon, { className: "w-6 h-6" })}
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">{label}</p>
          <p className="text-4xl font-bold tracking-tighter mb-4">{value}</p>
          <p className="text-[10px] font-bold text-stone-600 italic uppercase">{desc}</p>
       </div>
    </div>
  );
}