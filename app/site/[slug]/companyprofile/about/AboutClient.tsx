'use client';

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
  MapPinIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutClient({ baseCompany }: { baseCompany: any }) {
  // Client-side context
  const store = useStore();

  // Safe extraction of customizable system accents
  const primaryAccent = useMemo(() => {
    return baseCompany.themeSettings?.primaryColor || '#F59E0B'; // Gold/Amber Institutional Node
  }, [baseCompany.themeSettings]);

  // 🧠 Fallback Data Provisioning for StoreForm Fields
  const name = baseCompany.name || 'Aurum Precious Metals Limited';
  const tagline = baseCompany.tagline || 'Global commodity infrastructure specialized in the structured sourcing, physical auditing, and high-efficiency freight logistics of industrial metals.';
  const sectionTitle = baseCompany.sectionTitle || 'Distinguished International Metals Trading';
  const description = baseCompany.description || 'Aurum Precious Metals Limited is a distinguished international metals trading company, specializing in gold purchasing and copper cathode supply. With strategic operations established across key global markets, we’ve built a reputation for excellence, reliability, and professional service in the metals industry.';
  
  const founderQuote = baseCompany.founderQuote || "From our strategic base in Kenya, we’ve grown to become a trusted partner for gold trading entities worldwide, known for our professionalism, reliability, and commitment to excellence.";
  const founderName = baseCompany.founderName || "Executive Board, Aurum Precious Metals";

  const coreValues = baseCompany.CoreValues?.length ? baseCompany.CoreValues : [
    { id: '1', title: 'Risk Mitigation', description: 'Strict compliance protocols and secure transactional escrow nodes.', icon: 'shield' },
    { id: '2', title: 'Assay Rigor', description: 'High-precision laboratory verification protecting all delivery vectors.', icon: 'scale' },
    { id: '3', title: 'Global Reach', description: 'Optimized routing across international transit corridors.', icon: 'globe' }
  ];

  const stats = baseCompany.stats?.length ? baseCompany.stats : [
    { id: 's1', label: 'Annual Volume', value: '500+ MT' },
    { id: 's2', label: 'Global Nodes', value: '12' },
    { id: 's3', label: 'Escrow Value', value: '$2.4B' },
    { id: 's4', label: 'System Uptime', value: '99.9%' },
  ];

  const locations = baseCompany.CompanyLocation?.length ? baseCompany.CompanyLocation : [
    { id: 'l1', city: 'Nairobi', country: 'Kenya', type: 'HQ // Strategic Base' },
    { id: 'l2', city: 'Dubai', country: 'UAE', type: 'Financial Escrow Node' },
    { id: 'l3', city: 'Geneva', country: 'Switzerland', type: 'Assay & Auditing' }
  ];

  // 🚢 Map Promotions to Freight Options
  const freightOptions = baseCompany.promotions?.length ? baseCompany.promotions : [
    {
      id: 'promo_air',
      title: 'Jet Air Freight System',
      badgeText: 'CLASS_01 // EXPRESS',
      bannerUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=2070&auto=format&fit=crop',
      description: 'Jet air freight is faster (1 to 5 days), more expensive, and ideal for urgent, high-value, or perishable goods, but has limited cargo capacity and a higher environmental impact. It offers exceptional end-to-end reliability and structural terminal security.',
      perks: [
        { id: 'p1', icon: 'Transit Time', label: '1–5 Days' },
        { id: 'p2', icon: 'Security Node', label: 'Maximum' },
        { id: 'p3', icon: 'Capacity', label: 'Restricted' }
      ]
    },
    {
      id: 'promo_sea',
      title: 'Ocean Sea Freight',
      badgeText: 'CLASS_02 // BULK',
      bannerUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c83a7f?q=80&w=2070&auto=format&fit=crop',
      description: 'Sea freight is slower (weeks to months), cost-effective, and better suited for bulky, heavy, or non-urgent shipments, with a lower carbon footprint. It excels exponentially in handling immense volume requirements and oversized industrial materials.',
      perks: [
        { id: 'p4', icon: 'Transit Time', label: 'Weeks/Months' },
        { id: 'p5', icon: 'Carbon Profile', label: 'Optimized' },
        { id: 'p6', icon: 'Volumetric Capacity', label: 'Unbounded' }
      ]
    }
  ];

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-hidden">
      
      {/* 1. HERO CONTEXT MATRIX */}
      <section className="relative min-h-[50vh] flex flex-col items-center justify-center pt-24 pb-16 px-6 border-b border-zinc-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400"
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryAccent }} />
            Institutional Profile // {baseCompany.category || 'Commodities Trading'}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight uppercase"
          >
            {name}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-sm md:text-base font-mono text-zinc-400 tracking-wide leading-relaxed"
          >
            {tagline}
          </motion.p>
        </div>

        {/* STATS MATRIX */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full max-w-5xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-zinc-900 pt-8"
        >
          {stats.map((stat: any, index: number) => (
            <div key={stat.id || index} className="text-center md:text-left p-4 border border-zinc-900 bg-zinc-950/50 rounded-lg">
              <ChartBarIcon className="w-4 h-4 mb-3 mx-auto md:mx-0 text-zinc-600" />
              <div className="text-2xl font-bold text-zinc-200">{stat.value}</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 2. CORE NARRATIVE & PRIMARY ASSETS */}
      <section className="max-w-7xl mx-auto py-24 px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        
        {/* Left Column: Authoritative Prose */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 block">01 // Executive Overview</span>
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-zinc-100">
              {sectionTitle}
            </h2>
            <div className="w-12 h-[2px]" style={{ backgroundColor: primaryAccent }} />
          </div>

          <p className="text-base text-zinc-400 leading-relaxed font-sans whitespace-pre-line">
            {description}
          </p>

          <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-sm relative overflow-hidden group mt-8">
            <div className="absolute top-0 left-0 w-[2px] h-full" style={{ backgroundColor: primaryAccent }} />
            <p className="text-zinc-300 font-medium italic text-sm leading-relaxed">
              "{founderQuote}"
            </p>
            <div className="mt-4 flex items-center gap-3">
              {baseCompany.founderImage && (
                <div className="w-8 h-8 rounded-full overflow-hidden relative border border-zinc-800">
                  <Image src={baseCompany.founderImage} alt={founderName} fill className="object-cover" />
                </div>
              )}
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">— {founderName}</span>
            </div>
          </div>

          {/* Core Values Minimalist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
            {coreValues.map((val: any, idx: number) => (
              <div key={val.id || idx} className="border border-zinc-900 p-4 rounded-lg bg-zinc-900/10 hover:bg-zinc-900/30 transition-colors">
                {idx % 2 === 0 ? (
                  <ShieldCheckIcon className="w-5 h-5 mb-2 text-zinc-400" style={{ color: primaryAccent }} />
                ) : (
                  <ScaleIcon className="w-5 h-5 mb-2 text-zinc-400" style={{ color: primaryAccent }} />
                )}
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">{val.title}</h4>
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">{val.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: High-Value Material Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[4/3] rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900 group">
            <Image 
              src={baseCompany.logoUrl || 'https://images.unsplash.com/photo-1587582423100-ee481a5e52dc?q=80&w=2070&auto=format&fit=crop'}
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
              src={baseCompany.bannerUrl || 'https://images.unsplash.com/photo-1587582423100-ee481a5e52dc?q=80&w=2070&auto=format&fit=crop'}
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
            <h3 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">Systematic Transit Nodes</h3>
            <p className="text-xs font-mono text-zinc-400">
              Operational parameters and route allocation criteria based on payload valuation and critical timelines.
            </p>
          </div>

          {/* Dynamic Promotions / Freight Data Mapping */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {freightOptions.slice(0, 2).map((promo: any, idx: number) => (
              <div key={promo.id || idx} className="border border-zinc-900 bg-zinc-950 rounded-xl p-6 md:p-8 space-y-6 flex flex-col justify-between hover:border-zinc-800 transition-all">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-zinc-900 border border-zinc-800">
                        {idx === 0 ? (
                          <PaperAirplaneIcon className="w-5 h-5 text-zinc-400" style={{ color: primaryAccent }} />
                        ) : (
                          <GlobeAmericasIcon className="w-5 h-5 text-zinc-400" style={{ color: primaryAccent }} />
                        )}
                      </div>
                      <h4 className="text-lg font-bold uppercase tracking-wider">{promo.title}</h4>
                    </div>
                    {promo.badgeText && (
                      <span className="font-mono text-[10px] text-zinc-500 border border-zinc-800/60 px-2 py-0.5 rounded">
                        {promo.badgeText}
                      </span>
                    )}
                  </div>
                  
                  {promo.bannerUrl && (
                    <div className="relative h-48 w-full rounded-lg border border-zinc-900 overflow-hidden bg-zinc-900">
                      <Image 
                        src={promo.bannerUrl}
                        alt={promo.title} 
                        fill
                        sizes="(max-w-768px) 100vw, 50vw"
                        loader={imageLoader}
                        className="object-cover filter contrast-110 brightness-90"
                      />
                    </div>
                  )}

                  <p className="text-sm text-zinc-400 font-sans leading-relaxed">
                    {promo.description}
                  </p>
                </div>

                {/* Map Perks to Metrics Grid */}
                {promo.perks && promo.perks.length > 0 && (
                  <div className="pt-6 border-t border-zinc-900/60 grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
                    {promo.perks.slice(0, 3).map((perk: any, perkIdx: number) => (
                      <div key={perk.id || perkIdx} className="p-2 bg-zinc-900/40 rounded border border-zinc-900">
                        <span className="text-zinc-500 block uppercase">{perk.icon || `Metric ${perkIdx + 1}`}</span>
                        <span className="text-zinc-200 font-bold mt-1 block truncate" title={perk.label}>{perk.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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

      {/* 4. GLOBAL PRESENCE MATRIX */}
      <section className="py-16 px-6 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-sm">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">03 // Global Footprint</span>
            <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-200 mb-2">Operational Nodes</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">Strategic physical presence established across primary global trading corridors to ensure localized compliance and expedited transit protocols.</p>
          </div>
          
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            {locations.map((loc: any, idx: number) => (
              <div key={loc.id || idx} className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-lg flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 mt-0.5 text-zinc-500" style={{ color: primaryAccent }} />
                <div>
                  <h5 className="text-sm font-bold text-zinc-200">{loc.city}, {loc.country}</h5>
                  <p className="text-[10px] font-mono uppercase text-zinc-500 mt-1">{loc.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}