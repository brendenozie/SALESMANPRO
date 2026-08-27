'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheckIcon,      
  LockClosedIcon,        
  AdjustmentsVerticalIcon, 
  ClockIcon,             
  UserGroupIcon,         
  Cog6ToothIcon,         
  MagnifyingGlassIcon,   
} from '@heroicons/react/24/solid';

const icons = {
  ShieldCheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
};

type IconKey = keyof typeof icons;

const storeData = {
  tagline: 'Uncompromising digital defense tailored for modern threats.',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'linear' },
  },
};

interface FeaturesSectionProps { 
  themeSettings: { 
    primaryColor?: string; 
    secondaryColor?: string; 
  } | undefined | null;
  name?: string | undefined | null;
  promotions?: any[];
  tagline?: string | undefined | null;
}

export default function FeaturesSecurityMatrixLight({ themeSettings, name, promotions, tagline }: FeaturesSectionProps) {
  const primary = themeSettings?.primaryColor || "#00A880";

  const fallbackFeatures: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "ShieldCheckIcon", title: "Proactive Defense", desc: "Always-on threat intelligence and pre-emptive measures to neutralize emerging attacks." },
    { icon: "LockClosedIcon", title: "Zero Trust Architecture", desc: "Implementing strict verification protocols, ensuring no entity is trusted by default." },
    { icon: "AdjustmentsVerticalIcon", title: "Customized Blueprints", desc: "Bespoke defense strategies mapped precisely to your infrastructure and compliance needs." },
    { icon: "ClockIcon", title: "24/7 Global Monitoring", desc: "Relentless monitoring and rapid incident response backed by a world-class Security Operations Center." },
    { icon: "UserGroupIcon", title: "Elite Security Analysts", desc: "Access to a specialized team of certified ethical hackers and security architects." },
    { icon: "MagnifyingGlassIcon", title: "Continuous Discovery", desc: "Ongoing penetration testing and deep-dive analysis to find and patch weaknesses before exploit vectors open." },
  ];

  const features = promotions?.[0]?.perks?.length > 0
    ? promotions?.[0].perks.map((perk: any, idx: number) => ({
        icon: (idx % 3 === 0 ? "ShieldCheckIcon" : idx % 3 === 1 ? "LockClosedIcon" : "AdjustmentsVerticalIcon") as IconKey,
        title: perk.label,
        desc: perk.description,
      }))
    : fallbackFeatures;

  return (
    <AnimatePresence>
      <section 
        className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100" 
        id="security-features"
      >
        {/* STRUCTURAL BACKGROUND TELEMETRY MESH */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-gray-900 h-full" />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          
          {/* ASYMMETRIC MONO HEADER ROUTINE */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-20 border-b border-gray-100 pb-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px]" style={{ backgroundColor: primary }} />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  SYSTEM_CAPABILITIES // CORE_MATRIX
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1]">
                THE CORE OF YOUR DIGITAL DEFENSE
              </h2>
            </div>
            <div className="max-w-sm lg:mt-8">
              <p className="text-xs font-mono text-gray-400 leading-relaxed uppercase">
                {tagline || storeData.tagline}
              </p>
            </div>
          </div>

          {/* SYSTEM CHANNEL HARDENED GRID */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-100"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map(({ icon, title, desc } : { icon: string; title: string; desc: string }, idx : number) => {
              const Icon = icons[icon as IconKey] || ShieldCheckIcon;
              const hexIndex = `0${idx + 1}`.slice(-2);
              
              return (
                <motion.div
                  key={title}
                  className="p-8 border-r border-b border-gray-100 bg-white hover:bg-gray-50/60 transition-colors flex flex-col justify-between group min-h-[280px]"
                  variants={itemVariants}
                >
                  <div>
                    {/* METRIC HEADER BAR */}
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-mono font-bold text-gray-300 group-hover:text-gray-900 transition-colors">
                        [SYS_PERK_{hexIndex}]
                      </span>
                      <div 
                        className="w-8 h-8 flex items-center justify-center border border-gray-100 group-hover:border-gray-950 transition-colors text-gray-400 group-hover:text-gray-900"
                      >
                        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-105" /> 
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-black uppercase tracking-widest block mb-2 text-gray-400">
                      INTELLIGENCE MODULE
                    </span>

                    <h3 className="text-sm font-mono font-black uppercase tracking-tight text-gray-900 mb-3">
                      {title}
                    </h3>

                    <p className="text-xs font-mono text-gray-400 leading-relaxed">
                      {desc || 'Unwavering commitment to secure your digital presence against all known and zero-day threats.'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}