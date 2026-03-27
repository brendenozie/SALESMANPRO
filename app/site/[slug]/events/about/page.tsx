"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  BoltIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  TicketIcon,
  GlobeAltIcon,
  PlayIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function EventsAboutPage() {
  return (
    <main className="bg-stone-950 min-h-screen pt-32 pb-24 text-stone-100 overflow-hidden selection:bg-[#CCFF00] selection:text-black">
      
      {/* 1. HERO: THE MANIFESTO */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-3 mb-8">
              <BoltIcon className="w-6 h-6 text-[#CCFF00]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">The Culture Engine</span>
            </div>
            
            <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter leading-[0.75] mb-12 italic uppercase">
              We Own <br />
              <span className="text-transparent font-sans" style={{ WebkitTextStroke: '2px #CCFF00' }}>The Night.</span>
            </h1>
            
            <p className="text-xl text-stone-400 font-medium leading-relaxed max-w-lg mb-12">
              Based in the heart of Nairobi, we are the bridge between world-class organizers and a generation hungry for connection. We don't just sell tickets; we curate memories.
            </p>

            <div className="flex flex-wrap gap-12">
               <div>
                  <p className="text-5xl font-black mb-1">500K+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Tickets Scanned</p>
               </div>
               <div>
                  <p className="text-5xl font-black mb-1 text-[#CCFF00]">120+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Global Partners</p>
               </div>
            </div>
          </motion.div>

          <div className="relative group">
             {/* Large Immersive Visual */}
             <div className="relative aspect-square rounded-[4rem] overflow-hidden border-[16px] border-stone-900 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80" 
                  alt="Crowd Energy" 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                  loader={loader}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80" />
             </div>
             {/* Floating Video Preview Button */}
             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#CCFF00] rounded-full flex items-center justify-center shadow-2xl z-20"
             >
                <PlayIcon className="w-10 h-10 text-stone-950" />
             </motion.button>
          </div>
        </div>
      </section>

      {/* 2. THE CORE PILLARS: BRUTALIST GRID */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 border-t border-white/10">
          <PillarCard 
            icon={<TicketIcon />} 
            title="Instant Flow" 
            desc="Blockchain-backed ticketing. No fakes. No friction. Just entry." 
          />
          <PillarCard 
            icon={<UserGroupIcon />} 
            title="Community First" 
            desc="Built by event-goers, for event-goers. We prioritize the vibe." 
            accent 
          />
          <PillarCard 
            icon={<GlobeAltIcon />} 
            title="Nairobi Heart" 
            desc="Deeply rooted in the 254, scaling local talent to global stages." 
          />
        </div>
      </section>

      {/* 3. THE CALL TO ACTION: "THE VOID" */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-[#CCFF00] rounded-[5rem] py-24 px-12 text-center text-stone-950 relative overflow-hidden group">
           {/* Abstract Decorative Element */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-black/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
           
           <SparklesIcon className="w-16 h-16 mx-auto mb-10 text-stone-950" />
           <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-10 leading-[0.85]">
             Ready to <br /> Host Your <br /> Universe?
           </h2>
           <p className="text-stone-800 font-bold uppercase tracking-widest text-xs mb-12 max-w-sm mx-auto">
             Join 2,000+ organizers currently scaling their dreams on our platform.
           </p>
           
           <button className="px-16 py-8 bg-stone-950 text-white rounded-full font-black text-xs uppercase tracking-[0.5em] hover:bg-stone-800 transition-all shadow-2xl">
             Partner With Us
           </button>
        </div>
      </section>
    </main>
  );
}

function PillarCard({ icon, title, desc, accent }: { icon: any, title: string, desc: string, accent?: boolean }) {
  return (
    <div className={`p-16 border-b border-x border-white/5 transition-all duration-500 group ${accent ? 'bg-white/[0.02]' : 'hover:bg-white/[0.02]'}`}>
      <div className={`w-12 h-12 mb-10 flex items-center justify-center rounded-xl ${accent ? 'text-[#CCFF00]' : 'text-stone-500 group-hover:text-white'}`}>
        {React.cloneElement(icon, { className: "w-8 h-8" })}
      </div>
      <h3 className="text-3xl font-bold mb-6 tracking-tight uppercase italic">{title}</h3>
      <p className="text-stone-500 font-medium leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}