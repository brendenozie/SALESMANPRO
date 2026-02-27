'use client';

import React, { useMemo, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowUpRightIcon,
  SparklesIcon,
  Squares2X2Icon
} from "@heroicons/react/24/outline";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

function CategoryPortal({ cat, index }: { cat: IStoreCategory; index: number }) {
  const [hovered, setHovered] = useState(false);
  const imageUrl = (cat as any).imageUrl || (cat as any).image || FALLBACK_IMAGE_URL;

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-[450px] w-full group cursor-pointer"
    >
      <Link href={`/ecommerce/products?category=${cat.categoryId}`} className="block h-full w-full">
        {/* The "Frame" */}
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0a0a]">
          
          {/* Background Image with Parallax Effect */}
          <motion.div 
            animate={{ scale: hovered ? 1.1 : 1, opacity: hovered ? 0.6 : 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>

          {/* Gradient Wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 p-8 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-8 bg-primary-color" style={{ backgroundColor: 'var(--primary-color)' }} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/50">Collection {index + 1}</span>
            </div>
            
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none mb-4 transition-transform duration-500 group-hover:-translate-y-2">
              {cat.displayName}
            </h3>

            <div className="overflow-hidden">
               <motion.div 
                 animate={{ y: hovered ? 0 : 40 }}
                 className="flex items-center justify-between text-white/60"
               >
                 <span className="text-xs font-medium uppercase tracking-widest">Explore Series</span>
                 <ArrowUpRightIcon className="w-5 h-5 text-white" />
               </motion.div>
            </div>
          </div>

          {/* Glass Accent Piece */}
          <div className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <Squares2X2Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function CategoriesSectionV5({ store }: { store: StoreForm | null }) {
  const categories = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  return (
    <section className="relative bg-[#050505] py-32 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-color/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary-color/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Header Logic */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-bold tracking-[.4em] uppercase text-white/40">The Catalog</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none"
            >
              CHOOSE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/50 to-white/10">
                VIBRATION.
              </span>
            </motion.h2>
          </div>

          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="text-white/40 text-lg max-w-xs border-l border-white/10 pl-6"
          >
            Engineering excellence across every category. Select a collection to begin your journey.
          </motion.p>
        </div>

        {/* The Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <CategoryPortal key={cat.id} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* View All Button - Unique Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-24 flex justify-center"
        >
          <Link href="/ecommerce/categories" className="group relative px-12 py-5 rounded-full border border-white/10 hover:border-white/40 transition-all overflow-hidden">
            <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 text-white group-hover:text-black font-bold uppercase tracking-widest text-sm flex items-center gap-3">
              Browse Full Universe
              <ArrowUpRightIcon className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}