"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import {
  ChevronLeftIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassPlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import PreviewModal from "../PreviewModal/PreviewModal";

interface CategoryVariant {
  name: string;
  link: string;
  description: string;
  tag: "New" | "Popular" | "Standard" | "Recommended" | "Trending" | "Featured" | "Limited" | "Exclusive" | "Best Seller" | "Top Rated" | "Editor's Choice" | "Customer Favorite" | "Hot" | "Must Have" | "Essential" | "Premium" | "Advanced" | "Professional" | "Ultimate";
  desktopPreviewImage?: string;
  mobilePreviewImage?: string;
}

interface Category {
  name: string;
  icon?: string;
  variants: CategoryVariant[];
}

export interface CategoryVariantSelectProps {
  siteCategories: Category[];
  category: string;
  variant?: string | null | undefined;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

// Staggered animation variants for the list items
const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function MainCategoryVariantSelect({
  siteCategories,
  category,
  variant,
  handleChange,
}: CategoryVariantSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const selectedCategory = siteCategories.find((c) => c.name === category) || siteCategories[0];
  const selectedTemplate = siteCategories.flatMap((cat) => cat.variants).find((v) => v.name === variant);

  const activePreviewImage =
    previewMode === "desktop"
      ? selectedTemplate?.desktopPreviewImage
      : selectedTemplate?.mobilePreviewImage || selectedTemplate?.desktopPreviewImage;

  return (
    <div className="relative w-full max-w-7xl mx-auto rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 p-4 lg:p-8 shadow-2xl shadow-zinc-200/20 dark:shadow-black/40 backdrop-blur-3xl overflow-hidden">
      
      {/* Standalone Ambient Background Accents */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-gradient-to-tr from-orange-400/10 to-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        key="step2-standalone"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch lg:h-[720px]"
      >
        {/* LEFT COLUMN: CONTROL & SELECTION CARD */}
        <div className="lg:col-span-4 w-full flex flex-col bg-zinc-50/80 dark:bg-zinc-900/80 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-inner backdrop-blur-md relative overflow-hidden">
          
          {/* <button
            onClick={() => handleChange({ target: { name: "category", value: "" } } as any)}
            className="inline-flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-6 group w-fit z-10"
          >
            <ChevronLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            All Industries
          </button> */}

          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
              <span className="relative text-3xl p-3.5 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                {selectedCategory.icon || "📁"}
              </span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 dark:text-indigo-400 mb-0.5">
                Select Your Perfect Template
              </p>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                {selectedCategory.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                {selectedCategory.variants.length} Variants Available
                <span className="hidden sm:inline"> for your store</span>
              </p>
            </div>
            <div >

            </div>
          </div>

          {/* VARIANT FEED SUB-GRID */}
          <motion.div
            variants={listContainerVariants}
            initial="hidden"
            animate="show"
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin dark:scrollbar-thumb-zinc-700 scrollbar-thumb-zinc-300 z-10"
          >
            {selectedCategory.variants.map((v) => {
              const isSelected = v.name === variant;
              return (
                <motion.button
                  variants={listItemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={v.name}
                  onClick={() => handleChange({ target: { name: "variant", value: v.name } } as any)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? "bg-white dark:bg-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border-2 border-indigo-500 dark:border-indigo-400"
                      : "bg-white/40 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-800 border-2 border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-indigo-50 dark:bg-indigo-500/10 pointer-events-none"
                    />
                  )}
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={`font-bold text-sm tracking-tight ${
                            isSelected ? "text-indigo-600 dark:text-indigo-300" : "text-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {v.name}
                        </p>
                        {v.tag && v.tag !== "Standard" && (
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm ${
                              v.tag === "New"
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                                : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                            }`}
                          >
                            {v.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {v.description || "Fully responsive design paradigm suited for immediate integration."}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 w-full py-4 bg-zinc-950 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-zinc-200 dark:shadow-indigo-900/20 transition-all active:scale-[0.98] z-10"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
            Live Fullscreen Preview
          </button>
        </div>

        {/* RIGHT COLUMN: CINEMATIC HARDWARE DISPLAY STAGE */}
        <div className="lg:col-span-8 w-full flex flex-col relative min-h-[450px] lg:min-h-0 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2rem] p-4 lg:p-8 justify-between overflow-hidden shadow-inner">
          
          <div className="flex justify-center z-20">
            <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 shadow-sm flex gap-1">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all duration-300 ${
                  previewMode === "desktop"
                    ? "bg-zinc-900 dark:bg-zinc-950 text-white shadow-md scale-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 scale-95 hover:scale-100"
                }`}
              >
                <ComputerDesktopIcon className="h-4 w-4" /> Desktop
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all duration-300 ${
                  previewMode === "mobile"
                    ? "bg-zinc-900 dark:bg-zinc-950 text-white shadow-md scale-100"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 scale-95 hover:scale-100"
                }`}
              >
                <DevicePhoneMobileIcon className="h-4 w-4" /> Mobile
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center py-8 lg:py-4">
            <AnimatePresence mode="wait">
              {previewMode === "desktop" ? (
                <motion.div
                  key="desktop-shell"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-full max-w-3xl aspect-[16/10] bg-zinc-800 dark:bg-black rounded-t-3xl rounded-b-xl p-3 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] border-b-[12px] border-zinc-700 dark:border-zinc-900 relative group flex flex-col ring-1 ring-white/10"
                >
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-900 border border-zinc-700 z-30 opacity-80" />

                  <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-xl overflow-hidden relative cursor-ns-resize shadow-inner">
                    <motion.div
                      key={activePreviewImage}
                      initial={{ y: 0 }}
                      whileHover={activePreviewImage ? { y: "-65%" } : {}}
                      transition={{ duration: 8, ease: "linear" }}
                      className="w-full origin-top"
                    >
                      {activePreviewImage ? (
                        <img
                          src={activePreviewImage}
                          alt={`${variant} desktop view`}
                          className="w-full h-auto object-cover select-none"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full aspect-video flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 p-6 text-center">
                          <SparklesIcon className="h-10 w-10 mb-3 stroke-[1.2]" />
                          <span className="text-sm font-medium">Awaiting desktop canvas mapping</span>
                        </div>
                      )}
                    </motion.div>
                    {/* Screen Glare Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-xl" />
                    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-zinc-950/30 to-transparent z-10 pointer-events-none" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-shell"
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -20 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="w-[280px] aspect-[9/19] bg-zinc-900 dark:bg-black rounded-[3rem] p-3 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)] border-4 border-zinc-800 dark:border-zinc-800/80 relative group flex flex-col ring-2 ring-black/5"
                >
                  {/* Dynamic Island */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full bg-black z-30 flex items-center justify-end px-3 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 border border-zinc-700" />
                  </div>

                  <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[2.2rem] overflow-hidden relative cursor-ns-resize">
                    <motion.div
                      key={activePreviewImage}
                      initial={{ y: 0 }}
                      whileHover={activePreviewImage ? { y: "-70%" } : {}}
                      transition={{ duration: 10, ease: "linear" }}
                      className="w-full origin-top"
                    >
                      {activePreviewImage ? (
                        <img
                          src={activePreviewImage}
                          alt={`${variant} mobile view`}
                          className="w-full h-auto object-cover select-none"
                          draggable={false}
                        />
                      ) : (
                        <div className="w-full h-[550px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 p-4 text-center">
                          <SparklesIcon className="h-8 w-8 mb-3 stroke-[1.2]" />
                          <span className="text-xs font-medium">Awaiting mobile canvas</span>
                        </div>
                      )}
                    </motion.div>
                    {/* Screen Glare Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-[2.2rem]" />
                    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-zinc-950/40 to-transparent z-10 pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between text-xs px-4 py-3 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
            <span className="flex items-center gap-2 font-semibold">
              <SparklesIcon className="h-4 w-4 text-indigo-500 animate-pulse" />
              Hover screen to scroll preview
            </span>
            <span className="font-mono tracking-tighter opacity-70 font-medium">
              v.{selectedTemplate?.name?.replace(/\s+/g, '-').toLowerCase() || "null"}
            </span>
          </div>
        </div>
      </motion.div>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={selectedTemplate?.link || ""}
        name={selectedTemplate?.name || ""}
      />
    </div>
  );
}