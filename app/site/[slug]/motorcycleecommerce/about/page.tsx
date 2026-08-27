"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  FireIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  AdjustmentsVerticalIcon,
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  ChartBarIcon,
  VariableIcon
} from "@heroicons/react/24/solid";

const heavyEntry = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

export default function MotoManifestoPage() {
  const [compareId, setCompareId] = useState("naked");

  const specs = {
    naked: { name: "The Street Brawler", engine: "900cc Parallel Twin", torque: "92 Nm", cooling: "Liquid", weight: "189kg", vibe: "Aggressive & Raw" },
    tourer: { name: "The Horizon Chaser", engine: "1250cc Boxer", torque: "143 Nm", cooling: "Air/Liquid", weight: "249kg", vibe: "Refined & Rugged" },
    supersport: { name: "The Apex Predator", engine: "998cc Inline-4", torque: "113 Nm", cooling: "Dual-Fan Liquid", weight: "172kg", vibe: "Precise & High-Rev" },
  };

  return (
    <main className="bg-zinc-950 text-white min-h-screen pt-32 pb-24 overflow-hidden selection:bg-orange-500">
      
      {/* 1. RIDER PROFILE (ABOUT US) - THE MANIFESTO */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-[15rem] font-black text-white/[0.03] uppercase italic pointer-events-none select-none">
          Legacy
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={heavyEntry}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-1 bg-orange-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">The Duka Philosophy</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] mb-12 uppercase italic">
              Respect <br />
              <span className="text-orange-500">The Road.</span>
            </h1>
            
            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg mb-12 border-l-4 border-zinc-800 pl-8">
              We aren't just a dealership; we are a garage born from the red dust of the Rift Valley and the neon pulse of Nairobi. We build machines for those who seek the wind.
            </p>

            <div className="space-y-10">
               <ManifestoPoint icon={<FireIcon/>} title="Fuel-First Engineering" desc="Every bike is tuned for local fuel grades and high-altitude performance." />
               <ManifestoPoint icon={<ShieldCheckIcon/>} title="The Rider's Code" desc="Safety isn't an option. It's the foundation of every sale." />
            </div>
          </motion.div>

          <div className="relative group">
             <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-8 border-zinc-900 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80" 
                  alt="Rider in Nairobi" fill className="object-cover transition-transform duration-[10s] group-hover:scale-110"
                  loader={imageLoader}
                />
                {/* Visual "HUD" Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
             </div>
             
             {/* Floating Spec Badge */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -bottom-10 -left-10 bg-orange-600 p-8 rounded-3xl shadow-2xl border-4 border-zinc-950"
             >
                <BoltIcon className="w-10 h-10 text-zinc-950 mb-4" />
                <p className="text-2xl font-black italic uppercase leading-none">High <br /> Voltage</p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SPEC-CHECK COMPARISON TOOL */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-zinc-900 rounded-[4rem] p-10 md:p-24 border border-white/5 relative overflow-hidden shadow-2xl">
          {/* Background Carbon Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Precision Tuning</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-10">Spec-Check <br /> <span className="text-transparent" style={{ WebkitTextStroke: '2px #f97316' }}>Engine.</span></h2>
              
              <div className="grid grid-cols-1 gap-4">
                {Object.keys(specs).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setCompareId(key)}
                    className={`p-8 rounded-2xl border-2 transition-all text-left group ${compareId === key ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <div className="flex justify-between items-center">
                       <span className={`text-2xl font-black uppercase italic ${compareId === key ? 'text-white' : 'text-zinc-600'}`}>{(specs as any)[key].name}</span>
                       <ChevronRightIcon className={`w-6 h-6 transition-transform ${compareId === key ? 'rotate-90 text-orange-500' : 'text-zinc-800'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Spec Output: Tactical Interface */}
            <div className="w-full lg:w-[500px]">
               <div className="bg-zinc-950 border-2 border-zinc-800 p-12 rounded-[3rem] relative shadow-inner">
                  <div className="flex justify-between items-start mb-12">
                     <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
                        <ChartBarIcon className="w-6 h-6 text-orange-500" />
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-zinc-600">Unit ID</p>
                        <p className="font-mono text-orange-500">#MOTO-{(specs as any)[compareId].engine.split(' ')[0]}</p>
                     </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={compareId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="space-y-8"
                    >
                       <SpecLine label="Displacement" value={(specs as any)[compareId].engine} />
                       <SpecLine label="Peak Torque" value={(specs as any)[compareId].torque} />
                       <SpecLine label="Thermal Mgmt" value={(specs as any)[compareId].cooling} />
                       <SpecLine label="Curb Weight" value={(specs as any)[compareId].weight} />
                       
                       <div className="pt-10 border-t border-zinc-900">
                          <p className="text-[9px] font-black uppercase text-zinc-600 mb-2">Machine Vibe</p>
                          <p className="text-2xl font-black italic uppercase text-white tracking-widest">
                            "{(specs as any)[compareId].vibe}"
                          </p>
                       </div>

                       <button className="w-full py-6 bg-orange-600 text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all shadow-xl shadow-orange-900/20">
                          Secure This Unit
                       </button>
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ManifestoPoint({ icon, title, desc }: any) {
  return (
    <div className="flex gap-6 group">
      <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-orange-500 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500">
        {React.cloneElement(icon, { className: "w-7 h-7" })}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2">{title}</h4>
        <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SpecLine({ label, value }: any) {
  return (
    <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      <p className="text-xl font-bold text-white italic">{value}</p>
    </div>
  );
}