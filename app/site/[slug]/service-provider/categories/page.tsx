"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  CalendarDaysIcon,
  StarIcon,
  ArrowRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Executive Precision) --- */
const FALLBACK_SERVICE = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


function resolveServiceStyle(index: number) {
  const themes = [
    { accent: "text-indigo-600", bg: "bg-indigo-600", border: "border-indigo-100", glow: "shadow-indigo-500/10", label: "Top Rated" },
    { accent: "text-emerald-600", bg: "bg-emerald-600", border: "border-emerald-100", glow: "shadow-emerald-500/10", label: "Instant Book" },
    { accent: "text-blue-600", bg: "bg-blue-600", border: "border-blue-100", glow: "shadow-blue-500/10", label: "Corporate Grade" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Smooth & Reliable) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function ServiceCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveServiceStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link href={`/service-provider/products?category=${cat.id}`} className="block">
        <div className={`relative h-[480px] w-full overflow-hidden bg-white rounded-[2.5rem] border ${theme.border} transition-all duration-500 hover:shadow-2xl ${theme.glow}`}>
          
          {/* Availability Pulse */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm border border-slate-100">
             <div className={`w-2 h-2 rounded-full ${theme.bg} animate-pulse`} />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Online Now</span>
          </div>

          {/* Visual: Contextual Photography */}
          <div className="h-1/2 w-full relative overflow-hidden">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_SERVICE)}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              loader={loader}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Content: Professional Clarity */}
          <div className="p-8 pt-4">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.accent} mb-3 block`}>
              {theme.label}
            </span>
            
            <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              {cat.displayName}
            </h3>
            
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2">
              Expertly vetted professionals serving the greater Nairobi area with guaranteed quality.
            </p>

            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
               <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Pros</span>
                     <span className="text-lg font-bold text-slate-900 italic">24+</span>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="flex items-center gap-1">
                     <StarIcon className="w-4 h-4 text-amber-400" />
                     <span className="text-sm font-bold text-slate-900">4.9</span>
                  </div>
               </div>
               
               <div className={`w-12 h-12 rounded-2xl ${theme.bg} text-white flex items-center justify-center transition-all duration-300 group-hover:shadow-lg transform group-hover:-rotate-6`}>
                  <ArrowRightIcon className="w-5 h-5" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function ServiceCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#f8fafc] min-h-screen py-32 overflow-hidden relative">
      {/* Background Ambience: Professional Soft Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Clean & Trustworthy */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Vetted Excellence Only</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold text-slate-900 leading-[0.8] tracking-tighter"
            >
              Expertise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic font-serif font-light">On Demand.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm max-w-xs"
          >
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                   <CalendarDaysIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-slate-900 leading-tight">Book a session in under 60 seconds.</p>
             </div>
          </motion.div>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <ServiceCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Join the Network" CTA Card */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <UserGroupIcon className="w-12 h-12 text-indigo-400 mb-8" />
                <h4 className="text-4xl font-bold leading-tight mb-4 tracking-tight">Become a <br /> Partner.</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">List your services on the platform and scale your business across the region.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
                Apply to Join
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}