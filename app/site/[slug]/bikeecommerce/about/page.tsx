"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  WrenchScrewdriverIcon, 
  CogIcon, 
  BeakerIcon,
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  VariableIcon
} from "@heroicons/react/24/solid";

const gearSpin = {
  animate: { rotate: 360, transition: { duration: 8, repeat: Infinity, ease: "linear" } }
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;



export default function BikeServicePage() {
  const [activeGeo, setActiveGeo] = useState("aero");

  const geoData = {
    aero: { title: "The Speedster", reach: "Long", stack: "Low", angle: "74°", desc: "Aggressive posture for maximum velocity on Nairobi's open tarmac." },
    trail: { title: "The Climber", reach: "Mid", stack: "High", angle: "66°", desc: "Slack head-angle for stability on the rugged Karura Forest trails." },
    city: { title: "The Commuter", reach: "Short", stack: "High", angle: "71°", desc: "Upright comfort for navigating the busy streets of Westlands." },
  };

  return (
    <main className="bg-white min-h-screen pt-32 pb-24 text-slate-900 overflow-hidden">
      
      {/* 1. PRO MAINTENANCE (ABOUT US) */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-1 bg-red-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Authorized Service Center</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-10 uppercase italic">
              Precision <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>Mechanics.</span>
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg mb-12">
              Our workshop isn't a garage—it's a laboratory. From ultrasonic parts cleaning to laser-guided wheel trueing, we treat every bike like a world-tour machine.
            </p>

            <div className="grid grid-cols-2 gap-8 py-10 border-t border-slate-100">
               <ServiceStat icon={<WrenchScrewdriverIcon/>} label="Certified Techs" value="Level 3" />
               <ServiceStat icon={<BeakerIcon/>} label="Diagnostics" value="Digital" />
            </div>
          </motion.div>

          <div className="relative">
             <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-100 border-[16px] border-slate-100 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80" 
                  alt="Bike Mechanic at Work" fill className="object-cover"
                  loader={imageLoader}
                />
             </div>
             {/* Rotating Gear Overlay */}
             <motion.div 
               variants={gearSpin} animate="animate"
               className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl border-8 border-white"
             >
                <CogIcon className="w-20 h-20" />
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. BIKE GEOMETRY GUIDE (INTERACTIVE) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden">
          {/* Subtle Speed Lines */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 0, transparent 40px)' }} />

          <div className="relative z-10 flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-8">Dial In Your <span className="text-red-600">Fit.</span></h2>
              <p className="text-slate-400 mb-12 max-w-md">Geometry is the soul of the bike. Choose a riding style to see how the frame dimensions change your performance.</p>

              <div className="space-y-4">
                {Object.keys(geoData).map((key) => (
                  <button 
                    key={key}
                    onClick={() => setActiveGeo(key)}
                    className={`w-full p-8 rounded-2xl border-2 transition-all flex items-center justify-between group ${activeGeo === key ? 'border-red-600 bg-red-600/5' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                  >
                    <span className="text-2xl font-black uppercase italic tracking-tighter">{(geoData as any)[key].title}</span>
                    <ArrowRightIcon className={`w-6 h-6 transition-transform ${activeGeo === key ? 'translate-x-0' : '-translate-x-4 opacity-0'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Geometry Data Visualization */}
            <div className="w-full lg:w-[450px]">
               <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] relative">
                  <div className="flex items-center gap-3 mb-10">
                     <VariableIcon className="w-6 h-6 text-red-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Blueprint Data</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={activeGeo}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                       <div className="grid grid-cols-2 gap-8">
                          <GeoMetric label="Reach" value={(geoData as any)[activeGeo].reach} />
                          <GeoMetric label="Stack" value={(geoData as any)[activeGeo].stack} />
                          <GeoMetric label="Head Angle" value={(geoData as any)[activeGeo].angle} />
                          <GeoMetric label="Stability" value="High" />
                       </div>
                       
                       <p className="text-sm text-slate-400 leading-relaxed pt-8 border-t border-white/5">
                         {(geoData as any)[activeGeo].desc}
                       </p>

                       <button className="w-full py-5 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                          Find My Size
                       </button>
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceStat({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function GeoMetric({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{label}</p>
      <p className="text-3xl font-black italic text-white tracking-tighter">{value}</p>
    </div>
  );
}