'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldExclamationIcon, 
  FingerPrintIcon,       
  LockClosedIcon,        
  RocketLaunchIcon,      
  CodeBracketSquareIcon, 
} from '@heroicons/react/24/outline'; // Swapped to line icons for crisp telemetry feel
import { ICoreValue } from '@/types/typings';

const iconMap = {
  Vigilance: ShieldExclamationIcon,
  Integrity: FingerPrintIcon,
  Protection: LockClosedIcon,
  Innovation: RocketLaunchIcon,
  Technical: CodeBracketSquareIcon,
};

type IconKey = keyof typeof iconMap;

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

interface CoreValuesSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  CoreValues: ICoreValue[];
}

export default function CoreValuesSectionSecurityLight({ themeSettings, CoreValues }: CoreValuesSectionProps) {

  const primaryColor = themeSettings?.primaryColor || '#00A880'; 

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
          icon: val.icon || defaultSecurityCoreValues[idx]?.icon || 'Vigilance',
        })).slice(0, 6) 
      : defaultSecurityCoreValues.slice(0, 6);

  return (
    <AnimatePresence>
      <section
        id="core-values"
        className="relative py-28 md:py-36 px-6 lg:px-12 bg-white text-gray-900 overflow-hidden border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-16 lg:gap-24 relative z-10">
          
          {/* CONTROL STICKY SIDEBAR AREA */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                Operational Mandate
              </p>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
              The Foundational Pillars of Our Trust
            </h2>
            
            <p className="mt-6 text-xs text-gray-500 leading-relaxed max-w-sm">
              These are the immutable internal protocols that govern our architectural execution, strategic posture, and non-negotiable security requirements.
            </p>
          </div>

          {/* TELEMETRY MATRIX GRID OVERLAY */}
          <motion.div
            className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {coreValuesToRender.map((item, idx) => {
              const IconComponent = iconMap[item.icon as IconKey] || ShieldExclamationIcon;
              
              return (
                <motion.div
                  key={item.id || `cv-${idx}`}
                  className="group relative flex flex-col items-start transition-all duration-300"
                  variants={itemVariants}
                >
                  {/* DATA STREAM DECORATOR BADGE */}
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-5 border transition-all duration-300 bg-gray-50 text-gray-600 group-hover:bg-white group-hover:text-black shadow-sm"
                    style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                  >
                    <IconComponent className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  
                  {/* METRIC SPEC TYPE INDICATOR */}
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-1.5 block">
                    Protocol // 0{idx + 1}
                  </span>

                  <h3 className="text-md font-bold tracking-tight text-gray-900 mb-2 transition-colors duration-200 group-hover:text-black">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
          
        </div>
      </section>
    </AnimatePresence>
  );
}