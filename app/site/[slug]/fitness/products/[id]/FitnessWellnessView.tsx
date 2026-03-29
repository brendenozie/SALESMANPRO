"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FireIcon, 
  HeartIcon, 
  BoltIcon, 
  BeakerIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  PlayIcon,
  ChartBarIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { NutritionTable } from './NutritionTable';
import { WorkoutVideoPreview } from './WorkoutVideoPreview';

const loader = ({ src }: { src: string }) => src;

export default function FitnessWellnessView({ product, storeFormData }: any) {
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fbbf24'; // High-Energy Amber/Yellow
  const [activeMetric, setActiveMetric] = useState(0);

  const metrics = [
    { label: 'Burn Rate', value: '450 kcal', icon: <FireIcon className="w-5 h-5" /> },
    { label: 'Intensity', value: 'Elite', icon: <BoltIcon className="w-5 h-5" /> },
    { label: 'Recovery', value: '24 hrs', icon: <HeartIcon className="w-5 h-5" /> },
    { label: 'Purity', value: '100%', icon: <BeakerIcon className="w-5 h-5" /> },
  ];

  const benefits = [
    'Enhanced Metabolic Activation',
    'Mental Clarity & Focus',
    'Sustainable Energy Levels',
    'Optimized Recovery Windows'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] selection:bg-amber-100">
      
      {/* --- DYNAMIC SPLIT HERO --- */}
      <section className="relative grid lg:grid-cols-2 h-[80vh] lg:h-screen overflow-hidden">
        {/* Left: Product/Service Image */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-full w-full bg-zinc-100 dark:bg-zinc-900"
        >
          <Image
            src={product?.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200'}
            alt="Fitness Hero"
            fill
            className="object-cover"
            loader={loader}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </motion.div>

        {/* Right: The Energy Text */}
        <div className="flex flex-col justify-center px-10 lg:px-20 bg-white dark:bg-[#050505]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              Peak Performance 2026
            </span>
            <h1 className="text-6xl lg:text-[100px] font-black tracking-tighter leading-[0.85] mb-10 uppercase italic">
              {product?.name || "The Kinetic <br/> Protocol"}
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed mb-12 max-w-lg">
              Unlock the next version of yourself. Our science-backed approach combines high-intensity physiology with restorative wellness logic.
            </p>
            <div className="flex items-center gap-8">
               <button 
                 className="h-16 px-12 rounded-2xl text-black font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl transition-all hover:scale-105"
                 style={{ backgroundColor: primaryColor }}
               >
                 Get Started
               </button>
               <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                 <PlayIcon className="w-6 h-6" /> Watch Trailer
               </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- BIO-METRIC DASHBOARD --- */}
      <section className="py-24 border-b border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-20 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {metrics.map((m, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  {m.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{m.label}</p>
              </div>
              <h3 className="text-4xl font-black dark:text-white">{m.value}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- THE TRANSFORMATION GRID --- */}
      <main className="max-w-7xl mx-auto px-6 lg:px-20 py-32 grid lg:grid-cols-12 gap-24">
        
        {/* Left: The Science & Benefits */}
        <div className="lg:col-span-7">
          <section className="mb-24">
            <h2 className="text-4xl font-bold dark:text-white mb-10 tracking-tight italic">Why it works.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
                  <CheckBadgeIcon className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-sm font-bold dark:text-zinc-200">{b}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-10 flex items-center gap-3">
               <ChartBarIcon className="w-5 h-5" /> The Transformation Journey
             </h3>
             <div className="space-y-6">
                {[
                  { phase: 'Phase 01', title: 'Activation', desc: 'Kickstart your metabolism and set the foundation for mobility.' },
                  { phase: 'Phase 02', title: 'Threshold', desc: 'Push past previous limits with progressive load and volume.' },
                  { phase: 'Phase 03', title: 'Mastery', desc: 'Refine the physique and lock in long-term wellness habits.' }
                ].map((p, i) => (
                  <div key={i} className="p-10 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 group hover:bg-zinc-900 hover:text-white transition-all duration-500">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">{p.phase}</p>
                    <h4 className="text-2xl font-bold mb-4">{p.title}</h4>
                    <p className="text-zinc-500 group-hover:text-zinc-400 font-light">{p.desc}</p>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Right: Booking & Community */}
        <aside className="lg:col-span-5 h-fit lg:sticky lg:top-32">
          <div className="p-10 bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-10">Start Your Program</h3>
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-4xl font-black dark:text-white">KSh {product?.price?.toLocaleString() || '8,500'}</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Single Purchase / Lifetime Access</p>
              </div>
              <SparklesIcon className="w-10 h-10 text-amber-500 opacity-20" />
            </div>

            <button className="w-full h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all mb-4">
              Enroll Now
            </button>
            <p className="text-[10px] text-center text-zinc-400 font-medium">30-Day Money Back Guarantee</p>

            <div className="mt-12 pt-10 border-t border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-300 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold dark:text-zinc-300">Join 1,200+ members in Nairobi.</p>
               </div>
            </div>
            
            {/* Background Texture */}
            <div className="absolute -right-10 -top-10 text-9xl font-black text-zinc-500/5 select-none pointer-events-none uppercase italic">FIT</div>
          </div>

          {/* Coach Insight */}
          <div className="mt-8 p-8 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex gap-6 items-center">
             <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20">
               <img src="https://images.unsplash.com/photo-1548690312-e3b507d17a4d?w=200" alt="Coach" className="w-full h-full object-cover"  />
             </div>
             <div>
               <h5 className="font-bold">Coach B.O.</h5>
               <p className="text-xs opacity-80 leading-relaxed font-light">"The hardest part is showing up. We've built the system—you just bring the drive."</p>
             </div>
          </div>
        </aside>
      </main>

      <WorkoutVideoPreview />

      <NutritionTable />
      
    </div>
  );
}