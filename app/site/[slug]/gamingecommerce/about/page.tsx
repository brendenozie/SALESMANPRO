"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  CpuChipIcon, 
  BoltIcon, 
  RocketLaunchIcon, 
  WrenchScrewdriverIcon,
  CheckIcon,
  ServerIcon
} from "@heroicons/react/24/solid";

const glitchIn = {
  hidden: { opacity: 0, x: -20, filter: "brightness(2) blur(10px)" },
  visible: { opacity: 1, x: 0, filter: "brightness(1) blur(0px)", transition: { duration: 0.5 } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

export default function GamingExperiencePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [rig, setRig] = useState({ cpu: "", gpu: "", ram: "" });

  const steps = [
    { id: "cpu", label: "The Brain", options: ["Intel i9-14900K", "Ryzen 9 7950X3D"], icon: <CpuChipIcon className="w-5 h-5"/> },
    { id: "gpu", label: "The Muscle", options: ["RTX 4090", "RX 7900 XTX"], icon: <BoltIcon className="w-5 h-5"/> },
    { id: "ram", label: "The Reflex", options: ["32GB DDR5", "64GB DDR5"], icon: <ServerIcon className="w-5 h-5"/> },
  ];

  const handleSelect = (option: string) => {
    setRig({ ...rig, [steps[activeStep].id]: option });
    if (activeStep < steps.length - 1) setActiveStep(activeStep + 1);
  };

  return (
    <main className="bg-slate-950 min-h-screen pt-32 pb-24 text-white overflow-hidden relative">
      
      {/* 1. THE BATTLE STATION ABOUT SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-40 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" animate="visible" variants={glitchIn}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 mb-8 border border-cyan-500/20">
              <RocketLaunchIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Nairobi HQ — Established 2026</span>
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-10 uppercase italic">
              Built for <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #22d3ee' }}>Victory.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-lg mb-10">
              Gaming Duka isn't just a store; it's a sanctuary for the competitive. We don't just sell parts; we optimize your digital existence.
            </p>

            <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-10">
               <Stat label="Avg. FPS Gain" value="+40%" />
               <Stat label="Rig Uptime" value="99.9%" />
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)]"
            >
              <Image 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" 
                alt="Pro Battle Station" fill className="object-cover"
                loader={imageLoader}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
            </motion.div>
            
            {/* Floating Hardware Spec Label */}
            <div className="absolute -bottom-6 -left-6 bg-slate-900 border border-white/10 p-6 rounded-2xl backdrop-blur-xl group-hover:scale-110 transition-transform">
               <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">Build #092</p>
               <p className="text-sm font-bold text-white uppercase italic">"The Rift-Walker"</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE RIG BUILDER (Interactive RPG-Style UI) */}
      <section className="max-w-7xl mx-auto px-6 relative">
        <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 md:p-20 relative overflow-hidden backdrop-blur-sm">
          
          {/* Animated Background Pulse */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-8">Forge Your <span className="text-cyan-400">Weapon.</span></h2>
              
              {/* Progress Steps */}
              <div className="flex gap-4 mb-12">
                {steps.map((step, i) => (
                  <div key={step.id} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= activeStep ? 'bg-cyan-500' : 'bg-white/10'}`} />
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Step {activeStep + 1}: {steps[activeStep].label}</p>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 gap-4"
                  >
                    {steps[activeStep].options.map((opt) => (
                      <button 
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        className={`group p-8 rounded-2xl text-left transition-all border-2 flex items-center justify-between ${Object.values(rig).includes(opt) ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                      >
                        <span className="text-xl font-bold uppercase">{opt}</span>
                        <div className={`w-6 h-6 rounded-full border border-white/20 flex items-center justify-center transition-all ${Object.values(rig).includes(opt) ? 'bg-cyan-500 border-cyan-500' : ''}`}>
                          {Object.values(rig).includes(opt) && <CheckIcon className="w-4 h-4 text-slate-950" />}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Rig Preview Card */}
            <div className="w-full lg:w-[400px]">
               <div className="bg-slate-950/80 border border-white/10 p-10 rounded-[2.5rem] sticky top-32">
                  <h3 className="text-2xl font-black mb-8 uppercase italic flex items-center gap-3">
                    <WrenchScrewdriverIcon className="w-6 h-6 text-cyan-400" /> Specs
                  </h3>
                  
                  <ul className="space-y-6 mb-12">
                     <SelectedSpec label="CPU" value={rig.cpu} />
                     <SelectedSpec label="GPU" value={rig.gpu} />
                     <SelectedSpec label="RAM" value={rig.ram} />
                  </ul>

                  <button 
                    disabled={!rig.ram}
                    className={`w-full py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${rig.ram ? 'bg-cyan-500 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:scale-105' : 'bg-white/5 text-slate-500'}`}
                  >
                    {rig.ram ? 'Deploy Build' : 'Locked'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <p className="text-4xl font-black italic text-cyan-400 mb-1">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  );
}

function SelectedSpec({ label, value }: { label: string, value: string }) {
  return (
    <li className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${value ? 'text-white' : 'text-slate-800'}`}>{value || "Awaiting Selection..."}</span>
    </li>
  );
}