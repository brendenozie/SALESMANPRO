'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldExclamationIcon,
  FingerPrintIcon,
  LockClosedIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  CodeBracketSquareIcon,
} from '@heroicons/react/24/solid';
import { ICoreValue } from '@/types/typings';

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      duration: 0.4,
      ease: 'linear',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'linear' },
  },
};

const iconMap = {
  Vigilance: ShieldExclamationIcon,
  Integrity: FingerPrintIcon,
  Protection: LockClosedIcon,
  Innovation: RocketLaunchIcon,
  Technical: CodeBracketSquareIcon,
};

type IconKey = keyof typeof iconMap;

interface CoreValuesSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  CoreValues: ICoreValue[];
}

export default function CoreValuesSectionSecurityLight({ themeSettings, CoreValues }: CoreValuesSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6';

  const defaultSecurityCoreValues: ICoreValue[] = [
    {
      id: "cv1",
      title: "Unwavering Vigilance",
      description: "We maintain a 24/7 proactive stance, ensuring threats are predicted and mitigated before they materialize.",
      icon: "Vigilance",
    },
    {
      id: "cv2",
      title: "Absolute Integrity",
      description: "Confidentiality, transparency, and ethical conduct are non-negotiable in all our client engagements.",
      icon: "Integrity",
    },
    {
      id: "cv3",
      title: "Client-Centric Protection",
      description: "Our solutions are tailored, prioritizing your business continuity and specific compliance requirements above all else.",
      icon: "Protection",
    },
    {
      id: "cv4",
      title: "Relentless Innovation",
      description: "We continuously adapt our defense strategies, leveraging the latest AI and threat intelligence to stay ahead of adversaries.",
      icon: "Innovation",
    },
    {
      id: "cv5",
      title: "Technical Mastery",
      description: "Our team comprises certified, elite experts with deep domain knowledge in penetration testing and security architecture.",
      icon: "Technical",
    },
  ];

  const coreValuesToRender: ICoreValue[] =
    CoreValues && CoreValues.length > 0
      ? CoreValues.map((val: any, idx: number) => ({
          ...val,
          label: val.label || defaultSecurityCoreValues[idx]?.icon || 'Vigilance',
        })).slice(0, 5)
      : defaultSecurityCoreValues.slice(0, 5);

  const gridClass = coreValuesToRender.length === 3 
    ? "lg:grid-cols-3" 
    : coreValuesToRender.length === 4 
      ? "md:grid-cols-2 lg:grid-cols-4" 
      : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <AnimatePresence>
      <section
        id="core-values"
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 border-b border-gray-100 overflow-hidden"
      >
        {/* STRUCTURAL TELEMETRY MESH */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-gray-900 h-full" />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* ASYMMETRIC HEADER SPLIT */}
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-20 border-b border-gray-100 pb-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
                <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                  OPERATIONAL_PILLARS // CORE
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1]">
                FOUNDATIONAL PILLARS OF RISK MITIGATION
              </h2>
            </div>
            <p className="text-xs font-mono text-gray-400 leading-relaxed max-w-sm lg:mt-8">
              Systemized core architectural vectors defining explicit transparency matrices, non-negotiable compliance parameters, and absolute defense execution routines.
            </p>
          </div>

          {/* HIGH-DENSITY FRAME GRID */}
          <motion.div
            className={`grid grid-cols-1 gap-0 border-t border-l border-gray-100 ${gridClass}`}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {coreValuesToRender.map((item, idx) => {
              const IconComponent = iconMap[item.icon as IconKey] || ShieldExclamationIcon;
              const nodeString = `0${idx + 1}`.slice(-2);
              
              return (
                <motion.div
                  key={item.id || `cv-${idx}`}
                  className="p-8 border-r border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors flex flex-col justify-between group relative"
                  variants={cardVariants}
                >
                  <div>
                    {/* NODE IDENTIFIER STRIP */}
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-[10px] font-mono font-bold text-gray-300 group-hover:text-gray-900 transition-colors">
                        [PLR_VAL_{nodeString}]
                      </span>
                      <IconComponent 
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest block mb-2 text-gray-400">
                      METRIC // {item.icon}
                    </span>
                    
                    <h3 className="text-sm font-mono font-black uppercase tracking-tight text-gray-900 mb-3">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs font-mono text-gray-400 leading-relaxed mb-8">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {/* UTILITY TELEMETRY STREAM ROW */}
                  <button
                    className="inline-flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors text-left w-fit mt-auto"
                  >
                    Query Directive Protocol
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* STATIC FAULT STATE TELEMETRY HEADER */}
          {coreValuesToRender.length === 0 && (
            <div className="text-center font-mono text-[10px] text-gray-400 mt-12 uppercase tracking-widest">
              STATUS_ERR // NO_INPUT_DATAFEED // LOADED_DEFAULT_REGISTRIES
            </div>
          )}
        </div>
      </section>
    </AnimatePresence>
  );
}