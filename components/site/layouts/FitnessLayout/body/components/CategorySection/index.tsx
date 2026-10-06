'use client';

import React, { useMemo, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  UserGroupIcon,
  StarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

// Premium fitness fallback image
const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

function resolveFitnessIcon(index: number) {
  const icons = [
    <FireIcon className="w-6 h-6" key="fire" />,
    <HeartIcon className="w-6 h-6" key="heart" />,
    <BoltIcon className="w-6 h-6" key="bolt" />,
    <SparklesIcon className="w-6 h-6" key="sparkles" />,
    <UserGroupIcon className="w-6 h-6" key="group" />,
    <StarIcon className="w-6 h-6" key="star" />,
  ];
  return icons[index % icons.length];
}

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* -------------------------------------------------------------------------- */
/* Subcategory Component */
/* -------------------------------------------------------------------------- */

function SubcategoryPill({ sub, index }: { sub: ISubcategory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/fitness/programs?subcategory=${sub.slug || sub.name}`}>
        <div className="group flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:border-indigo-500/30 dark:hover:border-indigo-500/30">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
              Focus Area
            </span>
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight transition-colors">
              {sub.name}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 transition-colors shadow-sm">
            <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Category Card Component */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const [imgError, setImgError] = useState(false);
  const catSlug = safeSlug(cat.categoryId || cat.category?.id || cat.id || cat.displayName || `cat-${index}`);
  const imageUrl = imgError ? FALLBACK_IMAGE_URL : (cat.category?.image || FALLBACK_IMAGE_URL);
  const icon = resolveFitnessIcon(index);

  return (
    <motion.div variants={itemVariants} className="group relative h-[460px] w-full rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500">
      <Link href={`/fitness/programs?category=${cat.category?.id || cat.categoryId || catSlug}`} className="block relative w-full h-full bg-slate-100 dark:bg-slate-800">
        
        <Image decoding="async"
          src={imageUrl}
          alt={cat.displayName || "Fitness Category"}
          fill
          onError={() => setImgError(true)}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Premium Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
        
        {/* Card Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="flex flex-col gap-4">
            {/* Glassmorphism Icon Badge */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-lg group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all duration-300">
               {icon}
            </div>

            <h3 className="text-3xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
              {cat.displayName}
            </h3>

            <div className="flex items-center gap-3 overflow-hidden mt-2">
              <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                Explore Programs
              </span>
              <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:translate-x-1.5 transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function CategoriesSectionFitness({ store }: { store: StoreForm | null }) {
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const subcategoriesForGrid = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((cat) => {
      if (cat.subcategories) {
        list.push(...cat.subcategories.filter((s) => s.visible ?? true));
      }
    });
    return list.slice(0, 12);
  }, [categoriesToShow, isFew]);

  return (
    <section className="relative py-24 md:py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-4"
            >
              <SparklesIcon className="w-5 h-5" />
              <span className="text-xs font-bold tracking-[0.2em] uppercase">
                Curated Disciplines
              </span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white"
            >
              Find Your <span className="text-indigo-600 dark:text-indigo-500">Focus.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden md:block text-right"
          >
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-xs">
              Whether you're building strength, increasing flexibility, or pushing your cardio limits, select a discipline to begin.
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCard key={cat.id} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* Subcategory Section (Renders if only a few main categories exist) */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-6 mb-10">
                <span className="font-bold text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  Specialized Areas
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refined Footer CTA */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 flex justify-center"
        >
          <Link 
            href={`/fitness/programs`} 
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <span>View All Disciplines</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}