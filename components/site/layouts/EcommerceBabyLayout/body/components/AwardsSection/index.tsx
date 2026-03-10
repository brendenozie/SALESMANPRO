'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
// Using Hero Icons as per saved preference
import { 
  TrophyIcon, 
  CheckBadgeIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  StarIcon 
} from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15, delayChildren: 0.3 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => src;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  
  const defaultAwards = [
    { name: 'Mother & Baby Gold 2026', icon: <CheckBadgeIcon /> },
    { name: 'Eco-Friendly Choice', icon: <SparklesIcon /> },
    { name: 'Dermatologically Tested', icon: <ShieldCheckIcon /> },
    { name: 'Top Rated Nursery Brand', icon: <TrophyIcon /> },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-[#FBFAFC] dark:bg-zinc-950 overflow-hidden">
      {/* Abstract Soft Background Shape */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] opacity-[0.07] pointer-events-none translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: primary }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] blur-[100px] opacity-[0.05] pointer-events-none -translate-x-1/2 translate-y-1/2 rounded-full bg-sky-400" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm mb-8"
          >
            <StarIcon className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Excellence in Care</span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-[1.1] tracking-tighter">
            Globally Recognized for <br/>
            <span className="italic font-serif font-light px-2" style={{ color: primary }}>Safety & Quality</span>
          </h2>
        </div>
        
        {/* Awards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl;
            
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -12 }}
                className="group relative flex flex-col items-center p-12 rounded-[4rem] bg-white dark:bg-zinc-900 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500"
              >
                {/* Visual Accent */}
                <div className="absolute top-6 right-6 w-3 h-3 rounded-full opacity-10 group-hover:opacity-100 transition-all duration-700" style={{ backgroundColor: primary }} />

                {/* Award Icon Wrapper */}
                <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                   <div 
                    className="absolute inset-0 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                    style={{ backgroundColor: primary }}
                   />
                   
                   <div className="relative z-10 w-full h-full text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:scale-110 transition-all duration-700 ease-out">
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

                <div className="text-center space-y-2">
                  <h3 className="text-[12px] font-black text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white uppercase tracking-widest transition-colors duration-500 leading-tight">
                    {award.name}
                  </h3>
                  <div className="w-0 h-[2px] bg-zinc-100 dark:bg-zinc-800 mx-auto group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating Certification Footer */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all"
        >
            <div className="flex items-center gap-4">
                <ShieldCheckIcon className="w-10 h-10 text-zinc-400" />
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Facility Standard</p>
                    <p className="text-xs font-bold text-zinc-400">ISO 9001:2026 Certified</p>
                </div>
            </div>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden md:block" />
            <div className="flex items-center gap-4">
                <CheckBadgeIcon className="w-10 h-10 text-zinc-400" />
                <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sustainability</p>
                    <p className="text-xs font-bold text-zinc-400">OEKO-TEX® Confirmed</p>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}