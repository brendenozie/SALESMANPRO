'use client';

import React, { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  BeakerIcon,
  BugAntIcon,
  RectangleGroupIcon,
  SparklesIcon,
  CubeTransparentIcon,
  TruckIcon,
  SunIcon
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Helpers */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80";
const MAX_SUBCATEGORIES = 8;

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

function resolveAgroStyle(index: number) {
  const themes = [
    { accent: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-200", dot: "bg-emerald-500", gradient: "from-emerald-600 to-teal-600" },
    { accent: "text-orange-600", bg: "bg-orange-50", border: "hover:border-orange-200", dot: "bg-orange-500", gradient: "from-orange-500 to-amber-600" },
    { accent: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-200", dot: "bg-blue-500", gradient: "from-blue-600 to-cyan-600" },
    { accent: "text-lime-600", bg: "bg-lime-50", border: "hover:border-lime-200", dot: "bg-lime-500", gradient: "from-lime-500 to-emerald-500" },
  ];
  
  const icons = [
    <BeakerIcon className="w-6 h-6" key="1" />,
    <BugAntIcon className="w-6 h-6" key="2" />,
    <TruckIcon className="w-6 h-6" key="3" />,
    <SunIcon className="w-6 h-6" key="4" />,
  ];

  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const { theme } = resolveAgroStyle(index);
  const catSlug = safeSlug(cat.displayName || `category-${index}`);
  // cat.slug || 
  const subCount = cat.subcategories?.filter((s) => s.visible).length || 0;

  return (
    <motion.div variants={itemVariants} className="group relative h-full">
      <Link href={`/shop/catalog?category=${catSlug}`} className="block h-full">
        <div className="relative h-[420px] w-full overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 group-hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] group-hover:-translate-y-2">
          <div className="h-3/5 w-full overflow-hidden relative">
            <Image
              src={FALLBACK_IMAGE_URL}
              // cat.icon || cat.image || 
              alt={cat.displayName || ""}
              fill
              loader={customLoader}
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white" />
          </div>

          <div className="absolute bottom-0 w-full p-8 bg-white/90 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {subCount} Specialties
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
              {cat.displayName}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium italic">View collection</p>
              <div className={`p-2 rounded-full ${theme.bg} ${theme.accent} transition-transform group-hover:translate-x-1`}>
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SubcategoryTile({ sub, index }: { sub: ISubcategory; index: number }) {
  const { theme, icon } = resolveAgroStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/shop/catalog?subcategory=${sub.slug || sub.name}`}>
        <div className={`group flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-slate-100 transition-all hover:bg-slate-50 ${theme.border} hover:shadow-md`}>
          <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${theme.bg} ${theme.accent} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{sub.name}</h4>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Explore Supplies</p>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function EnhancedAgroCategories({ store }: { store: StoreForm | null }) {
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      // .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const limitedSubcategories = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((pcat) => {
      if (pcat.subcategories) {
        const subs = pcat.subcategories
          .filter((s) => s.visible ?? true)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .slice(0, 4); 
        list.push(...subs);
      }
    });
    return list.slice(0, MAX_SUBCATEGORIES);
  }, [categoriesToShow, isFew]);

  return (
    <section className="relative bg-[#fafaf9] py-32 overflow-hidden">
      {/* Decorative Bio-Patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 text-left">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 mb-4 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              <SparklesIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {isFew ? "Curated Essentials" : "Inventory Hub"}
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter"
            >
              {isFew ? (
                <>Popular <span className="italic font-serif font-light text-orange-600">Selections</span> for Your Farm.</>
              ) : (
                <>Essential <span className="italic font-serif font-light text-emerald-600">Supplies</span> for Every Cycle.</>
              )}
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-lg text-slate-500 font-medium max-w-xs border-l-2 border-emerald-500 pl-6"
          >
            {isFew 
              ? "Browse specific solutions tailored to your unique agricultural needs."
              : "We bridge the gap between scientific research and field application."}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {isFew ? (
            /* RENDER SUB-TILES IF CATEGORIES ARE FEW */
            <>
              {limitedSubcategories.length > 0 ? (
                limitedSubcategories.map((sub, idx) => (
                  <SubcategoryTile key={sub.id || idx} sub={sub} index={idx} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                   <CubeTransparentIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                   <p className="text-slate-500 font-medium">No specific varieties listed yet.</p>
                </div>
              )}
            </>
          ) : (
            /* RENDER MAIN CARDS NORMALLY */
            <>
              {categoriesToShow.map((cat, idx) => (
                <CategoryCard key={cat.id} cat={cat} index={idx} />
              ))}
              
              {/* CTA Card stays to fill empty space or provide a link */}
              <motion.div variants={itemVariants} className="flex flex-col justify-between p-10 bg-emerald-900 rounded-[2.5rem] text-white group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <RectangleGroupIcon className="w-32 h-32" />
                </div>
                <RectangleGroupIcon className="w-12 h-12 text-emerald-400 relative z-10" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold leading-tight mb-4">Need a Custom Solution?</p>
                  <Link href="/contact" className="inline-flex items-center gap-2 font-bold text-emerald-400 hover:text-white transition-colors">
                    Contact Specialist <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}