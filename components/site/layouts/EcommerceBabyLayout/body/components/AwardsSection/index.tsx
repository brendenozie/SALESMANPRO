'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
// Hero Icons as requested
import { 
  TrophyIcon, 
  CheckBadgeIcon, 
  ShieldCheckIcon, 
  SparklesIcon 
} from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => src;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  
  // Baby-themed fallback data
  const defaultAwards = [
    { name: 'Mother & Baby Gold 2026', icon: <CheckBadgeIcon /> },
    { name: 'Eco-Friendly Choice', icon: <SparklesIcon /> },
    { name: 'Dermatologically Tested', icon: <ShieldCheckIcon /> },
    { name: 'Top Rated Nursery Brand', icon: <TrophyIcon /> },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill={primary} d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,77.3,-44.7C85.4,-31.3,90.5,-15.7,89.5,-0.6C88.5,14.6,81.4,29.1,72.3,42.4C63.1,55.7,51.9,67.7,38.5,75.1C25.1,82.5,9.6,85.2,-5.9,82.8C-21.4,80.4,-36.9,72.9,-50.3,62.5C-63.7,52.1,-75,38.8,-80.6,23.5C-86.2,8.2,-86.1,-9.1,-80.7,-24.6C-75.3,-40.1,-64.6,-53.8,-51.2,-61.1C-37.8,-68.4,-21.7,-69.3,-6.5,-73.5C8.7,-77.7,17.4,-85.2,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trusted Worldwide</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
            Recognized for <span className="italic font-serif" style={{ color: primary }}>Quality</span> & Safety
          </h2>
          
          <p className="text-lg text-slate-500 font-medium">
            We are proud to be honored by leading parenting and health organizations for our commitment to baby wellness.
          </p>
        </div>
        
        {/* Awards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl;
            
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative flex flex-col items-center p-10 rounded-[3rem] bg-[#FAF9F6] hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500"
              >
                {/* Award Icon Wrapper */}
                <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                   <div 
                    className="absolute inset-0 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ backgroundColor: primary }}
                   />
                   
                   <div className="relative z-10 w-full h-full text-slate-300 group-hover:text-slate-900 transition-colors duration-500">
                    {src ? (
                      <Image
                        src={src}
                        alt={award.name}
                        loader={loader}
                        fill
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      React.cloneElement(award.icon as React.ReactElement, { className: "w-full h-full" })
                    )}
                   </div>
                </div>

                <div className="text-center">
                  <h3 className="text-sm font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest transition-colors duration-500 leading-relaxed">
                    {award.name}
                  </h3>
                </div>

                {/* Bottom Accents */}
                <div 
                  className="absolute bottom-6 w-8 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{ backgroundColor: primary }}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating "Safety Certified" Stamp */}
        <div className="mt-20 flex justify-center">
           <div className="px-8 py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center gap-4 grayscale opacity-40">
              <ShieldCheckIcon className="w-8 h-8 text-slate-400" />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Safety Standards</p>
                <p className="text-[10px] font-bold text-slate-400">ISO 9001:2026 Certified Facility</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}