"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BoltIcon, UserIcon, FireIcon,
  BeakerIcon, 
  HashtagIcon, 
  FingerPrintIcon, 
  RectangleGroupIcon,
  VariableIcon
} from "@heroicons/react/24/solid";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function WorkoutConfiguratorAbout() {
  return (
    <main className="bg-black min-h-screen pt-32 pb-24 text-white overflow-hidden selection:bg-[#DFFF00] selection:text-black">
      
      {/* 1. HERO: THE HUMAN BLUEPRINT */}
      <section className="max-w-7xl mx-auto px-6 mb-48 relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#DFFF00]/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-[2px] bg-[#DFFF00]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#DFFF00]">System Protocol v4.0</span>
            </div>
            
            <h1 className="text-8xl md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.75] mb-12">
              Forge <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #fff' }}>The Machine.</span>
            </h1>
            
            <p className="text-xl text-stone-400 font-medium leading-relaxed max-w-lg mb-12 uppercase italic">
              Generic programs are for generic results. Our configurator uses physiological data to draft your path to peak performance.
            </p>

            <div className="grid grid-cols-2 gap-12 border-t border-white/10 pt-12">
               <div>
                  <p className="text-5xl font-black mb-1">500+</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Biometric Variables</p>
               </div>
               <div>
                  <p className="text-5xl font-black mb-1 text-[#DFFF00]">1:1</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Program Accuracy</p>
               </div>
            </div>
          </motion.div>

          <div className="relative">
             {/* The "Scanner" Visual */}
             <div className="relative aspect-[3/4] rounded-3xl border border-white/10 bg-stone-900/20 backdrop-blur-3xl overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                
                {/* Scanning Line Animation */}
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-1 bg-[#DFFF00] shadow-[0_0_20px_#DFFF00] z-20"
                />

                <img 
                  src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80" 
                  alt="Athlete Anatomy" 
                  className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-100 transition-opacity duration-700"
                />
             </div>
          </div>
        </div>
      </section>

      {/* 2. THE THREE PILLARS OF FORGING */}
      <section className="max-w-7xl mx-auto px-6 py-48 border-y border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <ModuleCard 
            icon={<FingerPrintIcon />} 
            title="Biometric ID" 
            desc="We analyze your unique leverage points and muscle insertions to prevent injury and maximize force." 
          />
          <ModuleCard 
            icon={<VariableIcon />} 
            title="Neural Adaptation" 
            desc="Workouts synced to your central nervous system recovery, ensuring you never hit a plateau." 
            active
          />
          <ModuleCard 
            icon={<RectangleGroupIcon />} 
            title="Macro-Scaling" 
            desc="Nutrition that evolves alongside your lifting intensity—real-time fuel for real-time gains." 
          />
        </div>
      </section>

      <FitnessCalculator />
      
    </main>
  );
}

function ModuleCard({ icon, title, desc, active }: any) {
  return (
    <div className="group text-center flex flex-col items-center">
      <div className={`w-20 h-20 rounded-full mb-10 flex items-center justify-center transition-all ${active ? 'bg-[#DFFF00] text-black shadow-[0_0_50px_rgba(223,255,0,0.4)]' : 'bg-stone-900 text-stone-600 group-hover:bg-white group-hover:text-black'}`}>
        {React.cloneElement(icon, { className: "w-10 h-10" })}
      </div>
      <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-6">{title}</h3>
      <p className="text-stone-500 text-sm leading-relaxed max-w-xs">{desc}</p>
    </div>
  );
}

function FitnessCalculator() {
  const [weight, setWeight] = useState<number>(100);
  const [reps, setReps] = useState<number>(5);
  const [view, setView] = useState<"1RM" | "BF">("1RM");

  // Epley Formula for 1RM
  const oneRepMax = weight * (1 + reps / 30);
  
  return (
    <section className="bg-black py-32 overflow-hidden">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="bg-stone-900/50 rounded-[4rem] p-12 lg:p-20 border border-white/5 relative shadow-2xl">
          
          <div className="flex justify-center gap-4 mb-20">
             {["1RM", "BF"].map((v) => (
               <button
                 key={v}
                 onClick={() => setView(v as any)}
                 className={`px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all ${view === v ? 'bg-[#DFFF00] text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
               >
                 {v === "1RM" ? "Strength Potential" : "Composition"}
               </button>
             ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-24 relative z-10 items-center">
            {/* Input Dashboard */}
            <div className="flex-1 w-full">
              <div className="space-y-16">
                <div>
                  <div className="flex justify-between mb-8">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Lift Weight (KG)</label>
                    <span className="text-[#DFFF00] font-mono font-bold text-2xl">{weight}</span>
                  </div>
                  <input 
                    type="range" min="20" max="400" step="2.5"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full h-1 bg-stone-800 rounded-full appearance-none accent-[#DFFF00] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-8">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500">Reps Executed</label>
                    <span className="text-white font-mono font-bold text-2xl">{reps}</span>
                  </div>
                  <input 
                    type="range" min="1" max="15" step="1"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="w-full h-1 bg-stone-800 rounded-full appearance-none accent-white cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Result Circle */}
            <div className="flex-1 flex justify-center w-full">
               <div className="relative w-80 h-80 rounded-full border-[12px] border-white/5 flex items-center justify-center group">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-[12px] border-[#DFFF00] -m-[12px] z-10"
                  />
                  
                  <div className="text-center">
                     <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500 mb-4">Estimated 1RM</p>
                     <motion.h4 
                       key={oneRepMax}
                       initial={{ scale: 1.2, color: "#DFFF00" }}
                       animate={{ scale: 1, color: "#fff" }}
                       className="text-8xl font-black italic tracking-tighter"
                     >
                       {Math.round(oneRepMax)}
                     </motion.h4>
                     <p className="text-sm font-bold text-[#DFFF00] uppercase tracking-widest mt-2">KILOGRAMS</p>
                  </div>

                  <div className="absolute -bottom-10 bg-white text-black px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-2xl">
                    Elite Tier / 98th Percentile
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
             <StatBox label="Max Bench" value={Math.round(oneRepMax * 0.8)} />
             <StatBox label="Max Squat" value={Math.round(oneRepMax * 1.2)} />
             <StatBox label="Max Deadlift" value={Math.round(oneRepMax * 1.5)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({ label, value }: { label: string, value: number }) {
  return (
    <div className="p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-[#DFFF00]/30 transition-colors">
       <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-2">{label}</p>
       <p className="text-3xl font-black italic text-white">{value} KG</p>
    </div>
  );
}