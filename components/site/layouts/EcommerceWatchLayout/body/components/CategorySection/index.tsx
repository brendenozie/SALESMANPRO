'use client';

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon, PlusIcon, ClockIcon } from '@heroicons/react/24/outline';
import { IStoreCategory, ISubcategory } from '@/types/typings';

export interface WatchCategoryProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

const MAX_TECHNICAL_SPECS = 8;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

function TechSpecTile({ sub }: { sub: ISubcategory }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/shop/catalog?subcategory=${sub.slug || sub.name}`}>
        <div className="group flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-slate-900 transition-all duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">Series</span>
            <span className="text-sm font-bold text-slate-900 tracking-tight">{sub.name}</span>
          </div>
          <div className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <PlusIcon className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function WatchCategorySection({ StoreCategory, themeSettings }: WatchCategoryProps) {
  const primary = themeSettings?.primaryColor || '#0f172a'; // Deep slate/black

  const categoriesToShow = useMemo(() => {
    return (StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [StoreCategory]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const subcategoriesForGrid = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((cat) => {
      if (cat.subcategories) {
        list.push(...cat.subcategories.filter((s) => s.visible ?? true));
      }
    });
    return list.slice(0, MAX_TECHNICAL_SPECS);
  }, [categoriesToShow, isFew]);

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header: Minimalist Horology Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span className="h-px w-8 bg-slate-900" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
                 {isFew ? "Technical Selection" : "The Collection"}
               </span>
            </div>
            <h2 className="text-4xl font-light text-slate-900 tracking-tighter">
              Precision <span className="font-bold">Instruments</span>
            </h2>
          </div>
          
          <Link 
            href="/shop/catalog" 
            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            Full Catalog <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {/* The Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {categoriesToShow.map((cat, idx) => (
            <motion.div key={cat.id || idx} variants={itemVariants}>
              <Link href={`/shop/catalog?category=${ cat.id}`}>
              {/* cat.slug || */}
                <div className="group relative bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-white p-8 h-full flex flex-col items-center text-center transition-all duration-500">
                  {/* Icon with circular "Lens" effect */}
                  <div className="w-16 h-16 mb-6 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl relative overflow-hidden group-hover:shadow-md transition-shadow">
                    <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 group-hover:invert transition-all duration-300">
                      {cat.icon && !cat.icon.startsWith('http') ? cat.icon : <ClockIcon className="w-6 h-6 text-slate-400" />}
                      {cat.icon?.startsWith('http') && (
                        <img src={cat.icon} alt="" className="w-8 h-8 object-contain" />
                      )}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-1">
                    {cat.displayName}
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Series
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Luxury CTA Tile */}
          {!isFew && (
            <motion.div variants={itemVariants}>
               <div className="bg-slate-900 p-8 h-full flex flex-col justify-center items-center text-center group cursor-pointer">
                  <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ArrowRightIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discover All</span>
               </div>
            </motion.div>
          )}
        </motion.div>

        {/* Subcategory Technical List (isFew Logic) */}
        {isFew && subcategoriesForGrid.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mt-12 pt-12 border-t border-slate-100"
          >
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">
              Available Configurations
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subcategoriesForGrid.map((sub, idx) => (
                <TechSpecTile key={sub.id || idx} sub={sub} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}