'use client';

import React, { useMemo, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowUpRightIcon,
  PlusIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const catSlug = safeSlug(cat.displayName || "category");
  const imageUrl = cat.image || cat.category?.image || "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884";

  return (
    <motion.div variants={cardVariants} className="flex-shrink-0 group">
      <Link
        href={`/bookecommerce/products?category=${cat.categoryId || cat.category?.id || catSlug}`}
        className="block w-72 md:w-[400px]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="absolute top-6 left-6 z-20 font-mono text-[10px] text-white/50 mix-blend-difference uppercase tracking-widest">
            Index No. {index < 9 ? `0${index + 1}` : index + 1}
          </span>

          <Image
            src={imageUrl}
            alt={cat.displayName || "Category"}
            fill
            loader={customLoader}
            className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <ArrowUpRightIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-baseline">
          <h3 className="text-2xl md:text-3xl font-serif italic text-zinc-900 dark:text-white">
            {cat.displayName}
          </h3>
          <span className="font-mono text-[10px] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            ENTER ARCHIVE
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSectionMerged({ store }: { store: StoreForm | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = store?.themeSettings?.primaryColor || '#0D9488';

  /* --- Original Functional Logic --- */
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 4;

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

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (categoriesToShow.length === 0) return null;

  return (
    <section className="relative bg-[#FDFDFB] dark:bg-zinc-950 py-32 transition-colors duration-500 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Editorial Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
               <div className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800">
                <SparklesIcon className="h-4 w-4" style={{ color: primaryColor }} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">
                {isFew ? "Curated Collections" : "The Seasonal Index"}
              </span>
            </motion.div>
            <h2 className="text-6xl md:text-9xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
              {isFew ? "Direct\nIntent" : "Explore\nBy Genre"}
            </h2>
          </div>

          {!isFew && (
            <div className="flex gap-4">
               <button onClick={() => scroll("left")} className="w-16 h-16 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button onClick={() => scroll("right")} className="w-16 h-16 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Scroll Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          ref={scrollRef}
          className={`flex overflow-x-auto scrollbar-hide space-x-12 pb-12 ${isFew ? 'lg:justify-start' : ''}`}
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCard key={cat.id || idx} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* Adaptive Subcategory functionality merged */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-32 pt-24 border-t border-zinc-100 dark:border-zinc-800"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4 space-y-6">
                  <div className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-900 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                    Deep Dive
                  </div>
                  <h4 className="text-4xl font-serif text-zinc-900 dark:text-white">Refine your search within these genres</h4>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  {subcategoriesForGrid.map((sub, idx) => (
                    <motion.div key={sub.id || idx} variants={cardVariants} className="border-b border-zinc-100 dark:border-zinc-800 py-6 group">
                      <Link 
                        href={`/bookecommerce/products?subcategory=${sub.slug || sub.name}`}
                        className="flex items-center justify-between"
                      >
                        <span className="text-lg font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          {sub.name}
                        </span>
                        <div className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                           <PlusIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}