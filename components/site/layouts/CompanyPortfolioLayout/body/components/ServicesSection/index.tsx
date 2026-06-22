"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowUpRightIcon, 
  CheckCircleIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  TruckIcon
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
  services?: any[];
  storeSlug: string;
}

// Premier default services built directly for Grey Trading Limited's operational matrix
const defaultServices: any[] = [
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
  const [activeService, setActiveService] = useState<string>(services[0]?.id || '');

  return (
    <section id="services-portfolio" className="py-24 lg:py-36 bg-zinc-950 text-white relative overflow-hidden font-sans">
      
      {/* Structural Tech Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-900 to-transparent" />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT COLUMN: Sticky Context & Live Navigation Indicators */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-6">
                Institutional Capabilities
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-none">
                Refined Metals <br />
                <span className="text-zinc-500 font-light italic">Trading Channels</span>
              </h2>
              <p className="mt-6 text-base text-zinc-400 leading-relaxed font-light">
                Grey Trading Limited bridges localized production metrics with high-liquidity global consumption points. Every channel operates under ironclad regulatory matrices and precise physical execution vectors.
              </p>
            </div>

            {/* Interactive Control Index */}
            <div className="hidden lg:block space-y-3 pt-6 border-t border-zinc-900">
              {services.map((svc, idx) => (
                <button
                  key={svc.id}
                  onClick={() => setActiveService(svc.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 ${
                    activeService === svc.id 
                      ? 'bg-zinc-900 border border-zinc-800 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-mono font-bold ${activeService === svc.id ? 'text-amber-500' : 'text-zinc-600'}`}>
                      0{idx + 1}
                    </span>
                    <span className="text-sm font-medium tracking-wide">{svc.name.split('&')[0].split('(')[0]}</span>
                  </div>
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors ${activeService === svc.id ? 'bg-amber-500' : 'bg-transparent'}`} />
                </button>
              ))}
            </div>

            {/* Global Security Disclaimer Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-900 flex gap-4 items-start">
              <ShieldCheckIcon className="w-6 h-6 text-amber-500/80 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold tracking-wider uppercase text-zinc-300">Compliance Standard Baseline</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light">
                  All trade desking runs parallel to strict international anti-money laundering (AML) legislation, supply transparency laws, and counter-terrorist financing controls.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Panoramic Service Rows */}
          <div className="lg:col-span-7 space-y-12">
            {services.map((svc) => (
              <motion.div
                key={svc.id}
                onViewportEnter={() => setActiveService(svc.id)}
                viewport={{ margin: "-30% 0px -30% 0px" }}
                className={`group relative bg-zinc-900/20 border rounded-3xl overflow-hidden transition-all duration-500 ${
                  activeService === svc.id 
                    ? 'border-zinc-800 bg-zinc-900/40 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]' 
                    : 'border-zinc-900 opacity-60 hover:opacity-90'
                }`}
              >
                {/* Wide Panoramic Image Showcase */}
                <div className="relative h-60 sm:h-72 w-full overflow-hidden border-b border-zinc-900">
                  <Image
                    src={svc.imageUrl || svc.images?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop'}
                    alt={svc.name || 'Service Image'}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out grayscale-[30%] group-hover:scale-105 group-hover:grayscale-0"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    loader={({ src }) => `${src}?q=80&w=800&auto=format&fit=crop`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
                  
                  {/* Performance Data Callout Token */}
                  <div className="absolute bottom-6 right-6 backdrop-blur-md bg-zinc-950/70 border border-zinc-800 p-4 rounded-xl text-right min-w-[120px]">
                    <div className="text-xs font-mono font-bold tracking-wider text-amber-500 uppercase">{svc.metric}</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-400 mt-0.5">{svc.metricLabel}</div>
                  </div>
                </div>

                {/* Information Core Panel */}
                <div className="p-8 sm:p-10 space-y-6">
                  <h3 className="text-2xl font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight">
                    {svc.name}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm leading-relaxed font-light">
                    {svc.description}
                  </p>

                  {/* Operational Technical Spec Flags */}
                  <div className="pt-4 border-t border-zinc-900/80">
                    <div className="flex flex-wrap gap-2">
                      {svc.specs && svc.specs?.length > 0 && svc.specs?.map((spec, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs font-medium">
                          <span className="w-1 h-1 rounded-full bg-amber-500" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Call to Action Footer */}
                  <div className="pt-4 flex justify-between items-center">
                    <button 
                      onClick={() => router.push(`/companyprofile/services/${svc.id}`)}
                      className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors"
                    >
                      Initialize Allocation Pipeline
                      <ArrowUpRightIcon className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}