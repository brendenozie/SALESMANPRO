"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPinIcon, 
  ChevronRightIcon, 
  GlobeAltIcon, 
  TruckIcon, 
  MapIcon, 
  SignalIcon,
  CommandLineIcon
} from "@heroicons/react/24/solid";

const REGIONS = [
  {
    id: "nairobi",
    title: "Nairobi Region",
    towns: ["Nairobi City", "Kitengela", "Athi River", "Ngong", "Ongata Rongai", "Kikuyu", "Limuru", "Kimende", "Juja", "Kiambu"],
    stats: "15-Min Node Latency"
  },
  {
    id: "mt-kenya",
    title: "Mount Kenya",
    towns: ["Thika", "Sagana", "Muranga", "Kerugoya", "Embu", "Chuka", "Nkubu", "Meru", "Isiolo", "Nanyuki", "Nyeri"],
    stats: "Daily Scheduled Runs"
  },
  {
    id: "rift-valley",
    title: "Rift Valley",
    towns: ["Naivasha", "Gilgil", "Nakuru", "Molo", "Eldama Ravine", "Kabarnet", "Eldoret", "Kitale", "Kapenguria"],
    stats: "Express Link Hubs"
  },
  {
    id: "western",
    title: "Western / Nyanza",
    towns: ["Kisumu", "Kakamega", "Bungoma", "Busia", "Malaba", "Kericho", "Bomet", "Kisii", "Migori", "Homabay"],
    stats: "Cross-Border Gateway"
  },
  {
    id: "coast",
    title: "Coast Region",
    towns: ["Mombasa", "Voi", "Kilifi", "Malindi", "Diani", "Ukunda", "Wundanyi", "Kibwezi"],
    stats: "Port-to-Door Sync"
  },
  {
    id: "east-africa",
    title: "East Africa",
    towns: ["Uganda", "Tanzania", "South Sudan", "Rwanda"],
    stats: "International Logistics"
  }
];

export function NetworkMap() {
  const [activeRegion, setActiveRegion] = useState(REGIONS[0]);

  return (
    <section id="network" className="py-24 lg:py-40 bg-white overflow-hidden relative font-sans">
      {/* Background Architectural Elements */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] -z-0" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600"
            >
              <SignalIcon className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Distribution Grid</span>
            </motion.div>
            <h2 className="text-6xl md:text-8xl font-black text-slate-950 leading-[0.85] uppercase italic tracking-tighter">
              Network <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>Coverage</span>
            </h2>
          </div>
          <div className="max-w-md space-y-4 border-l-4 border-orange-500 pl-8">
             <p className="text-slate-500 font-medium leading-relaxed italic text-lg">
              &quot;From the heart of Nairobi to the borders of East Africa, our neural logistics grid ensures your cargo is never out of reach.&quot;
             </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:h-[750px]">
          
          {/* --- LEFT: REGION SELECTOR --- */}
          <div className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-4 custom-scrollbar py-2 h-full">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setActiveRegion(region)}
                className={`group relative flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 text-left border-2 ${
                  activeRegion.id === region.id 
                  ? "bg-white border-orange-500 shadow-[0_20px_40px_-15px_rgba(247,148,29,0.15)] translate-x-2" 
                  : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    activeRegion.id === region.id 
                    ? "bg-slate-950 text-white rotate-6" 
                    : "bg-white text-slate-400 group-hover:text-slate-600 shadow-sm"
                  }`}>
                    {region.id === 'east-africa' ? <GlobeAltIcon className="w-6 h-6" /> : <MapIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className={`font-black uppercase italic tracking-tight text-lg ${
                      activeRegion.id === region.id ? "text-slate-950" : "text-slate-400"
                    }`}>{region.title}</h4>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ${
                       activeRegion.id === region.id ? "text-orange-500" : "text-slate-400"
                    }`}>{region.stats}</p>
                  </div>
                </div>
                <ChevronRightIcon className={`w-5 h-5 transition-all duration-500 ${
                  activeRegion.id === region.id ? "text-orange-500 opacity-100" : "opacity-0 -translate-x-4"
                }`} />
              </button>
            ))}
          </div>

          {/* --- RIGHT: DATA DISPLAY --- */}
          <div className="lg:col-span-8 relative">
            <div className="h-full bg-slate-50 rounded-[3.5rem] border-4 border-white shadow-inner overflow-hidden p-8 lg:p-16 relative">
              
              {/* Live Signal Graphic */}
              <div className="absolute top-12 right-12 flex items-center gap-3">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Strong / End-to-End Active</span>
                 </div>
                 <CommandLineIcon className="text-emerald-500 w-5 h-5 animate-pulse" />
              </div>

              {/* Dynamic Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeRegion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="relative z-10 h-full flex flex-col"
                >
                  <h3 className="text-5xl lg:text-7xl font-black text-slate-950 uppercase italic mb-12 tracking-tighter leading-none">
                    {activeRegion.title}
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6 flex-grow content-start overflow-y-auto pr-6 custom-scrollbar">
                    {activeRegion.towns.map((town, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-center gap-4 group cursor-default"
                      >
                        <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:scale-150 transition-transform shadow-[0_0_10px_rgba(247,148,29,0.5)]" />
                        <span className="text-slate-600 font-bold text-sm lg:text-lg hover:text-slate-950 transition-colors uppercase tracking-tight">
                          {town}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* High-Impact Footer Info */}
                  <div className="mt-12 pt-10 border-t-2 border-white flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center gap-10">
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fleet Identity</span>
                         <span className="text-slate-950 font-black italic tracking-tighter">IMV-NET-ALPHA</span>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Load</span>
                         <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden">
                               <div className="w-3/4 h-full bg-orange-500" />
                            </div>
                            <span className="text-slate-950 font-black italic text-xs">75%</span>
                         </div>
                       </div>
                    </div>
                    <TruckIcon className="text-slate-200 w-24 h-24 absolute -bottom-4 -right-4 rotate-[-15deg] opacity-50" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Background Abstract Grid Map */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-[0.05]">
                 <svg viewBox="0 0 200 200" className="w-full h-full stroke-slate-950 fill-none">
                    <path d="M20,100 Q100,20 180,100 T20,100" strokeWidth="0.5" />
                    <path d="M50,50 L150,150 M150,50 L50,150" strokeWidth="0.2" strokeDasharray="4 4" />
                    <circle cx="100" cy="100" r="70" strokeWidth="0.1" />
                 </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}