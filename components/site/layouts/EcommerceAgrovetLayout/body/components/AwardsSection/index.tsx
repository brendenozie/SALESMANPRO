'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HallOfHeritage({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#065f46';

  // Integrated sample data for fallback
  const displayAwards = awards?.length ? awards : [
    { name: 'Seed Quality Excellence 2025', iconUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e' },
    { name: 'Top Agricultural Retailer', iconUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3' },
    { name: 'Innovation in AgTech', iconUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598' },
    { name: 'Farmer\'s Choice Award', iconUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033' },
  ];

  if (!displayAwards.length) return null;

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Decorative Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
          <div className="max-w-xl text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-amber-500 mb-4"
            >
              <TrophyIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Industry Accolades</span>
            </motion.div>
            
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.95]">
              A Legacy of <br />
              <span className="italic font-serif font-light text-emerald-600">Growth & Trust.</span>
            </h2>
          </div>

          <p className="text-slate-500 font-medium max-w-xs border-l-2 border-emerald-500 pl-6 text-sm leading-relaxed">
            Our commitment to the farming community has been recognized globally for innovation, sustainability, and service.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-100 border border-slate-100 rounded-[2.5rem] overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {displayAwards.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? award?.url;
            
            return (
              <div 
                key={idx} 
                className="group relative bg-white p-12 flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-slate-50"
              >
                {/* Subtle Hover Reveal Effect */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <StarIcon className="w-4 h-4 text-amber-400" />
                </div>

                <div className="relative w-32 h-32 mb-8 grayscale group-hover:grayscale-0 transition-all duration-700 ease-out transform group-hover:scale-110">
                  {src ? (
                    <Image decoding="async"
                      src={src}
                      alt={award.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-full border border-dashed border-slate-200">
                        <TrophyIcon className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-widest leading-snug transition-colors">
                  {award.name}
                </h3>
                
                {/* Card "Footprint" */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
              </div>
            );
          })}
        </motion.div>

        {/* Global Stats Bar */}
        <div className="mt-16 flex flex-wrap justify-center gap-x-16 gap-y-8">
            <div className="text-center">
                <p className="text-3xl font-black text-slate-900">12+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Years Active</p>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="text-center">
                <p className="text-3xl font-black text-slate-900">150k</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farmers Served</p>
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div className="text-center">
                <p className="text-3xl font-black text-slate-900">98%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satisfaction</p>
            </div>
        </div>
      </div>
    </section>
  );
}