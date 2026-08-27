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
} from '@heroicons/react/24/outline';

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
  themeSettings: {
    primaryColor: '#00A880', 
    secondaryColor: '#3B82F6', 
  },
  tagline: 'Uncompromising digital defense tailored for modern threats.',
  promotions: [],
  name: "CyberShield",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 140,
      damping: 20,
    },
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
  const secondary = themeSettings?.secondaryColor || "#3B82F6";

  const fallbackFeatures: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "ShieldCheckIcon", title: "Proactive Defense", desc: "Always-on threat intelligence and pre-emptive measures to neutralize emerging attacks." },
    { icon: "LockClosedIcon", title: "Zero Trust Architecture", desc: "Implementing strict verification protocols, ensuring no entity is trusted by default." },
    { icon: "AdjustmentsVerticalIcon", title: "Customized Security Blueprints", desc: "Bespoke defense strategies mapped precisely to your infrastructure and compliance needs." },
    { icon: "ClockIcon", title: "24/7 Global Monitoring (SOC)", desc: "Relentless monitoring and rapid incident response backed by a world-class Security Operations Center." },
    { icon: "UserGroupIcon", title: "Elite Security Analysts", desc: "Access to a specialized team of certified ethical hackers and security architects." },
    { icon: "MagnifyingGlassIcon", title: "Continuous Vulnerability Discovery", desc: "Ongoing penetration testing and deep-dive analysis to find and patch weaknesses before they're exploited." },
  ];

  const features = promotions?.[0]?.perks?.length > 0
    ? promotions?.[0].perks.map((perk: any, idx: number) => ({
        icon: (idx % 3 === 0 ? "ShieldCheckIcon" : idx % 3 === 1 ? "LockClosedIcon" : "AdjustmentsVerticalIcon") as IconKey,
        title: perk.label,
        desc: perk.description,
      }))
    : fallbackFeatures;

  const currentTagline = tagline || storeData.tagline;

  return (
    <AnimatePresence>
      <section 
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100" 
        id="security-features"
      >
        {/* STRUCTURAL LAYOUT BASE */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-24 relative z-10">
          
          {/* CONTROL STICKY SIDEBAR AREA */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: primary }} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Core Capabilities
              </p>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              The Engine of Your Protection
            </h2>
            
            {currentTagline && (
              <p className="mt-6 text-sm text-gray-500 leading-relaxed max-w-sm">
                {currentTagline}
              </p>
            )}
          </div>

          {/* TELEMETRY MATRIX GRID OVERLAY */}
          <motion.div
            className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map(({ icon, title, desc } : { icon: string; title: string; desc: string }, idx : number) => {
              const Icon = icons[icon as IconKey] || ShieldCheckIcon;
              return (
                <motion.div
                  key={title}
                  className="group relative flex flex-col items-start transition-all duration-300"
                  variants={itemVariants}
                >
                  {/* DATA STREAM DECORATOR BADGE */}
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-5 border transition-all duration-300 bg-gray-50 text-gray-600 group-hover:bg-white group-hover:text-black shadow-sm"
                    style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                  >
                    <Icon className="w-4 h-4 stroke-[2.2]" style={{ '--hover-color': primary } as React.CSSProperties} /> 
                  </div>
                  
                  {/* INTERACTIVE COMPONENT DETAILS */}
                  <h3 className="text-md font-bold tracking-tight text-gray-900 mb-2 transition-colors duration-200 group-hover:text-black">
                    {title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {desc || 'Unwavering commitment to secure your digital presence against all known vectors.'}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}