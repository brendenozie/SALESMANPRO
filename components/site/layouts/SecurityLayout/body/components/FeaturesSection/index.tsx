'use client';

import React from 'react';
import Image from 'next/image';
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

// Assuming context import is correct
// import { useStoreContext } from "@/contexts/StoreContext"; 
// import { StoreForm } from "@/types/typings";

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

// Fallback data for a standalone preview
const storeData = {
  themeSettings: {
    primaryColor: '#00A880', // Teal/Green for Tech/Safety
    secondaryColor: '#3B82F6', // Blue for Trust/Cyber
  },
  tagline: 'Uncompromising digital defense tailored for modern threats.',
  promotions: [],
  name: "CyberShield",
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Animation variants (No change, as they are appearance-based)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
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
  // Light accent background for the badge/tagline
  const accentBg = `${primary}20`; 

  // --- SECURITY-FOCUSED FALLBACK FEATURES (CONTENT UNCHANGED) ---
  const fallbackFeatures: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "ShieldCheckIcon", title: "Proactive Defense", desc: "Always-on threat intelligence and pre-emptive measures to neutralize emerging attacks." },
    { icon: "LockClosedIcon", title: "Zero Trust Architecture", desc: "Implementing strict verification protocols, ensuring no entity is trusted by default." },
    { icon: "AdjustmentsVerticalIcon", title: "Customized Security Blueprints", desc: "Bespoke defense strategies mapped precisely to your infrastructure and compliance needs." },
    { icon: "ClockIcon", title: "24/7 Global Monitoring (SOC)", desc: "Relentless monitoring and rapid incident response backed by a world-class Security Operations Center." },
    { icon: "UserGroupIcon", title: "Elite Security Analysts", desc: "Access to a specialized team of certified ethical hackers and security architects." },
    { icon: "MagnifyingGlassIcon", title: "Continuous Vulnerability Discovery", desc: "Ongoing penetration testing and deep-dive analysis to find and patch weaknesses before they're exploited." },
  ];

  // Dynamic data handling (unchanged)
  const features = promotions?.[0]?.perks?.length > 0
    ? promotions?.[0].perks.map((perk: any, idx: number) => ({
      icon: (idx % 3 === 0 ? "ShieldCheckIcon" : idx % 3 === 1 ? "LockClosedIcon" : "AdjustmentsVerticalIcon") as IconKey,
      title: perk.label,
      desc: perk.description,
    }))
    : fallbackFeatures;

  const brandName = name || "CyberShield";

  return (
    <AnimatePresence>
      <section 
        className="relative py-24 md:py-32 px-4 sm:px-12 bg-white text-gray-900 overflow-hidden" 
        id="security-features"
      >
        
        {/* Dynamic, blurred radial gradient background - Light Mode */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
            style={{ backgroundColor: primary }}
            animate={{ x: ['-25%', '25%', '-25%'], y: ['-25%', '25%', '-25%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
            style={{ backgroundColor: secondary }}
            animate={{ x: ['25%', '-25%', '25%'], y: ['25%', '-25%', '25%'] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Heading */}
        <div className="max-w-5xl mx-auto text-center mb-20 relative z-10">
          <motion.span
            className="inline-block text-sm font-semibold px-5 py-2 rounded-full shadow-md"
            // High-contrast badge for visibility
            style={{ backgroundColor: accentBg, color: primary, border: `1px solid ${primary}` }}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            Mission-Critical Capabilities
          </motion.span>
          <motion.h2
            className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-gray-900 drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            The Core of Your <span style={{ color: primary }}>Digital Defense</span>
          </motion.h2>
          {tagline && (
            <motion.p
              className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              {tagline || storeData.tagline}
            </motion.p>
          )}
        </div>

        {/* Feature Cards Grid (Vigilance Matrix - Light) */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map(({ icon, title, desc } : { icon: string; title: string; desc: string }, idx : number) => {
            const Icon = icons[icon as IconKey];
            return (
              <motion.div
                key={title}
                className="group rounded-xl border border-gray-200 p-8 relative z-10 transition-all duration-300 backdrop-blur-sm shadow-xl"
                // LIGHT MODE: Clean white card background
                style={{ backgroundColor: 'white' }}
                variants={itemVariants}
                // Hover effect: slight scale, lift, and a subtle shadow/glow
                whileHover={{ 
                    scale: 1.05, 
                    translateY: -8, 
                    boxShadow: `0 10px 30px ${primary}20, 0 5px 15px rgba(0,0,0,0.05)` 
                }}
              >
                {/* Digital Glow/Pulse Effect on Hover (Toned Down for Light Mode) */}
                <div
                  className="absolute inset-0 z-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-xl"
                  style={{
                    background: `radial-gradient(circle at center, ${primary}22 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />
                
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300"
                  // Icon container with clear color and a strong shadow
                  style={{
                    backgroundColor: primary,
                    boxShadow: `0 5px 15px ${primary}66`,
                  }}
                >
                  {/* White icon on primary background */}
                  <Icon className="w-8 h-8 text-white" /> 
                </div>
                <h3 className="text-2xl font-bold relative z-10 text-gray-900">
                  {title}
                </h3>
                <p className="text-md text-gray-600 mt-3 relative z-10 leading-relaxed">{desc || 'Unwavering commitment to secure your digital presence against all known and zero-day threats.'}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </AnimatePresence>
  );
}