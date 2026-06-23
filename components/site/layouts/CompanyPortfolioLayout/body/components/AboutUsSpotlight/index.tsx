"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { 
  GlobeAmericasIcon, 
  ShieldCheckIcon, 
  ArrowUpRightIcon,
  CircleStackIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

// --- INSTITUTIONAL PROFILE DATA ---
const enterpriseData = {
  name: 'Auram Limited',
  tagline: 'Risk-Insulated Physical Commodity Execution',
  profileNarrative: "Auram Limited operates at the absolute intersection of localized primary extraction and structured global market demand. We handle downstream logistics, validation, and multi-market delivery of refined metals through deeply integrated, compliance-locked clearings. By reinforcing regional supplier relationships with tier-1 international execution protocols, we insulate both sides of the trade ledger from structural market volatility.",
  
  // High-fidelity asset image focusing on industrial refining/bulk logistics architecture
  profileImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop', 
  
  metrics: [
    { id: 'm-1', label: "Refined Volume Handled", value: "340k+ MT", order: 1, Icon: CircleStackIcon },
    { id: 'm-2', label: "Verified Sourcing Hubs", value: "12 Nodes", order: 2, Icon: ScaleIcon },
    { id: 'm-3', label: "Compliance Baseline", value: "Tier-1", order: 3, Icon: ShieldCheckIcon },
    { id: 'm-4', label: "Global Clearing Terminal Ports", value: "24 Routes", order: 4, Icon: GlobeAmericasIcon },
  ],
};

// --- FRAMER MOTION STYLES ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const metricItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

// --- ENTERPRISE METRIC CARD ---
const MetricCard = ({ metric }: { metric: any }) => {
  const IconComponent = metric.Icon;
  return (
    <motion.div
      variants={metricItemVariants}
      className="group relative bg-zinc-900/30 border border-zinc-900/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 hover:bg-zinc-900/60 hover:border-zinc-800"
    >
      {/* Absolute Micro Ambient Light Flare on hover */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none" />
      
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-zinc-600 group-hover:text-zinc-500 transition-colors">
          [0{metric.order}]
        </span>
      </div>

      <div className="mt-8">
        <h3 className="text-3xl font-bold text-zinc-100 tracking-tight leading-none">
          {metric.value}
        </h3>
        <p className="text-xs font-medium tracking-wide text-zinc-400 mt-2">
          {metric.label}
        </p>
      </div>
    </motion.div>
  );
};

// --- MAIN PROFILE COMPONENT ---
export default function CorporateProfileSection({pagedata}: {pagedata: any}) {

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  // const metricsToRender = pagedata.metrics ? pagedata.metrics : enterpriseData.metrics;
  
  const metricsToRender = enterpriseData.metrics;

  return (
    <section id="corporate-profile" className="py-24 md:py-36 bg-zinc-950 text-white font-sans overflow-hidden relative">
      
      {/* Structural Framing Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-zinc-800" />
        <div className="absolute inset-x-0 top-1/3 h-[1px] bg-zinc-900" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* LEFT PANEL: Cinematic Media Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative h-[380px] md:h-[520px] w-full"
          >
            {/* Fine Outer Tech Border Layout */}
            <div className="absolute -inset-3 border border-zinc-900 rounded-2xl pointer-events-none" />
            
            <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={pagedata.bannerUrl || enterpriseData.profileImageUrl}
                alt="Institutional trading desk operations tracking bulk commodities markets"
                fill
                className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity transform hover:scale-102 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
                loader={({ src }) => `${src}?q=80&w=800&auto=format&fit=crop`}
              />
              {/* Internal Bottom Vignette Shield Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-90" />
            </div>

            {/* Micro Corner Highlight Markers instead of a large star accent */}
            <div className="absolute top-0 left-0 w-2 h-[1px] bg-amber-500" />
            <div className="absolute top-0 left-0 h-2 w-[1px] bg-amber-500" />
          </motion.div>
          
          {/* RIGHT PANEL: Executive Statement & Strategic Index */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-bold mb-3">
              Corporate Infrastructure
            </p>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight leading-[1.15] mb-6">
              Connecting localized extraction to <span className="text-zinc-500 font-normal italic">sovereign clearings</span>.
            </h2>
            
            <p className="text-zinc-400 text-base md:text-lg font-light leading-relaxed mb-10 text-justify">
              {pagedata.description || enterpriseData.profileNarrative}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#trade-desk"
                className="inline-flex items-center gap-2.5 bg-zinc-100 text-zinc-950 font-bold py-3.5 px-7 rounded-xl shadow-lg text-xs tracking-wider uppercase hover:bg-white transition-all duration-300 transform hover:scale-[1.01]"
              >
                Inquire Allocation Parameters
                <ArrowUpRightIcon className="w-4 h-4 text-zinc-950" />
              </a>
              
              <a
                href="#compliance-reports"
                className="inline-flex items-center gap-2 border border-zinc-800 text-zinc-300 font-bold py-3.5 px-7 rounded-xl text-xs tracking-wider uppercase bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300"
              >
                Download Transparency Matrix
              </a>
            </div>
          </motion.div>
        </div>

        {/* INTEGRATED DATA LAYOUT: Fluid Footprint Performance Dashboard */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-24 pt-12 border-t border-zinc-900"
        >
          {metricsToRender.map((metric : any, index: number) => (
            <MetricCard key={`${metric.id}-${index}`} metric={metric} />
          ))}
        </motion.div>

      </div>
    </section>
  );
}