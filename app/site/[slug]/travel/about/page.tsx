

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  FlagIcon, 
  GlobeAmericasIcon,
  ArrowPathIcon,
  CloudIcon
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function TravelLiveAbout() {
  return (
    <main className="bg-[#FAF9F6] min-h-screen pt-32 pb-24 text-stone-900 selection:bg-emerald-900 selection:text-white">
      {/* 1. HERO: THE STARTING POINT */}
      <section className="max-w-7xl mx-auto px-6 mb-48 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-8">
              <span className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs">01</span>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-800">The Departure</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-[0.85] mb-12">
              Beyond the <br />
              <span className="font-sans font-black uppercase text-transparent" style={{ WebkitTextStroke: '1.5px #1c1917' }}>Guidebook.</span>
            </h1>
            
            <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-lg mb-12 italic">
              "We didn't start as a travel agency. We started as three friends with a Land Rover and a passion for the corners of Kenya that Google Maps hadn't quite reached yet."
            </p>

            <div className="flex gap-10">
               <div className="flex items-center gap-4">
                  <UserGroupIcon className="w-8 h-8 text-stone-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">100% Local <br/> Guides</span>
               </div>
               <div className="flex items-center gap-4">
                  <HeartIcon className="w-8 h-8 text-stone-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-tight">Community <br/> Focused</span>
               </div>
            </div>
          </motion.div>

          <div className="relative group">
             {/* The "Journal" Visual */}
             <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80" 
                  alt="Safari Sunset" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" />
             </div>
             {/* Decorative Tape Element */}
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-10 bg-white/40 backdrop-blur-md border border-white/20 -rotate-3 z-10" />
          </div>
        </div>
      </section>

      {/* 2. THE TIMELINE: MILESTONES */}
      <section className="max-w-5xl mx-auto px-6 py-32 border-l border-dashed border-stone-300 ml-10 lg:ml-auto">
         <TimelineNode 
           year="2018" 
           title="The First Camp" 
           desc="Established our base in the Mara, partnering directly with the Maasai community to create low-impact luxury stays." 
         />
         <TimelineNode 
           year="2021" 
           title="Coastal Expansion" 
           desc="Launched our 'Blue Economy' initiative in Watamu, focusing on reef restoration and sustainable kite-surfing." 
           active
         />
         <TimelineNode 
           year="2026" 
           title="Digital Frontier" 
           desc="Introducing the Travel Duka—bringing the artisan markets of Kenya to the global stage." 
         />
      </section>

      <CarbonCalculator />
      
    </main>
  );
}

function TimelineNode({ year, title, desc, active }: any) {
  return (
    <div className="relative pl-12 mb-24 last:mb-0">
      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-[#FAF9F6] ${active ? 'bg-emerald-700 scale-150 shadow-lg shadow-emerald-900/20' : 'bg-stone-300'}`} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-800 mb-4 block">{year}</span>
      <h3 className="text-3xl font-serif italic mb-4">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed max-w-xl">{desc}</p>
    </div>
  );
}


function CarbonCalculator() {
  const [distance, setDistance] = useState<number>(500);
  const [transport, setTransport] = useState<"Flight" | "Safari-Van" | "Train">("Flight");

  // Mock Offset Logic (KG CO2 per KM)
  const rates = { Flight: 0.25, "Safari-Van": 0.15, Train: 0.05 };
  const totalKG = distance * rates[transport];
  const treesToPlant = Math.ceil(totalKG / 20); // 1 tree offsets approx 20kg/year

  return (
    <section className="bg-emerald-950 py-32 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 lg:p-20 border border-white/10 relative">
          
          <div className="flex flex-col lg:flex-row gap-20 relative z-10">
            {/* Input Section */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-12">
                <GlobeAmericasIcon className="w-10 h-10 text-emerald-400" />
                <h2 className="text-5xl font-serif italic text-white leading-none tracking-tight">Eco <br /> Blueprint</h2>
              </div>

              <div className="space-y-16">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/60 mb-8 block">Projected Travel Distance (KM)</label>
                  <input 
                    type="range" min="50" max="5000" step="50"
                    value={distance}
                    onChange={(e) => setDistance(Number(e.target.value))}
                    className="w-full h-1 bg-emerald-900 rounded-full appearance-none accent-emerald-400 cursor-pointer"
                  />
                  <div className="mt-8 text-6xl font-black text-white italic tracking-tighter">
                    {distance} <span className="text-xl text-emerald-500 uppercase font-sans tracking-widest not-italic">KM</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/60 mb-8 block">Primary Mode of Transport</label>
                  <div className="grid grid-cols-3 gap-4">
                    {["Flight", "Safari-Van", "Train"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTransport(t as any)}
                        className={`py-4 rounded-2xl border font-black text-[9px] uppercase tracking-widest transition-all ${transport === t ? 'bg-emerald-400 text-emerald-950 border-emerald-400' : 'bg-transparent text-emerald-100/40 border-white/10 hover:border-emerald-400'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Result Box */}
            <div className="flex-1">
               <div className="h-full bg-emerald-400 rounded-[3.5rem] p-12 text-emerald-950 flex flex-col justify-between shadow-[0_0_100px_rgba(52,211,153,0.2)]">
                  <div>
                    <div className="flex justify-between items-start mb-12">
                       <CloudIcon className="w-12 h-12" />
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">Estimated Footprint</p>
                          <p className="text-3xl font-black italic">{totalKG.toFixed(1)} KG CO2</p>
                       </div>
                    </div>
                    
                    <h4 className="text-5xl font-serif italic leading-tight mb-4">Plant <span className="underline decoration-1 underline-offset-8">{treesToPlant} Trees</span></h4>
                    <p className="text-xs font-bold leading-relaxed uppercase tracking-wider opacity-70">
                      Your contribution will directly fund the reforestation of the Mau Forest complex, restoring vital water towers for Kenya.
                    </p>
                  </div>

                  <button className="mt-12 w-full py-8 bg-emerald-950 text-white rounded-3xl font-black text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-emerald-950 transition-all shadow-2xl flex items-center justify-center gap-4 group">
                    <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Offset My Journey
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-[120px] -ml-[400px] -mt-[400px]"
      />
    </section>
  );
}