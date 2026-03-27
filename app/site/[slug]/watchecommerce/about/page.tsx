"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  WrenchScrewdriverIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  LifebuoyIcon,
  VariableIcon
} from "@heroicons/react/24/outline";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } }
};


const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


export default function WatchCraftsmanshipPage() {
  return (
    <main className="bg-slate-950 min-h-screen pt-32 pb-24 text-white overflow-hidden">
      
      {/* 1. THE CRAFTSMANSHIP HERO */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Since 2026</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-light tracking-tighter leading-[0.85] mb-10 uppercase">
              Precision <br />
              <span className="italic font-serif text-amber-500">Redefined.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
              Watch Duka is Nairobi’s home for horological excellence. We believe a watch isn’t just a tool for time; it’s a legacy on your wrist.
            </p>

            <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
               <div>
                  <p className="text-3xl font-light mb-1 italic">0.02mm</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Tolerance Level</p>
               </div>
               <div>
                  <p className="text-3xl font-light mb-1 italic">180+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Micro-Components</p>
               </div>
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 border border-white/10 shadow-2xl"
            >
              <Image 
                src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=1200&q=80" 
                alt="Watch Internals" fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s]"
                loader={imageLoader}
              />
            </motion.div>
            
            {/* Floating Detail Label */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-white/10 p-6 rounded-xl backdrop-blur-xl">
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Technical Insight</p>
               <p className="text-sm font-medium text-white italic">"Tourbillon Alignment"</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WATCH CARE GUIDE SECTION */}
      <section className="bg-white text-slate-950 py-32 rounded-[4rem] mx-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-light tracking-tighter uppercase mb-6">The Care <span className="italic font-serif">Guide</span></h2>
            <p className="text-slate-500 font-medium max-w-lg mx-auto italic">Maintenance is the heart of longevity. Follow our master watchmakers' advice to keep your timepiece ticking forever.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <CareItem 
              Icon={VariableIcon} 
              title="Magnetic Shielding" 
              desc="Avoid placing your watch near smartphones or speakers. Magnets can disrupt the hairspring’s rhythm." 
            />
            <CareItem 
              Icon={LifebuoyIcon} 
              title="Salt & Water" 
              desc="Always rinse with fresh water after a swim in the ocean. Salt is the enemy of fine gaskets." 
            />
            <CareItem 
              Icon={ClockIcon} 
              title="The 4-Year Rule" 
              desc="Mechanical movements require a full service every 4 years to replace oils and verify seals." 
            />
          </div>

          {/* Quick Care "Bento" */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-slate-50 p-10 rounded-3xl flex items-start gap-8">
                <WrenchScrewdriverIcon className="w-12 h-12 text-slate-400 shrink-0" />
                <div>
                  <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">Winding Wisdom</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">Never wind your watch while wearing it. The angle can bend the winding stem. Always remove it from your wrist first.</p>
                </div>
             </div>
             <div className="bg-slate-900 p-10 rounded-3xl flex items-start gap-8 text-white">
                <ShieldCheckIcon className="w-12 h-12 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">Storage Secrets</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">Store in a cool, dry place. Nairobi's humidity can vary—use a watch box to maintain a consistent environment.</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. THE PHILOSOPHY SECTION */}
      <section className="py-40 text-center max-w-4xl mx-auto px-6">
         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="space-y-10"
         >
           <h3 className="text-4xl md:text-6xl font-light leading-tight italic font-serif">
             "We don't sell watches. We curate the moments you spend wearing them."
           </h3>
           <div className="h-px w-24 bg-amber-500 mx-auto" />
           <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-500">Brenden Odhiambo — Founder</p>
         </motion.div>
      </section>
    </main>
  );
}

function CareItem({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="group">
      <div className="w-14 h-14 rounded-full border border-slate-200 flex items-center justify-center mb-8 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-2xl font-light uppercase mb-4 tracking-tighter">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed text-sm">{desc}</p>
    </div>
  );
}