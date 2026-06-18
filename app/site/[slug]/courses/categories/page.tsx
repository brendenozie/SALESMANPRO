"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  AcademicCapIcon, 
  UserIcon, 
  ClockIcon,
  VideoCameraIcon,
  ArrowUpRightIcon,
  StarIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Scholarly Vibrance) --- */
const FALLBACK_EDU = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveEduStyle(index: number) {
  const themes = [
    { accent: "text-blue-600", bg: "bg-blue-600", border: "border-blue-100", label: "STEM & Logic" },
    { accent: "text-purple-600", bg: "bg-purple-600", border: "border-purple-100", label: "Creative Arts" },
    { accent: "text-amber-500", bg: "bg-amber-500", border: "border-amber-100", label: "Business & Leadership" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Structured Growth) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.215, 0.61, 0.355, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function CourseCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveEduStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link href={`/courses/products?category=${cat.id}`} className="block">
        <div className={`relative h-[520px] w-full overflow-hidden bg-white rounded-[2rem] border-2 ${theme.border} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
          
          {/* Status Badge: Live Lessons */}
          <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-100">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Live Class</span>
          </div>

          {/* Visual: Immersive Learning Space */}
          <div className="h-[45%] w-full relative overflow-hidden">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_EDU)}
              alt={cat.displayName || ""}
              loader={loader}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Soft Paper Texture Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Content: Clean & Actionable */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-4">
               <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${theme.bg} text-white`}>
                 {theme.label}
               </span>
            </div>
            
            <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
              {cat.displayName}
            </h3>
            
            {/* Micro-Metrics for Trust */}
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">1.2k Students</span>
               </div>
               <div className="flex items-center gap-2">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-600">4.8 (200 Reviews)</span>
               </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available Modules</span>
                  <span className="text-lg font-bold text-slate-900">{cat.subcategories?.length || 15}+ Courses</span>
               </div>
               
               <div className={`w-14 h-14 rounded-full ${theme.bg} text-white flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-lg`}>
                  <ArrowUpRightIcon className="w-6 h-6" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function EducationCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fcfdfd] min-h-screen py-32 overflow-hidden relative">
      {/* Decorative Grid: Geometric Learning Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border-4 border-blue-100 rounded-full opacity-50" />
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-purple-50 rounded-3xl rotate-12 -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Inspiring & Solid */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                 <AcademicCapIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Future-Ready Curriculum</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-[10rem] font-black text-slate-900 leading-[0.8] tracking-tighter"
            >
              Master <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-500 italic">Everything.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm max-w-sm"
          >
             <p className="text-sm text-slate-500 font-bold leading-relaxed uppercase tracking-widest">
               "Nairobi's elite portal for personalized tutoring and professional skill-building."
             </p>
          </motion.div>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categories.map((cat, idx) => (
            <CourseCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Specialized Tutor Card */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-slate-900 rounded-[2rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl border-2 border-white/5">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              
              <div className="relative z-10">
                <VideoCameraIcon className="w-12 h-12 text-blue-400 mb-8" />
                <h4 className="text-4xl font-bold leading-tight mb-4 tracking-tight">Expert <br /> Tutors.</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">Book 1-on-1 sessions with certified educators from top local and international schools.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-900/40">
                Browse Faculty
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}