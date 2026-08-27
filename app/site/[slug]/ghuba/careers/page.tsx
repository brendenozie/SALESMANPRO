"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  RocketLaunchIcon, 
  UserGroupIcon, 
  SparklesIcon, 
  GlobeEuropeAfricaIcon,
  ArrowRightIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

// --- Animation Variants ---
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function GhubaCareersPage() {
  return (
    <main className="bg-white dark:bg-[#050505] min-h-screen pt-32 pb-24 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- 1. HERO: THE CALL TO ADVENTURE --- */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative text-center">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] rounded-full -z-10" />
        
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 mb-8">
            <RocketLaunchIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">We are Hiring</span>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85]">
            Build the future <br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 italic">
              of African Tech.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Join a remote-first team of dreamers, builders, and disruptors rewriting the rules of the marketplace from the heart of Nairobi to the world.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex justify-center gap-4">
            <button className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform active:scale-95 shadow-xl">
              View Openings
            </button>
            <button className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-full font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Our Culture
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* --- 2. THE PERKS: BENTO STYLE --- */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
          {/* Large Culture Card */}
          <div className="md:col-span-2 md:row-span-2 bg-slate-100 dark:bg-slate-900 rounded-[3rem] p-12 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <UserGroupIcon className="w-48 h-48" />
            </div>
            <h3 className="text-4xl font-bold mb-4 relative z-10">Radical <br/> Ownership</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs relative z-10">We don’t micromanage. You own your projects, your schedule, and your impact.</p>
          </div>

          <div className="bg-rose-50 dark:bg-rose-500/10 rounded-[3rem] p-8 flex flex-col justify-center items-center text-center">
             <GlobeEuropeAfricaIcon className="w-10 h-10 text-rose-500 mb-4" />
             <h4 className="font-bold text-xl">Remote First</h4>
             <p className="text-sm text-slate-500 mt-2">Work from anywhere in Africa.</p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-[3rem] p-8 flex flex-col justify-center items-center text-center">
             <SparklesIcon className="w-10 h-10 text-indigo-500 mb-4" />
             <h4 className="font-bold text-xl">Annual Retreats</h4>
             <p className="text-sm text-slate-500 mt-2">From Diani to the Mara.</p>
          </div>

          <div className="md:col-span-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-[3rem] p-10 flex items-center justify-between">
            <div>
                <h3 className="text-3xl font-bold mb-2">Competitive Pay</h3>
                <p className="opacity-70">Top-tier salaries & equity options.</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center">
                <BriefcaseIcon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. OPEN POSITIONS --- */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-end mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Open Roles</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">12 active openings</p>
        </div>

        <div className="space-y-4">
          <JobRow title="Senior Product Designer" category="Design" type="Remote" />
          <JobRow title="Backend Engineer (Go/Node)" category="Engineering" type="Remote" />
          <JobRow title="Growth Marketing Manager" category="Marketing" type="Hybrid (Nairobi)" />
          <JobRow title="Customer Success Lead" category="Operations" type="Remote" />
        </div>
      </section>
    </main>
  );
}

function JobRow({ title, category, type }: { title: string, category: string, type: string }) {
  return (
    <motion.div 
      whileHover={{ x: 10 }}
      className="p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-transparent flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
    >
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block">{category}</span>
        <h3 className="text-2xl font-bold group-hover:text-indigo-500 transition-colors">{title}</h3>
      </div>
      <div className="flex items-center gap-8 mt-4 md:mt-0">
        <span className="text-slate-400 font-medium">{type}</span>
        <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:border-transparent transition-all">
          <ArrowRightIcon className="w-5 h-5 group-hover:text-white dark:group-hover:text-black transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}