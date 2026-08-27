'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/outline';

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3', name: 'Sustainability Excellence' },
    { iconUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598', name: 'Global Tech Vanguard' },
    { iconUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033', name: 'Innovation of the Year' },
    { iconUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e', name: 'Customer Choice 2026' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Soft Ambient Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primary} 0%, transparent 70%)` }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Elegant Header */}
        <div className="text-center mb-24 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 shadow-sm"
          >
            <StarIcon className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-gray-500">Industry Recognition</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none"
          >
            Award-Winning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-500 to-gray-900">Expertise.</span>
          </motion.h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="group flex flex-col items-center text-center"
              >
                {/* Floating Image Container */}
                <div className="relative w-48 h-48 mb-8">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: idx * 0.5 }}
                    className="relative w-full h-full p-8 bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-50 flex items-center justify-center overflow-hidden"
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={award.name}
                        className="w-full h-full object-contain filter grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                      />
                    ) : (
                      <TrophyIcon className="w-16 h-16 text-gray-200 transition-colors duration-500 group-hover:text-amber-500" />
                    )}

                    {/* Glass Refraction Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </motion.div>

                  {/* Shadow that shrinks/expands with float */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-900/5 blur-xl rounded-full scale-100 group-hover:scale-125 transition-transform duration-500" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">
                    {award.name}
                  </h3>
                  <div className="w-12 h-0.5 bg-gray-100 mx-auto transition-all duration-500 group-hover:w-20 group-hover:bg-amber-400" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Confidence Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-32 pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-center gap-12 grayscale opacity-50"
        >
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Proudly Verified By</span>
          <div className="flex flex-wrap justify-center gap-12">
            {/* These would be small grey-scale logos of certifying bodies */}
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-6 w-28 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}