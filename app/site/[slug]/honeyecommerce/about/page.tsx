"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  BeakerIcon, 
  SunIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon,
  SparklesIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HoneyBeeToBottlePage() {
  return (
    <main className="bg-[#fffdfa] dark:bg-slate-950 min-h-screen pt-32 pb-24 text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden">
      
      {/* 1. THE ORIGIN STORY (BEE-TO-BOTTLE) */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">The Journey</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-10">
              Bee to <br />
              <span className="italic font-serif font-light text-amber-500">Bottle.</span>
            </h1>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
              In the heart of Kenya's diverse landscapes, our bees forage on wild blossoms. We don't interfere; we simply harvest what nature provides—raw, cold-pressed, and untouched.
            </p>

            <div className="space-y-8 border-l-2 border-amber-100 dark:border-amber-900/50 pl-8 ml-2">
               <TimelineStep number="01" title="Ethical Foraging" desc="Bees gather nectar from indigenous forests in Baringo and Mwingi." />
               <TimelineStep number="02" title="Cold Extraction" desc="Extracted without heat to preserve living enzymes and pollen." />
               <TimelineStep number="03" title="Micro-Filtering" desc="Slow-strained to remove wax while keeping the nectar’s soul intact." />
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div 
              initial={{ clipPath: "circle(0% at 50% 50%)" }}
              animate={{ clipPath: "circle(100% at 50% 50%)" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl border-[16px] border-white dark:border-slate-900"
            >
              <Image 
                src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80" 
                alt="Raw Honeycomb" fill className="object-cover transition-transform duration-[3s] group-hover:scale-110" loader={imageLoader}
              />
            </motion.div>
            {/* Liquid Drip Element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-400/20 blur-3xl rounded-full -z-10 animate-pulse" />
          </div>
        </div>
      </section>

      {/* 2. THE TASTING GUIDE (FLAVOR WHEEL BENTO) */}
      <section className="bg-amber-50 dark:bg-slate-900/50 py-32 rounded-[5rem] mx-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black tracking-tighter mb-4">The Nectar <span className="italic font-serif font-light text-amber-500">Profiles</span></h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">A Sensory Journey Through Kenya</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TastingCard 
              variety="Wild Acacia" 
              origin="Baringo Valley" 
              profile="Light, Floral, Silky" 
              intensity="Low"
              color="bg-yellow-200/30 text-yellow-700 dark:text-yellow-300"
            />
            <TastingCard 
              variety="Forest Multi-Floral" 
              origin="Mau Forest" 
              profile="Rich, Earthy, Woody" 
              intensity="Medium"
              color="bg-amber-200/30 text-amber-800 dark:text-amber-400"
            />
            <TastingCard 
              variety="Desert Blossom" 
              origin="Northern Kenya" 
              profile="Bold, Spicy, Toffee" 
              intensity="High"
              color="bg-orange-200/30 text-orange-800 dark:text-orange-400"
            />
          </div>

          {/* Sensory "Deep Dive" Card */}
          <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 flex flex-col lg:flex-row items-center gap-12 group">
             <div className="w-48 h-48 bg-amber-500 rounded-full flex items-center justify-center shrink-0 shadow-2xl shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <BeakerIcon className="w-20 h-20 text-white" />
             </div>
             <div>
                <h4 className="text-3xl font-black mb-4 italic font-serif">Understanding Crystallization</h4>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl font-medium">
                   Real honey is alive. Crystallization is a natural mark of quality—it proves our honey hasn't been overheated or pasteurized. Simply place your jar in warm water to return it to its liquid gold state.
                </p>
                <div className="mt-8 flex gap-6">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                      <ShieldCheckIcon className="w-4 h-4" /> Lab Tested
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600">
                      <SparklesIcon className="w-4 h-4" /> 100% Raw
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TimelineStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="relative">
      <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-amber-500 shadow-lg shadow-amber-500/40" />
      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 mb-1">{number}</p>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-slate-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

function TastingCard({ variety, origin, profile, intensity, color }: { variety: string, origin: string, profile: string, intensity: string, color: string }) {
  return (
    <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:shadow-2xl transition-all duration-500">
      <div className="flex justify-between items-start mb-10">
        <div className={`px-4 py-1.5 rounded-full ${color} text-[10px] font-black uppercase tracking-widest`}>
          {intensity} Intensity
        </div>
        <MapPinIcon className="w-5 h-5 text-slate-300" />
      </div>
      <h3 className="text-2xl font-black mb-1">{variety}</h3>
      <p className="text-xs font-bold text-amber-500 mb-6 italic font-serif">{origin}</p>
      <div className="h-px w-full bg-slate-100 dark:bg-slate-700 mb-6" />
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic">"Notes of {profile.toLowerCase()}"</p>
      <button className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
        Shop Variety <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}