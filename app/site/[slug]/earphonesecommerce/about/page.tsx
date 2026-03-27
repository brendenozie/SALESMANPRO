"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  SpeakerWaveIcon, 
  CpuChipIcon, 
  BoltIcon, 
  MusicalNoteIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon
} from "@heroicons/react/24/solid";

const pulseEffect = {
  initial: { scale: 1, opacity: 0.5 },
  animate: { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5], transition: { duration: 2, repeat: Infinity } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

export default function EarphonesTechPage() {
  const [testActive, setTestActive] = useState(false);
  const [latencyValue, setLatencyValue] = useState(0);

  // Simulated Latency Test
  useEffect(() => {
    let interval: any;
    if (testActive) {
      interval = setInterval(() => {
        setLatencyValue(Math.floor(Math.random() * (45 - 38) + 38));
      }, 100);
    } else {
      setLatencyValue(0);
    }
    return () => clearInterval(interval);
  }, [testActive]);

  return (
    <main className="bg-black text-white min-h-screen pt-32 pb-24 overflow-hidden">
      
      {/* 1. THE SOUND SIGNATURE "ABOUT" SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
              <MusicalNoteIcon className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Studio Grade Audio</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 uppercase italic">
              The Physics <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Of Feeling.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-12">
              At Earphones Duka, we don't just sell drivers. We tune experiences. Our signature sound profile is balanced in Nairobi's most precise acoustic chambers, ensuring deep sub-bass that doesn't muddy the crisp highs.
            </p>

            <div className="space-y-8">
               <TechSpec title="Beryllium Drivers" value="11mm Ultra-Rigid" />
               <TechSpec title="Frequency Response" value="5Hz - 40kHz" />
               <TechSpec title="Audio Codecs" value="LDAC, aptX Adaptive, AAC" />
            </div>
          </motion.div>

          <div className="relative">
             <motion.div 
               variants={pulseEffect}
               initial="initial"
               animate="animate"
               className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl -z-10"
             />
             <div className="relative aspect-square rounded-[3rem] border border-white/10 bg-gradient-to-br from-slate-900 to-black p-12 overflow-hidden group">
                {/* Oscilloscope Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 400 400">
                    <motion.path 
                      d="M0 200 Q 100 100 200 200 T 400 200" 
                      fill="transparent" 
                      stroke="#60a5fa" 
                      strokeWidth="2"
                      animate={{ d: ["M0 200 Q 100 50 200 200 T 400 200", "M0 200 Q 100 350 200 200 T 400 200", "M0 200 Q 100 50 200 200 T 400 200"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </svg>
                </div>
                <Image 
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80" 
                  alt="Earphone internals" fill className="object-cover opacity-60 mix-blend-screen group-hover:scale-110 transition-transform duration-[5s]" 
                  loader={imageLoader}
                />
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE LATENCY LAB (Interactive Tool) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] p-10 md:p-24 border border-white/5 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            
            <div className="flex-1">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8">
                The <span className="text-blue-400">Latency</span> Lab.
              </h2>
              <p className="text-slate-400 mb-12 text-lg leading-relaxed">
                Experience the speed of our **Pro-Sync** technology. Compare our hyper-low 40ms response time against standard Bluetooth audio.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <LatencyCard title="Standard Bluetooth" value="250ms" status="Laggy" color="bg-rose-500" />
                 <LatencyCard title="Duka Pro-Sync" value={`${latencyValue || 40}ms`} status="Instant" color="bg-blue-500" highlight />
              </div>
            </div>

            <div className="w-full lg:w-[400px] flex flex-col items-center">
               <div className="relative w-64 h-64 bg-black rounded-full border-4 border-white/5 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.15)]">
                  <AnimatePresence mode="wait">
                    {!testActive ? (
                      <motion.button
                        key="start"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setTestActive(true)}
                        className="w-32 h-32 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center shadow-lg"
                      >
                        <PlayIcon className="w-12 h-12" />
                      </motion.button>
                    ) : (
                      <motion.button
                        key="stop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={() => setTestActive(false)}
                        className="w-32 h-32 rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center"
                      >
                        <StopIcon className="w-12 h-12" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                  
                  {/* Rotating HUD Ring */}
                  {testActive && (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-10px] border-t-2 border-blue-500 rounded-full"
                    />
                  )}
               </div>
               <p className="mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                 {testActive ? "Syncing Signal..." : "Run Latency Diagnostic"}
               </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

function TechSpec({ title, value }: { title: string, value: string }) {
  return (
    <div className="flex items-center gap-6 group">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{title}</p>
        <p className="text-xl font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function LatencyCard({ title, value, status, color, highlight }: any) {
  return (
    <div className={`p-8 rounded-3xl border ${highlight ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/5 bg-white/5'}`}>
       <div className="flex justify-between items-start mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</p>
          <div className={`w-2 h-2 rounded-full ${color}`} />
       </div>
       <p className={`text-4xl font-black italic mb-2 ${highlight ? 'text-white' : 'text-slate-600'}`}>{value}</p>
       <div className="flex items-center gap-2">
          {highlight && <CheckCircleIcon className="w-4 h-4 text-blue-500" />}
          <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-blue-500' : 'text-slate-500'}`}>{status}</p>
       </div>
    </div>
  );
}