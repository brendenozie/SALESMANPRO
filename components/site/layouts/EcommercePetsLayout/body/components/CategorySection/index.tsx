'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
// Using Hero Icons as per your saved preference
import { 
  ArrowUpRightIcon, 
  SparklesIcon,
  TagIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import { IStoreCategory, StoreForm } from '@/types/typings';

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

const CategoryBentoCard = ({ 
  cat, 
  className, 
  index,
  primaryColor
}: { 
  cat: any; 
  className?: string; 
  index: number;
  primaryColor: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      className={`relative group overflow-hidden rounded-[3rem] bg-slate-100 ${className}`}
    >
      <Link href={`/products?category=${cat.id}`} className="block w-full h-full relative">
        {/* Main Category Image */}
        <Image
          src={cat.imageUrl || "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"}
          alt={cat.displayName}          
          loader={({ src }) => `${src}?w=600&q=80`}
          fill
          className="object-cover transition-transform duration-[2s] group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        
        {/* Soft Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Floating Tag (Visible on Hover) */}
        <div className="absolute top-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
            <ArrowUpRightIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content Box */}
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <span 
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white/90"
                style={{ backgroundColor: `${primaryColor}CC` }}
              >
                {cat.subCount || 0} Collections
              </span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {cat.displayName}
            </h3>
            
            <p className="text-white/60 text-sm font-medium max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              Discover curated essentials for your {cat.displayName.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Animated Accent Circle */}
        <div 
          className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: primaryColor }}
        />
      </Link>
    </motion.div>
  );
};

export default function CategorySection({ store }: { store: StoreForm | null }) {
  const primary = store?.themeSettings?.primaryColor || '#0EA5E9';

  const processedCategories = useMemo(() => {
    return (store?.StoreCategory || [])
      .filter((c) => c.visible ?? true)
      .slice(0, 5)
      .map(cat => ({
        ...cat,
        subCount: cat.subcategories?.length || 0,
        imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
        //  cat.imageUrl || (cat as any).image || 
      }));
  }, [store]);

  if (processedCategories.length === 0) return null;

  return (
    <section className="py-24 bg-[#FDFCFB]">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px]" style={{ backgroundColor: primary }} />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">The Catalog</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Shop by <br />
              <span className="italic font-serif font-light" style={{ color: primary }}>Pet Kingdom</span>
            </h2>
          </div>
          
          <Link href="/categories" className="group flex items-center gap-4 pb-2 border-b-2 border-slate-100 hover:border-slate-900 transition-all">
            <span className="text-sm font-black uppercase tracking-widest">View All Species</span>
            <ShoppingBagIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[900px]">
          
          {/* Main Hero: Dog/Cat (Col 1-7) */}
          <CategoryBentoCard 
            index={0} 
            cat={processedCategories[0]} 
            primaryColor={primary}
            className="md:col-span-7 md:row-span-2" 
          />

          {/* Side Stack 1 (Col 8-12 Top) */}
          {processedCategories[1] && (
            <CategoryBentoCard 
              index={1} 
              cat={processedCategories[1]} 
              primaryColor={primary}
              className="md:col-span-5 md:row-span-1" 
            />
          )}

          {/* Lower Grid (Col 8-12 Bottom Split) */}
          <div className="md:col-span-5 md:row-span-1 grid grid-cols-2 gap-6">
            {processedCategories.slice(2, 4).map((cat, i) => (
              <CategoryBentoCard 
                key={cat.id}
                index={i + 2} 
                cat={cat} 
                primaryColor={primary}
                className="col-span-1" 
              />
            ))}
          </div>

          {/* Full Width Small Feature if 5th exists */}
          {processedCategories[4] && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="md:col-span-12 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-between px-10 relative overflow-hidden group mt-4"
            >
              <div className="relative z-10 flex items-center gap-6">
                <TagIcon className="w-10 h-10 text-white/20" />
                <h4 className="text-white text-2xl font-black">{processedCategories[4].displayName}</h4>
              </div>
              <Link 
                href={`/products?category=${processedCategories[4].id}`}
                className="relative z-10 px-8 py-3 bg-white rounded-full text-slate-900 font-bold text-sm hover:scale-105 transition-transform"
              >
                Browse Collection
              </Link>
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-32 group-hover:translate-x-20 transition-transform duration-700" />
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}