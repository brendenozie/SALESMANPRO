'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import {
  ClockIcon,
  TagIcon,
  Squares2X2Icon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';

interface FeaturesSectionProps {
  features?: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
  themeSettings?: any;
}

// Fallback high-fidelity content if context/props list needs defaults shoes store
const DEFAULT_FEATURES = [
  {
    id: 1,
    title: '10 minute shoe delivery',
    description:
      'Get your order delivered to your doorstep at the earliest from our shoe pickup stores near you.',
    icon: ClockIcon,
  },
  {
    id: 2,
    title: 'Best Prices & Offers',
    description:
      'Cheaper prices than your local shoe store, great cashback offers to top it off. Get best prices & offers.',
    icon: TagIcon,
  },
  {
    id: 3,
    title: 'Wide Shoe Selection',
    description:
      'From sneakers to formal shoes, explore a vast collection of footwear for every style and occasion.',
    icon: Squares2X2Icon,
  },
  {
    id: 4,
    title: 'Easy Returns & Exchanges',
    description:
      'Not satisfied with your purchase? Enjoy hassle-free returns and exchanges on all shoe orders.',
    icon: ArrowUturnLeftIcon,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
};

export default function FeaturesSection({ features, themeSettings }: FeaturesSectionProps) {
  const primary = themeSettings?.primaryColor || '#18181b'; 
  const displayFeatures = features && features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden border-t border-zinc-200/50 dark:border-zinc-900/60">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Core Layout Blueprint Framework */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Sticky Left Layout Manifesto Anchor */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 block mb-2">
                Operational Framework
              </span>
              <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                Engineered <br />
                <span className="text-zinc-400 dark:text-zinc-500 font-normal italic font-serif lowercase">to the</span> <br />
                Highest Spec
              </h2>
            </div>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-sm font-medium">
              Every interface layer, distribution pipeline, and user verification channel is calibrated for high-throughput luxury retail processing.
            </p>
            
            {/* Design Language Technical Calibration Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200/60 dark:border-zinc-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black tracking-widest text-zinc-800 dark:text-zinc-300 uppercase">
                System Latency: 0.04ms
              </span>
            </div>
          </div>

          {/* Right Layout Module: Bento Dynamic Spec Cells */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {displayFeatures.map((feature, idx) => {
              const Icon = feature.icon || Squares2X2Icon;
              
              return (
                <motion.div
                  key={feature.id || idx}
                  variants={cardVariants}
                  className="group relative flex flex-col justify-between p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-transparent dark:border-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)]"
                >
                  {/* Dynamic Pointer Radial Glow Layer */}
                  <div 
                    className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.02] transition-opacity duration-700 blur-xl pointer-events-none scale-90"
                    style={{ backgroundColor: primary === '#18181b' ? '#ffffff' : primary }}
                  />

                  {/* Top Block: Interface Telemetry / Icon Assembly */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="relative">
                      {/* Soft underlying component glow */}
                      <div 
                        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 scale-120"
                        style={{ backgroundColor: primary === '#18181b' ? '#d4d4d8' : primary }}
                      />
                      <div className="h-14 w-14 relative z-10 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-500 ease-out overflow-hidden">
                        {/* Interactive sliding color backplate layer */}
                        <div 
                          className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out -z-10"
                          style={{ backgroundColor: primary === '#18181b' ? '#ffffff' : primary }}
                        />
                        <Icon className="w-6 h-6 stroke-[1.75]" />
                      </div>
                    </div>

                    {/* Industrial Index Reference Coordinates */}
                    <span className="font-mono text-[10px] font-bold text-zinc-300 dark:text-zinc-700 tracking-wider">
                      // 0{idx + 1}
                    </span>
                  </div>

                  {/* Bottom Block: Informational Typography Frame */}
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>

                  {/* Accent Line Blueprint Asset */}
                  <div className="w-12 h-[2px] bg-zinc-100 dark:bg-zinc-800 mt-6 group-hover:w-full transition-all duration-700 ease-out" />
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </div>
    </section>
  );
}