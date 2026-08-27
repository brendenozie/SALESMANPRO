/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BoltIcon, 
  MapIcon, 
  ShieldCheckIcon, 
  WrenchScrewdriverIcon,
  CircleStackIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  Square3Stack3DIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

export default function AutomotiveVehicleView({ vehicle, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#1e293b';
  const [selectedColor, setSelectedColor] = useState('Midnight Black');

  // Mock Automotive Data
  const specs = [
    { label: '0-100 km/h', value: '3.8s', icon: <BoltIcon className="w-5 h-5" /> },
    { label: 'Horsepower', value: '450 HP', icon: <CircleStackIcon className="w-5 h-5" /> },
    { label: 'Drive Type', value: 'AWD', icon: <MapIcon className="w-5 h-5" /> },
    { label: 'Safety Rating', value: '5-Star', icon: <ShieldCheckIcon className="w-5 h-5" /> },
  ];

  const colors = [
    { name: 'Midnight Black', hex: '#0a0a0a' },
    { name: 'Silver Bullet', hex: '#d1d5db' },
    { name: 'Racing Red', hex: '#dc2626' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-zinc-200">
      
      {/* --- HERO: THE POWER SHOT --- */}
      <section className="relative h-[70vh] lg:h-[90vh] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={vehicle?.imageUrl || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600'}
            alt="Vehicle Hero"
            className="w-full h-full object-cover"
          />
          {/* Cinematic Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] via-transparent to-transparent" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col justify-end px-6 lg:px-20 pb-20 max-w-7xl mx-auto">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-7xl lg:text-[140px] font-black tracking-tighter leading-[0.8] mb-8 uppercase italic italic">
              {vehicle?.name || "The Apex GT"}
            </h1>
            <div className="flex flex-wrap items-center gap-12">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Starting At</p>
                  <p className="text-4xl font-black dark:text-white">KSh {vehicle?.price?.toLocaleString() || '12,500,000'}</p>
               </div>
               <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-800" />
               <button className="h-16 px-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-[10px] tracking-[0.3em] rounded-full shadow-2xl hover:scale-105 transition-transform">
                 Configure & Price
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- THE DASHBOARD SPEC STRIP --- */}
      <section className="relative z-10 -mt-10 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-1 p-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
          {specs.map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-10 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
              <div className="text-zinc-400 mb-3">{s.icon}</div>
              <span className="text-2xl font-black dark:text-white">{s.value}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- CONTENT ENGINE --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-32 grid lg:grid-cols-12 gap-24">
        
        {/* Left: Engineering & Gallery */}
        <div className="lg:col-span-7">
          <section className="mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-10">Engineering Excellence</h2>
            <p className="text-3xl lg:text-5xl font-bold dark:text-white leading-tight mb-8 tracking-tight">
              Designed for those who <span className="text-zinc-400">refuse to compromise</span> on performance.
            </p>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12">
              {vehicle?.description || "Engineered in collaboration with elite racing teams, this model features an active aerodynamic system and a carbon-fiber reinforced chassis for unmatched agility on both Nairobi highways and track days."}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="aspect-square relative rounded-[2.5rem] overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800" alt="Interior" className="w-full h-full object-cover" />
               </div>
               <div className="aspect-square relative rounded-[2.5rem] overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800" alt="Wheel" className="w-full h-full object-cover" />
               </div>
            </div>
          </section>

          {/* Technical DNA Table */}
          <section>
             <h3 className="text-sm font-black uppercase tracking-widest mb-10 flex items-center gap-3">
               <WrenchScrewdriverIcon className="w-5 h-5" /> Technical DNA
             </h3>
             <div className="space-y-4">
                {[
                  { k: 'Engine', v: '4.0L V8 Twin-Turbo' },
                  { k: 'Transmission', v: '9-Speed Dual Clutch' },
                  { k: 'Fuel Economy', v: '8.4L / 100km' },
                  { k: 'Cargo Space', v: '450 Liters' }
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-6 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-sm font-bold text-zinc-400">{row.k}</span>
                    <span className="text-sm font-black dark:text-white">{row.v}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Right: Booking & Personalization */}
        <aside className="lg:col-span-5">
          <div className="p-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 sticky top-32">
            
            {/* Color Selector */}
            <div className="mb-12">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Exterior Finish</p>
               <div className="flex gap-4">
                 {colors.map((c) => (
                   <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${selectedColor === c.name ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                   />
                 ))}
               </div>
               <p className="mt-4 text-xs font-bold dark:text-zinc-300">{selectedColor}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-10">
               <button className="w-full h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-black dark:hover:bg-zinc-100 transition-all">
                 <CalendarIcon className="w-4 h-4" /> Book a Test Drive
               </button>
               <button className="w-full h-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white dark:hover:bg-zinc-800 transition-all">
                 <ChatBubbleLeftRightIcon className="w-4 h-4" /> Speak to a Consultant
               </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black dark:text-white uppercase tracking-widest">7-Year Warranty</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Full coverage on all powertrain components.</p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                    <ScaleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black dark:text-white uppercase tracking-widest">Trade-In Evaluator</p>
                    <p className="text-[10px] text-zinc-400 font-medium">Get a valuation for your current vehicle in minutes.</p>
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </main>

      {/* --- CTA: RELATED FLEET --- */}
      <section className="bg-zinc-900 py-32 px-6 lg:px-20 text-white overflow-hidden relative">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div>
               <h2 className="text-5xl font-black italic tracking-tighter mb-4">Explore the Full Fleet</h2>
               <p className="text-zinc-400 max-w-md font-light">From executive sedans to rugged off-roaders, discover the perfect match for your lifestyle.</p>
            </div>
            <button className="h-20 w-20 rounded-full bg-white text-zinc-900 flex items-center justify-center hover:scale-110 transition-transform">
               <ArrowRightIcon className="w-8 h-8" />
            </button>
         </div>
         {/* Background Typography */}
         <div className="absolute -bottom-10 -right-20 text-[20vw] font-black text-white/[0.03] leading-none select-none italic pointer-events-none">
            DRIVE
         </div>
      </section>
    </div>
  );
}