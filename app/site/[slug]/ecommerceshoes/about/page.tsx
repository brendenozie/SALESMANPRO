"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  BoltIcon, 
  GlobeAltIcon, 
  RocketLaunchIcon, 
  HeartIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";
import { custom } from "zod";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function AboutPage() {
  return (
    <main className="bg-white dark:bg-[#050505] min-h-screen pt-20 overflow-hidden">
      
      {/* 1. HERO SECTION: MASSIVE TYPOGRAPHY */}
      <section className="relative h-[80vh] flex items-center justify-center px-6">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black italic uppercase tracking-tighter leading-none text-slate-200 dark:text-indigo-900/30 select-none">
            LEGACY
          </div>
        </div>
        
        <div className="relative z-10 text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.4em] skew-x-[-12deg]"
          >
            Since 2024
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] text-slate-900 dark:text-white"
          >
            More Than <br /> 
            <span className="text-transparent border-text dark:text-indigo-500">Just Shoes.</span>
          </motion.h1>
        </div>
      </section>

      {/* 2. THE STORY: BENTO GRID LAYOUT */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
          
          {/* Main Story Image */}
          <motion.div 
            variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-slate-100 group"
          >
            <Image 
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80" 
              alt="Craftsmanship" fill className="object-cover transition-transform duration-1000 group-hover:scale-110"
              loader={customLoader}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-12 flex flex-col justify-end">
              <h2 className="text-4xl font-black italic uppercase text-white mb-4">The Craft</h2>
              <p className="max-w-md text-white/70 text-lg leading-relaxed">
                We started with a simple obsession: engineering the perfect silhouette for every stride. Every stitch is a commitment to performance.
              </p>
            </div>
          </motion.div>

          {/* Stats / Icon Box */}
          <motion.div 
            variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="md:col-span-4 bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between"
          >
            <BoltIcon className="w-16 h-16 opacity-50" />
            <div className="space-y-2">
              <div className="text-6xl font-black italic uppercase tracking-tighter">100k+</div>
              <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs">Athletes Empowered</p>
            </div>
          </motion.div>

          {/* Secondary Text Box */}
          <motion.div 
            variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="md:col-span-4 border-2 border-slate-100 dark:border-gray-800 rounded-[2.5rem] p-10 flex flex-col justify-center gap-6"
          >
            <h3 className="text-2xl font-black italic uppercase text-slate-900 dark:text-white leading-tight">Driven by <span className="text-indigo-600">Culture</span></h3>
            <p className="text-slate-500 dark:text-gray-400">
              We don't just sell footwear; we fuel the community that defines street culture and athletic excellence.
            </p>
          </motion.div>

          {/* Action Image */}
          <motion.div 
            variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="md:col-span-8 relative rounded-[2.5rem] overflow-hidden bg-slate-900 group"
          >
             <Image 
              src="https://images.unsplash.com/photo-1514444984083-08018ba2435e?auto=format&fit=crop&w=1200&q=80" 
              alt="Street Culture" fill className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
              loader={customLoader}
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center">
                 <RocketLaunchIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-bounce" />
                 <span className="text-2xl font-black italic uppercase text-white tracking-widest">Global Reach.</span>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. CORE VALUES: HORIZONTAL SCROLL FEEL */}
      <section className="bg-slate-50 dark:bg-gray-900/50 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none mb-6">
                Our Core <br /> <span className="text-indigo-600">Vibrations</span>
              </h2>
              <div className="h-1.5 w-24 bg-indigo-600 skew-x-[-12deg]" />
            </div>
            
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-12">
              <ValueItem 
                Icon={GlobeAltIcon} 
                title="Sustainability" 
                desc="Recycled materials, zero-waste packaging, and carbon-neutral shipping." 
              />
              <ValueItem 
                Icon={HeartIcon} 
                title="Community" 
                desc="Supporting local athletes and street artists across Nairobi and beyond." 
              />
              <ValueItem 
                Icon={ShieldCheckIcon} 
                title="Innovation" 
                desc="Smart-tracking tech integrated into every pro-line performance shoe." 
              />
              <ValueItem 
                Icon={RocketLaunchIcon} 
                title="Speed" 
                desc="We don't wait for trends. We set the pace for the digital commerce era." 
              />
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .border-text {
          -webkit-text-stroke: 1.5px #1e1b4b;
        }
        .dark .border-text {
          -webkit-text-stroke: 1.5px #6366f1;
        }
      `}</style>
    </main>
  );
}

function ValueItem({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="group space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-indigo-600 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-xl font-black italic uppercase text-slate-900 dark:text-white">{title}</h4>
      <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}