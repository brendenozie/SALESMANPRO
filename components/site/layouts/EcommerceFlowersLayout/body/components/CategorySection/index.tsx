"use client";

import React, { useMemo, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Helpers */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({
  cat,
  index,
}: {
  cat: IStoreCategory;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const catSlug = safeSlug(cat.categoryId || cat.displayName || "category");
  const imageUrl = FALLBACK_IMAGE_URL; //cat.imageUrl || cat.image || 

  // Varied heights for a masonry feel
  const heightClass = index % 3 === 0 ? "h-[500px]" : index % 3 === 1 ? "h-[400px]" : "h-[450px]";

  return (
    <motion.div
      variants={cardVariants}
      className={`relative group overflow-hidden rounded-[2rem] bg-slate-100 ${heightClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/ecommerce/products?category=${catSlug}`} className="block h-full w-full">
        {/* Image with subtle parallax zoom */}
        <Image
          src={imageUrl}
          alt={cat.displayName || "Category"}
          fill
          loader={customLoader}
          className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
        />
        
        {/* Soft Floral Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="overflow-hidden">
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-bold mb-2"
            >
              Explore Collection
            </motion.p>
          </div>
          
          <h3 className="text-3xl font-serif italic text-white leading-none">
            {cat.displayName}
          </h3>

          <div className="mt-6 flex items-center justify-between">
            <div className="h-[1px] flex-1 bg-white/30 mr-4 scale-x-0 origin-left transition-transform duration-700 group-hover:scale-x-100" />
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white backdrop-blur-sm group-hover:bg-rose-500 group-hover:border-rose-500 transition-all duration-300">
              <PlusIcon className={`h-5 w-5 transition-transform duration-500 ${isHovered ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSection({ store }: { store: StoreForm | null }) {
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  return (
    <section className="relative bg-[#FCFBFA] py-32 overflow-hidden">
      {/* Decorative Floral "Shadow" Element */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-50 rounded-full blur-[100px] opacity-60" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-100 rounded-full blur-[100px] opacity-60" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Elegant Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="h-[1px] w-12 bg-rose-500" />
              <span className="text-rose-500 text-[11px] uppercase tracking-[0.4em] font-black">
                The Collections
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1]"
            >
              Curated <span className="italic text-rose-500">Petals</span> <br />
              for Every Moment.
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-slate-500 max-w-xs text-sm leading-relaxed border-l border-slate-200 pl-6"
          >
            From seasonal wildflowers to rare exotic stems, explore our curated categories designed to bring nature's poetry into your space.
          </motion.p>
        </div>

        {/* Masonry-Style Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8"
        >
          {categoriesToShow.length > 0 ? (
            categoriesToShow.map((cat, idx) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                index={idx}
              />
            ))
          ) : (
            /* Empty State */
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="font-serif italic text-slate-400">Our garden is currently being replanted. Check back soon.</p>
            </div>
          )}
        </motion.div>

        {/* Minimal Footer Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-24 flex justify-center"
        >
          <Link 
            href="/ecommerce/categories" 
            className="group flex items-center gap-4 text-slate-900 font-bold uppercase tracking-[0.2em] text-[12px]"
          >
            <span>View All Departments</span>
            <div className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}