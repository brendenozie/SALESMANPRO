"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CurrencyDollarIcon, ChartBarIcon, ShieldExclamationIcon } from "@heroicons/react/24/solid";
import { 
  CpuChipIcon, 
  PaintBrushIcon, 
  WrenchIcon, 
  BeakerIcon,
  VariableIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function AutoConfiguratorAbout() {
  return (
    <main className="bg-stone-950 min-h-screen pt-32 pb-24 text-white overflow-hidden selection:bg-orange-500">
      {/* 1. HERO: THE BLUEPRINT */}
      <section className="max-w-7xl mx-auto px-6 mb-48 relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-[1px] bg-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Precision Labs / 2026</span>
            </div>
            
            <h1 className="text-8xl md:text-[10rem] font-black italic uppercase tracking-tighter leading-[0.8] mb-12">
              Beyond <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #fff' }}>Standard.</span>
            </h1>
            
            <p className="text-xl text-stone-400 font-medium leading-relaxed max-w-lg mb-12">
              Every machine we source is a canvas. Our configuration lab allows you to tune performance, aesthetics, and utility to the exact demands of the Kenyan terrain.
            </p>

            <div className="flex gap-12">
               <div>
                  <p className="text-5xl font-black mb-1">1,200+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Unique Specs</p>
               </div>
               <div>
                  <p className="text-5xl font-black mb-1 text-orange-500">0.01mm</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Build Tolerance</p>
               </div>
            </div>
          </motion.div>

          <div className="relative">
             {/* The "Blueprint" Visual */}
             <div className="relative aspect-video rounded-3xl border border-white/10 bg-stone-900/50 backdrop-blur-3xl overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')] opacity-30" />
                <motion.div 
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                   <VariableIcon className="w-64 h-64 text-orange-500/20" />
                </motion.div>
                <div className="absolute bottom-10 left-10 p-6 border-l-2 border-orange-500 bg-black/40 backdrop-blur-md">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-2">Chassis Integrity</p>
                   <p className="text-2xl font-mono font-bold tracking-tighter">NX-459 // OPTIMIZED</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE BUILD LAYERS */}
      <section className="max-w-7xl mx-auto px-6 py-48 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <BuildCard 
            icon={<CpuChipIcon />} 
            title="Performance Core" 
            desc="Stage 2 remapping and high-flow intake systems calibrated for Nairobi's altitude." 
          />
          <BuildCard 
            icon={<PaintBrushIcon />} 
            title="Aesthetic Armor" 
            desc="Satin wraps and ceramic coatings designed to withstand tropical UV exposure." 
            active
          />
          <BuildCard 
            icon={<WrenchIcon />} 
            title="Suspension Logic" 
            desc="Adaptive dampening systems tuned for both smooth tarmac and rugged off-road paths." 
          />
        </div>
      </section>

      <AutoFinanceCalculator />

    </main>
  );
}

function BuildCard({ icon, title, desc, active }: any) {
  return (
    <div className="group">
      <div className={`w-16 h-16 rounded-2xl mb-10 flex items-center justify-center transition-all ${active ? 'bg-orange-600 text-white shadow-[0_0_40px_rgba(249,115,22,0.3)]' : 'bg-stone-900 text-stone-600 group-hover:bg-orange-500 group-hover:text-white'}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-6">{title}</h3>
      <p className="text-stone-400 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
function AutoFinanceCalculator() {
  const [vehicleValue, setVehicleValue] = useState<number>(3500000);
  const [year, setYear] = useState<number>(2019);

  // Simplified Kenyan Import Logic (ID + Excise + VAT + IDF + RDL)
  const calculateTotal = () => {
    const importDuty = vehicleValue * 0.35;
    const exciseDuty = (vehicleValue + importDuty) * 0.20;
    const vat = (vehicleValue + importDuty + exciseDuty) * 0.16;
    const levies = vehicleValue * 0.055; // IDF & RDL
    return {
      duty: importDuty,
      taxes: exciseDuty + vat + levies,
      grandTotal: importDuty + exciseDuty + vat + levies
    };
  };

  const results = calculateTotal();

  return (
    <section className="bg-stone-950 py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="bg-stone-900 border border-white/5 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden">
          
          <div className="flex flex-col lg:flex-row gap-24 relative z-10">
            {/* Input Dashboard */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-12">
                <ChartBarIcon className="w-10 h-10 text-orange-500" />
                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Duty <br /> Analytics</h2>
              </div>

              <div className="space-y-16">
                <div>
                  <div className="flex justify-between mb-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Current Market Value (KES)</label>
                    <span className="text-orange-500 font-mono font-bold">{vehicleValue.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" min="1000000" max="25000000" step="100000"
                    value={vehicleValue}
                    onChange={(e) => setVehicleValue(Number(e.target.value))}
                    className="w-full h-1 bg-stone-800 rounded-full appearance-none accent-orange-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500 mb-8 block">Year of First Registration</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[2018, 2019, 2020, 2021].map((y) => (
                      <button
                        key={y}
                        onClick={() => setYear(y)}
                        className={`py-4 rounded-xl font-black text-xs transition-all ${year === y ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'bg-stone-800 text-stone-500 hover:text-white'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Output Display */}
            <div className="flex-1">
               <div className="bg-black/40 backdrop-blur-2xl rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500 mb-12">Total Clearing Estimate</h4>
                  
                  <div className="space-y-10">
                     <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Import Duty (35%)</span>
                        <span className="text-xl font-mono text-white">{results.duty.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Excise + VAT + Levies</span>
                        <span className="text-xl font-mono text-white">{results.taxes.toLocaleString()}</span>
                     </div>
                     
                     <div className="pt-10 border-t border-white/10">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-black text-orange-500 uppercase tracking-[0.3em]">Total OMV</span>
                           <motion.span 
                             key={results.grandTotal}
                             initial={{ scale: 1.2, color: "#f97316" }}
                             animate={{ scale: 1, color: "#fff" }}
                             className="text-5xl font-black tracking-tighter"
                           >
                             {results.grandTotal.toLocaleString()} <span className="text-sm">KES</span>
                           </motion.span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/5 flex gap-4">
                     <ShieldExclamationIcon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                     <p className="text-[9px] text-stone-400 font-bold leading-relaxed uppercase tracking-widest">
                       Estimates are based on 2026 KRA valuation tables. Final costs subject to CRF and physical inspection.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}