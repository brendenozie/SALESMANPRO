'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { IStoreCategory, ISubcategory } from '@/types/typings';

export interface HoneyCategoryProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

const MAX_SUBCATS = 10;

/* -------------------------------------------------------------------------- */
/* Design Variants */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const hexVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 12 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

function HoneycombPill({ sub }: { sub: ISubcategory }) {
  return (
    <motion.div variants={hexVariants}>
      <Link href={`/honeyecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="group flex items-center gap-3 px-5 py-3 rounded-full bg-amber-50 border border-amber-100 hover:bg-amber-500 hover:border-amber-600 transition-all duration-300 shadow-sm hover:shadow-md">
          <div className="w-2 h-2 rounded-full bg-amber-400 group-hover:bg-white" />
          <span className="text-sm font-bold text-amber-900 group-hover:text-white transition-colors">
            {sub.name}
          </span>
          <ArrowRightIcon className="w-3 h-3 text-amber-400 group-hover:text-white opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function HoneyCategorySection({ StoreCategory, themeSettings }: HoneyCategoryProps) {
  const primary = themeSettings?.primaryColor || '#D97706'; // Golden Amber

  const categoriesToShow = useMemo(() => {
    return (StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [StoreCategory]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const subcategories = useMemo(() => {
    if (!isFew) return [];
    const list: ISubcategory[] = [];
    categoriesToShow.forEach((cat) => {
      if (cat.subcategories) {
        list.push(...cat.subcategories.filter((s) => s.visible ?? true));
      }
    });
    return list.slice(0, MAX_SUBCATS);
  }, [categoriesToShow, isFew]);

  return (
    <section className="relative py-24 bg-[#FFFDF7] overflow-hidden">
      {/* Subtle Background Honeycomb SVG or Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" className="text-amber-600 fill-current">
          <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-amber-600 font-bold uppercase tracking-[0.3em] text-xs mb-3 block"
          >
            Nature's Sweetest Gift
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-amber-950 tracking-tight"
          >
            Taste the <span className="italic text-amber-600">Liquid Gold</span>
          </motion.h2>
          <p className="mt-4 text-amber-800/60 max-w-lg mx-auto text-sm font-medium">
            Explore our ethically sourced collections from wild blossom to raw infusion.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {categoriesToShow.map((cat, idx) => {
            const [isHovered, setIsHovered] = useState(false); // Track hover for this card

            <motion.div key={cat.id || idx} variants={hexVariants} className="group">
              <Link href={`/honeyecommerce/products?category=${cat.categoryId || cat.category?.id || cat.id}`}>
              {/* cat.slug ||  */}
                <div className="relative flex flex-col items-center">
                  {/* Hexagon Shape Container */}
                  <div className="relative w-40 h-44 md:w-48 md:h-52 flex items-center justify-center transition-transform duration-500 group-hover:-translate-y-2">
                    <div className="absolute inset-0 bg-amber-100 clip-path-hex transition-colors duration-300 group-hover:bg-amber-500 shadow-sm" />
                    
                    {/* ─── THE BEE INTEGRATION ─── */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ x: 60, y: -40, opacity: 0, scale: 0 }}
                          animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                          exit={{ x: 60, y: -40, opacity: 0, scale: 0 }}
                          transition={{ 
                            type: "spring", 
                            stiffness: 150, 
                            damping: 18 
                          }}
                          className="absolute top-1/2 left-1/2" // Origin point
                        >
                          <HoneyBee />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative z-10 w-20 h-20 flex items-center justify-center">
                       {cat.icon  ? (
                         <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{cat.icon}</span>
                       ) : (
                         <Image decoding="async" 
                           src={'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=80&q=80'} 
                          //  cat.image ||
                           alt="" 
                           width={80} 
                           height={80}
                           className="object-contain group-hover:brightness-0 group-hover:invert transition-all" // Bypass Next.js optimization for external URLs
                         />
                       )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-black text-amber-950 uppercase tracking-tight">
                      {cat.displayName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="h-px w-4 bg-amber-400" />
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                        {(cat.subcategories?.length || 0)} Varieties
                      </span>
                      <span className="h-px w-4 bg-amber-400" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
                  })}

          {/* Golden CTA Card */}
          {!isFew && (
            <motion.div variants={hexVariants} className="hidden lg:flex">
              <Link href="/honeyecommerce/categories" className="w-full h-full p-8 border-2 border-dashed border-amber-200 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-amber-50 transition-colors">
                 <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <ArrowRightIcon className="w-6 h-6 text-amber-600" />
                 </div>
                 <span className="text-sm font-black text-amber-900 uppercase tracking-widest">View Full Duka</span>
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Smart Switch: Subcategory Floral List */}
        {isFew && subcategories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-20 pt-16 border-t border-amber-100"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] text-amber-800/40">
                Browse Specific Infusions
              </h4>
              <div className="h-px flex-1 bg-amber-100 hidden md:block" />
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="flex flex-wrap justify-center gap-4"
            >
              {subcategories.map((sub, idx) => (
                <HoneycombPill key={sub.id || idx} sub={sub} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      <style jsx global>{`
        .clip-path-hex {
          clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
        }
      `}</style>
    </section>
  );
}


/**
 * Small Animated Bee SVG
 */
function HoneyBee() {
  return (
    <motion.div
      initial={{ scale: 0.8, rotate: 10 }}
      animate={{ 
        scale: [1, 1.1, 1], 
        rotate: [10, -5, 10],
        y: [0, -3, 0] 
      }}
      transition={{ 
        duration: 0.6, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="absolute z-20 w-8 h-8 pointer-events-none"
    >
      <svg viewBox="0 0 100 100" className="fill-current text-amber-950/80">
        {/* Simple but recognizable Bee body/wings pattern */}
        <circle cx="50" cy="50" r="30" fill="#FFD700" stroke="#451a03" strokeWidth="4"/>
        <path d="M50 20 L50 80" stroke="#451a03" strokeWidth="6" strokeDasharray="10 10"/>
        {/* Wings */}
        <ellipse cx="20" cy="40" rx="15" ry="10" fill="#FFF" stroke="#FFF" strokeWidth="2" opacity="0.8"/>
        <ellipse cx="80" cy="40" rx="15" ry="10" fill="#FFF" stroke="#FFF" strokeWidth="2" opacity="0.8"/>
        {/* Eyes/Stinger */}
        <circle cx="35" cy="50" r="4" fill="#451a03"/>
        <circle cx="65" cy="50" r="4" fill="#451a03"/>
        <path d="M50 80 L50 95" stroke="#451a03" strokeWidth="3"/>
      </svg>
    </motion.div>
  );
}