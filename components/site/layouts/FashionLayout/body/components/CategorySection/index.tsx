'use client';

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000";

const customLoader = ({ src, width }: any) => `${src}?w=${width}&q=80`;


/* -------------------------------------------------------------------------- */
/* Types & Helpers */
/* -------------------------------------------------------------------------- */

// const FALLBACK_IMAGE_URL =
//   "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop";

// const customLoader = ({ src, width, quality }: any) =>
//   `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "item") {
  if (!value) return fallback;
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

// Unified interface for the Grid Item
interface IBentoItem {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
  subtitle: string;
}

// Resolver for Category Images
function getCategoryImageUrl(cat: IStoreCategory) {
  const c: any = cat as any;
  if (c.imageUrl) return c.imageUrl;
  if (c.image) return c.image;
  return FALLBACK_IMAGE_URL;
}

// Resolver for Subcategory Images
function getSubcategoryImageUrl(sub: ISubcategory) {
  const s: any = sub as any;
  if (s.imageUrl) return s.imageUrl;
  if (s.image) return s.image;
  return FALLBACK_IMAGE_URL;
}

interface IBentoItem {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
  subtitle: string;
}

const BentoItem = ({
  item,
  className,
  index,
}: {
  item: IBentoItem;
  className?: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className={`relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900 ${className}`}
    >
      <Link href={`/fashionecommerce/products?category=${safeSlug(item.id)}`} className="block w-full h-full relative">
        <Image
          src={FALLBACK_IMAGE_URL}
          // item.imageUrl || 
          loader={customLoader}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        
        {/* Subtle Scrim - only at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Floating Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-end items-start">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            {item.subtitle}
          </span>
          <h3 className="text-2xl md:text-3xl font-light text-white tracking-tighter uppercase italic">
            {item.name}
          </h3>
          
          {/* Animated Underline */}
          <div className="mt-4 h-px w-0 group-hover:w-12 bg-white transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  );
};

export default function CategoriesSection({ store }: { store: StoreForm | null }) {
  
  const storeSlug = store?.slug ?? "site";

  // Logic: Mix Categories and Subcategories to fill 4 slots
  const bentoItems: IBentoItem[] = useMemo(() => {
    const rawCategories = (store?.StoreCategory || [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // 1. Transform Main Categories into Bento Items
    const mainItems: IBentoItem[] = rawCategories.map((cat) => {
      const subCount = cat.subcategories?.filter((s) => s.visible).length || 0;
      return {
        id: cat.id || `cat-${Math.random()}`,
        name: cat.displayName || "Category",
        imageUrl: getCategoryImageUrl(cat),
        href: `/fashionecommerce/products?category=${safeSlug(cat.categoryId || cat.displayName || "category")}`,
        subtitle: subCount > 0 ? `${subCount} Collections` : "Browse Category",
      };
    });

    // 2. If we have enough main categories (4+), just use them
    if (mainItems.length >= 4) {
      return mainItems.slice(0, 4);
    }

    // 3. If NOT enough, harvest subcategories from the existing main categories
    // We prioritize the main categories first, then append subcategories
    const subItems: IBentoItem[] = [];
    
    rawCategories.forEach((cat) => {
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories
          .filter((s) => s.visible ?? true)
          // Optional: Sort subcategories if they have sortOrder
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) 
          .forEach((sub) => {
            subItems.push({
              id: sub.id || `sub-${Math.random()}`,
              name: sub.name || "Collection",
              imageUrl: getSubcategoryImageUrl(sub),
              href: `/fashionecommerce/products?subcategory=${safeSlug(sub.name || "collection")}`,
              subtitle: "Featured Collection",
            });
          });
      }
    });

    // 4. Combine: Main items first, then fill remainder with subItems
    const combined = [...mainItems, ...subItems];
    
    // Return top 4 unique items (ensure we don't accidentally duplicate if data is weird)
    return combined.slice(0, 4);

  }, [store, storeSlug]);

  if (bentoItems.length === 0) return null;

  return (
    <section className="py-32 bg-white dark:bg-zinc-950">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-4">
              Curated Selection
            </span>
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
              Explore <span className="font-serif italic lowercase text-zinc-400">the</span> <br />
              Collections
            </h2>
          </div>
          <Link 
            href={`/fashionecommerce/categories`}
            className="text-[10px] font-black uppercase tracking-[0.3em] py-4 border-b border-zinc-900 dark:border-white text-zinc-900 dark:text-white hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors"
          >
            View All Series
          </Link>
        </div>

        {/* Luxury Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[1200px] md:h-[800px]">
          
          {/* Main Hero Category */}
          <BentoItem 
            index={0}
            item={bentoItems[0]} 
            className="md:col-span-7 md:row-span-2" 
          />

          {/* Side Stack */}
          <BentoItem 
            index={1}
            item={bentoItems[1]} 
            className="md:col-span-5 md:row-span-1" 
          />

          {/* Bottom Split */}
          <BentoItem 
            index={2}
            item={bentoItems[2]} 
            className="md:col-span-2 md:row-span-1" 
          />
          <BentoItem 
            index={3}
            item={bentoItems[3]} 
            className="md:col-span-3 md:row-span-1" 
          />
          
        </div>
      </div>
    </section>
  );
}