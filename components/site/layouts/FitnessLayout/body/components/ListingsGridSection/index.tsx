"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  HeartIcon,
  ClockIcon,
  ArrowRightIcon,
  UserCircleIcon,
  SparklesIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useStoreContext } from "@/contexts/StoreContext";
import { useRouter, useParams } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

interface ListingsGridProps {
  programs?: any[];
}

export default function ListingsGrid({ programs = [] }: ListingsGridProps) {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const params = useParams();
  
  // Resolve runtime context params dynamically
  const slug = params?.slug || "fitness";
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const globalCurrency = storeFormData?.currency || "KES";
  
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 relative overflow-hidden">
      
      {/* Immersive Organic Blur Orbs */}
      <div 
        className="absolute top-0 right-[-10%] w-[500px] h-[500px] opacity-15 dark:opacity-[0.08] blur-[120px] rounded-full -z-10 pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-12 left-[-10%] w-[400px] h-[400px] opacity-10 dark:opacity-[0.04] blur-[100px] rounded-full -z-10 pointer-events-none transition-colors duration-500" 
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center space-x-2 font-black tracking-[0.2em] uppercase text-[11px]"
              style={{ color: primaryColor }}
            >
              <SparklesIcon className="w-4 h-4 text-orange-500" />
              <span>Premium Fitness Rosters</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter italic uppercase leading-none transition-colors"
            >
              Transformative <br /> 
              <span className="text-neutral-400 dark:text-neutral-600 transition-colors">Programs</span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-md text-neutral-500 dark:text-neutral-400 font-medium text-sm sm:text-base leading-relaxed transition-colors"
          >
            Engineered training pipelines explicitly structured by elite trainers to boost real performance outcomes and biometric recovery.
          </motion.p>
        </div>

        {/* EMPTY STATE */}
        {programs.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No active fitness schedules found right now.</p>
          </div>
        )}

        {/* LISTINGS BENTO GRID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.02 }}
        >
          {programs.map((program) => {
            // Unify names, pricing, and nested image fallbacks
            const title = program.name || program.title || "Elite Workout Block";
            const price = program.finalPrice ?? program.sellingPrice ?? 0;
            const currency = program.currency || globalCurrency;
            
            const imageSrc = program.imageUrl || 
              (Array.isArray(program.images) && program.images[0]?.url) || 
              (typeof program.images?.[0] === 'string' ? program.images[0] : "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop");

            return (
              <motion.div
                key={program.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group relative bg-white dark:bg-neutral-900/40 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-neutral-900 dark:hover:border-neutral-700/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* HERO VISUAL COVER CONTAINER */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <Image decoding="async"
                      src={imageSrc}
                      alt={title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    
                    {/* Immersive Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
                    
                    {/* Floating Upper Badges */}
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1 bg-neutral-900/80 dark:bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                        {program.productCategory?.name || program.code || "Active Session"}
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => toggleFavorite(program.id, e)}
                      className="absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md text-neutral-700 dark:text-neutral-300 shadow-sm transition-all"
                    >
                      {favorites[program.id] ? (
                        <HeartIconSolid className="h-4 w-4" style={{ color: primaryColor }} />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>

                  {/* BODY TEXTUAL CONTENT */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white uppercase italic tracking-tight line-clamp-1 transition-colors">
                          {title}
                        </h3>
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed h-10">
                        {program.description || "Tailored execution parameters built to build and sustain systemic cellular load profiles."}
                      </p>
                    </div>

                    {/* METRIC ROW PINS */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                      <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                        <ClockIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{program.duration || "60 Mins"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                        <UserCircleIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{program.coachName || "Expert Coach"}</span>
                      </div>
                      {program.locationName && (
                        <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                          <MapPinIcon className="h-4 w-4 shrink-0 text-neutral-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{program.locationName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION CTA BAR */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none mb-1">Total Pricing</span>
                    <span className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                      {currency} {price.toLocaleString()}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all duration-300 shadow-sm hover:opacity-95"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: "#ffffff"
                    }}
                    onClick={() => {
                      router.push(`/fitness/programs/${program.id}`);
                    }}
                  >
                    <span>Reserve Slot</span>
                    <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </motion.button>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

        {/* BOTTOM GLOBAL REDIRECT BUTTON */}
        {programs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-col items-center"
          >
            <div className="h-[1px] w-16 bg-neutral-200 dark:bg-neutral-800 mb-6" />
            <button
              onClick={() => router.push(`/fitness/programs`)}
              className="text-neutral-800 dark:text-neutral-200 font-bold uppercase tracking-[0.2em] text-xs hover:opacity-70 transition-opacity flex items-center gap-2 group"
            >
              Explore All Sessions
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        )}
        
      </div>
    </section>
  );
}