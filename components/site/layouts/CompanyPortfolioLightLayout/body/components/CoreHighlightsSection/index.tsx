"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  TruckIcon,
  CircleStackIcon,
  CubeIcon,
  ChartBarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// --- TYPES ---
export interface ICoreValue {
  id?: string;
  title: string;
  description: string | null;
  icon: string | null;
}

interface Pillar {
  id: string;
  title: string;
  description: string;
  Icon: React.ElementType<React.SVGProps<SVGSVGElement>>;
  accentClass: string;
  bgGlowClass: string;
}

// Map string values from your database/CMS to the actual Heroicons
const iconMap: Record<string, React.ElementType<React.SVGProps<SVGSVGElement>>> = {
  CircleStackIcon,
  CubeIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
};

// Cycle styles sequentially if custom ones aren't provided by dynamic data
const colorThemes = [
  { accent: 'text-amber-500 border-amber-500/30 group-hover:border-amber-400', glow: 'from-amber-500/10 to-transparent' },
  { accent: 'text-orange-500 border-orange-500/30 group-hover:border-orange-400', glow: 'from-orange-500/10 to-transparent' },
  { accent: 'text-zinc-400 border-zinc-700 group-hover:border-zinc-500', glow: 'from-zinc-500/10 to-transparent' },
  { accent: 'text-emerald-500 border-emerald-500/30 group-hover:border-emerald-400', glow: 'from-emerald-500/10 to-transparent' },
  { accent: 'text-blue-500 border-blue-500/30 group-hover:border-blue-400', glow: 'from-blue-500/10 to-transparent' },
  { accent: 'text-indigo-500 border-indigo-500/30 group-hover:border-indigo-400', glow: 'from-indigo-500/10 to-transparent' },
];

// --- STATIC PILLARS CONFIGURATION (FALLBACK) ---
const corporatePillars: Pillar[] = [
  {
    id: 'pillar-1',
    title: 'Gold Trading Made Simple',
    description: 'We provide an easy, reliable way to buy gold. We source directly from trusted local mines and ensure every piece is verified for purity by top-tier testing labs.',
    Icon: CircleStackIcon,
    accentClass: colorThemes[0].accent,
    bgGlowClass: colorThemes[0].glow,
  },
  {
    id: 'pillar-2',
    title: 'Quality Copper Supply',
    description: 'We supply high-grade copper to factories and manufacturers worldwide. Our systems are built to handle large orders, ensuring you get the materials you need to keep your production running smoothly.',
    Icon: CubeIcon,
    accentClass: colorThemes[1].accent,
    bgGlowClass: colorThemes[1].glow,
  },
  {
    id: 'pillar-3',
    title: 'Secure & Reliable Shipping',
    description: 'We manage the entire shipping process, from start to finish. Your goods are protected by our secure transport network, careful handling, and expert oversight to ensure everything arrives safely at your doorstep.',
    Icon: TruckIcon,
    accentClass: colorThemes[2].accent,
    bgGlowClass: colorThemes[2].glow,
  },
  {
    id: 'pillar-4',
    title: 'Trusted Compliance',
    description: 'We do things the right way. We strictly follow all international trading and anti-money laundering laws, providing full transparency so you can do business with complete peace of mind.',
    Icon: ShieldCheckIcon,
    accentClass: colorThemes[3].accent,
    bgGlowClass: colorThemes[3].glow,
  },
  {
    id: 'pillar-5',
    title: 'Smart Risk Management',
    description: 'The global market can be unpredictable, but we protect you. We use proven strategies to balance costs and manage market fluctuations, keeping your investment secure and your pricing stable.',
    Icon: ChartBarIcon,
    accentClass: colorThemes[4].accent,
    bgGlowClass: colorThemes[4].glow,
  },
  {
    id: 'pillar-6',
    title: 'Connecting Global Markets',
    description: 'We bridge the gap between local resources and the global market. By linking reliable regional suppliers directly to international buyers, we create a steady, efficient flow of goods that benefits everyone.',
    Icon: GlobeAltIcon,
    accentClass: colorThemes[5].accent,
    bgGlowClass: colorThemes[5].glow,
  },
];

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

interface CorporatePillarsProps {
  pagedata?: {
    companyName?: string;
    companyDescription?: string;
    companyTagline?: string;
    sectionSubtitle?: string | null | undefined;
    sectionTitle?: string | null | undefined;
    sectionDescription?: string | null | undefined;
    CoreValues?: ICoreValue[];
  };
}

export default function CorporatePillarsSection({ pagedata }: CorporatePillarsProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const companyName = pagedata?.sectionSubtitle || "Trading Limited &bull; Operational Architecture";
  const companyDescription = pagedata?.sectionDescription || "We manage sophisticated trading channels for refined and industrial metals, combining regional sourcing access with institutional compliance, structural security, and cross-border execution precision.";
  const companyTagline = pagedata?.sectionTitle || "At the intersection of global demand and trusted supply.";

  // Transform runtime ICoreValue[] data into Pillar structures with fallback layouts
  const featuresToRender: Pillar[] = pagedata?.CoreValues && pagedata.CoreValues.length > 0
    ? pagedata.CoreValues.map((value, idx) => {
        const theme = colorThemes[idx % colorThemes.length];
        return {
          id: value.id || `dynamic-pillar-${idx}`,
          title: value.title,
          description: value.description || '',
          // Match string to component or fall back to default GlobeAltIcon
          Icon: value.icon && iconMap[value.icon] ? iconMap[value.icon] : GlobeAltIcon, 
          accentClass: theme.accent,
          bgGlowClass: theme.glow,
        };
      })
    : corporatePillars;

  return (
    <section
      id="operations"
      className="py-24 md:py-36 bg-zinc-950 text-white relative overflow-hidden"
    >
      {/* Premium Ambient Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', 
            backgroundSize: '32px 32px' 
          }} 
        />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/5 blur-[140px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[250px] bg-zinc-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* Institutional Header Section */}
        <div className="max-w-4xl mb-20 md:mb-28">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.25em] text-amber-500 font-bold mb-4"
          >
            {companyName} 
          </motion.p>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-100 leading-[1.1]"
          >
            {companyTagline}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-3xl font-light leading-relaxed"
          >
            {companyDescription}
          </motion.p>
        </div>

        {/* Pillars Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuresToRender.map((pillar) => {
            const IconComponent = pillar.Icon;
            return (
              <motion.div
                key={pillar.id}
                variants={cardVariants}
                className="group relative bg-zinc-900/40 backdrop-blur-sm border p-8 rounded-2xl transition-all duration-500 hover:bg-zinc-900/80 hover:-translate-y-1 flex flex-col justify-between h-full"
                style={{ borderColor: 'rgba(63, 63, 70, 0.4)' }} 
              >
                {/* Dynamic Metallic Glow Backing */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.bgGlowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl pointer-events-none`} />

                <div>
                  {/* Icon Frame */}
                  <div className={`w-12 h-12 mb-8 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-300 ${pillar.accentClass}`}>
                    <IconComponent className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-zinc-100 mb-3 tracking-tight group-hover:text-white transition-colors duration-300">
                    {pillar.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-light group-hover:text-zinc-300 transition-colors duration-300">
                    {pillar.description}
                  </p>
                </div>

                {/* Subtle Action Link Indicator */}
                <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center text-xs font-semibold text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
                  <span className="tracking-wider uppercase">Review Controls</span>
                  <ArrowRightIcon className="w-3 h-3 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}