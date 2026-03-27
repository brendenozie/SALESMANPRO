"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { 
  PlayIcon, 
  SparklesIcon, 
  BoltIcon, 
  GlobeAltIcon,
  VideoCameraIcon,
  MicrophoneIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function MediaAboutPage() {
  const { scrollYProgress } = useScroll();
  const xTranslate = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <main className="bg-white dark:bg-stone-950 min-h-screen pt-32 pb-24 text-stone-900 dark:text-stone-100 overflow-hidden selection:bg-red-600 selection:text-white">
      
      {/* 1. HERO: THE KINETIC MANIFESTO */}
      <section className="max-w-7xl mx-auto px-6 mb-48 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-[2px] bg-red-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-600 animate-pulse">On Air / 2026</span>
            </div>
            
            <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter leading-[0.75] mb-12 italic uppercase">
              The Stage <br />
              <span className="text-transparent font-sans" style={{ WebkitTextStroke: '2px currentColor' }}>Is Yours.</span>
            </h1>
            
            <p className="text-xl text-stone-500 dark:text-stone-400 font-medium leading-relaxed max-w-lg mb-12">
              Born in Nairobi, we are the digital stage for the next generation of African storytellers. We don't just host content; we amplify the voices that define the continent.
            </p>

            <div className="flex flex-wrap gap-12">
               <div className="p-8 bg-stone-100 dark:bg-white/5 rounded-3xl border border-stone-200 dark:border-white/10">
                  <p className="text-4xl font-black mb-1">12M+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Monthly Streams</p>
               </div>
               <div className="p-8 bg-stone-100 dark:bg-white/5 rounded-3xl border border-stone-200 dark:border-white/10">
                  <p className="text-4xl font-black mb-1 text-red-600">5K+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Verified Creators</p>
               </div>
            </div>
          </motion.div>

          <div className="relative group">
             {/* The "Master View" Image */}
             <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[16px] border-stone-100 dark:border-stone-900 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80" 
                  alt="Recording Studio" 
                  fill 
                  className="object-cover transition-all duration-[2s] group-hover:scale-110 group-hover:rotate-2"
                  loader={loader}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             
             {/* Floating Play Button */}
             <motion.button 
               whileHover={{ scale: 1.1, rotate: 12 }}
               className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600 rounded-full flex items-center justify-center shadow-2xl z-20 text-white"
             >
                <PlayIcon className="w-16 h-16" />
             </motion.button>
          </div>
        </div>
      </section>

      {/* 2. RUNNING TEXT DECORATION */}
      <div className="w-full overflow-hidden py-20 whitespace-nowrap bg-stone-950 text-white flex items-center">
         <motion.h2 
           style={{ x: xTranslate }}
           className="text-[12rem] font-black uppercase tracking-tighter italic leading-none opacity-20"
         >
           Amplifying • Africa • Digitally • Disrupting • 254 • Culture •
         </motion.h2>
      </div>

      {/* 3. THE ECOSYSTEM: STUDIO PILLARS */}
      <section className="max-w-7xl mx-auto px-6 py-48">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border-t border-stone-200 dark:border-white/10">
          <StudioCard 
            icon={<VideoCameraIcon />} 
            title="Cinema" 
            desc="Curating the boldest indie films and high-budget epics from across the 54 nations." 
          />
          <StudioCard 
            icon={<MicrophoneIcon />} 
            title="Audio" 
            desc="From Gengetone to Amapiano—we provide the bandwidth for the sound of the streets." 
            active 
          />
          <StudioCard 
            icon={<GlobeAltIcon />} 
            title="Global" 
            desc="Bridging the gap between local talent and international distribution networks." 
          />
        </div>
      </section>

      {/* 4. THE CALL TO ACTION: THE "RED ROOM" */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-red-600 rounded-[5rem] py-32 px-12 text-center text-white relative overflow-hidden group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
           <SparklesIcon className="w-20 h-20 mx-auto mb-12 text-white animate-bounce" />
           <h2 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter mb-12 leading-[0.8]">
             Your Legend <br /> Starts Now.
           </h2>
           <div className="flex flex-col md:flex-row justify-center gap-6">
              <button className="px-16 py-8 bg-stone-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-red-600 transition-all shadow-2xl">
                Start Creating
              </button>
              <button className="px-16 py-8 bg-transparent border-2 border-white/30 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                Partner with us
              </button>
           </div>
        </div>
      </section>
    </main>
  );
}

function StudioCard({ icon, title, desc, active }: any) {
  return (
    <div className={`p-16 border-b border-x border-stone-200 dark:border-white/5 transition-all duration-500 group ${active ? 'bg-red-600/5 dark:bg-white/[0.02]' : 'hover:bg-stone-50 dark:hover:bg-white/[0.01]'}`}>
      <div className={`w-14 h-14 mb-10 flex items-center justify-center rounded-2xl ${active ? 'bg-red-600 text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-500 group-hover:text-red-600 transition-colors'}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-3xl font-black mb-6 tracking-tight uppercase italic">{title}</h3>
      <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}