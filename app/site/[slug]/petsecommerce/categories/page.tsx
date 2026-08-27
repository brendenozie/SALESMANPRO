"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  HeartIcon, 
  SparklesIcon, 
  TagIcon,
  FingerPrintIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME & STYLE HELPERS (High Energy Palette) --- */
const FALLBACK_PET_IMAGE = "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80";

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

function resolvePetStyle(index: number) {
  const themes = [
    { accent: "text-orange-500", bg: "bg-orange-50", border: "hover:border-orange-200", shadow: "shadow-orange-100", label: "Bark & Run" },
    { accent: "text-indigo-500", bg: "bg-indigo-50", border: "hover:border-indigo-200", shadow: "shadow-indigo-100", label: "Purr & Nap" },
    { accent: "text-emerald-500", bg: "bg-emerald-50", border: "hover:border-emerald-200", shadow: "shadow-emerald-100", label: "Healthy Feathers" },
    { accent: "text-rose-500", bg: "bg-rose-50", border: "hover:border-rose-200", shadow: "shadow-rose-100", label: "Pocket Pals" },
  ];
  const icons = [
    <FingerPrintIcon className="w-6 h-6 rotate-12" key="1" />,
    <SparklesIcon className="w-6 h-6 -rotate-12" key="2" />,
    <HeartIcon className="w-6 h-6" key="3" />,
    <TagIcon className="w-6 h-6" key="4" />,
  ];
  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* --- 2. ANIMATIONS (Playful & Quick) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -2 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 150, damping: 12 } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function PetCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const { theme } = resolvePetStyle(index);
  const isImageUrl = cat.image || cat.icon?.startsWith("http") || cat.icon?.startsWith("/");

  return (
    <motion.div variants={itemVariants} className="group h-full">
      <Link href={`/petsecommerce/products?category=${cat.id}`} className="block h-full">
        <div className={`relative h-[460px] w-full overflow-hidden rounded-[2rem] bg-white transition-all duration-500 hover:shadow-2xl ${theme.shadow} hover:-translate-y-2`}>
          
          {/* Angled Image Container */}
          <div className="h-3/5 w-full relative overflow-hidden clip-path-mypoly">
            <style jsx>{`
              .clip-path-mypoly {
                clip-path: polygon(0 0, 100% 0, 100% 85%, 0% 100%);
              }
            `}</style>
            <Image
              src={isImageUrl ? cat.image || cat.icon || FALLBACK_PET_IMAGE : FALLBACK_PET_IMAGE}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
                loader={customLoader}
            />
            <div className={`absolute inset-0 bg-gradient-to-t from-${theme.accent.split('-')[1]}-900/40 to-transparent`} />
          </div>

          <div className="p-8">
            <span className={`inline-block px-3 py-1 rounded-lg ${theme.bg} ${theme.accent} text-[10px] font-black uppercase tracking-widest mb-4`}>
              {theme.label}
            </span>
            
            <h3 className="text-3xl font-black text-slate-800 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
               <FingerPrintIcon className="w-4 h-4 opacity-30" />
               <span>{cat.subcategories?.length || 0} Specialties</span>
            </div>
          </div>

          <div className={`absolute bottom-6 right-8 w-12 h-12 rounded-full ${theme.bg} ${theme.accent} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0`}>
             <ChevronRightIcon className="w-6 h-6" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PetSubTile({ sub, index, storeSlug }: { sub: ISubcategory; index: number; storeSlug: string }) {
  const { theme, icon } = resolvePetStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/petsecommerce/products?subcategory=${sub.id}`}>
        <div className={`group relative p-6 rounded-[1.5rem] bg-white border border-slate-100 transition-all hover:bg-slate-50 ${theme.border} hover:shadow-lg`}>
          <div className="flex items-center gap-5">
            <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${theme.bg} ${theme.accent} group-hover:rotate-12 transition-transform`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-800 truncate">{sub.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Care</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function PetsDukaCategoriesPage() {
  const store = useStore();
  const rawCategories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawCategories]);

  const isNicheStore = categories.length > 0 && categories.length <= 2;

  const elevatedSubs = useMemo(() => {
    if (!isNicheStore) return [];
    return categories.flatMap(cat => cat.subcategories || []).slice(0, 12);
  }, [categories, isNicheStore]);

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fcfcfd] min-h-screen py-32 overflow-hidden relative">
      {/* Playful Background Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-50 rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 mb-4 bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-indigo-200"
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">The Pet Paradise</span>
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 leading-[1] tracking-tighter"
            >
              {isNicheStore ? (
                <>Happy Tails <br /> <span className="text-orange-500 italic font-serif font-light">Start Here.</span></>
              ) : (
                <>Your Pet's <br /> <span className="text-indigo-600 italic font-serif font-light">World, Curated.</span></>
              )}
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-slate-500 font-bold max-w-xs border-l-4 border-orange-400 pl-6 leading-relaxed"
          >
            "From nutrition to playtime, we provide only the best for your furry, feathered, or scaled family members."
          </motion.p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid grid-cols-1 gap-8 ${isNicheStore ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
        >
          {isNicheStore ? (
             elevatedSubs.map((sub, idx) => (
              <PetSubTile key={sub.id} sub={sub} index={idx} storeSlug={storeSlug} />
            ))
          ) : (
            categories.map((cat, idx) => (
              <PetCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
            ))
          )}

          {/* Veterinarian CTA Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900 rounded-[2rem] p-10 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                 <FingerPrintIcon className="w-40 h-40" />
              </div>
              <h4 className="text-3xl font-black leading-tight relative z-10">Ask our <br /> <span className="text-emerald-400">Pet Experts.</span></h4>
              <div className="relative z-10">
                <p className="text-sm text-slate-400 mb-6 font-medium">Get personalized advice on nutrition and wellness.</p>
                <Link href="/petsecommerce/products" className="font-black text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-2 group-hover:text-white transition-colors">
                  Talk to a Vet <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}