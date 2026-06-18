"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  PlusIcon, 
  HeartIcon, 
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon,
  ArrowRightCircleIcon,
  UsersIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Healing Energy) --- */
const FALLBACK_HEALTH = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveHealthStyle(index: number) {
  const themes = [
    { accent: "text-teal-600", bg: "bg-teal-600", border: "border-teal-100", label: "24/7 Emergency" },
    { accent: "text-rose-500", bg: "bg-rose-500", border: "border-rose-100", label: "Specialized Care" },
    { accent: "text-sky-600", bg: "bg-sky-600", border: "border-sky-100", label: "Diagnostics" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Calm & Fluid) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0, 
    transition: { duration: 1, ease: [0.23, 1, 0.32, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function HealthCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveHealthStyle(index);

  return (
    <motion.div variants={cardVariants} className="group">
      <Link href={`/healthcare/products?category=${cat.id}`} className="block h-full">
        <div className="relative h-full bg-white rounded-[3rem] p-4 border border-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(20,80,80,0.1)] group-hover:border-teal-100">
          
          {/* Image Container with Soft Mask */}
          <div className="relative h-80 w-full overflow-hidden rounded-[2.5rem] mb-8">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_HEALTH)}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-[3s] group-hover:scale-110"
              loader={loader}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Status Floating Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm">
               <div className={`w-2 h-2 rounded-full animate-pulse ${theme.bg}`} />
               <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">{theme.label}</span>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-6 pb-8">
            <div className="flex justify-between items-start mb-6">
               <h3 className="text-4xl font-bold tracking-tight text-stone-900 leading-none">
                 {cat.displayName}
               </h3>
               <ArrowRightCircleIcon className={`w-10 h-10 ${theme.accent} opacity-20 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-45`} />
            </div>

            <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-[280px]">
              Access world-class medical professionals and advanced {cat.displayName?.toLowerCase()} technology.
            </p>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-stone-50">
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.bg} bg-opacity-10 flex items-center justify-center`}>
                    <UsersIcon className={`w-4 h-4 ${theme.accent}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">12+ Experts</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.bg} bg-opacity-10 flex items-center justify-center`}>
                    <ClockIcon className={`w-4 h-4 ${theme.accent}`} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Low Wait</span>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function HealthCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#F8FBFA] min-h-screen py-32 overflow-hidden selection:bg-teal-600 selection:text-white">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Header: Trust & Clarity */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <ShieldCheckIcon className="w-6 h-6 text-teal-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">MOH Certified Facilities</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-bold text-stone-900 leading-[0.8] tracking-tighter"
            >
              Healing <br />
              <span className="text-teal-600">Simplified.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-white rounded-[2.5rem] border border-stone-100 shadow-xl max-w-sm"
          >
             <p className="text-sm text-stone-500 leading-relaxed italic">
               "Nairobi's digital gateway to specialized healthcare. Connect with the best hospitals and wellness centers in seconds."
             </p>
             <div className="flex items-center gap-2 mt-6">
                <HeartIcon className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-900">Your health, our priority.</span>
             </div>
          </motion.div>
        </div>

        {/* The Wellness Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <HealthCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Telemedicine CTA */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-teal-900 rounded-[3rem] p-12 text-white flex flex-col justify-between group relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -mr-32 -mt-32" />
              
              <div className="relative z-10">
                <PlusIcon className="w-12 h-12 text-teal-400 mb-8" />
                <h4 className="text-4xl font-bold leading-tight mb-4 tracking-tighter">Virtual <br /> Consultation.</h4>
                <p className="text-xs text-teal-200/60 font-medium uppercase tracking-widest leading-loose">Talk to a doctor from the comfort of your home. Video calls available 24/7.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-white text-teal-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-teal-400 hover:text-white transition-all">
                Book Video Call
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}