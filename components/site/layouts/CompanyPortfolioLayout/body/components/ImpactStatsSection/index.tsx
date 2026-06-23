'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  CurrencyDollarIcon, 
  GlobeAsiaAustraliaIcon, 
  ShieldCheckIcon, 
  ArrowUpRightIcon,
  CpuChipIcon 
} from '@heroicons/react/24/outline';

// --- INSTITUTIONAL LEDGER CONFIGURATION ---
const sectionTitle = "Institutional Volume & Performance";
const firmName = "Trading Limited"; 

const performanceMetrics = [
  { 
    id: 'gt-metric-1', 
    value: "$480M+", 
    label: "Settled Transactional Cleared Value", 
    order: 1, 
    Icon: CurrencyDollarIcon 
  },
  { 
    id: 'gt-metric-2', 
    value: "14", 
    label: "Active Sovereign Corridors", 
    order: 2, 
    Icon: GlobeAsiaAustraliaIcon 
  },
  { 
    id: 'gt-metric-3', 
    value: "99.84%", 
    label: "On-Time Operational Fulfillment", 
    order: 3, 
    Icon: CpuChipIcon 
  },
  { 
    id: 'gt-metric-4', 
    value: "Tier-1", 
    label: "Regulatory Audit Classification", 
    order: 4, 
    Icon: ShieldCheckIcon 
  },
];

// --- PRODUCTION-READY ANIMATION ARCHITECTURE ---
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const metricTileVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// --- DATA PLATE COMPONENT ---
const MetricTile = ({ metric }: { metric: typeof performanceMetrics[0] }) => {
  const IconComponent = metric.Icon;

  return (
    <motion.div
      variants={metricTileVariants}
      className="group relative bg-zinc-900/20 backdrop-blur-sm border border-zinc-900 rounded-xl p-6 md:p-8 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:bg-zinc-900/40 hover:border-zinc-800"
    >
      {/* Structural Anchor Micro Lights */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.02] blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-900/80 text-zinc-500 group-hover:text-amber-500 transition-colors duration-300 shadow-inner">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-600 select-none">
            // SYS_0{metric.order}
          </span>
        </div>

        {/* Scaled Quantitative Readout */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-none">
          {metric.value}
        </h3>
      </div>
      
      {/* Technical Definitive Subtitle */}
      <p className="mt-4 text-xs font-medium tracking-wide text-zinc-400 border-t border-zinc-900 pt-4 group-hover:text-zinc-300 transition-colors">
        {metric.label}
      </p>
    </motion.div>
  );
};

// --- MAIN PERFORMANCE SECTION ---
export default function PerformanceMetricsDashboard({pagedata}: {pagedata: any}) {
  const [ref, inView] = useInView({ 
    triggerOnce: true, 
    threshold: 0.1 
  });

  const orderedMetrics = [...performanceMetrics].sort((a, b) => a.order - b.order);

  return (
    <section id="performance-ledger" className="py-24 md:py-32 bg-zinc-950 text-white font-sans relative overflow-hidden">
      
      {/* Structural Blueprint Grid Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-x-0 bottom-1/4 h-[1px] bg-zinc-900" />
        <div className="absolute left-1/4 inset-y-0 w-[1px] bg-zinc-900 hidden lg:block" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Upper Editorial Header Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start mb-20">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
              Audited Capital Realization
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase leading-none">
              {sectionTitle}
            </h2>
          </div>
          
          <div className="lg:col-span-7 lg:border-l lg:border-zinc-900 lg:pl-10">
            <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed text-justify">
              The continuous scale of our processing network relies entirely upon automated compliance checking, multi-asset security vaults, and precision timing. These verified ledgers map the continuous operational throughput generated under the direction of **{pagedata.name || firmName}**.
            </p>
          </div>
        </div>

        {/* Quant Matrix Grid */}
        <motion.div 
          ref={ref} 
          variants={gridContainerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {orderedMetrics.map((stat) => (
            <MetricTile key={stat.id} metric={stat} />
          ))}
        </motion.div>
        
        {/* Verification Sub-Action Ledger */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex justify-center"
        >
          {/* <a 
            href="#audit-ledger" 
            className="inline-flex items-center gap-2.5 border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-800 text-zinc-300 hover:text-zinc-100 font-bold py-3.5 px-8 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-md group"
          >
            Access Real-Time Audit Vault
            <ArrowUpRightIcon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
          </a> */}
        </motion.div>

      </div>
    </section>
  );
}