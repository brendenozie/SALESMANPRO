"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  slug: string;
  specs: string[];
  metric: string;
  metricLabel: string;
}

interface GreyServicesSectionProps {
  services?: ServiceItem[];
  storeSlug?: string;
}

const defaultServices: ServiceItem[] = [
  {
    id: 'svc-1',
    name: 'Gold Procurement & Primary Refining Sourcing',
    description: 'Direct integration with verified regional extraction hubs. We execute audited purchasing pipelines backed by international tier-1 assay compliance protocols and locked value verification chains.',
    imageUrl: 'https://images.unsplash.com/photo-1610375228911-c4ab455981ca?q=80&w=2070&auto=format&fit=crop',
    slug: 'gold-procurement',
    specs: ['LBMA Compliant Assaying', 'Verified Origin Tracks', 'Immediate Liquidity Lines'],
    metric: '99.99%',
    metricLabel: 'Purity Standard'
  },
  {
    id: 'svc-2',
    name: 'Copper Cathode Wholesale Distribution',
    description: 'Bulk delivery infrastructure optimized for international heavy manufacturing, industrial grade wiring systems, and clean energy grid rollouts across major logistical terminals.',
    imageUrl: 'https://images.unsplash.com/photo-1535615611114-358aaab13718?q=80&w=2070&auto=format&fit=crop',
    slug: 'copper-cathodes',
    specs: ['Grade-A Purity Cu', 'Flexible FOB/CIF Terms', 'Secured Allocation Reserves'],
    metric: 'A-Grade',
    metricLabel: 'LME Class'
  },
  {
    id: 'svc-3',
    name: 'Cross-Border Multi-Modal Logistics',
    description: 'End-to-end freight oversight using armored transit assets, maritime bulk carriers, and tightly managed customs clearing loops across complex global channels.',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop',
    slug: 'global-logistics',
    specs: ['Fully Insured Transit', 'Real-Time Telemetry', 'Strategic Clearing Ports'],
    metric: '24/7',
    metricLabel: 'Oversight Control'
  },
  {
    id: 'svc-4',
    name: 'Structured Commodity Risk Mitigation',
    description: 'Defensive market positioning systems, forward contract optimization, and physical hedging mechanisms engineered to insulate buyers and producers from structural price volatility.',
    imageUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop',
    slug: 'risk-management',
    specs: ['Volatility Countermeasures', 'Forward Pricing Models', 'Liquidity Protection'],
    metric: 'Zero',
    metricLabel: 'Unhedged Exposure'
  }
];

