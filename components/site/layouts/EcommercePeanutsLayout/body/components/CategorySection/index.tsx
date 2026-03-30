'use client';

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { IStoreCategory, ISubcategory } from '@/types/typings';

export interface PeanutCategoryProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

const MAX_SUBCATS = 10;

/* -------------------------------------------------------------------------- */
/* Design Variants */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const shellVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotate: -2 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

function PeanutPill({ sub }: { sub: ISubcategory }) {
  return (
    <motion.div variants={shellVariants}>
      <Link href={`/peanutecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="group flex items-center gap-3 px-6 py-3 rounded-full bg-[#F3E5AB] border-2 border-[#D2B48C] hover:bg-[#8B4513] hover:border-[#5D2E0C] transition-all duration-300 shadow-sm">
          <span className="text-sm font-black text-[#5D2E0C] group-hover:text-white transition-colors">
            {sub.name}
          </span>
          <ArrowRightIcon className="w-3 h-3 text-[#8B4513] group-hover:text-white transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function PeanutCategorySection({ StoreCategory, themeSettings }: PeanutCategoryProps) {
  const primary = themeSettings?.primaryColor || '#8B4513'; // Saddle Brown

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
    <section className="relative py-20 bg-[#FAF7F2] overflow-hidden">
      {/* Background Texture Overlay (Burlap/Paper feel) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-3"
            >
              <span className="w-10 h-[2px] bg-[#D2B48C]" />
              <span className="text-[#8B4513] font-black uppercase tracking-[0.2em] text-xs">
                Premium Harvest
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-[#3E2723] leading-[1.1]"
            >
              {isFew ? "Freshly Shelled" : "Explore the"} <span className="text-[#A0522D]">Nutty Goodness</span>
            </motion.h2>
          </div>
          
          <Link href="/peanutecommerce/categories" className="group flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md transition-all">
            <span className="text-sm font-bold text-stone-800 uppercase tracking-widest">Full Pantry</span>
            <ShoppingBagIcon className="w-5 h-5 text-[#A0522D] group-hover:rotate-12 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categoriesToShow.map((cat, idx) => (
            <motion.div key={cat.id || idx} variants={shellVariants} className="group">
              <Link href={`/peanutecommerce/products?category=${cat.categoryId || cat.category?.id || cat.id}`}>
                <div className="relative p-1 bg-[#F5DEB3] rounded-[3rem] transition-all duration-500 group-hover:rotate-1 group-hover:shadow-xl">
                  <div className="bg-white rounded-[2.8rem] overflow-hidden p-8 flex flex-col items-center">
                    
                    {/* Icon/Image Container with "Shell" shape */}
                    <div className="relative w-32 h-32 mb-6 bg-[#FAF7F2] rounded-full flex items-center justify-center border-4 border-[#F5DEB3] group-hover:border-[#A0522D] transition-colors duration-500">
                       <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                         {cat.icon && !cat.icon.startsWith('http') ? cat.icon : '🥜'}
                       </span>
                       {cat.icon?.startsWith('http') && (
                         <img src={cat.icon} alt="" className="w-16 h-16 object-contain" />
                       )}
                    </div>

                    <h3 className="text-2xl font-black text-[#3E2723] text-center mb-2">
                      {cat.displayName}
                    </h3>
                    <p className="text-xs font-bold text-[#8B4513]/60 uppercase tracking-widest">
                      {(cat.subcategories?.length || 0)} Handpicked Items
                    </p>

                    <div className="mt-6 flex items-center justify-center w-10 h-10 rounded-full bg-[#FAF7F2] group-hover:bg-[#3E2723] group-hover:text-white transition-all">
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Special "Roastery" Placeholder */}
          {!isFew && (
            <motion.div variants={shellVariants} className="hidden lg:block">
              <div className="h-full border-4 border-dashed border-[#D2B48C] rounded-[3rem] flex flex-col items-center justify-center p-10 text-center bg-stone-50/50">
                 <div className="text-4xl mb-4 opacity-30">🔥</div>
                 <h3 className="text-xl font-black text-stone-400">New Roasts Coming</h3>
                 <p className="text-stone-400 text-sm mt-2 font-medium">We're currently perfecting a new batch of crunchy delights.</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Smart Switch: Peanut-shaped Subcategory Cluster */}
        {isFew && subcategories.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-20"
          >
            <div className="flex items-center gap-4 mb-10">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-[#8B4513]/40">Crack Open the Details</h4>
              <div className="h-[2px] flex-1 bg-[#D2B48C]/30" />
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="flex flex-wrap justify-center gap-4"
            >
              {subcategories.map((sub, idx) => (
                <PeanutPill key={sub.id || idx} sub={sub} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}