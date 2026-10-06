'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon, ChevronRightIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { IStoreCategory, ISubcategory } from '@/types/typings';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

export interface CategorySectionProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

/* -------------------------------------------------------------------------- */
/* Constants & Helpers */
/* -------------------------------------------------------------------------- */
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
];

const MAX_SUBCATEGORIES = 8;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

/**
 * Subcategory Tile matching ProductCard's layout aesthetics
 */
function SubcategoryTile({ sub, idx }: { sub: ISubcategory; idx: number }) {
  const { buildUrl } = useEditableContent();
  return (
    <motion.div variants={itemVariants}>
      <Link href={buildUrl('/ecommerceshoes/products', { subcategory: sub.slug || sub.name })}>
        <div className="group flex items-center justify-between p-5 rounded-[1.75rem] bg-white dark:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-500 hover:shadow-[0_24px_48px_-10px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black text-xs">
              0{idx + 1}
            </div>
            <div className="truncate">
              <h4 className="font-bold text-zinc-900 dark:text-white text-base truncate leading-tight">{sub.name}</h4>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Explore Line</p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-300">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function CategorySection({ StoreCategory, themeSettings }: CategorySectionProps) {
  const { buildUrl } = useEditableContent();
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const primary = themeSettings?.primaryColor || '#18181b';

  // Logic: Filter and sort visible categories
  const categoriesToShow = useMemo(() => {
    return (StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [StoreCategory]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  // Logic: Extract subcategories if we only have 1 or 2 categories
  const subcategoriesToShow = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((cat) => {
      if (cat.subcategories) {
        list.push(...cat.subcategories.filter(s => s.visible ?? true));
      }
    });
    return list.slice(0, MAX_SUBCATEGORIES);
  }, [categoriesToShow, isFew]);

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <EditableElement
              targetId="home.categories-section.eyebrow"
              componentKey="CategoriesSection"
              elementKey="eyebrow"
              label="Eyebrow Text"
              defaultValue={isFew ? "Curated Silhouette Segments" : "Product Tier Classifications"}
            >
              {(val) => (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3 block"
                >
                  {val}
                </motion.span>
              )}
            </EditableElement>

            <EditableElement
              targetId="home.categories-section.title"
              componentKey="CategoriesSection"
              elementKey="title"
              label="Section Heading"
              defaultValue={isFew ? "Premium Capsule Feeds" : "Engineered Design Spaces"}
            >
              {(val) => (
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none uppercase"
                >
                  {val}
                </motion.h2>
              )}
            </EditableElement>
          </div>
          <Link 
            href={buildUrl('/ecommerceshoes/categories')} 
            className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest pb-1 border-b-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white transition-colors"
          >
            View All Categories
            <ArrowRightCircleIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic Category Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categoriesToShow.map((cat, idx) => (
            <motion.div 
              key={cat.id} 
              variants={itemVariants} 
              className="relative flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-3 transition-all duration-500 group border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)]"
            >
              {/* ProductCard Aligned Badges */}
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                <span className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Tier 0{idx + 1}
                </span>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    {cat.subcategories.length} Lines
                  </span>
                )}
              </div>

              {/* Floating Quick Action Overlay Trigger */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveOverlayId(cat.id);
                  }}
                  className="absolute top-6 right-6 z-20 p-3 bg-white dark:bg-zinc-800 rounded-full shadow-lg text-zinc-900 dark:text-white transition-all duration-300 hover:scale-110"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}

              {/* Image Area matching the 72h aspect container */}
              <div className="relative h-80 w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50">
                <Link href={buildUrl('/ecommerceshoes/products', { category: cat.category?.slug || cat.id })} className="block h-full w-full">
                  <Image
                    src={FALLBACK_IMAGES[idx % 3]}
                    fill
                    decoding="async"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2"
                  />
                </Link>

                {/* Size-style Subcategory Selection Overlay Panel */}
                <AnimatePresence>
                  {activeOverlayId === cat.id && (
                    <motion.div 
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="absolute inset-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 flex flex-col justify-center items-center"
                    >
                      <button 
                        onClick={() => setActiveOverlayId(null)}
                        className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-md text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Quick Navigation</p>
                      
                      <div className="grid grid-cols-2 gap-2 w-full max-h-[160px] overflow-y-auto pr-1">
                        {cat.subcategories?.slice(0, 6).map((sub) => (
                          <Link 
                            key={sub.id} 
                            href={buildUrl('/ecommerceshoes/products', { subcategory: sub.slug || sub.name })}
                            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px] font-black text-center text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 transition-all hover:border-zinc-900 dark:hover:border-white"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>

                      <Link
                        href={buildUrl('/ecommerceshoes/products', { category: cat.category?.slug || cat.id })}
                        className="mt-5 w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-center rounded-2xl font-black text-[10px] uppercase tracking-widest block transition-all hover:opacity-90"
                      >
                        View Full Concept
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Structural Details Footer Frame */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                     {cat.icon ? `${cat.icon} Concept Pool` : "Premium Footwear Line"}
                  </p>
                  <h4 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                     {cat.displayName || cat.category?.name || 'Untitled Classification'}
                  </h4>
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  <Link 
                    href={buildUrl('/ecommerceshoes/products', { category: cat.category?.slug || cat.id })}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-zinc-500/10"
                  >
                    <span>Browse Collection</span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Locked Release Drop Layout Replacement */}
          {!isFew && (
            <motion.div
              variants={itemVariants}
              className="relative flex flex-col bg-zinc-100/50 dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 min-h-[480px] items-center justify-center text-center"
            >
              <div className="w-14 h-14 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-md mb-4 border border-zinc-100 dark:border-zinc-700">
                <span className="text-xl text-zinc-400 dark:text-zinc-500 animate-pulse">⚡</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-zinc-400 dark:text-zinc-500 uppercase">Upcoming Drops</h3>
              <p className="text-zinc-400 dark:text-zinc-600 text-xs mt-2 max-w-[210px] font-medium leading-relaxed">
                Footwear design blueprints locked. Next category configuration releasing soon.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Dynamic Sub-tiers Framework */}
        {isFew && subcategoriesToShow.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 pt-16 border-t border-zinc-200/60 dark:border-zinc-800/60"
          >
            <div className="flex items-center gap-4 mb-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Refine Configuration Matrix</h3>
               <div className="h-px flex-1 bg-zinc-200/60 dark:bg-zinc-800/60" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subcategoriesToShow.map((sub, idx) => (
                <SubcategoryTile key={sub.id || idx} sub={sub} idx={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}