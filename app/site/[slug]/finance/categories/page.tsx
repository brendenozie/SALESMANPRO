"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ShieldCheckIcon, 
  ScaleIcon, 
  CurrencyDollarIcon,
  DocumentTextIcon,
  LockClosedIcon,
  ArrowUpRightIcon,
  BuildingLibraryIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Prestige & Trust) --- */
const FALLBACK_FINANCE = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80";

function resolveFinanceStyle(index: number) {
  const themes = [
    { accent: "text-slate-900", bg: "bg-slate-900", iconBg: "bg-slate-100", label: "Certified Legal" },
    { accent: "text-emerald-900", bg: "bg-emerald-900", iconBg: "bg-emerald-50", label: "Wealth Management" },
    { accent: "text-amber-700", bg: "bg-amber-700", iconBg: "bg-amber-50", label: "Corporate Advisory" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Solid & Deliberate) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, ease: "easeOut" } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: [0.19, 1, 0.22, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


function FinanceCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveFinanceStyle(index);

  return (
    <motion.div variants={cardVariants} className="group h-full">
      <Link href={`/finance/products?category=${cat.id}`} className="block h-full">
        <div className="relative h-full bg-white border border-stone-200 rounded-[1.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] hover:-translate-y-2">
          
          {/* Top Decorative Pinstripe */}
          <div className={`h-2 w-full ${theme.bg} opacity-20 group-hover:opacity-100 transition-opacity`} />

          <div className="p-10">
            {/* Visual Icon Header */}
            <div className="flex justify-between items-start mb-12">
               <div className={`w-16 h-16 ${theme.iconBg} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6`}>
                  <BuildingLibraryIcon className={`w-8 h-8 ${theme.accent}`} />
               </div>
               <div className="flex items-center gap-2 px-3 py-1 bg-stone-50 rounded-full border border-stone-100">
                  <LockClosedIcon className="w-3 h-3 text-stone-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">Verified</span>
               </div>
            </div>

            {/* Content */}
            <h3 className="text-4xl font-serif text-stone-900 mb-6 leading-none tracking-tight">
              {cat.displayName}
            </h3>
            
            <p className="text-stone-500 text-sm leading-relaxed mb-10 italic">
              Navigating complex {cat.displayName?.toLowerCase()} frameworks with precision and absolute discretion.
            </p>

            {/* List of Expertise (Hidden/Reveal) */}
            <div className="space-y-4 mb-12 opacity-40 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Regulatory Compliance</span>
               </div>
               <div className="flex items-center gap-3">
                  <ScaleIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">Fiduciary Duty</span>
               </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-8 border-t border-stone-100">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 group-hover:text-stone-900 transition-colors">Consultation</span>
               <ArrowUpRightIcon className="w-5 h-5 text-stone-300 group-hover:text-stone-900 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function FinanceCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#FAF9F6] min-h-screen py-32 overflow-hidden selection:bg-slate-900 selection:text-white">
      {/* Subtle Pinstripe Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Institutional & Modern */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12 border-b border-stone-200 pb-20">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-[1px] bg-stone-900" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-900">Capital & Compliance Network</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-[10rem] font-serif text-stone-950 leading-[0.8] tracking-tighter"
            >
              Secure <br />
              <span className="font-sans font-black italic uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px #1c1917' }}>Legacy.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-white shadow-2xl rounded-sm border-l-4 border-slate-900 max-w-sm"
          >
             <p className="text-xs text-stone-600 font-bold leading-loose uppercase tracking-widest">
               "Providing the strategic legal and financial scaffolding for Nairobi's most ambitious entrepreneurs."
             </p>
             <div className="flex items-center gap-2 mt-6">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900 italic">Licensed by CBK & LSK</span>
             </div>
          </motion.div>
        </div>

        {/* The Grid: Balanced & Sturdy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categories.map((cat, idx) => (
            <FinanceCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Secure Portal CTA */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-stone-950 rounded-[1.5rem] p-12 text-white flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <CurrencyDollarIcon className="w-12 h-12 text-amber-500 mb-8" />
                <h4 className="text-4xl font-serif italic leading-tight mb-4 tracking-tight">Private <br /> Desk.</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-loose">Access bespoke wealth protection and tax optimization strategies. Non-disclosure guaranteed.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-white text-stone-950 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-amber-600 hover:text-white transition-all shadow-xl">
                Open Secure Portal
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}