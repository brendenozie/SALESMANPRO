"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  PlayIcon, 
  PlusIcon, 
  ShareIcon, 
  HandThumbUpIcon,
  TicketIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, PlayIcon as PlaySolid } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

export default function MediaEntertainmentView({ media, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#e11d48'; // Cinema Red
  const [isHovered, setIsHovered] = useState(false);

  // Mock Media Data
  const cast = [
    { name: 'Sarah J. Parker', role: 'Director', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    { name: 'Marcus Chen', role: 'Lead Actor', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Elena Rodriguez', role: 'Composer', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500/30 font-sans">
      
      {/* --- CINEMATIC IMMERSIVE HERO --- */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {/* Background Backdrop */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={media?.backdropUrl || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1600'}
            alt="Backdrop"
            fill
            className="object-cover brightness-[0.4] saturate-[0.8]"
            loader={loader}
            priority
          />
          {/* Edge Vignette & Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent" />
        </motion.div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-20 pb-20 max-w-[1800px] mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-8">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-[10px] font-black uppercase tracking-widest">
                4K Ultra HD
              </span>
              <div className="flex items-center gap-1.5 text-amber-500">
                <StarSolid className="w-4 h-4" />
                <span className="text-xs font-black text-white">9.2/10</span>
              </div>
              <span className="text-zinc-400 text-xs font-medium">2h 15m • Sci-Fi • 2026</span>
            </div>

            <h1 className="text-6xl lg:text-[120px] font-black tracking-tighter leading-[0.85] mb-10 italic uppercase">
              {media?.name || "The Neon Horizon"}
            </h1>

            <div className="flex flex-wrap items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="h-16 px-10 rounded-full text-white font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-3 shadow-2xl transition-all relative overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                <PlaySolid className="w-5 h-5" />
                Watch Trailer
              </motion.button>

              <button className="w-16 h-16 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <PlusIcon className="w-6 h-6" />
              </button>
              <button className="w-16 h-16 rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- MEDIA SPECS & STORY --- */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-20 py-24 grid lg:grid-cols-12 gap-20">
        
        {/* Left Column: Synopsis & Cast */}
        <div className="lg:col-span-8">
          <section className="mb-20">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-8">Synopsis</h2>
            <p className="text-2xl lg:text-3xl text-zinc-300 font-light leading-relaxed tracking-tight italic">
              "In a world where memories are traded as currency, one architect discovers a fragment of a past that shouldn't exist. Now, they must navigate the digital underground of Nairobi's future to uncover the truth."
            </p>
          </section>

          <section>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Principal Cast & Crew</h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white flex items-center gap-2">
                Full Credits <ChevronRightIcon className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {cast.map((person, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 border border-white/5">
                    <Image src={person.img} alt={person.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" loader={loader} />
                  </div>
                  <h4 className="font-bold text-lg mb-1">{person.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{person.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Experience Details */}
        <aside className="lg:col-span-4 h-fit lg:sticky lg:top-32">
          <div className="p-10 bg-zinc-900/50 rounded-[3rem] border border-white/5 backdrop-blur-xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-white mb-10 border-b border-white/10 pb-6">Technical Metadata</h3>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
                  <SpeakerWaveIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Audio Profile</p>
                  <p className="text-sm font-bold">Dolby Atmos • 7.1 Surround</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
                  <LanguageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Languages</p>
                  <p className="text-sm font-bold">English (Original), Swahili, French</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
                  <TicketIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Pricing Plan</p>
                  <p className="text-sm font-bold" style={{ color: primaryColor }}>KSh 950 / Rental</p>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <button className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl hover:bg-zinc-200 transition-all">
                Pre-Order Digital Copy
              </button>
              <button className="w-full h-16 rounded-2xl border border-white/20 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                <HandThumbUpIcon className="w-5 h-5" /> Like This
              </button>
            </div>
          </div>

          {/* Social Proof / Global Rank */}
          <div className="mt-8 p-8 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-between group overflow-hidden relative">
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Global Chart</p>
               <h5 className="text-3xl font-black italic">#1 Trending</h5>
             </div>
             <PlayIcon className="w-20 h-20 absolute -right-4 -bottom-4 opacity-20 group-hover:scale-125 transition-transform" />
          </div>
        </aside>
      </main>

      {/* --- FULLSCREEN IMAGE GALLERY --- */}
      <section className="px-6 lg:px-20 pb-32">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-12">Production Stills</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[1, 2, 3, 4].map((i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -10 }}
               className="relative aspect-video rounded-2xl overflow-hidden border border-white/10"
             >
               <Image src={`https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800`} alt="Still" fill className="object-cover" loader={loader}/>
             </motion.div>
           ))}
        </div>
      </section>
    </div>
  );
}