"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  HeartIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { IStoreCategory } from '@/types/typings';

/*
  Unified Category Grid Component (Light mode)
  - Fully merged: unified icon engines (main + sub), theme system
  - Improved subcategory fallback: if main categories < 6 => render subcategories
  - URL slugs + Link integration
  - Cleaner data pipeline
  - Optional skeleton loader for light mode (isLoading prop)

  Props:
    - StoreCategory: IStoreCategory[] | undefined | null
    - isLoading?: boolean (defaults to false)
*/

// --------------------------
// Icon engines
// --------------------------
const mainIconMap = {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  HeartIcon,
};
const mainIconList = Object.values(mainIconMap) as React.ElementType[];

function generateIconFromHash(name: string) {
  if (!name) return QuestionMarkCircleIcon;
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % mainIconList.length;
  return mainIconList[index] as React.ElementType;
}

const subIconPool = ['💎', '📦', '🎨', '🛠️', '⚡', '🧠', '📚', '🏷️', '🎯', '🌐'];
function generateSubIcon(name: string) {
  if (!name) return '🔖';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return subIconPool[Math.abs(hash) % subIconPool.length];
}

// --------------------------
// Theme system (light mode)
// --------------------------
const THEMES = [
  { text: 'text-blue-600', bg: 'bg-blue-50', accent: 'from-blue-100 to-blue-50' },
  { text: 'text-violet-600', bg: 'bg-violet-50', accent: 'from-violet-100 to-violet-50' },
  { text: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'from-emerald-100 to-emerald-50' },
  { text: 'text-rose-600', bg: 'bg-rose-50', accent: 'from-rose-100 to-rose-50' },
  { text: 'text-amber-600', bg: 'bg-amber-50', accent: 'from-amber-100 to-amber-50' },
  { text: 'text-cyan-600', bg: 'bg-cyan-50', accent: 'from-cyan-100 to-cyan-50' },
];

// --------------------------
// Helper: safe slug
// --------------------------
function makeSlug(s?: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --------------------------
// Skeleton card (light mode)
// --------------------------
function SkeletonCard() {
  return (
    <div className="h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gray-100" />
        <div className="w-8 h-8 rounded-full bg-gray-100" />
      </div>
      <div className="h-5 bg-gray-100 rounded w-3/5 mb-3" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

// --------------------------
// Component
// --------------------------
interface CategoryGridSectionProps {
  StoreCategory?: IStoreCategory[] | null;
  isLoading?: boolean;
}

export default function CategoryGridSection({ StoreCategory, isLoading = false }: CategoryGridSectionProps) {

  // 1. normalize & filter incoming categories safely
  const incoming = Array.isArray(StoreCategory) ? StoreCategory.filter(c => c != null) : [];
  const visibleMain = incoming.filter(c => c.visible !== false);

  // 2. decide data source: main categories or flattened subcategories
  let dataToRender: any[] = [];

  if (visibleMain.length === 0) {
    // fallback mock (light-mode friendly)
    dataToRender = [
      { displayName: 'Design & Creative', slug: 'design-creative', count: 120 },
      { displayName: 'Analytics & Data', slug: 'analytics-data', count: 85 },
      { displayName: 'Trades & Services', slug: 'trades-services', count: 40 },
      { displayName: 'Finance', slug: 'finance', count: 32 },
      { displayName: 'Software & IT', slug: 'software-it', count: 15 },
      { displayName: 'Home & Garden', slug: 'home-garden', count: 9 },
    ];
  } else if (visibleMain.length < 6) {
    // flatten subcategories
    dataToRender = visibleMain.flatMap(cat => (cat.subcategories || []).map((sub: any) => ({ ...sub, parent: cat })));
  } else {
    dataToRender = visibleMain;
  }

  // 3. map to unified item shape
  const items = dataToRender.slice(0, 12).map((raw: any, idx: number) => {
    const isMain = !!raw.subcategories || !!raw.displayName && visibleMain.some((m: any) => m === raw || m.displayName === raw.displayName);
    const name = raw.displayName || raw.name || raw.title || 'Untitled';
    const slug = raw.slug || makeSlug(name) || (isMain ? makeSlug(name) : makeSlug(name));
    const theme = THEMES[idx % THEMES.length];

    return {
      name,
      slug,
      count: isMain ? (raw.subcategories?.length || raw.count || 0).toLocaleString() : (raw.count || '').toString(),
      theme,
      isMain,
      Icon: isMain ? generateIconFromHash(name) : null,
      emoji: !isMain ? generateSubIcon(name) : null,
      parentName: raw.parent?.displayName || undefined,
    };
  });

  // animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 85, damping: 16 } },
  };

  return (
    <section className="relative py-16 bg-white font-sans overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div className="text-center max-w-3xl mx-auto mb-12" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">Directory</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Category</span></h2>
          <p className="text-lg text-gray-500">Find top-rated services and professionals tailored to your needs.</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>

          {isLoading ? (
            // show skeletons
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={`s-${i}`} variants={itemVariants} className="group">
                <SkeletonCard />
              </motion.div>
            ))
          ) : (
            items.map((item, idx) => (
              <motion.div key={idx} variants={itemVariants} className="group">
                <Link href={`/categories/${item.slug}`} className="block h-full">
                  <div className={`h-full bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden`}>

                    {/* Accent bar */}
                    <div className={`absolute -top-6 left-0 w-full h-8 bg-gradient-to-r ${item.theme.accent} opacity-40 transform rotate-2 pointer-events-none`} />

                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${item.theme.bg} ${item.theme.text} shadow-inner`}>
                        {item.isMain ? (
                          // heroicon (component) — use React.createElement so TS treats the dynamic component correctly
                          React.createElement(item.Icon as React.ElementType, { className: "w-7 h-7" })
                        ) : (
                          <span className="text-xl">{item.emoji}</span>
                        )}
                      </div>

                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{item.name}</h3>
                    {item.parentName && <p className="text-xs text-gray-400 mt-1">in {item.parentName}</p>}

                    {item.count ? (
                      <p className="text-sm text-gray-500 mt-3">{item.count} Listings</p>
                    ) : null}

                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-0 group-hover:w-full transition-all duration-500 ease-out" />
                  </div>
                </Link>
              </motion.div>
            ))
          )}

        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/categories" className="inline-flex items-center gap-2 text-base font-bold px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all">
            View All Categories
n          <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
