'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  StarIcon, 
  CommandLineIcon, 
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon 
} from '@heroicons/react/24/solid';

const sampleLogs = [
  {
    authorName: 'David Omondi',
    quote: "The solar-integrated power systems stabilized our entire site. Zero downtime during the last grid fluctuation. Essential for Nairobi operations.",
    avatarUrl: 'https://i.pravatar.cc/150?u=david',
  },
  {
    authorName: 'Eng. Beatrice Kamau',
    quote: "Build quality is unmatched. We deployed the hardware across three construction sites; the reinforced casing handles dust and heat perfectly.",
    avatarUrl: 'https://i.pravatar.cc/150?u=beatrice',
  },
  {
    authorName: 'Samuel Chen',
    quote: "Fast procurement and even faster delivery. SalesmanPro is our primary partner for all regional hardware scaling. Highly professional.",
    avatarUrl: 'https://i.pravatar.cc/150?u=samuel',
  },
];

export default function FieldLogSection({ testimonials = sampleLogs }: { testimonials?: Testimonial[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  return (
    <section className="relative py-40 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Structural Line Art */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Industrial Left-Aligned */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 items-end">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            >
              <CommandLineIcon className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operator Testimonials</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
              Verified <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>Field Reports</span>
            </h2>
          </div>
          
          <div className="lg:text-right border-l-4 lg:border-l-0 lg:border-r-4 border-amber-500 px-6">
            <p className="text-xl text-zinc-500 font-bold leading-tight uppercase tracking-tighter max-w-md ml-auto">
              Real-world data from our active deployment partners across the Kenyan industrial sector.
            </p>
          </div>
        </div>

        {/* Tactical Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t-2 border-l-2 border-zinc-900 dark:border-zinc-800">
          {testimonials?.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative p-12 bg-white dark:bg-zinc-950 border-r-2 border-b-2 border-zinc-900 dark:border-zinc-800 group"
            >
              {/* Card Metadata */}
              <div className="flex justify-between items-start mb-12">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-1 bg-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] font-black font-mono text-zinc-300 dark:text-zinc-700">LOG_ID: #00{index + 1}</span>
              </div>

              <blockquote className="text-2xl text-zinc-900 dark:text-white font-black italic uppercase tracking-tighter mb-12 leading-none group-hover:text-amber-500 transition-colors">
                "{t.quote}"
              </blockquote>

              {/* Identity Block */}
              <div className="flex items-center gap-4 pt-8 border-t border-zinc-100 dark:border-zinc-900">
                <img
                  src={t.avatarUrl || ''}
                  alt={t.authorName || 'Operator'}
                  className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all border-2 border-zinc-900 dark:border-zinc-100"
                />
                <div className="text-left">
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest leading-none mb-1">
                    {t.authorName}
                  </h4>
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Operational Partner
                  </p>
                </div>
              </div>

              <ChatBubbleBottomCenterTextIcon className="absolute bottom-6 right-6 w-8 h-8 opacity-5 text-zinc-900 dark:text-white group-hover:rotate-12 transition-transform" />
            </motion.div>
          ))}
        </div>

        {/* Global Performance Bar */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-32 p-12 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-12"
        >
            <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="text-center md:text-left">
                    <span className="block text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">98.4%</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Reliability Rating</span>
                </div>
                <div className="hidden md:block w-px h-16 bg-zinc-200 dark:bg-zinc-800" />
                <div className="text-center md:text-left">
                    <span className="block text-6xl font-black text-amber-500 tracking-tighter">500+</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Projects Managed</span>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-14 h-14 bg-zinc-800 border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                      <UserGroupIcon className="w-6 h-6 text-zinc-500" />
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Active Network</p>
                  <p className="text-[10px] font-bold text-zinc-400">Global Operational Nodes</p>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}