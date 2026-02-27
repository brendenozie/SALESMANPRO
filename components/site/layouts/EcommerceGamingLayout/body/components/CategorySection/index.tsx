'use client';

import React, { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  RectangleGroupIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

function resolveGamingStyle(index: number) {
  const icons = [
    <FireIcon className="w-6 h-6" key="fire" />,
    <BoltIcon className="w-6 h-6" key="bolt" />,
    <TrophyIcon className="w-6 h-6" key="trophy" />,
    <RocketLaunchIcon className="w-6 h-6" key="rocket" />,
    <CpuChipIcon className="w-6 h-6" key="cpu" />,
    <ShieldCheckIcon className="w-6 h-6" key="shield" />,
  ];
  return icons[index % icons.length];
}

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const [imgError, setImgError] = useState(false);
  const catSlug = safeSlug(cat.categoryId || cat.displayName || cat.id);
  const imageUrl = imgError ? FALLBACK_IMAGE_URL : ( FALLBACK_IMAGE_URL);//cat.imageUrl || cat.image ||
  const icon = resolveGamingStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/ecommerce/products?category=${catSlug}`} className="block relative h-[450px] w-full overflow-hidden bg-zinc-900 border border-white/5 transition-all">
        
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600 z-20 group-hover:w-12 group-hover:h-12 transition-all duration-300" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/20 z-20" />

        {/* Image Layer with Zoom */}
        <Image
          src={imageUrl}
          alt={cat.displayName || ""}
          fill
          loader={customLoader}
          onError={() => setImgError(true)}
          className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-70 transition-all duration-700"
        />

        {/* HUD Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="flex items-center gap-3 mb-4">
             <div className="bg-red-600 p-2 text-white skew-x-[-12deg] shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                {icon}
             </div>
             <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase font-bold">Sector 0{index + 1}</span>
          </div>

          <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase group-hover:text-red-500 transition-colors">
            {cat.displayName}
          </h3>

          <div className="mt-4 flex items-center justify-between overflow-hidden">
            <div className="h-[1px] flex-1 bg-white/10 group-hover:bg-red-600/50 transition-colors" />
            <div className="pl-4 flex items-center gap-2 text-xs font-black text-gray-400 group-hover:text-white transition-colors">
              ENTER SITE <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSectionGaming({ store }: { store: StoreForm | null }) {
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Background Tech Noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/carbon-fibre.png")` }} />
      
      {/* HUD Lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-red-600/20 via-transparent to-red-600/20" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header Section */}
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 text-red-600 mb-4"
            >
              <RectangleGroupIcon className="w-6 h-6 animate-pulse" />
              <span className="text-sm font-black tracking-[0.3em] uppercase">Inventory_Modules</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase"
            >
              CHOOSE YOUR <span className="text-red-600">CLASS</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="hidden lg:block text-right"
          >
            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest leading-relaxed">
              System Ready // Filter Active <br />
              Select collection to deploy.
            </p>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0" // Gap 0 for that seamless industrial look
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCard key={cat.id} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* Industrial Footer CTA */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 flex justify-center"
        >
          <Link href={`/ecommerce/categories`} className="group relative px-12 py-5 bg-white text-black font-black uppercase tracking-tighter italic text-xl hover:bg-red-600 hover:text-white transition-all overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              ACCESS ALL MODULES <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </span>
            {/* Skewed background effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-red-600" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}