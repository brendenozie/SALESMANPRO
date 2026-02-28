'use client';

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightCircleIcon, ArrowRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { IStoreCategory, ISubcategory } from '@/types/typings';

export interface CategorySectionProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

/* -------------------------------------------------------------------------- */
/* Constants & Helpers */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
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
 * Modern Subcategory Tile for the "Few Categories" view
 */
function SubcategoryTile({ sub, idx }: { sub: ISubcategory; idx: number }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/ecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-stone-100 transition-all hover:border-amber-200 hover:shadow-md hover:-translate-y-1">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <span className="text-xl">✨</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-stone-800 truncate">{sub.name}</h4>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Browse Collection</p>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function CategorySection({ StoreCategory, themeSettings }: CategorySectionProps) {
  const primary = themeSettings?.primaryColor || '#D97706';

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
    <section className="py-24 bg-[#FDFCF9]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-600 font-bold uppercase tracking-[0.3em] text-xs mb-4 block"
            >
              {isFew ? "Hand-Picked Varieties" : "Our Specialties"}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter text-stone-900 leading-none"
            >
              {isFew ? (
                 <>Curated <span className="italic font-serif font-light text-amber-700">Daily Delights</span></>
              ) : (
                 <>Baked with <span className="italic font-serif font-light text-amber-700">Heart & Soul</span></>
              )}
            </motion.h2>
          </div>
          <Link 
            href="/ecommerce/categories" 
            className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest border-b-2 border-amber-500 pb-1 hover:text-amber-600 transition-colors"
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
            <motion.div key={cat.id} variants={itemVariants} className="group cursor-pointer">
              <Link href={`/ecommerce/products?category=${cat.category?.slug || cat.id}`}>
                <div className="relative h-[450px] overflow-hidden rounded-2xl mb-6 shadow-xl transition-shadow hover:shadow-2xl">
                  
                  <Image
                    src={ FALLBACK_IMAGES[idx % 3]}
                    // cat.image ||
                    alt={cat.displayName || 'Category'}
                    loader={({ src }) => src}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  
                  {cat.icon && (
                    <div className="absolute top-6 left-6 px-4 py-2 backdrop-blur-md bg-white/20 border border-white/30 rounded-full text-white text-xs font-bold flex items-center gap-2">
                       <span className="text-lg">{cat.icon}</span>
                       <span className="tracking-widest uppercase">Specialty</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-8 left-8 right-8 text-white translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-1 opacity-0 group-hover:opacity-100 transition-all duration-500">
                       {(cat.subcategories?.length || 0)} Varieties
                    </p>
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">
                       { cat.displayName || cat.category?.name || 'Untitled' }
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="h-[1px] w-8 bg-amber-500 transition-all duration-500 group-hover:w-12" />
                      <span className="text-sm font-black uppercase tracking-widest">Explore Collection</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Placeholder for "More Coming Soon" (Only show if not in "isFew" mode to maintain layout) */}
          {!isFew && (
            <motion.div
              variants={itemVariants}
              className="relative h-[450px] rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-center p-10 bg-stone-50/50"
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                <span className="text-2xl">🥐</span>
              </div>
              <h3 className="text-xl font-bold text-stone-400">New Delights Incoming</h3>
              <p className="text-stone-400 text-sm mt-2">Perfecting new recipes daily.</p>
            </motion.div>
          )}
        </motion.div>

        {/* Subcategories (Only visible if 1 or 2 categories exist) */}
        {isFew && subcategoriesToShow.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-20 pt-16 border-t border-stone-100"
          >
            <div className="flex items-center gap-4 mb-10">
               <h3 className="text-xs font-black uppercase tracking-[0.4em] text-stone-400">Refine by Variety</h3>
               <div className="h-px flex-1 bg-stone-100" />
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