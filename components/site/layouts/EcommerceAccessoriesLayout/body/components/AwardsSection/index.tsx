'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { 
  TrophyIcon, 
  CheckBadgeIcon, 
  ShieldCheckIcon, 
  Cog8ToothIcon,
  FireIcon 
} from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

const loader = ({ src }: { src: string; width: number }) => src;

export default function AutomotiveAccreditations({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; // Racing Red
  
  const defaultAwards = [
    { name: 'KEBS Auto Certified', icon: <CheckBadgeIcon /> },
    { name: 'OEM Standard 2026', icon: <Cog8ToothIcon /> },
    { name: 'Track-Tested Durability', icon: <ShieldCheckIcon /> },
    { name: 'Regional Performance Leader', icon: <TrophyIcon /> },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-40 bg-zinc-50 dark:bg-[#09090b] overflow-hidden">
      
      {/* Carbon / Asphalt Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at center, #808080 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
           
      {/* Ambient Redline Glow */}
      <div className="absolute top-0 right-[20%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.03] dark:opacity-[0.08] pointer-events-none" 
           style={{ backgroundColor: primaryColor }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: High-Speed Offset Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24 items-end relative">
          
          {/* Subtle connecting track line */}
          <div className="absolute -left-6 md:-left-12 top-0 bottom-0 w-1" style={{ backgroundColor: primaryColor }} />

          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-white"
            >
              <FireIcon className="w-4 h-4 animate-pulse" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">Quality Assurance</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm">
              Certified For <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
                The Road
              </span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right pb-2 border-l-2 pl-6 lg:border-l-0 lg:pl-0 border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-loose">
              Every system, spare, and component in our garage undergoes rigorous field testing tailored for East African roads and high-performance tracks.
            </p>
          </div>
        </div>
        
        {/* Awards/Accreditation Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl;
            
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative p-12 rounded-2xl bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 hover:border-transparent transition-all duration-500 overflow-hidden"
              >
                {/* Dynamic Hover Border Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{ backgroundColor: primaryColor, opacity: 0.15 }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)] transition-opacity duration-500" />

                {/* Visual Accent: Auto Part Number */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 tracking-[0.2em] group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    SPEC_NO: 00{idx + 1}
                  </span>
                </div>

                <div className="relative flex flex-col items-center justify-center space-y-8 mt-6 z-10">
                  <div className="relative w-20 h-20 text-zinc-300 dark:text-zinc-800 group-hover:scale-110 transition-all duration-500" style={{ color: "inherit" }}>
                    {/* The icon will inherit the primary color on hover via CSS cascade hack below */}
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 dark:text-zinc-800 group-hover:opacity-0 transition-opacity duration-300">
                       {src ? (
                        <Image src={src} alt={award.name} loader={loader} fill className="object-contain grayscale opacity-50" />
                      ) : (
                        React.cloneElement(award.icon as React.ReactElement, { className: "w-full h-full" })
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: primaryColor }}>
                       {src ? (
                        <Image src={src} alt={award.name} loader={loader} fill className="object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                      ) : (
                        React.cloneElement(award.icon as React.ReactElement, { className: "w-full h-full drop-shadow-md" })
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] leading-relaxed">
                      {award.name}
                    </h3>
                    <div className="mt-5 flex justify-center gap-1.5">
                      {[1, 2, 3].map((i) => (
                        <div 
                          key={i} 
                          className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:animate-pulse transition-colors" 
                          style={{ 
                            backgroundColor: i === 1 ? primaryColor : undefined,
                            animationDelay: `${i * 150}ms`
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Global Compliance Telemetry Footer */}
        <div className="mt-20 p-8 md:p-12 rounded-2xl bg-zinc-900 dark:bg-white flex flex-col md:flex-row items-center justify-between gap-8 group shadow-xl">
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-xl bg-zinc-800 dark:bg-zinc-100">
              <ShieldCheckIcon className="w-10 h-10" style={{ color: primaryColor }} />
            </div>
            <div className="text-left text-white dark:text-zinc-900">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Parts Authentication</p>
              <p className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">OEM & ISO Certified</p>
            </div>
          </div>
          
          <div className="hidden lg:flex gap-3 flex-1 px-12 justify-center">
             {[1, 2, 3, 4, 5].map(i => (
               <div 
                 key={i} 
                 className="w-full max-w-[40px] h-1.5 rounded-full bg-zinc-800 dark:bg-zinc-200 group-hover:bg-opacity-100 transition-colors duration-700" 
                 style={{ 
                   backgroundColor: i <= 3 ? primaryColor : undefined,
                   transitionDelay: `${i * 100}ms` 
                 }} 
               />
             ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right text-white dark:text-zinc-900">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Compliance Standard</p>
              <p className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">KEBS APPROVED</p>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800 dark:bg-zinc-100">
              <CheckBadgeIcon className="w-10 h-10" style={{ color: primaryColor }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}