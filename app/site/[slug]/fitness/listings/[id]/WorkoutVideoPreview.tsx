"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, ClockIcon, BoltIcon, TrophyIcon, XMarkIcon } from '@heroicons/react/24/solid';

export function WorkoutVideoPreview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-20 px-6 lg:px-20 bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-4">Inside the Program</h2>
            <h3 className="text-4xl lg:text-5xl font-black dark:text-white uppercase italic tracking-tighter">
              The <span className="text-zinc-400">Kinetic</span> Session 01
            </h3>
          </div>
          <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest">Preview: 2:45 Mins</p>
        </header>

        {/* --- VIDEO THUMBNAIL --- */}
        <motion.div 
          whileHover={{ scale: 0.99 }}
          className="relative aspect-video rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl border border-zinc-100 dark:border-zinc-800"
          onClick={() => setIsOpen(true)}
        >
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1600" 
            alt="Workout Preview" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <PlayIcon className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Floating HUD Labels */}
          <div className="absolute bottom-10 left-10 flex gap-4">
            <div className="px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
              <ClockIcon className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">45m Intensity</span>
            </div>
            <div className="px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
              <BoltIcon className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Advanced</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- SIMPLE FULLSCREEN MODAL (LOGIC) --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 lg:p-20"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-10 right-10 text-white">
              <XMarkIcon className="w-10 h-10" />
            </button>
            <div className="w-full max-w-6xl aspect-video bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black text-2xl uppercase tracking-[0.5em]">
                Video Stream Loading...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}