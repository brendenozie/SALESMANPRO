"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/contexts/StoreContext';
import Image from 'next/image';
import {
  ShieldCheckIcon,
  GlobeAmericasIcon,
  ScaleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutPage() {
  const store = useStore();
  
  // Safe extraction of customizable system accents
  const primaryAccent = useMemo(() => {
    return store?.storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Gold/Amber Institutional Node
  }, [store?.storeFormData?.themeSettings]);

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-hidden">
      
      {/* 1. HERO CONTEXT MATRIX */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-6 border-b border-zinc-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400"
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryAccent }} />
            Institutional Profile // Verified Operations
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight uppercase"
          >
            {store?.storeFormData?.name || 'Aurum Precious Metals Limited'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm md:text-base font-mono text-zinc-400 tracking-wide leading-relaxed"
          >
            Global commodity infrastructure specialized in the structured sourcing, physical auditing, and high-efficiency freight logistics of industrial metals.
          </motion.p>
        </div>
      </section>

      {/* 2. CORE NARRATIVE & PRIMARY ASSETS */}
      <section className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Column: Authoritative Prose */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">01 // Executive Overview</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-zinc-100">
              Distinguished International Metals Trading
            </h2>
            <div className="w-12 h-[2px]" style={{ backgroundColor: primaryAccent }} />
          </div>

          <p className="text-base text-zinc-400 leading-relaxed font-sans">
            Aurum Precious Metals Limited is a distinguished international metals trading company, specializing in gold purchasing and copper cathode supply. With strategic operations established across key global markets, we’ve built a reputation for excellence, reliability, and professional service in the metals industry.
          </p>

          <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-[2px] h-full" style={{ backgroundColor: primaryAccent }} />
            <p className="text-zinc-300 font-medium italic text-sm leading-relaxed">
              "From our strategic base in Kenya, we’ve grown to become a trusted partner for gold trading entities worldwide, known for our professionalism, reliability, and commitment to excellence."
            </p>
          </div>

          {/* Core Values Minimalist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="border border-zinc-900 p-4 rounded-lg bg-zinc-900/10">
              <ShieldCheckIcon className="w-5 h-5 mb-2 text-zinc-400" style={{ color: primaryAccent }} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Risk Mitigation</h4>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">Strict compliance protocols and secure transactional escrow nodes.</p>
            </div>
            <div className="border border-zinc-900 p-4 rounded-lg bg-zinc-900/10">
              <ScaleIcon className="w-5 h-5 mb-2 text-zinc-400" style={{ color: primaryAccent }} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Assay Rigor</h4>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">High-precision laboratory verification protecting all delivery vectors.</p>
            </div>
          </div>
        </div>

        {/* Right Column: High-Value Material Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[4/3] rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 group">
            <Image 
              src={store?.storeFormData?.logoUrl || 'https://images.unsplash.com/photo-1587582423100-ee481a5e52dc?q=80&w=2070&auto=format&fit=crop'}
              alt="High purity gold bars casting process at refinery" 
              fill
              priority
              sizes="(max-w-768px) 100vw, 50vw"
              loader={imageLoader}
              className="object-cover filter grayscale brightness-90 contrast-125 group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded border border-zinc-800 uppercase tracking-widest">
              Asset Sector // Gold Bullion
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 group">
            <Image 
              src={store?.storeFormData?.bannerUrl || 'https://images.unsplash.com/photo-1587582423100-ee481a5e52dc?q=80&w=2070&auto=format&fit=crop'}
              alt="Industrial stacks of newly made copper cathode sheets inside warehouse facility" 
              fill
              sizes="(max-w-768px) 100vw, 50vw"
              loader={imageLoader}
              className="object-cover filter grayscale brightness-90 contrast-125 group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-400 bg-zinc-950/80 px-3 py-1 rounded border border-zinc-800 uppercase tracking-widest">
              Asset Sector // Copper Cathodes
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSIT & FREIGHT SYSTEMS METRIC MATRIX */}
      <section className="border-t border-zinc-900 bg-black/30 py-24 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">02 // Logistics Infrastructure</span>
            <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">Jet Air Freight vs. Sea Freight</h3>
            <p className="text-xs font-mono text-zinc-400">
              Operational parameters and route allocation criteria based on payload valuation and critical timelines.
            </p>
          </div>

          {/* Split Structural Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Air Freight Node */}
            <div className="border border-zinc-900 bg-zinc-950 rounded-xl p-6 md:p-8 space-y-6 flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                      <PaperAirplaneIcon className="w-5 h-5 text-zinc-400" style={{ color: primaryAccent }} />
                    </div>
                    <h4 className="text-lg font-bold uppercase tracking-wider">Jet Air Freight System</h4>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 border border-zinc-800/60 px-2 py-0.5 rounded">CLASS_01 // EXPRESS</span>
                </div>
                
                <div className="relative h-48 w-full rounded-lg border border-zinc-900 overflow-hidden bg-zinc-900">
                  <Image 
                    src={'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop'}
                    alt="Commercial logistics cargo aircraft loading containers at terminal airfield runway during night operations" 
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    loader={imageLoader}
                    className="object-cover filter contrast-110 brightness-90"
                  />
                </div>

                <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                  Jet air freight is faster (1 to 5 days), more expensive, and ideal for urgent, high-value, or perishable goods, but has limited cargo capacity and a higher environmental impact. It offers exceptional end-to-end reliability and structural terminal security.
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-900/60 grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
                <div className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                  <span className="text-zinc-500 block uppercase">Transit Time</span>
                  <span className="text-zinc-200 font-bold mt-1 block">1–5 Days</span>
                </div>
                <div className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                  <span className="text-zinc-500 block uppercase">Security Node</span>
                  <span className="text-zinc-200 font-bold mt-1 block">Maximum</span>
                </div>
                <div className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                  <span className="text-zinc-500 block uppercase">Capacity</span>
                  <span className="text-zinc-200 font-bold mt-1 block">Restricted</span>
                </div>
              </div>
            </div>

            {/* Sea Freight Node */}
            <div className="border border-zinc-900 bg-zinc-950 rounded-xl p-6 md:p-8 space-y-6 flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                      <GlobeAmericasIcon className="w-5 h-5 text-zinc-400" style={{ color: primaryAccent }} />
                    </div>
                    <h4 className="text-lg font-bold uppercase tracking-wider">Ocean Sea Freight</h4>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 border border-zinc-800/60 px-2 py-0.5 rounded">CLASS_02 // BULK</span>
                </div>
                
                <div className="relative h-48 w-full rounded-lg border border-zinc-900 overflow-hidden bg-zinc-900">
                  <Image 
                    src={'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop'} 
                    alt="Massive ocean-going container vessel cargo ship sailing over deep seawater routes" 
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    loader={imageLoader}
                    className="object-cover filter contrast-110 brightness-90"
                  />
                </div>

                <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                  Sea freight is slower (weeks to months), cost-effective, and better suited for bulky, heavy, or non-urgent shipments, with a lower carbon footprint. It excels exponentially in handling immense volume requirements and oversized industrial materials.
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-900/60 grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
                <div className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                  <span className="text-zinc-500 block uppercase">Transit Time</span>
                  <span className="text-zinc-200 font-bold mt-1 block">Weeks/Months</span>
                </div>
                <div className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                  <span className="text-zinc-500 block uppercase">Carbon Profile</span>
                  <span className="text-zinc-200 font-bold mt-1 block">Optimized</span>
                </div>
                <div className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                  <span className="text-zinc-500 block uppercase">Volumetric Capacity</span>
                  <span className="text-zinc-200 font-bold mt-1 block">Unbounded</span>
                </div>
              </div>
            </div>

          </div>

          {/* Concise Analytical Context Block */}
          <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-900 max-w-3xl mx-auto flex gap-4 items-start">
            <SparklesIcon className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" style={{ color: primaryAccent }} />
            <div className="font-mono text-xs text-zinc-500 leading-relaxed">
              <strong className="text-zinc-300">Operational Takeaway:</strong> The transactional deployment of either pipeline depends strictly on client capitalization timelines, total weight allocation thresholds, and the fundamental intrinsic security profiles of the underlying metals.
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}