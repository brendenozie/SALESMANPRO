"use client";

import React, { useState, useMemo, useRef, ChangeEvent } from "react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import PreviewModal from "../PreviewModal/PreviewModal";

interface CategoryVariant {
  name: string;
  link: string;
  description: string;
  tag: "New" | "Popular" | "Standard";
  desktopPreviewImage?: string;
  mobilePreviewImage?: string;
}

interface Category {
  name: string;
  icon?: string;
  variants: CategoryVariant[];
}

export interface CategorySelectProps {
  siteCategories: Category[];
  category: string;
  variant?: string | null | undefined;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export default function CategoryStep({
  siteCategories,
  category,
  variant,
  handleChange,
}: CategorySelectProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const selectedCategory = siteCategories.find((c) => c.name === category);
  const selectedTemplate = selectedCategory?.variants.find((v) => v.name === variant);

  const filteredCategories = useMemo(
    () => siteCategories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search, siteCategories]
  );

  const handleIndustrySelect = (catName: string) => {
    const cat = siteCategories.find(c => c.name === catName);
    handleChange({ target: { name: 'category', value: catName } } as any);
    if (cat && cat.variants.length > 0) {
      handleChange({ target: { name: 'variant', value: cat.variants[0].name } } as any);
    }
  };

  // Safe fallback images if properties are missing
  const activePreviewImage = previewMode === 'desktop' 
    ? selectedTemplate?.desktopPreviewImage 
    : selectedTemplate?.mobilePreviewImage || selectedTemplate?.desktopPreviewImage;

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 lg:p-12 min-h-[750px] flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500/20">
        
