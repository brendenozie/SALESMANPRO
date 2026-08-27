"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  HeartIcon, 
  ShieldCheckIcon, 
  BeakerIcon, 
  GlobeAmericasIcon,
  SparklesIcon,
  PlayIcon,
  UserGroupIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.25, 1, 0.5, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function HealthcareAboutPage() {
  return (
    <main className="bg-[#F8FBFA] min-h-screen pt-32 pb-24 text-stone-900 overflow-hidden selection:bg-teal-600 selection:text-white">
      
      {/* 1. HERO: THE HUMAN MANIFESTO */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-[2px] bg-teal-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">Established 2026 • Nairobi</span>
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-bold tracking-tighter leading-[0.8] mb-12">
              Modern Care. <br />
              <span className="text-stone-300 italic font-serif">Human Heart.</span>
            </h1>
            
            <p className="text-xl text-stone-500 font-medium leading-relaxed max-w-lg mb-12">
              We aren't just a hospital network; we are a digital health ecosystem built to ensure no Kenyan is ever more than a click away from world-class medical expertise.
            </p>

            <div className="flex gap-16">
               <div>
                  <p className="text-5xl font-bold mb-1 text-teal-600">98%</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Patient Satisfaction</p>
               </div>
               <div>
                  <p className="text-5xl font-bold mb-1 text-rose-500">24/7</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Emergency Response</p>
               </div>
            </div>
          </motion.div>

          <div className="relative">
             {/* The "Healing Eye" Visual */}
             <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl rotate-2">
                <Image 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80" 
                  alt="Doctor with Patient" 
                  loader={loader}
                  fill 
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-teal-900/10 mix-blend-multiply" />
             </div>
             {/* Floating Trust Card */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[2rem] shadow-xl border border-stone-100 max-w-[240px]"
             >
                <ShieldCheckIcon className="w-10 h-10 text-teal-600 mb-4" />
                <p className="text-sm font-bold leading-tight">ISO 9001 Certified Quality Management</p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE PILLARS: THE ZEN GRID */}
      <section className="bg-white py-48 border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <PillarCard 
              icon={<BeakerIcon />} 
              title="Tech-Led" 
              desc="From AI diagnostics to remote monitoring, we use the future to heal today." 
            />
            <PillarCard 
              icon={<HeartIcon />} 
              title="Empathy-First" 
              desc="Every patient is a person, not a file. Our bedside manner extends to our UI." 
              active
            />
            <PillarCard 
              icon={<GlobeAmericasIcon />} 
              title="Locally Rooted" 
              desc="Designed for the unique challenges of the African healthcare landscape." 
            />
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE TIMELINE: THE JOURNEY */}
      <section className="max-w-5xl mx-auto px-6 py-48">
        <h2 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-stone-400 mb-20">Our Evolution</h2>
        <div className="space-y-32">
           <TimelineEntry 
             year="2024" 
             title="The Foundation" 
             desc="Launched our first digital-first clinic in Westlands, focusing on rapid diagnostics." 
           />
           <TimelineEntry 
             year="2025" 
             title="Expansion" 
             desc="Partnered with 50+ pharmacies to bring medicine delivery to every doorstep in Nairobi." 
             reverse
           />
           <TimelineEntry 
             year="2026" 
             title="The Future" 
             desc="Integrating AI-triage systems to reduce hospital wait times by 70%." 
           />
        </div>
      </section>

      {/* 4. THE CALL TO WELLNESS: THE SOFT VOID */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-teal-900 rounded-[5rem] py-24 px-12 text-center text-white relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10" />
           <SparklesIcon className="w-16 h-16 mx-auto mb-10 text-teal-400" />
           <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-10 leading-[0.85]">
             Ready to <br /> Feel Better?
           </h2>
           <div className="flex flex-col md:flex-row justify-center gap-6">
              <button className="px-12 py-6 bg-white text-teal-900 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-teal-400 hover:text-white transition-all shadow-2xl">
                Book a Consultation
              </button>
              <button className="px-12 py-6 bg-transparent border border-white/20 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                Find a Facility
              </button>
           </div>
        </div>
      </section>
    </main>
  );
}

/* --- HELPERS --- */

function PillarCard({ icon, title, desc, active }: any) {
  return (
    <div className="group">
      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${active ? 'bg-teal-600 text-white shadow-xl' : 'bg-stone-100 text-stone-400 group-hover:bg-teal-50'}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-3xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-stone-500 leading-relaxed text-sm italic">{desc}</p>
    </div>
  );
}

function TimelineEntry({ year, title, desc, reverse }: any) {
  return (
    <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
       <div className="flex-1 text-center md:text-right">
          <span className="text-7xl font-serif italic text-teal-600/20">{year}</span>
       </div>
       <div className="w-4 h-4 rounded-full bg-teal-600 shadow-[0_0_20px_rgba(20,184,166,0.5)] hidden md:block" />
       <div className="flex-1 text-center md:text-left">
          <h4 className="text-2xl font-bold mb-4 tracking-tight uppercase">{title}</h4>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">{desc}</p>
       </div>
    </div>
  );
}