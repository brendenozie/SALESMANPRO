"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  BookOpenIcon, 
  HashtagIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpRightIcon,
  BookmarkSquareIcon
} from "@heroicons/react/24/outline";

const letterReveal = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


export default function BlogManifestoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Tech", "Culture", "Business", "Interviews"];
  const mockResults = [
    { title: "The Silicon Savanna Paradox", cat: "Tech", read: "12 min", date: "2026.03.12" },
    { title: "Nairobi's Neon Nights: Photo Essay", cat: "Culture", read: "5 min", date: "2026.03.08" },
    { title: "Scaling Beyond Borders", cat: "Business", read: "18 min", date: "2026.02.24" },
  ];

  return (
    <main className="bg-[#fffefc] min-h-screen pt-32 pb-24 text-stone-900 overflow-hidden">
      
      {/* 1. READING MANIFESTO (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={letterReveal}>
            <div className="flex items-center gap-3 mb-10">
              <span className="w-10 h-[1px] bg-stone-900" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-400">Our Editorial Ethos</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-light tracking-tighter leading-[0.8] mb-12">
              Slow <br /> 
              <span className="font-serif italic text-stone-400">Thoughts.</span>
            </h1>
            
            <div className="space-y-12 max-w-lg">
              <p className="text-2xl font-serif italic text-stone-500 leading-relaxed">
                "In an era of instant takes, we choose the long-form. We believe that clarity requires space, and wisdom requires time."
              </p>
              
              <div className="pt-12 border-t border-stone-100 flex gap-12">
                 <ManifestoStat label="Monthly Readers" value="45K+" />
                 <ManifestoStat label="Avg. Read Time" value="14min" />
              </div>
            </div>
          </motion.div>

          <div className="relative group">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000">
               <Image 
                 src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80" 
                 loader={loader}
                 alt="Library or Workspace" fill className="object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
               />
               <div className="absolute inset-0 border-[40px] border-white/10 group-hover:border-transparent transition-all duration-700" />
            </div>
            {/* The "Authenticity" Stamp */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-amber-400 rounded-full flex flex-col items-center justify-center p-6 text-center rotate-12 shadow-2xl border-2 border-white">
               <SparklesIcon className="w-8 h-8 mb-2" />
               <span className="text-[10px] font-black uppercase tracking-widest leading-none">Human <br /> Written</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONTENT EXPLORER (SEARCH & FILTER) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-stone-900 rounded-[3rem] p-8 md:p-20 text-white relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
          
          <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-10">
            <div>
              <h2 className="text-5xl font-light tracking-tighter mb-4">The <span className="font-serif italic text-amber-400">Archive</span> Explorer</h2>
              <p className="text-stone-400 text-sm max-w-sm uppercase tracking-widest font-bold">Search 1,200+ Articles Across 12 Domains</p>
            </div>
            
            <div className="relative w-full lg:w-[400px]">
               <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
               <input 
                 type="text" 
                 placeholder="Search keywords..." 
                 className="w-full bg-stone-800 border-none rounded-2xl py-6 pl-16 pr-6 text-white focus:ring-2 focus:ring-amber-400 transition-all font-serif italic text-lg"
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-16 border-b border-stone-800 pb-10">
            {filters.map((f) => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-amber-400 text-stone-900' : 'text-stone-500 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 gap-4">
             {mockResults.map((item, idx) => (
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 key={item.title} 
                 className="group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-2xl bg-stone-800/30 border border-white/5 hover:bg-stone-800 transition-all cursor-pointer"
               >
                 <div className="flex items-center gap-8">
                    <span className="text-xs font-mono text-stone-600">0{idx + 1}</span>
                    <div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">{item.cat}</p>
                       <h4 className="text-2xl font-light group-hover:italic group-hover:translate-x-2 transition-all">{item.title}</h4>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-12 mt-6 md:mt-0">
                    <div className="hidden lg:flex flex-col text-right">
                       <span className="text-[9px] font-bold text-stone-600 uppercase">Est. Read</span>
                       <span className="text-sm font-mono">{item.read}</span>
                    </div>
                    <div className="flex flex-col text-right">
                       <span className="text-[9px] font-bold text-stone-600 uppercase">Published</span>
                       <span className="text-sm font-mono">{item.date}</span>
                    </div>
                    <div className="w-12 h-12 rounded-full border border-stone-700 flex items-center justify-center group-hover:bg-white group-hover:text-stone-900 transition-all">
                       <ArrowUpRightIcon className="w-5 h-5" />
                    </div>
                 </div>
               </motion.div>
             ))}
          </div>
          
          <div className="mt-16 text-center">
             <button className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500 hover:text-amber-400 transition-colors">
               Load Older Archives +
             </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ManifestoStat({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</p>
      <p className="text-4xl font-light tracking-tighter text-stone-900 italic font-serif">{value}</p>
    </div>
  );
}