        {/* Ambient Blurred Background Accents */}
        <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-gradient-to-tr from-orange-300/20 to-amber-400/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 -z-10 w-[450px] h-[450px] bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-[130px]" />

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            
            /* STEP 1: DISCOVERY SCREEN */
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-12 w-full"
            >
              <header className="text-center space-y-4 max-w-3xl mx-auto">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tight leading-none"
                >
                  Pick your <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Industry.</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl"
                >
                  We will tailor your deployment engine blueprint based on your operational domain.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative max-w-xl mx-auto mt-8 group"
                >
                  {/* <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" /> */}
                  <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search industries (e.g. Agency, Store, SaaS...)"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              </header>

              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
              >
                {filteredCategories.map((cat, idx) => (
                  <motion.button
                    key={cat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.04, 0.4), ease: "easeOut" }}
                    whileHover={{ y: -6, scale: 1.02, boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleIndustrySelect(cat.name)}
                    className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/40 transition-colors flex flex-col items-center justify-center text-center group min-h-[140px]"
                  >
                    <span className="text-4xl mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 transform-gpu">{cat.icon || '💼'}</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 text-sm tracking-tight uppercase">{cat.name}</span>
                  </motion.button>
                ))}
              </motion.div>

              {filteredCategories.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-zinc-400 dark:text-zinc-500">
                  No explicit industries match your search parameter.
                </motion.div>
              )}
            </motion.div>
          ) : (
            
            /* STEP 2: REFINE & INTERACTIVE INTERFACE */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:h-[680px]"
            >
              {/* LEFT COLUMN: CONTROL & SELECTION CARD */}
              <div className="lg:col-span-4 w-full flex flex-col bg-zinc-50 dark:bg-zinc-900/60 rounded-[2rem] p-6 border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm backdrop-blur-sm">
                <button 
                  onClick={() => handleChange({ target: { name: 'category', value: "" } } as any)}
                  className="inline-flex items-center gap-2 text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-orange-500 dark:hover:text-orange-400 transition-colors mb-6 group w-fit"
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Change Industry
                </button>

                <div className="flex items-center gap-3.5 pb-5 mb-5 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-3xl p-3 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700/50">{selectedCategory.icon || '📁'}</span>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">Selected Sector</p>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{selectedCategory.name}</h2>
                  </div>
                </div>

                {/* VARIANT FEED SUB-GRID */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin dark:scrollbar-thumb-zinc-800 scrollbar-thumb-zinc-200"
                >
                  {selectedCategory.variants.map((v) => {
                    const isSelected = v.name === variant;
                    return (
                      <button
                        key={v.name}
                        onClick={() => handleChange({ target: { name: 'variant', value: v.name } } as any)}
                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
                          isSelected 
                            ? "bg-white dark:bg-zinc-800 shadow-md border border-indigo-500 dark:border-indigo-400" 
                            : "bg-white/40 dark:bg-zinc-900/20 hover:bg-white dark:hover:bg-zinc-800/50 border border-zinc-200/40 dark:border-zinc-800/40 hover:border-zinc-200 dark:hover:border-zinc-700"
                        }`}
                      >
                        {isSelected && (
                          <motion.div 
                            layoutId="activeIndicator"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 dark:bg-indigo-400" 
                          />
                        )}
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-bold text-sm tracking-tight ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {v.name}
                              </p>
                              {v.tag && v.tag !== 'Standard' && (
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  v.tag === 'New' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                                }`}>
                                  {v.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-normal">
                              {v.description || "Fully responsive design paradigm suited for immediate integration."}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-5 w-full py-3.5 bg-zinc-900 dark:bg-indigo-600 hover:bg-zinc-800 dark:hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-200 dark:shadow-none transition-all active:scale-[0.99]"
                >
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                  Preview Full Template
                </button>
              </div>

              {/* RIGHT COLUMN: CINEMATIC HARDWARE DISPLAY STAGE */}
              <div className="lg:col-span-8 w-full flex flex-col relative min-h-[400px] lg:min-h-0 bg-zinc-100/40 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800/50 rounded-[2rem] p-6 justify-between overflow-hidden">
                
                {/* FLOATING TOP DEVICE DOCK ARCHITECTURE */}
                <div className="flex justify-center z-20">
                  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex gap-1">
                    <button 
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition-all ${
                        previewMode === 'desktop' 
                          ? 'bg-zinc-950 dark:bg-zinc-800 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      <ComputerDesktopIcon className="h-3.5 w-3.5" /> Desktop view
                    </button>
                    <button 
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs transition-all ${
                        previewMode === 'mobile' 
                          ? 'bg-zinc-950 dark:bg-zinc-800 text-white shadow-sm' 
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                      }`}
                    >
                      <DevicePhoneMobileIcon className="h-3.5 w-3.5" /> Mobile frame
                    </button>
                  </div>
                </div>

                {/* THE MOCKUP RIG LAYER */}
                <div className="flex-1 flex items-center justify-center py-6">
                  <AnimatePresence mode="wait">
                    {previewMode === 'desktop' ? (
                      /* DESKTOP DISPLAY MONITOR MOCKUP Shell */
                      <motion.div
                        key="desktop-shell"
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -15 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        className="w-full max-w-2xl aspect-[16/10] bg-zinc-800 rounded-2xl p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-zinc-700/60 relative group flex flex-col"
                      >
                        {/* Camera Notch Top Panel */}
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-900 z-30 opacity-60" />
                        
                        {/* Canvas Window Frame viewport */}
                        <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-lg overflow-hidden relative group-hover:cursor-ns-resize">
                          <motion.div 
                            key={activePreviewImage}
                            initial={{ y: 0 }}
                            whileHover={activePreviewImage ? { y: "-60%" } : {}}
                            transition={{ duration: 6, ease: "easeInOut" }}
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
                                <SparklesIcon className="h-8 w-8 mb-2 stroke-[1.5]" />
                                <span className="text-xs">No active desktop canvas preview index mapped</span>
                              </div>
                            )}
                          </motion.div>
                          {/* Inner Shadow Border Mask overlay */}
                          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 dark:ring-white/5 rounded-lg" />
                          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-zinc-950/20 to-transparent z-10 pointer-events-none" />
                        </div>
                      </motion.div>
                    ) : (
                      /* MOBILE PREMIUM PHONE SHELL MOCKUP */
                      <motion.div
                        key="mobile-shell"
                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -15 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        className="w-[260px] aspect-[9/19] bg-zinc-900 rounded-[2.8rem] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border-4 border-zinc-800/90 relative group flex flex-col"
                      >
                        {/* Island Capsule pill */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-4 rounded-full bg-black z-30 flex items-center justify-end px-2">
                          <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        </div>
                        
                        {/* Phone Screen display wrapper */}
                        <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[2rem] overflow-hidden relative group-hover:cursor-ns-resize">
                          <motion.div 
                            key={activePreviewImage}
                            initial={{ y: 0 }}
                            whileHover={activePreviewImage ? { y: "-65%" } : {}}
                            transition={{ duration: 7, ease: "easeInOut" }}
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
                              <div className="w-full h-[450px] flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900/40 p-4 text-center">
                                <SparklesIcon className="h-6 w-6 mb-2 stroke-[1.5]" />
                                <span className="text-[10px]">No active mobile index mapped</span>
                              </div>
                            )}
                          </motion.div>
                          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 rounded-[2rem]" />
                          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-zinc-950/20 to-transparent z-10 pointer-events-none" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* BOTTOM CAPTION META PANEL */}
                <div className="flex items-center justify-between text-xs px-2 text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/40 dark:border-zinc-800/40 pt-3">
                  <span className="flex items-center gap-1.5 font-medium">
                    <SparklesIcon className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                    Hover frame to auto-scroll asset viewport
                  </span>
                  <span className="font-mono tracking-tighter opacity-80 text-[11px]">
                    {selectedTemplate?.name || "No Configuration Indexed"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          url={selectedTemplate?.link || ""}
          name={selectedTemplate?.name || ""}
        />
      </div>
    </>
  );
}