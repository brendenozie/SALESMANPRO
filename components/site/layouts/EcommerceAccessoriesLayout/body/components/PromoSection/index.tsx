'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, WrenchIcon, BoltIcon, Square3Stack3DIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Link from 'next/link';

export default function AutomotivePromoSection({ promotions }: { promotions: IPromotion[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#ea580c'; // High-octane Orange/Amber

  if (!promotions || promotions.length === 0) return null;

  // --- SINGLE PROMO: THE "PERFORMANCE INJECTOR" BANNER ---
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-24 bg-white dark:bg-[#050505] overflow-hidden border-y border-zinc-200 dark:border-zinc-900 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none mix-blend-overlay" 
             style={{ 
               backgroundImage: `linear-gradient(${primary} 1px, transparent 1px), linear-gradient(90deg, ${primary} 1px, transparent 1px)`, 
               backgroundSize: '40px 40px' 
             }} 
        />
        
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-zinc-100 dark:bg-[#0a0a0a] overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[600px] lg:min-h-[700px] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl group"
          >
            {/* Structural Accent Lines - Dynamic */}
            <div className="absolute top-0 left-0 w-full h-1 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out z-20" style={{ backgroundColor: primary }} />
            <div className="absolute top-0 left-0 w-1 h-full origin-top transform scale-y-0 group-hover:scale-y-100 transition-transform duration-1000 delay-300 ease-out z-20" style={{ backgroundColor: primary }} />
            
            <div className="relative z-10 flex-1 p-12 md:p-20 lg:p-28 flex flex-col justify-center space-y-8 bg-gradient-to-r from-zinc-100 via-zinc-100/95 to-transparent dark:from-[#0a0a0a] dark:via-[#0a0a0a]/95 dark:to-transparent">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3"
              >
                <div className="p-2 border border-amber-500/30 bg-amber-500/10 rounded-sm">
                  <BoltIcon className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-400">Featured Upgrade</span>
              </motion.div>

              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-zinc-900 dark:text-white leading-[0.8] tracking-tighter uppercase relative">
                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500 pb-2">
                  {promo.title}
                </span>
                {/* Glitch/Shadow effect on hover */}
                <span className="absolute inset-0 block text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600 opacity-0 group-hover:opacity-30 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500 pointer-events-none pb-2 z-[-1]" aria-hidden="true">
                  {promo.title}
                </span>
              </h2>

              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl font-bold uppercase tracking-tight leading-snug border-l-2 pl-6" style={{ borderColor: primary }}>
                {promo.description}
              </p>

              <div className="pt-8">
                <Link href={promo.ctaLink || '/automotiveecommerce/products'}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group/btn flex items-center gap-6 py-5 md:py-6 px-10 md:px-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black overflow-hidden"
                  >
                    <div className="absolute inset-0 w-full h-full bg-amber-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover/btn:scale-x-100" />
                    <span className="relative z-10 uppercase tracking-[0.2em] text-xs md:text-sm group-hover/btn:text-zinc-900 transition-colors duration-300">{promo.ctaText || 'Explore Kit'}</span>
                    <ArrowRightIcon className="relative z-10 w-5 h-5 group-hover/btn:translate-x-3 transition-transform group-hover/btn:text-zinc-900 duration-300" />
                  </motion.button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative min-h-[400px] lg:min-h-auto overflow-hidden">
              <img
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1581244276891-6bc618f3a697'}
                alt={promo.title}
                className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 filter brightness-75 dark:brightness-50 group-hover:brightness-100 transition-all duration-[1.5s] ease-out"
              />
              {/* Technical overlay graphic */}
              <div className="absolute bottom-10 right-10 flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-500">
                 <div className="text-[10px] text-amber-500 font-mono tracking-widest bg-zinc-900/80 px-3 py-1 border border-amber-500/30 mb-2">SYS.OP.OPTIMAL</div>
                 <div className="flex gap-1">
                   {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-1 h-4 bg-amber-500 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                   ))}
                 </div>
              </div>
              {/* Gradient to blend image with text area */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-transparent via-zinc-100/50 dark:via-[#0a0a0a]/50 to-zinc-100 dark:to-[#0a0a0a]" />
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- MULTI PROMO: THE "CHASSIS" BENTO GRID ---
  const displayed = promotions.slice(0, 3);
  return (
    <section className="py-24 bg-zinc-50 dark:bg-[#050505] border-t border-zinc-200 dark:border-zinc-900 relative">
      {/* Decorative Blueprint Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute left-0 top-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]" aria-hidden="true">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
        </svg>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                Performance <span className="text-amber-500">Kits</span>
              </h2>
              <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Curated Component Systems</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {displayed.map((item, index) => {
            const isLarge = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.1 }}
                className={`relative overflow-hidden group border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100 dark:bg-[#0a0a0a] shadow-sm hover:shadow-2xl transition-all duration-500
                  ${isLarge ? 'lg:col-span-7 h-[500px] md:h-[600px] lg:h-[700px]' : 'lg:col-span-5 h-[400px] md:h-[500px] lg:h-[700px]'}`}
              >
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1530124566582-a618bc2615ad'}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6] dark:brightness-[0.4] group-hover:brightness-[0.8] group-hover:scale-110 transition-all duration-[2s] ease-out"
                />
                
                {/* Tech Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
                
                {/* Corner Data Metric (Visual flair) */}
                <div className="absolute top-6 left-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300">
                    <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[9px] font-mono text-amber-500 tracking-widest">OPT-{index + 1} LIVE</span>
                </div>

                {/* Content - Bottom Docked */}
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-12 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 md:w-12 h-1 bg-amber-500" />
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 drop-shadow-md">System Spotlight</span>
                  </div>
                  
                  <h3 className={`font-black text-white mb-4 md:mb-6 leading-[0.85] tracking-tighter uppercase drop-shadow-lg
                      ${isLarge ? 'text-5xl md:text-7xl lg:text-8xl' : 'text-4xl md:text-5xl lg:text-6xl'}`}>
                    {item.title}
                  </h3>
                  
                  <p className="text-zinc-300 text-xs md:text-sm mb-8 md:mb-10 line-clamp-2 font-bold uppercase tracking-tight max-w-md drop-shadow-md opacity-80 group-hover:opacity-100 transition-opacity">
                    {item.description}
                  </p>
                  
                  <Link
                    href={item.ctaLink || '/automotiveecommerce/products'}
                    className="inline-flex items-center gap-0 group/link relative"
                  >
                    <div className="px-8 py-4 md:px-10 md:py-5 bg-white text-zinc-900 font-black text-[10px] uppercase tracking-widest relative overflow-hidden z-10">
                        <div className="absolute inset-0 bg-amber-500 transform -translate-x-full group-hover/link:translate-x-0 transition-transform duration-300 ease-in-out z-[-1]" />
                        <span className="group-hover/link:text-zinc-900 transition-colors">
                            {item.ctaText || 'View Series'}
                        </span>
                    </div>
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500 flex items-center justify-center transition-all duration-300 group-hover/link:bg-zinc-900 z-10">
                        <ChevronRightIcon className="w-5 h-5 text-zinc-900 group-hover/link:text-white transition-colors" />
                    </div>
                    {/* Shadow block behind button */}
                    <div className="absolute top-1 left-1 w-full h-full bg-black z-0 pointer-events-none" />
                  </Link>
                </div>

                {/* Industrial Grid Overlay on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-1000" 
                     style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '20px 20px' }} 
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}