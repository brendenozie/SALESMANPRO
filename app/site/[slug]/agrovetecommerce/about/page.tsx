"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  SunIcon, 
  BeakerIcon, 
  UserGroupIcon, 
  GlobeAmericasIcon 
} from '@heroicons/react/24/outline';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function AgrovetAboutPage() {
  return (
    <main className="bg-[#fcfdfc] dark:bg-[#050705] min-h-screen pt-28 pb-20 overflow-hidden">
      
      {/* 1. THE GROWTH HERO */}
      <section className="max-w-7xl mx-auto px-6 mb-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[2px] w-8 bg-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-700 dark:text-emerald-400">
                Rooted in Excellence
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-emerald-50 mb-8">
              Feeding the <br /> 
              <span className="text-emerald-600 italic">Future.</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-emerald-100/60 leading-relaxed max-w-lg mb-8 font-medium">
              We started with a single bag of seeds and a vision to empower every farmer. Today, we are Nairobi's trusted partner in agricultural innovation and veterinary care.
            </p>
            
            <div className="flex gap-4">
               <div className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-full text-sm">Our Legacy</div>
               <div className="px-6 py-3 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold rounded-full text-sm">View Labs</div>
            </div>
          </motion.div>

          {/* Image Composition: Organic Frame */}
          <div className="relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl z-10"
            >
              <Image 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80" 
                alt="Modern Farming" fill className="object-cover" loader={customLoader}
              />
            </motion.div>
            
            {/* Background Decorative "Leaf" shape */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl -z-0" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-lime-100 dark:bg-lime-900/20 rounded-full blur-3xl -z-0" />
          </div>
        </div>
      </section>

      {/* 2. CORE PILLARS: THE "FERTILE" GRID */}
      <section className="bg-emerald-50/50 dark:bg-emerald-950/10 py-24 border-y border-emerald-100 dark:border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <PillarItem 
              Icon={BeakerIcon} 
              title="Science-Led" 
              desc="Every fertilizer and feed is lab-tested for maximum yield performance." 
            />
            <PillarItem 
              Icon={UserGroupIcon} 
              title="Farmer First" 
              desc="On-the-ground support and consultation for local small-scale farmers." 
            />
            <PillarItem 
              Icon={SunIcon} 
              title="Sustainable" 
              desc="Committed to organic solutions that protect our soil for generations." 
            />
            <PillarItem 
              Icon={GlobeAmericasIcon} 
              title="Global Quality" 
              desc="Bringing world-class veterinary medicine to the heart of Kenya." 
            />
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS: THE "HARVEST" COUNTER */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-l border-emerald-100 dark:border-emerald-900/50 pl-12">
          <StatBox number="15k+" label="Farmers Supported" />
          <StatBox number="200+" label="Vet Clinics Supplied" />
          <StatBox number="100%" label="Quality Guaranteed" />
          <StatBox number="24/7" label="Expert Support" />
        </div>
      </section>
    </main>
  );
}

function PillarItem({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="space-y-4 group">
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-emerald-900/20 shadow-lg flex items-center justify-center text-emerald-600 transition-transform group-hover:-rotate-6">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-emerald-50">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-emerald-200/50 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-4xl md:text-5xl font-black tracking-tighter text-emerald-600">{number}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-emerald-800">{label}</div>
    </div>
  );
}