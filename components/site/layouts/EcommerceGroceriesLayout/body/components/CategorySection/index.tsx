'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  SparklesIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Helper to get a grocery-friendly image if none exists
const getImageUrl = (cat: any) => {
  return cat.imageUrl || cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800";
};

/* -------------------------------------------------------------------------- */
/* Sub-Component: The Bento Card */
/* -------------------------------------------------------------------------- */
function CategoryBentoCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Create a "Featured" look for every 3rd item (Bento Logic)
  const isLarge = index === 0 || index === 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-gray-100 ${
        isLarge ? 'md:col-span-2 md:row-span-2 h-[500px]' : 'h-[240px]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/ecommerce/products?category=${cat.categoryId}`} className="block h-full w-full">
        {/* Image with subtle zoom */}
        <Image
          src={getImageUrl(cat)}
          alt={cat.displayName}
          fill
          loader={customLoader}
          className={`object-cover transition-transform duration-1000 ease-out ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Dynamic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Glass-morphic Badge for Item Count */}
        <div className="absolute top-6 left-6 z-20">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
            {cat.subcategories?.length || 0} Collections
          </div>
        </div>

        {/* Content Section */}
        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
          <div className="flex items-end justify-between">
            <div>
              <motion.h3 
                animate={{ x: isHovered ? 10 : 0 }}
                className={`${isLarge ? 'text-4xl' : 'text-xl'} font-black text-white leading-tight`}
              >
                {cat.displayName}
              </motion.h3>
              {isLarge && (
                <p className="text-white/60 text-sm mt-2 max-w-[250px] line-clamp-2">
                  Explore our premium hand-picked selection of fresh {cat.displayName.toLowerCase()} products.
                </p>
              )}
            </div>

            <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition-all duration-300 ${isHovered ? 'scale-110 rotate-[-45deg]' : 'scale-100'}`}>
              <ArrowRightIcon className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Interactive "Flash" Light Effect on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
          }}
        />
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */
export default function CategoriesSectionV6({ store }: { store: StoreForm | null }) {
  const primaryColor = store?.themeSettings?.primaryColor || '#16a34a';

  const categories = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-green-50 rounded-full blur-3xl opacity-50" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="h-[2px] w-12 bg-green-600" style={{ backgroundColor: primaryColor }} />
              <span className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Our Catalog</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-gray-900 leading-tight"
            >
              Browse by <span className="italic font-light">Category</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link 
              href="/ecommerce/categories" 
              className="group flex items-center gap-3 text-lg font-bold text-gray-900 hover:text-green-600 transition-colors"
            >
              View all 24+ Categories
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 group-hover:border-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                <ChevronRightIcon className="h-5 w-5" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:auto-rows-min">
          {categories.slice(0, 6).map((cat, idx) => (
            <CategoryBentoCard 
              key={cat.id || idx} 
              cat={cat} 
              index={idx} 
            />
          ))}
        </div>

        {/* Mobile Swipe Indicator (Visible only on small screens) */}
        <div className="mt-12 flex justify-center md:hidden">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1 w-${i === 1 ? '8' : '2'} rounded-full bg-gray-200`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}