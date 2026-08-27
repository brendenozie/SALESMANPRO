"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheckIcon, 
  ArrowPathIcon, 
  HeartIcon, 
  BanknotesIcon,
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const sectionEntry = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function ImpactTrustPage() {
  const [amount, setAmount] = useState(2500); // KES

  const impactMetrics = [
    { label: "Clean Water", icon: <BeakerIcon />, cost: 500, unit: "Liters Provided" },
    { label: "School Meals", icon: <AcademicCapIcon />, cost: 150, unit: "Days of Nutrition" },
    { label: "Clinic Visits", icon: <HeartIcon />, cost: 1200, unit: "Health Checkups" },
  ];

  return (
    <main className="bg-[#fffcf9] min-h-screen pt-32 pb-24 text-stone-900 overflow-hidden">
      
      {/* 1. TRANSPARENCY REPORT (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionEntry}>
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Radical Accountability</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-10">
              Where Every <br />
              <span className="text-emerald-700 italic font-serif font-light">Shilling Goes.</span>
            </h1>
            
            <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-lg mb-12">
              Transparency isn't a report; it's a promise. We provide real-time tracking of funds from the moment they leave your hand to the moment they change a life.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm">
                  <p className="text-4xl font-bold text-emerald-700 mb-2">92%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Direct Program Impact</p>
               </div>
               <div className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm">
                  <p className="text-4xl font-bold text-stone-900 mb-2">0%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Profit Extraction</p>
               </div>
            </div>
          </motion.div>

          <div className="bg-stone-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />
             <h3 className="text-3xl font-bold mb-8 flex items-center gap-4 italic font-serif">
                The Integrity Ledger
             </h3>
             <div className="space-y-6">
                <LedgerLine label="Community Health Initiatives" percent={45} />
                <LedgerLine label="Educational Scholarships" percent={30} />
                <LedgerLine label="Sustainable Infrastructure" percent={17} />
                <LedgerLine label="Operations & Logistics" percent={8} />
             </div>
             <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Last Audited: March 2026</span>
                <button className="text-xs font-bold underline decoration-emerald-500 underline-offset-8">Download Full PDF</button>
             </div>
          </div>
        </div>
      </section>

      {/* 2. DONATE-TO-IMPACT CALCULATOR */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-[4rem] p-10 md:p-24 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-6">
               <SparklesIcon className="w-4 h-4 text-orange-600" />
               <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Visualizer</span>
            </div>
            <h2 className="text-5xl font-bold tracking-tight mb-4 leading-none">See Your <span className="text-orange-600 italic font-serif">Impact.</span></h2>
            <p className="text-stone-500 max-w-md mx-auto">Move the slider to see how your contribution translates into real-world change.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Range Slider UI */}
            <div className="mb-20">
               <div className="flex justify-between items-end mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Contribution Amount</span>
                  <span className="text-6xl font-black text-stone-900 tracking-tighter italic">KES {amount.toLocaleString()}</span>
               </div>
               <input 
                 type="range" 
                 min="500" 
                 max="50000" 
                 step="500"
                 value={amount}
                 onChange={(e) => setAmount(parseInt(e.target.value))}
                 className="w-full h-3 bg-stone-100 rounded-full appearance-none cursor-pointer accent-orange-600"
               />
            </div>

            {/* Impact Calculation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {impactMetrics.map((item) => (
                 <div key={item.label} className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100 text-center group hover:bg-white hover:shadow-xl transition-all duration-500">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all">
                       {React.cloneElement(item.icon as React.ReactElement, { className: "w-7 h-7" })}
                    </div>
                    <p className="text-4xl font-black text-stone-900 mb-2 italic">
                       {Math.floor(amount / item.cost)}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-tight">
                       {item.unit}
                    </p>
                 </div>
               ))}
            </div>

            <div className="mt-16 text-center">
               <button className="px-12 py-6 bg-stone-900 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-orange-600 transition-all shadow-2xl">
                 Commit to this Impact
               </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LedgerLine({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
        <span className="text-stone-400">{label}</span>
        <span className="text-emerald-500">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          className="h-full bg-emerald-600 rounded-full"
        />
      </div>
    </div>
  );
}