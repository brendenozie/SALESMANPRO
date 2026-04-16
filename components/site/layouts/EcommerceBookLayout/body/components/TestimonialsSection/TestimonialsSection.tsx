'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Testimonial } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';
import { StarIcon, HeartIcon } from '@heroicons/react/24/outline';

const sampletestimonials = [
  {
    authorName: 'Sarah Jenkins',
    quote: "The organic swaddles are a game changer. Softness redefined for the modern nursery.",
    avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
    location: 'Nairobi, KE'
  },
  {
    authorName: 'Mark Thompson',
    quote: "Sustainability meets architectural utility. The delivery was fast and the quality is felt in every thread.",
    avatarUrl: 'https://i.pravatar.cc/150?u=mark',
    location: 'London, UK'
  },
  {
    authorName: 'Elena Rodriguez',
    quote: "A curated dialogue between comfort and style. This has become my definitive nursery resource.",
    avatarUrl: 'https://i.pravatar.cc/150?u=elena',
    location: 'Madrid, ES'
  },
];

export default function TestimonialsSection({ testimonials = sampletestimonials }: { testimonials?: Testimonial[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  return (
    <section className="relative py-40 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Editorial Dialogue */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-32 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <HeartIcon className="w-4 h-4 text-zinc-300" />
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">The Human Element</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
              Verified <br />
              <span className="italic text-zinc-400 dark:text-zinc-600">Perspectives</span>
            </h2>
          </div>
          <div className="hidden lg:block pb-2">
             <div className="flex items-center gap-6">
                <span className="font-mono text-[40px] text-zinc-900 dark:text-white leading-none">4.9</span>
                <div className="space-y-1">
                   <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 text-zinc-900 dark:text-white fill-current" />)}
                   </div>
                   <p className="font-mono text-[8px] uppercase tracking-widest text-zinc-400">Index Rating</p>
                </div>
             </div>
          </div>
        </div>

        {/* Testimonials Grid: Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-100 dark:border-zinc-900">
          {testimonials?.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="p-12 border-r border-b border-zinc-100 dark:border-zinc-900 group"
            >
              <div className="flex flex-col h-full justify-between gap-16">
                
                {/* Visual Metadata */}
                <div className="flex justify-between items-start">
                  <div className="relative w-12 h-12 overflow-hidden bg-zinc-100 grayscale hover:grayscale-0 transition-all duration-700">
                     <img 
                       src={t.avatarUrl || `https://i.pravatar.cc/150?u=${t.authorName}`} 
                       alt={t.authorName || 'User Avatar'} 
                       className="w-full h-full object-cover opacity-80 group-hover:opacity-100 scale-110 group-hover:scale-100 transition-transform duration-700" 
                     />
                  </div>
                  <span className="font-mono text-[8px] text-zinc-300 dark:text-zinc-800 tracking-tighter">ID: 00{index + 1}</span>
                </div>

                {/* Content */}
                <blockquote className="space-y-6">
                  <p className="text-2xl font-serif italic text-zinc-900 dark:text-white leading-tight">
                    “{t.quote}”
                  </p>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                      {t.authorName}
                    </h4>
                    <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-400">
                      Verified Client — {'Global'}
                    </p>
                  </div>
                </blockquote>

                {/* Subtle Primary Accent */}
                <div className="w-6 h-[1px]" style={{ backgroundColor: primary }} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quantitative Social Proof Footer */}
        <div className="mt-24 pt-16 flex flex-col md:flex-row justify-between items-center gap-12 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-16">
            <div className="space-y-1">
               <p className="font-mono text-[10px] text-zinc-900 dark:text-white uppercase tracking-widest">12,000+</p>
               <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-[0.2em]">Global Shipments</p>
            </div>
            <div className="w-[1px] h-8 bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-1">
               <p className="font-mono text-[10px] text-zinc-900 dark:text-white uppercase tracking-widest">98%</p>
               <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-[0.2em]">Satisfaction Rate</p>
            </div>
          </div>

          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-10 h-10 border border-white dark:border-zinc-950 bg-zinc-100 grayscale hover:grayscale-0 transition-all cursor-crosshair overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="user" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center font-mono text-[8px]">
               +12K
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}