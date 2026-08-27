"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  SparklesIcon, 
  PaintBrushIcon, 
  GlobeEuropeAfricaIcon,
  UserGroupIcon 
} from "@heroicons/react/24/outline";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } }
};

const customLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function FashionAboutPage() {
  return (
    <main className="bg-[#fcfcfc] dark:bg-[#080808] min-h-screen pt-32 pb-24 text-slate-900 dark:text-white">
      
      {/* 1. EDITORIAL HERO: OVERLAPPING ELEMENTS */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 z-10">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.span variants={fadeInUp} className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-600 block mb-6">
                Our Philosophy
              </motion.span>
              <motion.h1 variants={fadeInUp} className="text-7xl md:text-9xl font-light tracking-tighter leading-[0.85] mb-8">
                The Art of <br />
                <span className="font-serif italic text-slate-400">Dressing.</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed max-w-md">
                We believe that style is a silent language. Founded in Nairobi, our mission is to curate pieces that speak volumes without saying a word.
              </motion.p>
            </motion.div>
          </div>

          <div className="lg:col-span-7 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative aspect-[4/5] w-full max-w-lg ml-auto overflow-hidden shadow-2xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" 
                alt="Fashion Editorial" fill className="object-cover" loader={customLoader}
              />
              <div className="absolute inset-0 border-[20px] border-white/10 backdrop-blur-[2px]" />
            </motion.div>
            
            {/* Floating "Badge" Element */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-900 p-8 shadow-xl hidden md:block"
            >
              <p className="text-4xl font-serif italic text-indigo-600">Est. 2026</p>
              <p className="text-[10px] font-bold tracking-widest uppercase mt-2">Global Boutique</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUES: BENTO GLASS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100 dark:border-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ValueCard 
            Icon={SparklesIcon} 
            title="Quality First" 
            desc="Sourced from the finest textiles, ensuring every garment lasts a lifetime."
          />
          <ValueCard 
            Icon={GlobeEuropeAfricaIcon} 
            title="Ethical Trace" 
            desc="From Nairobi to the world, we ensure fair wages and sustainable production."
          />
          <ValueCard 
            Icon={UserGroupIcon} 
            title="Inclusivity" 
            desc="Fashion is for everyone. We celebrate all silhouettes and identities."
          />
        </div>
      </section>

      {/* 3. THE "MANIFESTO" OVERLAY */}
      <section className="relative h-[600px] mt-24 flex items-center justify-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=80" 
          alt="Background" fill className="object-cover brightness-50 grayscale" loader={customLoader}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-serif italic text-white leading-tight"
          >
            "Fashion fades, only style remains the same."
          </motion.h2>
          <div className="mt-8 h-px w-24 bg-white/50 mx-auto" />
          <p className="mt-8 text-white/70 uppercase tracking-[0.4em] text-xs font-bold">The Avenue Manifesto</p>
        </div>
      </section>
    </main>
  );
}

function ValueCard({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-10 bg-white dark:bg-[#0f0f0f] border border-slate-100 dark:border-gray-800 rounded-sm shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="w-12 h-12 mb-8 border-b-2 border-indigo-600 flex items-center">
        <Icon className="w-6 h-6 text-slate-900 dark:text-white" />
      </div>
      <h3 className="text-xl font-light uppercase tracking-tighter mb-4">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed italic">{desc}</p>
    </motion.div>
  );
}