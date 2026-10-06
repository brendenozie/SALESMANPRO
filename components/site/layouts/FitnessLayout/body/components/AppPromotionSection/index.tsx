"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  CalendarDaysIcon,
  VideoCameraIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  FireIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src }: { src: string }) => src;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const floatAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// --- Sub-Components ---

const FeaturePill = ({ icon: Icon, text, primaryColor }: { icon: any, text: string, primaryColor: string }) => (
  <div 
    className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-900/60 group transition-all duration-300"
    style={{ ['--hover-border' as any]: primaryColor }}
  >
    <style>{`
      .group:hover { border-color: ${primaryColor}80 !important; }
    `}</style>
    <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" style={{ color: primaryColor }} />
    <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-colors">
      {text}
    </span>
  </div>
);

const TacticalStat = ({ icon: Icon, label, value, className, delay = 0, primaryColor }: any) => (
  <motion.div
    className={`absolute z-30 p-5 bg-white/90 dark:bg-neutral-950/80 border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur-md flex flex-col gap-2 min-w-[170px] rounded-2xl shadow-lg ${className}`}
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    animate={floatAnimation}
    transition={{ delay }}
  >
    <div className="flex justify-between items-center">
      <Icon className="w-5 h-5" style={{ color: primaryColor }} />
      <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
    </div>
    <div>
      <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase font-black tracking-[0.2em]">{label}</p>
      <p className="text-xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase">{value}</p>
    </div>
  </motion.div>
);

export default function AppPromotion() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 border-t border-neutral-200/60 dark:border-neutral-900/40">
      {/* Structural Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-neutral-50 via-transparent to-neutral-50 dark:from-neutral-950 dark:to-neutral-950" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* LEFT: Content Core */}
          <motion.div
            className="flex-1 order-2 lg:order-1 w-full"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-12" style={{ backgroundColor: primaryColor }} />
              <span className="text-xs font-black tracking-[0.35em] uppercase" style={{ color: primaryColor }}>
                System v2.0 Operational
              </span>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-8xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-8">
              Digital <br />
              <span className="text-neutral-200 dark:text-neutral-900 transition-colors">Architecture</span>
            </motion.h2>

            <motion.p variants={itemVariants} className="text-neutral-500 dark:text-neutral-400 font-medium text-sm md:text-base leading-relaxed uppercase mb-10 max-w-lg">
              Your performance ecosystem, recalibrated. AI-driven protocols, biometric syncing, and world-class instructional content delivered with surgical precision.
            </motion.p>

            {/* Tactical Grid Layout */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-xl">
              <FeaturePill icon={CpuChipIcon} text="Neural Sync" primaryColor={primaryColor} />
              <FeaturePill icon={VideoCameraIcon} text="4K Live Stream" primaryColor={primaryColor} />
              <FeaturePill icon={ChartBarSquareIcon} text="Bio-Analytics" primaryColor={primaryColor} />
              <FeaturePill icon={CalendarDaysIcon} text="Duty Cycles" primaryColor={primaryColor} />
            </motion.div>

            {/* Download Interface Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 sm:gap-8">
              <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                <a href="#" className="h-14 w-full sm:w-44 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl flex items-center justify-center px-4 py-2 font-black tracking-wider text-[11px] uppercase border border-transparent shadow-md hover:opacity-90 transition-opacity">
                  App Store
                </a>
                <a href="#" className="h-14 w-full sm:w-44 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl flex items-center justify-center px-4 py-2 font-black tracking-wider text-[11px] uppercase border border-transparent shadow-md hover:opacity-90 transition-opacity">
                  Google Play
                </a>
              </div>
              
              <div className="flex items-center gap-4 py-2 px-5 border-l border-neutral-200 dark:border-neutral-800 transition-colors w-full sm:w-auto justify-center sm:justify-start">
                <div className="p-1.5 bg-neutral-900 dark:bg-white rounded-lg shadow-sm">
                  <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-900 rounded flex items-center justify-center text-[8px] font-black text-neutral-900 dark:text-white border border-neutral-200 dark:border-transparent">
                    QR
                  </div>
                </div>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-black uppercase tracking-widest leading-tight">
                  Instant <br/> Deploy
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Visual Command Center */}
          <motion.div
            className="flex-1 relative order-1 lg:order-2 py-8 lg:py-12 flex justify-center items-center w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Central Glow Vector Mesh */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[110px] opacity-20 dark:opacity-25 pointer-events-none" 
              style={{ backgroundColor: primaryColor }}
            />

            {/* Floating Telemetry Badges */}
            <TacticalStat 
              icon={FireIcon} 
              label="Metabolic Output" 
              value="1,240 KCAL" 
              className="-top-2 left-4 hidden xl:flex" 
              primaryColor={primaryColor}
            />

            <TacticalStat 
              icon={CheckCircleIcon} 
              label="Compliance" 
              value="98.4%" 
              className="bottom-14 right-4 hidden xl:flex" 
              delay={0.4}
              primaryColor={primaryColor}
            />

            {/* Device Hardware Wrapper */}
            <div className="relative z-20 group">
              <div className="relative w-[270px] h-[560px] sm:w-[290px] sm:h-[600px] border-[10px] border-neutral-900 dark:border-neutral-900 bg-neutral-900 rounded-[3rem] shadow-2xl overflow-hidden ring-4 ring-neutral-200/50 dark:ring-neutral-900/50">
                <Image decoding="async"
                  src="/images/app-mockup-main.png"
                  alt="Interface Telemetry Asset"
                  fill
                  className="object-cover grayscale dark:opacity-95 group-hover:grayscale-0 transition-all duration-700 ease-out"
                  priority
                />
                
                {/* Horizontal Scanline Overlay Line */}
                <div 
                  className="absolute top-0 left-0 w-full h-1 opacity-60 z-30 pointer-events-none animate-scan" 
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 12px ${primaryColor}`
                  }} 
                />
                
                {/* Micro Glare Sheet */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
              </div>
              
              {/* Outer Peripheral Safety Ring */}
              <div className="absolute -inset-4 border border-neutral-200 dark:border-neutral-900 rounded-[3.5rem] pointer-events-none transition-all duration-700 group-hover:border-neutral-300 dark:group-hover:border-neutral-800" />
            </div>
          </motion.div>

        </div>
      </div>
      
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 4.5s linear infinite;
        }
      `}</style>
    </section>
  );
}