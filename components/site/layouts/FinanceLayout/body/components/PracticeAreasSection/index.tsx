"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MarketListingForm } from '@/types/typings';

// --- MINIMAL PROFESSIONAL ICONS ---
const ElegantArrowIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
  </svg>
);

const BalanceScaleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0-17.25a3.75 3.75 0 1 1-7.5 0M12 3a3.75 3.75 0 1 0 7.5 0M1 8.25h22m-1.5 0a3.75 3.75 0 0 1-7.5 0m7.5 0a3.75 3.75 0 0 0-7.5 0M3.75 8.25a3.75 3.75 0 0 1 7.5 0m-7.5 0a3.75 3.75 0 0 0 7.5 0M5.25 21h13.5" />
  </svg>
);

// --- INSTITUTIONAL ECOSYSTEM DATA ---
const defaultListings = [
  {
    id: "firm-1",
    name: "Corporate Law Matrix",
    description: "High-stakes strategic mergers, global acquisitions, structured compliance frameworks, and comprehensive international cross-border asset orchestration.",
    finalPrice: 1500,
    images: [{ url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" }],
    tag: "Tier-1 Advisory",
    metrics: "98.4% Advisory Success Rate"
  },
  {
    id: "firm-2",
    name: "Financial Architecture",
    description: "Bespoke wealth engineering, institutional deployment metrics, precise corporate tax structures, and strategic risk-mitigated asset allocations.",
    finalPrice: 2450,
    images: [{ url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" }],
    tag: "Capital Strategy",
    metrics: "$2.4B Combined Assets Managed"
  },
  {
    id: "firm-3",
    name: "IP Sovereignty Infrastructure",
    description: "Defensive patent orchestration, worldwide trademark protection protocols, technological estate custody, and aggressive global enforcement strategies.",
    finalPrice: 1820,
    images: [{ url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80" }],
    tag: "Asset Security",
    metrics: "420+ International Patents Retained"
  },
];

// --- ORCHESTRATION ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.02 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 110, damping: 20 } 
  },
};

interface PracticeAreasSectionProps {
  themeSettings?: {
    primaryColor?: string;
    accentColor?: string;
  } | null;
  marketplaceListings?: MarketListingForm[] | null;
}

export default function PracticeAreasAppSection({ themeSettings, marketplaceListings }: PracticeAreasSectionProps) {
  const listings = marketplaceListings?.length ? marketplaceListings : defaultListings;
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeAccent = themeSettings?.accentColor || "#2563EB"; 

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <section className="py-24 lg:py-36 bg-white text-slate-800 font-sans relative overflow-hidden">
      
      {/* Soft Premium Architectural Light Underlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] bg-slate-50 rounded-full blur-[130px] mix-blend-multiply" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[40rem] h-[40rem] bg-slate-50 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- EDITORIAL HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 lg:mb-24 pb-8 border-b border-slate-100 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs font-bold uppercase tracking-[0.25em] mb-3">
              <BalanceScaleIcon className="w-4 h-4 text-slate-500" /> Practice Overview
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Institutional Solutions <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-slate-500 font-bold">
                Engineered for Longevity
              </span>
            </h2>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="self-start md:self-end text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center gap-3 bg-white px-5 py-3.5 rounded-xl shadow-md shadow-slate-100/80 border border-slate-100 transition-all group"
          >
            All Practice Areas
            <ElegantArrowIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
          </motion.button>
        </div>

        {/* --- INTUITIVE EDITORIAL GRID --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.02 }}
          className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-stretch"
        >
          {listings.map((listing: any) => {
            const isHovered = hoveredId === listing.id;

            return (
              <motion.div
                key={listing.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredId(listing.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group flex flex-col justify-between bg-white border rounded-3xl p-5 transition-all duration-300 min-h-[480px] ${
                  isHovered 
                    ? "border-slate-200 shadow-2xl shadow-slate-200/60 -translate-y-1" 
                    : "border-slate-100 shadow-xl shadow-slate-100/40"
                }`}
              >
                
                {/* FRAMED IMAGE STAGE */}
                <div className="relative w-full h-56 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                  <img 
                    src={listing.images?.[0]?.url || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80"} 
                    alt={listing.name}
                    className="w-full h-full object-cover transition-transform duration-700 opacity-95 group-hover:opacity-100 group-hover:scale-[1.03]"
                  />
                  
                  {/* Clean Shadow Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />

                  {/* Clean Text-Driven Label Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                    {listing.tag && (
                      <span className="text-[10px] font-mono tracking-widest uppercase bg-white/95 border border-slate-100 px-2.5 py-1 rounded-md shadow-sm text-slate-800 font-bold">
                        {listing.tag}
                      </span>
                    )}
                    <div className="bg-slate-900 text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-md shadow-md">
                      {formatPrice(listing.finalPrice || 1000)}
                    </div>
                  </div>

                  {/* Minimal Framed Call-to-Action Node */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <motion.div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center border bg-white shadow-md text-slate-800"
                      animate={{ 
                        backgroundColor: isHovered ? activeAccent : "#FFFFFF",
                        borderColor: isHovered ? activeAccent : "#F1F5F9",
                        color: isHovered ? "#FFFFFF" : "#0F172A"
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ElegantArrowIcon className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>

                {/* --- PRACTICE DATA BLOCK --- */}
                <div className="pt-6 px-1 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                      {listing.name}
                    </h3>
                    <p className="mt-2.5 text-slate-600 text-sm leading-relaxed font-normal line-clamp-3">
                      {listing.description}
                    </p>
                  </div>
                  
                  {/* Firm Accountability Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-mono font-bold">
                    <span>
                      {listing.metrics || "Institutional Audit Verified"}
                    </span>
                    <span className="text-slate-900 text-[11px] font-bold uppercase tracking-wider group-hover:text-blue-600 transition-colors duration-300">
                      Initiate Consultation &rarr;
                    </span>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}