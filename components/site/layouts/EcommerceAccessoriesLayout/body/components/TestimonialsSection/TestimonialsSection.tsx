'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  FireIcon,
  WrenchScrewdriverIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

const sampleLogs = [
  {
    authorName: 'David Omondi',
    quote: "The high-performance suspension kit completely stabilized my track car. Zero body roll on the last hairpin. Essential for competitive racing.",
    avatarUrl: 'https://i.pravatar.cc/150?u=david',
  },
  {
    authorName: 'Eng. Beatrice Kamau',
    quote: "Build quality of these aftermarket rotors is unmatched. We installed them across our fleet; the ceramic pads handle high heat perfectly.",
    avatarUrl: 'https://i.pravatar.cc/150?u=beatrice',
  },
  {
    authorName: 'Samuel Chen',
    quote: "Express dispatch and even faster lap times. This garage is our primary pit-stop partner for all engine tuning and high-spec parts.",
    avatarUrl: 'https://i.pravatar.cc/150?u=samuel',
  },
];

export default function AutomotiveTestimonialSection({ testimonials = sampleLogs }: { testimonials?: Testimonial[] | null }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; // Racing Red

  return (
    <section className="relative py-40 bg-zinc-50 dark:bg-[#09090b] overflow-hidden">
      
      {/* Background Speed Lines Overlay */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none overflow-hidden flex justify-center">
        <div className="w-[1px] h-full bg-zinc-900 dark:bg-white transform -skew-x-12 mx-32" />
        <div className="w-[1px] h-full bg-zinc-900 dark:bg-white transform -skew-x-12 mx-32" />
        <div className="w-[1px] h-full bg-zinc-900 dark:bg-white transform -skew-x-12 mx-32" />
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Track-Aligned Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24 items-end relative">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-900 dark:text-white"
            >
              <WrenchScrewdriverIcon className="w-4 h-4 animate-pulse" style={{ color: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">Driver Telemetry</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm">
              Verified <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
                Track Records
              </span>
            </h2>
          </div>
          
          <div className="lg:text-right border-l-2 lg:border-l-0 lg:border-r-2 pl-6 lg:pl-0 lg:pr-6 border-zinc-200 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-loose max-w-md ml-auto">
              Real-world performance data from our active drivers, mechanics, and tuning partners across the East African auto sector.
            </p>
          </div>
        </div>

        {/* Tactical Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {testimonials?.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15, type: "spring", stiffness: 100 }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative p-10 md:p-12 rounded-3xl bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
            >
              {/* Dynamic Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-700 blur-3xl pointer-events-none"
                style={{ backgroundColor: primaryColor }}
              />

              {/* Card Metadata (RPM Style Rating) */}
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex gap-1.5 items-end h-4">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 rounded-t-sm transition-all duration-300 group-hover:animate-pulse" 
                      style={{ 
                        height: `${100 - (i * 15)}%`, 
                        backgroundColor: primaryColor,
                        opacity: 1 - (i * 0.1) 
                      }} 
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-black font-mono text-zinc-400 dark:text-zinc-500 tracking-widest">
                    DRIVER_ID: 00{index + 1}
                  </span>
                </div>
              </div>

              <blockquote className="text-xl md:text-2xl text-zinc-900 dark:text-white font-black italic uppercase tracking-tighter mb-12 leading-snug drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-zinc-900 group-hover:to-zinc-500 dark:group-hover:from-white dark:group-hover:to-zinc-500 transition-all duration-500 relative z-10">
                "{t.quote}"
              </blockquote>

              {/* Identity Block */}
              <div className="flex items-center gap-5 pt-8 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: primaryColor }} />
                  <img
                    src={t.avatarUrl || ''}
                    alt={t.authorName || 'Operator'}
                    className="relative w-14 h-14 rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-transparent transition-all duration-500"
                  />
                </div>
                <div className="text-left flex-1">
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1.5">
                    {t.authorName}
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest transition-colors duration-500" style={{ color: primaryColor }}>
                    Verified Tuner
                  </p>
                </div>
              </div>

              <ChatBubbleBottomCenterTextIcon className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.02] dark:opacity-[0.03] text-zinc-900 dark:text-white group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Global Performance Telemetry Bar */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-24 p-8 md:p-12 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/50 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden"
        >
            {/* Subtle Gradient Backing */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{ background: `linear-gradient(45deg, transparent, ${primaryColor}, transparent)` }} />

            <div className="flex flex-col sm:flex-row items-center gap-12 sm:gap-16 relative z-10">
                <div className="text-center sm:text-left group">
                    <span className="block text-6xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter italic leading-none mb-2">99.8%</span>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                      <SparklesIcon className="w-3 h-3 group-hover:animate-spin" style={{ color: primaryColor }} />
                      Part Reliability Rating
                    </span>
                </div>
                <div className="hidden sm:block w-px h-20 bg-gradient-to-b from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />
                <div className="text-center sm:text-left group">
                    <span className="block text-6xl md:text-7xl font-black tracking-tighter italic leading-none mb-2" style={{ color: primaryColor }}>10k+</span>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                      <FireIcon className="w-3 h-3 group-hover:animate-bounce" style={{ color: primaryColor }} />
                      Orders Dispatched
                    </span>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10 w-full lg:w-auto">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 border-4 border-white dark:border-[#09090b] shadow-sm flex items-center justify-center hover:-translate-y-1 transition-transform"
                    >
                      <UserGroupIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-1">Active Network</p>
                  <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Global Tuner Nodes</p>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}