'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { IStoreCategory, ISubcategory, StoreForm } from '@/types/typings';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000";
const FALLBACK_SUBCATEGORY_IMAGE_URL = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000";

function safeSlug(value?: string, fallback = "item") {
  if (!value) return fallback;
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

interface IBentoItem {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
  subtitle: string;
}

function getCategoryImageUrl(cat: IStoreCategory) {
  const c = cat as any;
  return c.imageUrl || c.image || FALLBACK_IMAGE_URL;
}

function getSubcategoryImageUrl(sub: ISubcategory) {
  const s = sub as any;
  return FALLBACK_SUBCATEGORY_IMAGE_URL;// s.imageUrl || s.image ||
}

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

const BentoCard = ({ 
  item, 
  className, 
  index 
}: { 
  item: IBentoItem; 
  className?: string; 
  index: number 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 1.02, 0.73, 1] }}
      className={`relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${className}`}
    >
      <Link href={item.href} className="block w-full h-full">
        <Image decoding="async"
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-[1.5s] cubic-bezier(0.2, 1, 0.3, 1) group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

        {/* Floating Metadata */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="space-y-3">
            <div className="overflow-hidden">
              <motion.span 
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                className="block text-[10px] font-black uppercase tracking-[0.4em] text-white/50"
              >
                {item.subtitle}
              </motion.span>
            </div>
            
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-3xl font-light text-white tracking-tighter uppercase leading-none max-w-[70%]">
                {item.name.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'font-serif italic lowercase block translate-x-2' : 'block'}>
                    {word}
                  </span>
                ))}
              </h3>
              
              <div className="mb-1 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white backdrop-blur-md group-hover:bg-white group-hover:text-zinc-950 transition-all duration-500">
                <ArrowLongRightIcon className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function CategorySection({ store }: { store: StoreForm | null }) {
  const bentoItems: IBentoItem[] = useMemo(() => {
    const rawCategories = (store?.StoreCategory || [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const mainItems: IBentoItem[] = rawCategories.map((cat) => {
      const subCount = cat.subcategories?.filter((s) => s.visible).length || 0;
      return {
        id: cat.id || `cat-${Math.random()}`,
        name: cat.displayName || "Category",
        imageUrl: getCategoryImageUrl(cat),
        href: `/furnitureecommerce/products?category=${cat.id}`,
        subtitle: subCount > 0 ? `${subCount} Collections` : "Studio Piece",
      };
    });

    if (mainItems.length >= 5) return mainItems.slice(0, 5);

    const subItems: IBentoItem[] = [];
    rawCategories.forEach((cat) => {
      if (cat.subcategories) {
        cat.subcategories
          .filter((s) => s.visible ?? true)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) 
          .forEach((sub) => {
            subItems.push({
              id: sub.id || `sub-${Math.random()}`,
              name: sub.name || "Collection",
              imageUrl: getSubcategoryImageUrl(sub),
              href: `/furnitureecommerce/products?subcategory=${sub.id}`,
              subtitle: "Curated Series",
            });
          });
      }
    });

    return [...mainItems, ...subItems].slice(0, 5);
  }, [store]);

  if (bentoItems.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-white dark:bg-zinc-950">
      <div className="max-w-[1700px] mx-auto px-6">
        
        {/* Header: Editorial Style */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl space-y-6">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block">
              // The Directory
            </span>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.85]">
              Curated <br />
              <span className="font-serif italic lowercase text-zinc-400 ml-4">Spaces</span>
            </h2>
          </div>
          
          <Link 
            href="/furnitureecommerce/categories" 
            className="group inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white"
          >
            <span>Explore Full Archive</span>
            <div className="w-12 h-px bg-current transition-all group-hover:w-20" />
          </Link>
        </div>

        {/* Bento Grid Composition */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 h-auto md:h-[800px]">
          
          {/* Main Hero Slot */}
          <BentoCard 
            index={0} 
            item={bentoItems[0]} 
            className="md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2" 
          />

          {/* Secondary Slots */}
          {bentoItems[1] && (
            <BentoCard 
              index={1} 
              item={bentoItems[1]} 
              className="md:col-span-2 md:row-span-1 lg:col-span-3" 
            />
          )}

          {/* Tertiary Row */}
          {bentoItems[2] && (
            <BentoCard 
              index={2} 
              item={bentoItems[2]} 
              className="md:col-span-1 md:row-span-1 lg:col-span-1" 
            />
          )}

          {bentoItems[3] && (
            <BentoCard 
              index={3} 
              item={bentoItems[3]} 
              className="md:col-span-1 md:row-span-1 lg:col-span-1" 
            />
          )}

          {bentoItems[4] && (
            <BentoCard 
              index={4} 
              item={bentoItems[4]} 
              className="md:col-span-2 md:row-span-1 lg:col-span-1" 
            />
          )}
        </div>
      </div>
    </section>
  );
}