export default function GreyServicesSection({ services = defaultServices, storeSlug }: GreyServicesSectionProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const activeService = services[activeIndex] || services[0];

  // Auto-play feature for non-interactive desktop viewing (pauses on hover)
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isHovered, services.length]);

  return (
    <section id="services-portfolio" className="py-20 lg:py-32 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white relative overflow-hidden font-sans transition-colors duration-300">
      
      {/* High-Tech Premium Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-600/5 dark:bg-zinc-800/10 blur-[150px] rounded-full" />
        <div 
          className="absolute inset-0 opacity-20 dark:opacity-100" 
          style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
        <div 
          className="absolute inset-0 hidden dark:block" 
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="mb-12 lg:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            Institutional Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-zinc-100 tracking-tight leading-tight">
            Reliable <span className="text-slate-500 dark:text-zinc-500 font-light italic">Enterprise Solutions</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
            We bridge the gap between local operational capacities and global market demands. Our infrastructure ensures that your end-to-end operations are executed safely, efficiently, and in strict compliance with all industry regulations.          
          </p>
        </div>

        {/* MAIN CONTAINER */}
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* LEFT SIDE: CONTROL INDEX (Desktop) & Touch Swiper Controls (Mobile) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:space-y-8">
            
            {/* Desktop Dynamic Sidebar Menu */}
            <div className="hidden lg:flex flex-col gap-3">
              {services.map((svc, idx) => {
                const isActive = activeIndex === idx;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`group w-full relative flex items-start gap-4 p-5 rounded-2xl text-left transition-all duration-300 border ${
                      isActive 
                        ? 'bg-white dark:bg-gradient-to-r dark:from-zinc-900 dark:to-zinc-900/60 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-black/40' 
                        : 'border-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-zinc-900/20'
                    }`}
                  >
                    {/* Active Highlight Bar Accent */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeBar"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-500 rounded-r-md"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    <span className={`font-mono text-xs font-bold mt-0.5 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-zinc-700'}`}>
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold tracking-wide transition-colors">
                        {svc.name.split('&')[0].split('(')[0].trim()}
                      </h3>
                      {isActive && (
                        <motion.p 
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed pr-4"
                        >
                          {svc.description.substring(0, 115)}...
                        </motion.p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Horizontal Carousel Slider (Visible only on < lg screens) */}
            <div className="block lg:hidden w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex gap-4 pb-4">
              {services.map((svc, idx) => (
                <div 
                  key={svc.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`snap-center shrink-0 w-[85vw] sm:w-[380px] p-5 rounded-2xl border transition-all cursor-pointer ${
                    activeIndex === idx 
                      ? 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-white shadow-md' 
                      : 'bg-slate-100/70 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-900 text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-amber-600 dark:text-amber-500 font-bold">0{idx + 1}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                      {svc?.metric}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold truncate mb-1 text-slate-900 dark:text-zinc-100">{svc?.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-light line-clamp-2">{svc?.description}</p>
                </div>
              ))}
            </div>

            {/* Micro Compliance Banner - Grounding anchor */}
            <div className="p-4 rounded-xl bg-slate-200/50 dark:bg-zinc-900/40 border border-slate-300/60 dark:border-zinc-900 flex gap-4 items-center backdrop-blur-sm">
              <ShieldCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-500/70 shrink-0" />
              <p className="text-[11px] text-slate-600 dark:text-zinc-500 leading-normal font-light">
                <span className="text-slate-900 dark:text-zinc-300 font-medium">Compliance Baseline:</span> Runs parallel to international AML, tier-1 assaying transparency, and secure multi-modal transit frameworks.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: CINEMATIC SHOWCASE THEATER */}
          <div className="lg:col-span-7 h-auto min-h-[500px] lg:min-h-full flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService?.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flex flex-col justify-between bg-white dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl dark:shadow-black/50 relative"
              >
                {/* Media Presentation Layer */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src={activeService?.images?.[0] || activeService?.imageUrl || 'https://images.unsplash.com/photo-1610375228911-c4ab455981ca?q=80&w=2070&auto=format&fit=crop'}
                    alt={activeService?.name}
                    className="object-cover w-full h-full scale-100 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Dynamic Floating Glass Badge */}
                  <div className="absolute bottom-4 right-4 backdrop-blur-lg bg-white/80 dark:bg-zinc-900/70 border border-slate-200 dark:border-zinc-700/60 p-3 rounded-xl text-right min-w-[110px] shadow-lg">
                    <div className="text-sm font-mono font-bold tracking-tight text-amber-600 dark:text-amber-400">{activeService?.metric}</div>
                    <div className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 mt-0.5">{activeService?.metricLabel}</div>
                  </div>
                </div>

                {/* Content Details Block */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {activeService?.name}
                    </h3>
                    <p className="mt-3 text-slate-600 dark:text-zinc-400 text-sm font-light leading-relaxed">
                      {activeService?.description}
                    </p>
                  </div>

                  {/* Technical Tags Grid */}
                  <div className="space-y-4">
                    <div className="h-[1px] bg-gradient-to-r from-slate-200 dark:from-zinc-800 via-transparent to-transparent" />
                    <div className="flex flex-wrap gap-2">
                      {activeService?.specs?.map((spec, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-light"
                        >
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operational Interactive CTA Action Button */}
                  <div className="pt-2 flex justify-between items-center">
                    <button 
                      onClick={() => router.push(`/companyprofile/services/${activeService.id}`)}
                      className="group/btn inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    >
                      Initialize Allocation Pipeline
                      <ArrowUpRightIcon className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                    
                    {/* Manual Navigation Chevrons for Mobile/Tablet layout optimization */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-400 transition-colors"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex((prev) => (prev + 1) % services.length);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-amber-400 transition-colors"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}