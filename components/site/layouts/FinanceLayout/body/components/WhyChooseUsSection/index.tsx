"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ICoreValue } from "@/types/typings";

interface LocalCoreValue extends Omit<ICoreValue, 'icon'> {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  order: number;
  badgeClass: string; 
  bgGlowClass: string;
}

const defaultCoreValues: LocalCoreValue[] = [
  {
    id: "feat-1",
    title: "Trusted Expertise",
    description: "Benefit from over two decades of combined legal and financial mastery, ensuring your matters are handled with elite precision.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12 5.477 2 10 2s10 4.477 10 10z" />
      </svg>
    ),
    badgeClass: "bg-blue-600 text-white",
    bgGlowClass: "from-blue-600/[0.03] to-transparent",
    order: 1,
  },
  {
    id: "feat-2",
    title: "Tailored Strategies",
    description: "Receive personalized enterprise solutions meticulously crafted to align with your unique objectives and intricate requirements.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    badgeClass: "bg-amber-600 text-white",
    bgGlowClass: "from-amber-600/[0.03] to-transparent",
    order: 2,
  },
  {
    id: "feat-3",
    title: "Proactive Communication",
    description: "Experience prompt responses and transparent updates, keeping you fully informed, integrated, and confident at every stage.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    badgeClass: "bg-emerald-600 text-white",
    bgGlowClass: "from-emerald-600/[0.03] to-transparent",
    order: 3,
  },
  {
    id: "feat-4",
    title: "Client-Centric Approach",
    description: "Your absolute market success is our priority. We are dedicated to delivering exceptional service and building generational relationships.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    badgeClass: "bg-rose-600 text-white",
    bgGlowClass: "from-rose-600/[0.03] to-transparent",
    order: 4,
  },
];

interface WhyChooseUsSectionProps {
  themeSettings?: {
    primaryColor?: string;
    accentColor?: string;
  } | null;
  CoreValues?: any[];
}

export default function WhyChooseUsSection({ themeSettings, CoreValues }: WhyChooseUsSectionProps) {
  const primaryColor = themeSettings?.primaryColor || "#2563EB";
  const accentColor = themeSettings?.accentColor || "#10B981";

  const workingValues: LocalCoreValue[] = CoreValues && CoreValues.length > 0
    ? CoreValues.map((v, i) => ({
        ...v,
        badgeClass: v.badgeClass || defaultCoreValues[i % 4].badgeClass,
        bgGlowClass: v.bgGlowClass || defaultCoreValues[i % 4].bgGlowClass,
        order: v.order || i + 1,
        icon: v.icon || defaultCoreValues[i % 4].icon
      }))
    : defaultCoreValues;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const currentActive = workingValues[activeIndex] || workingValues[0];

  return (
    <section className="relative py-24 lg:py-36 bg-white text-slate-800 overflow-hidden selection:bg-blue-500/10">
      
      {/* Background Ambient Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35] z-0" aria-hidden="true">
        <div 
          className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full blur-[140px] transition-all duration-700 ease-in-out mix-blend-multiply" 
          style={{ backgroundColor: `${primaryColor}15` }} 
        />
        <div 
          className="absolute bottom-12 right-12 w-[400px] h-[400px] rounded-full blur-[120px] transition-all duration-700 ease-in-out mix-blend-multiply" 
          style={{ backgroundColor: `${accentColor}12` }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Typography Intro */}
        <div className="max-w-3xl mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.25em] px-3 py-1.5 rounded-full border border-slate-100 bg-slate-50/80 text-slate-500 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Institutional Pillars
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mt-5 leading-[1.15]">
            Why Elite Enterprises <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900">
              Choose Certainty
            </span>
          </h2>
          <p className="mt-6 text-base sm:text-lg text-slate-600 font-normal max-w-xl leading-relaxed">
            We bypass commoditized advice to manage high-stakes strategic initiatives built strictly upon four foundational pillars.
          </p>
        </div>

        {/* Bento-Style Interactive Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDE: Dynamic Preview Display Panel (Desktop Viewports Only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-slate-50/50 border border-slate-100 p-10 rounded-3xl backdrop-blur-xl relative overflow-hidden shadow-xl shadow-slate-100/40">
            <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-white to-transparent pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-mono tracking-widest text-slate-400 uppercase font-bold">Core Pillar Focus</span>
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={currentActive.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className={`font-mono text-xs font-bold px-3 py-1 rounded-md shadow-sm tracking-wider ${currentActive.badgeClass}`}
                  >
                    0{currentActive.order}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Central Dynamic Stage */}
              <div className="mt-16 min-h-48 flex flex-col justify-center relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentActive.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-white mb-6 shadow-md ${currentActive.badgeClass}`}>
                      {currentActive.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentActive.title}</h3>
                    <p className="mt-4 text-slate-600 text-sm leading-relaxed font-normal">{currentActive.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer Metrics */}
            <div className="pt-8 border-t border-slate-200/60 flex items-center justify-between relative z-10">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">A-B Consulting Corp ©2026</span>
              <div className="flex gap-2">
                {workingValues.map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1 rounded-full transition-all duration-300 ease-out ${activeIndex === index ? 'w-6 bg-slate-900' : 'w-1 bg-slate-200'}`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Accordion Track */}
          <div className="lg:col-span-7 flex flex-col gap-3.5">
            {workingValues.map((val, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={val.id}
                  onClick={() => setActiveIndex(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  aria-expanded={isSelected}
                  className={`group relative w-full text-left p-6 sm:p-8 rounded-2xl border transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                    isSelected 
                      ? "bg-white border-slate-200 shadow-xl shadow-slate-100/70" 
                      : "bg-slate-50/50 border-slate-100/70 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  {/* Subtle Interactive Ambient Glow */}
                  {isSelected && (
                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${val.bgGlowClass} pointer-events-none transition-opacity rounded-2xl`} />
                  )}

                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className={`font-mono text-sm font-bold transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`}>
                        0{val.order}
                      </span>
                      <h3 className={`text-lg sm:text-xl font-bold tracking-tight transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-800'}`}>
                        {val.title}
                      </h3>
                    </div>

                    {/* Compact Icon Wrap */}
                    <div className={`p-2.5 rounded-lg transition-all duration-300 ${isSelected ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 bg-white border border-slate-100 group-hover:text-slate-600 group-hover:border-slate-200'}`}>
                      {val.icon}
                    </div>
                  </div>

                  {/* Accordion content safely animated across device viewports */}
                  <motion.div 
                    initial={false}
                    animate={{ height: isSelected ? "auto" : 0, opacity: isSelected ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden relative z-10"
                  >
                    <div className="pt-4 pr-4">
                      <p className="text-slate-600 text-sm leading-relaxed font-normal lg:hidden">
                        {val.description}
                      </p>
                      {/* Interactive Visual Highlight Strip for Desktop */}
                      <div className="hidden lg:block w-8 h-[2px] rounded-full mt-3 bg-slate-900 transition-all duration-300 group-hover:w-14" />
                    </div>
                  </motion.div>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
