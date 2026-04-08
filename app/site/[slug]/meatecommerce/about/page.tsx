'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  SparklesIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function TuyiaAboutPage() {
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen pt-32 pb-20 overflow-hidden font-sans">
      
      {/* 1. THE HERITAGE HERO */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <motion.div 
            className="lg:col-span-7"
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="h-[1px] w-12 bg-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">
                The Tuyia Legacy
              </span>
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter leading-[0.8] mb-12 uppercase">
              The Art of <br /> 
              <span className="text-transparent italic font-serif font-light" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>Modern</span> Butchery.
            </h1>
            
            <p className="text-xl text-stone-400 leading-snug max-w-xl mb-12 font-medium">
              Tuyia Farm wasn’t built on shortcuts. It was built on the Laikipia plains, 
              defined by the patient cycle of nature and the precision of master craftsmen. 
              We don’t just supply meat; we preserve a standard.
            </p>
            
            <div className="flex items-center gap-8">
               <button className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-amber-500 transition-colors">
                 Our Philosophy
               </button>
               <div className="flex flex-col">
                 <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Est. 2026</span>
                 <span className="text-stone-500 text-[10px] font-bold uppercase">Nairobi, Kenya</span>
               </div>
            </div>
          </motion.div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2 }}
              className="relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/10 group"
            >
              <Image 
                src="https://images.unsplash.com/photo-1602484281540-0239366fbd81?auto=format&fit=crop&w=1200&q=80" 
                alt="Tuyia Craft" 
                fill 
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                loader={customLoader}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </motion.div>
            
            {/* Floating Detail Card */}
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="absolute -bottom-10 -left-10 bg-stone-900 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl max-w-[240px]"
            >
              <SparklesIcon className="w-8 h-8 text-amber-500 mb-4" />
              <p className="text-xs font-bold leading-relaxed text-stone-300 uppercase tracking-tight">
                "Every cut tells a story of the soil, the grass, and the hands that prepared it."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CORE PILLARS: THE CRAFT GRID */}
      <section className="py-32 border-y border-white/5 bg-[#0e0e0e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <PillarItem 
              Icon={ShieldCheckIcon} 
              title="Traceability" 
              desc="Full visibility from our Laikipia pastures to your doorstep. Every cut is QR-verified." 
            />
            <PillarItem 
              Icon={UserGroupIcon} 
              title="Community" 
              desc="Supporting local herdsmen through fair-trade practices and sustainable grazing education." 
            />
            <PillarItem 
              Icon={ClockIcon} 
              title="Patient Aging" 
              desc="Our Himalayan salt cellar allows cuts to develop deep, nutty flavors over 28 days." 
            />
            <PillarItem 
              Icon={SparklesIcon} 
              title="Gold Standard" 
              desc="Only top-tier Angus and Heritage breeds make the Tuyia Reserve selection." 
            />
          </div>
        </div>
      </section>

      {/* 3. IMPACT STATS: THE "RESERVE" COUNTER */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-6">Quantifying Our <br /><span className="text-amber-500">Obsession.</span></h2>
            <p className="text-stone-500 text-sm font-medium">We don't measure success by volume, but by the precision of our yield and the satisfaction of Kenya's top chefs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <StatBox number="28" label="Days Dry Aged" />
            <StatBox number="100%" label="Pasture Raised" />
            <StatBox number="0" label="Antibiotics Used" />
          </div>
        </div>
      </section>
    </main>
  );
}

function PillarItem({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="bg-[#0a0a0a] p-12 space-y-6 hover:bg-stone-900/50 transition-colors group">
      <div className="w-12 h-12 flex items-center justify-center text-amber-500 border border-amber-500/20 rounded-full group-hover:bg-amber-500 group-hover:text-black transition-all">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tighter">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function StatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-6xl font-black tracking-tighter text-white tabular-nums italic">{number}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">{label}</div>
    </div>
  );
}