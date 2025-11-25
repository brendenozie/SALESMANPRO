"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Types & Helpers */
/* -------------------------------------------------------------------------- */

const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

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

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

/**
 * Bento Item Component
 * Now accepts a generic IBentoItem interface instead of raw Category data
 */
const BentoItem = ({
  item,
  className,
  priority = false,
}: {
  item: IBentoItem;
  className?: string;
  priority?: boolean;
}) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError ? FALLBACK_IMAGE_URL : item.imageUrl;

  return (
    <Link
      href={item.href}
      className={`relative block overflow-hidden rounded-2xl group cursor-pointer bg-gray-200 ${className}`}
    >
      {/* Image Background */}
      <Image
        src={imageUrl}
        loader={customLoader}
        alt={item.name}
        fill
        priority={priority}
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        onError={() => setImgError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 opacity-90 group-hover:opacity-100" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            {item.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <p className="text-white/80 text-sm font-medium">
              {item.subtitle}
            </p>
            
            {/* Hover Arrow Effect */}
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRightIcon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </Link>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Export */
/* -------------------------------------------------------------------------- */

export default function CategoriesSectionV5({
  store,
}: {
  store: StoreForm | null;
}) {
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
        href: `/${storeSlug}/category/${safeSlug(cat.categoryId || cat.displayName || "category")}`,
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
              href: `/${storeSlug}/subcategory/${safeSlug(sub.slug)}`,
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
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our curated collections designed to match your style and needs.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px] md:auto-rows-[300px]">
          
          {/* Slot 1: Large Item (Left Column, Spans 2 Rows) */}
          {bentoItems[0] && (
            <BentoItem
              item={bentoItems[0]}
              className="md:col-span-1 md:row-span-2 min-h-[400px]"
              priority={true}
            />
          )}

          {/* Slot 2: Small Item (Top Middle) */}
          {bentoItems[1] && (
            <BentoItem
              item={bentoItems[1]}
              className="md:col-span-1 md:row-span-1"
            />
          )}

          {/* Slot 3: Small Item (Top Right) */}
          {bentoItems[2] && (
            <BentoItem
              item={bentoItems[2]}
              className="md:col-span-1 md:row-span-1"
            />
          )}

          {/* Slot 4: Wide Item (Bottom Row, Spans 2 Columns) */}
          {bentoItems[3] && (
            <BentoItem
              item={bentoItems[3]}
              className="md:col-span-2 md:row-span-1"
            />
          )}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            href={`/${storeSlug}/categories`}
            className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            Browse All Categories
          </Link>
        </div>
      </div>
    </section>
  );
}