"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/next-image'; // Fallback to standard img if configuration issues arise
import { 
  ArrowUpRightIcon, 
  ShieldCheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
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

  // Auto-play feature for non-interactive desktop viewing (optional, pauses on hover)
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % services.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isHovered, services.length]);

  return (
    <section id="services-portfolio" className="py-20 lg:py-32 bg-zinc-950 text-white relative overflow-hidden font-sans">
      
      {/* High-Tech Premium Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="mb-12 lg:mb-20 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
            Institutional Capabilities
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight leading-tight">
            Refined Metals <span className="text-zinc-500 font-light italic">Trading Channels</span>
          </h2>
          <p className="mt-4 text-base text-zinc-400 font-light leading-relaxed">
            Bridging localized asset extraction with high-liquidity global fulfillment systems under ironclad regulatory compliance.
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
                        ? 'bg-gradient-to-r from-zinc-900 to-zinc-900/60 border-zinc-800 text-white shadow-lg shadow-black/40' 
                        : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20'
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

                    <span className={`font-mono text-xs font-bold mt-0.5 ${isActive ? 'text-amber-400' : 'text-zinc-700'}`}>
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
                          className="text-xs text-zinc-400 font-light leading-relaxed pr-4"
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
                      ? 'bg-zinc-900 border-zinc-700 text-white' 
                      : 'bg-zinc-900/40 border-zinc-900 text-zinc-400'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-amber-500 font-bold">0{idx + 1}</span>
                    <span className="text-[10px] uppercase font-mono tracking-wider bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
                      {svc.metric}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold truncate mb-1 text-zinc-100">{svc.name}</h3>
                  <p className="text-xs text-zinc-400 font-light line-clamp-2">{svc.description}</p>
                </div>
              ))}
            </div>

            {/* Micro Compliance Banner - Grounding anchor */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex gap-4 items-center backdrop-blur-sm">
              <ShieldCheckIcon className="w-5 h-5 text-amber-500/70 shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-normal font-light">
                <span className="text-zinc-300 font-medium">Compliance Baseline:</span> Runs parallel to international AML, tier-1 assaying transparency, and secure multi-modal transit frameworks.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: CINEMATIC SHOWCASE THEATER (Unified for Smooth Motion Transitions) */}
          <div className="lg:col-span-7 h-auto min-h-[500px] lg:min-h-full flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full flex flex-col justify-between bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
              >
                {/* Media Presentation Layer */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src={activeService.imageUrl}
                    alt={activeService.name}
                    className="object-cover w-full h-full scale-100 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
                  
                  {/* Dynamic Floating Glass Badge */}
                  <div className="absolute bottom-4 right-4 backdrop-blur-lg bg-zinc-900/70 border border-zinc-700/60 p-3 rounded-xl text-right min-w-[110px]">
                    <div className="text-sm font-mono font-bold tracking-tight text-amber-400">{activeService.metric}</div>
                    <div className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">{activeService.metricLabel}</div>
                  </div>
                </div>

                {/* Content Details Block */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {activeService.name}
                    </h3>
                    <p className="mt-3 text-zinc-400 text-sm font-light leading-relaxed">
                      {activeService.description}
                    </p>
                  </div>

                  {/* Technical Tags Grid */}
                  <div className="space-y-4">
                    <div className="h-[1px] bg-gradient-to-r from-zinc-800 via-transparent to-transparent" />
                    <div className="flex flex-wrap gap-2">
                      {activeService.specs?.map((spec, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-light"
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
                      className="group/btn inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Initialize Allocation Pipeline
                      <ArrowUpRightIcon className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                    
                    {/* Manual Navigation Chevrons for Mobile/Tablet layout optimization */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
                        }}
                        className="p-1 hover:text-amber-400 transition-colors text-zinc-500"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveIndex((prev) => (prev + 1) % services.length);
                        }}
                        className="p-1 hover:text-amber-400 transition-colors text-zinc-500"
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