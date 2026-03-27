"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  TicketIcon, 
  UserGroupIcon, 
  SparklesIcon,
  MapPinIcon,
  BoltIcon,
  CalendarDaysIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Vibrant Energy) --- */
const FALLBACK_EVENT = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveEventStyle(index: number) {
  const themes = [
    { accent: "text-[#CCFF00]", glow: "shadow-[#CCFF00]/20", bg: "bg-[#CCFF00]", label: "Selling Fast" },
    { accent: "text-purple-500", glow: "shadow-purple-900/20", bg: "bg-purple-500", label: "Exclusive" },
    { accent: "text-rose-500", glow: "shadow-rose-900/20", bg: "bg-rose-500", label: "Trending" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Aggressive & Smooth) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */


function EventCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveEventStyle(index);

  return (
    <motion.div variants={cardVariants} className="group perspective-1000">
      <Link href={`/site/${storeSlug}/events/products?category=${cat.id}`} className="block">
        <div className="relative h-[550px] w-full overflow-hidden rounded-[2.5rem] bg-stone-900 border border-white/5 transition-all duration-500 group-hover:border-white/20 group-hover:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)]">
          
          {/* Dynamic Image with Glitch/Overlay effect */}
          <div className="absolute inset-0">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_EVENT)}
              alt={cat.displayName || ""}
              fill
              className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
              loader={loader}
            />
            {/* Color Wash Overlay */}
            <div className={`absolute inset-0 mix-blend-overlay opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${theme.bg}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/20 to-transparent" />
          </div>

          {/* Status Badge */}
          <div className="absolute top-8 left-8 z-20">
             <div className={`flex items-center gap-2 px-4 py-2 bg-stone-950/80 backdrop-blur-xl rounded-full border border-white/10`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${theme.bg}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">{theme.label}</span>
             </div>
          </div>

          {/* Price/Metric Badge */}
          <div className="absolute top-8 right-8 z-20">
             <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-stone-950 group-hover:bg-[#CCFF00] transition-colors duration-500">
                <TicketIcon className="w-6 h-6" />
             </div>
          </div>

          {/* Main Content */}
          <div className="absolute inset-x-0 bottom-0 p-10">
            <div className="flex items-center gap-3 mb-6">
               <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.accent}`}>
                 {cat.displayName?.split(' ')[0]} / ARCHIVE
               </span>
            </div>

            <h3 className="text-6xl font-black text-white mb-6 tracking-tighter leading-[0.8] uppercase">
              {cat.displayName}
            </h3>
            
            <div className="flex flex-wrap gap-4 mb-10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
               <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Live Music</span>
               <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-stone-400 uppercase tracking-widest">VIP Access</span>
               <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Outdoor</span>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/10">
               <div className="flex items-center gap-4">
                  <UserGroupIcon className="w-5 h-5 text-stone-500" />
                  <span className="text-sm font-bold text-white tracking-tighter">1.2K+ Attending</span>
               </div>
               
               <div className="flex items-center gap-2 group/link">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>
                  <ArrowUpRightIcon className="w-8 h-8 text-white group-hover:text-[#CCFF00] transition-colors" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function EventsCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-stone-950 min-h-screen py-32 overflow-hidden relative selection:bg-[#CCFF00] selection:text-black">
      {/* Background Cyber-Glows */}
      <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#CCFF00]/5 rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: High-Octane Brand Identity */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-10"
            >
              <BoltIcon className="w-6 h-6 text-[#CCFF00]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500 underline decoration-[#CCFF00] underline-offset-8">Nairobi Live Activity Feed</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-[14rem] font-black text-white leading-[0.7] tracking-tighter uppercase italic"
            >
              Beyond <br />
              <span className="text-transparent font-sans" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>Routine.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl max-w-sm"
          >
             <div className="flex items-center gap-4 mb-4">
                <CalendarDaysIcon className="w-6 h-6 text-[#CCFF00]" />
                <span className="text-xs font-bold text-white tracking-widest uppercase">March 2026 Schedule</span>
             </div>
             <p className="text-xs text-stone-500 font-bold leading-relaxed uppercase tracking-widest">
               "48 Upcoming events this weekend across Nairobi CBD, Westlands, and Karen. Don't just watch. Experience."
             </p>
          </motion.div>
        </div>

        {/* Dynamic Grid: The Pulse */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categories.map((cat, idx) => (
            <EventCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Become an Organizer CTA */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-white rounded-[3rem] p-12 text-stone-950 flex flex-col justify-between group overflow-hidden relative shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#CCFF00] rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <SparklesIcon className="w-12 h-12 text-stone-950 mb-8" />
                <h4 className="text-4xl font-black leading-tight mb-4 tracking-tighter uppercase italic">Host Your <br /> Universe.</h4>
                <p className="text-[11px] text-stone-500 font-black uppercase tracking-widest leading-loose">The #1 Platform for Kenyan event organizers. Low fees, instant payouts, local support.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-stone-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#CCFF00] hover:text-stone-950 transition-all">
                Create Event
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}