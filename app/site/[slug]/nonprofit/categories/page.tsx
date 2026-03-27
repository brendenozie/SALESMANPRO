"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  HeartIcon, 
  HandRaisedIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  ArrowLongRightIcon,
  SunIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Organic & Warm) --- */
const FALLBACK_NP = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveNPStyle(index: number) {
  const themes = [
    { accent: "text-orange-600", bg: "bg-orange-600/10", iconBg: "bg-orange-600", label: "Immediate Relief" },
    { accent: "text-emerald-700", bg: "bg-emerald-700/10", iconBg: "bg-emerald-700", label: "Sustainability" },
    { accent: "text-sky-700", bg: "bg-sky-700/10", iconBg: "bg-sky-700", label: "Community Growth" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Soft & Breathable) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function NPCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveNPStyle(index);

  return (
    <motion.div variants={cardVariants} className="group">
      <Link href={`/site/${storeSlug}/nonprofit/products?category=${cat.id}`} className="block">
        <div className="bg-white rounded-[3rem] p-4 pb-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-stone-100 transition-all duration-700 hover:shadow-2xl hover:shadow-orange-900/5 group-hover:-translate-y-3">
          
          {/* Visual: The Human Element */}
          <div className="relative h-[400px] w-full overflow-hidden rounded-[2.5rem] mb-10">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_NP)}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-[4s] group-hover:scale-110"
              loader={loader}
            />
            {/* Soft Warm Filter */}
            <div className="absolute inset-0 bg-orange-900/5 group-hover:bg-transparent transition-colors duration-1000" />
            
            {/* Overlay Label */}
            <div className={`absolute bottom-6 left-6 px-5 py-2 rounded-full backdrop-blur-md bg-white/90 shadow-xl`}>
               <span className={`text-[10px] font-black uppercase tracking-widest ${theme.accent}`}>
                 {theme.label}
               </span>
            </div>
          </div>

          {/* Content: Emotional & Bold */}
          <div className="px-8">
            <h3 className="text-4xl font-bold text-stone-900 mb-6 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
              {cat.displayName}
            </h3>
            
            <p className="text-stone-500 font-medium leading-relaxed mb-10">
              Directly supporting families in the outskirts of Nairobi with clean water, education, and healthcare access.
            </p>

            <div className="flex items-center justify-between pt-8 border-t border-stone-50">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
                       <Image src={`https://i.pravatar.cc/100?u=${i+index}`} alt="Donor" width={40} height={40} loader={loader} />
                    </div>
                  ))}
                  <div className="h-10 px-3 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-stone-500">
                    +1.2K HELPED
                  </div>
               </div>
               
               <div className={`w-14 h-14 rounded-full ${theme.bg} flex items-center justify-center text-stone-900 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500`}>
                  <ArrowLongRightIcon className="w-6 h-6" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function NonProfitCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fffcf9] min-h-screen py-32 overflow-hidden relative">
      {/* Organic Background Blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Soulful & Purposeful */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-28 gap-12">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <HeartIcon className="w-6 h-6 text-orange-600" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-400">100% Transparency Guarantee</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-[11rem] font-bold text-stone-900 leading-[0.8] tracking-tighter"
            >
              Better <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-500 italic font-serif font-light">Together.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-white border border-stone-100 rounded-[2.5rem] shadow-sm max-w-sm hidden lg:block"
          >
             <p className="text-sm text-stone-500 font-bold leading-relaxed uppercase italic">
               "For every Shilling donated, 92 cents goes directly to the field. Your impact is real, measurable, and life-changing."
             </p>
          </motion.div>
        </div>

        {/* Dynamic Grid: Staggered Masonry Feel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        >
          {categories.map((cat, idx) => (
            <NPCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Volunteer CTA Card */}
          <motion.div variants={cardVariants} className="lg:col-span-2 bg-stone-900 rounded-[4rem] p-16 text-white flex flex-col md:flex-row justify-between items-center group overflow-hidden relative shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10" />
              
              <div className="relative z-10 max-w-xl">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-8 shadow-xl">
                   <HandRaisedIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-5xl font-bold leading-tight mb-6 tracking-tight">Be the Hands <br /> of Change.</h4>
                <p className="text-lg font-medium text-stone-400 leading-relaxed italic">Join our volunteer network of over 500 Kenyans making a difference every single day.</p>
              </div>

              <div className="relative z-10 mt-12 md:mt-0">
                 <button className="px-14 py-7 bg-orange-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-stone-900 transition-all shadow-2xl shadow-orange-900/40">
                   Join the Movement
                 </button>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}