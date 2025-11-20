"use client";

import React, { useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowDownCircleIcon,
  BuildingLibraryIcon,
  HomeIcon,
  LightBulbIcon,
  PhoneIcon,
  CubeTransparentIcon,
  ArrowRightIcon, // New icon for CTA
} from "@heroicons/react/24/outline";
import { BuildingOffice2Icon, MegaphoneIcon } from "@heroicons/react/24/solid"; // New icon for subcategory count

/* -------------------------------------------------------------------------- */
/* Constants & Helpers (Re-used/Adjusted) */
/* -------------------------------------------------------------------------- */
const MAX_SUBCATEGORIES = 10;
const FALLBACK_IMAGE_URL = "https://hips.hearstapps.com/hmg-prod/images/edc100123egan-002-6500742f5feb7.jpg";
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Helper Functions (Reused/Simplified) ---
function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function getCategoryImageUrl(cat: IStoreCategory, slug?: string) {
  const c: any = cat as any;
  if (c.imageUrl) return c.imageUrl;
  if (c.image) return c.image;
  const s = slug || safeSlug(c.displayName || c.categoryId || c.id);
  // Using more robust fallback images
  return `https://hips.hearstapps.com/hmg-prod/images/edc100123egan-002-6500742f5feb7.jpg`;
}

function getSubcategoryImageUrl(sub: ISubcategory) {
  const s: any = sub as any;
  if (s.imageUrl) return s.imageUrl;
  if (s.image) return s.image;
  const subSlug = safeSlug(s.name || s.slug || s.id);
  return `https://hips.hearstapps.com/hmg-prod/images/edc100123egan-002-6500742f5feb7.jpg`;
}

/**
 * Minimal theme/icon resolver: Picks colors to match the primary Emerald/Amber theme.
 */
function resolveCategoryStyle(_name: string, index: number) {
  const themes = [
    { text: "text-emerald-500", glow: "from-emerald-400", ring: "ring-emerald-500", bg: "bg-emerald-500" },
    { text: "text-amber-500", glow: "from-amber-400", ring: "ring-amber-500", bg: "bg-amber-500" },
    { text: "text-sky-500", glow: "from-sky-400", ring: "ring-sky-500", bg: "bg-sky-500" },
    { text: "text-rose-500", glow: "from-rose-400", ring: "ring-rose-500", bg: "bg-rose-500" },
    { text: "text-violet-500", glow: "from-violet-400", ring: "ring-violet-500", bg: "bg-violet-500" },
  ];

  const icons = [
    <HomeIcon className="w-7 h-7" key="home" />,
    <BuildingOffice2Icon className="w-7 h-7" key="office" />,
    <BuildingLibraryIcon className="w-7 h-7" key="bldg" />,
    <LightBulbIcon className="w-7 h-7" key="idea" />,
    <PhoneIcon className="w-7 h-7" key="phone" />,
    <CubeTransparentIcon className="w-7 h-7" key="cube" />,
    <MegaphoneIcon className="w-7 h-7" key="megaphone" />,
  ];

  const idx = Math.abs(index) % themes.length;
  const icon = icons[index % icons.length] || icons[0];
  const theme = themes[idx];

  return { icon, theme };
}

// Basic fallback categories (kept simple)
const fallbackCategories: IStoreCategory[] = [
  {
    id: `https://fallback.com`,
    categoryId: "misc",
    displayName: "General Properties",
    visible: true,
    sortOrder: 0,
    subcategories: [],
  } as unknown as IStoreCategory,
];

/* -------------------------------------------------------------------------- */
/* Animation (Refined) */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }, // Slightly faster
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

/* -------------------------------------------------------------------------- */
/* Category Card V4 (High Impact Image Card) */
/* -------------------------------------------------------------------------- */

export function CategoryCardV4({
  cat,
  storeSlug,
  index,
}: {
  cat: IStoreCategory;
  storeSlug?: string | null;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const catSlug = safeSlug(cat.categoryId || cat.displayName || "category") || "category";
  const imageUrl = imgError ? FALLBACK_IMAGE_URL : getCategoryImageUrl(cat, catSlug);
  const { icon, theme } = resolveCategoryStyle(cat.displayName || "category", index);
  const subcategoryCount = cat.subcategories?.filter(s => s.visible).length || 0;

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/${storeSlug}/category/${catSlug}`} aria-label={cat.displayName ?? undefined} passHref legacyBehavior>
        <a 
          className={`relative block rounded-2xl overflow-hidden shadow-2xl group transition-all duration-300 transform-gpu perspective-1000 
                     bg-gray-900 ring-2 ring-gray-100 dark:ring-gray-800
                     hover:ring-4 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-gray-900 ${theme.ring}
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:${theme.ring}`}
        >
          {/* Card Image Area (Reduced opacity on hover for better text readability) */}
          <div className="relative h-64 w-full">
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              loader={customLoader}
              onError={() => setImgError(true)}
              className="object-cover group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-60"
            />
            {/* Dark Gradient Overlay for high contrast text */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent`} />
          </div>

          {/* Content Area (Always visible at the bottom) */}
          <div className="absolute inset-x-0 bottom-0 p-6 pt-12 flex flex-col justify-end text-white">
            
            {/* Icon Badge (Top-left of the text block) */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border-2 border-white/30 transition-all duration-300 group-hover:bg-white group-hover:${theme.text}`}
            >
              {icon}
            </div>

            {/* Name Tag */}
            <span className="text-3xl font-extrabold drop-shadow-lg leading-tight">
              {cat.displayName}
            </span>
            
            {/* Subcategory Count & CTA */}
            <p className="mt-2 text-sm font-medium text-gray-300 flex items-center gap-1">
              {subcategoryCount > 0 
                ? `${subcategoryCount} Sub-types available`
                : 'View properties in this category'
              }
            </p>

            {/* Hover Reveal CTA (Bottom right) */}
            <motion.span
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`absolute top-6 right-6 px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1
                         bg-white ${theme.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md`}
            >
              Browse <ArrowRightIcon className="w-4 h-4" />
            </motion.span>
          </div>
        </a>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcategory Card V4 (Pill/Tag Card) */
/* -------------------------------------------------------------------------- */

export function SubcategoryCardV4({
  sub,
  storeSlug,
  index,
}: {
  sub: ISubcategory & { index: number };
  storeSlug?: string | null;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = imgError ? FALLBACK_IMAGE_URL : getSubcategoryImageUrl(sub);
  const { theme } = resolveCategoryStyle(sub.name, index); // Use theme for hover accent

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/${storeSlug}/subcategory/${sub.slug}`} aria-label={sub.name} passHref legacyBehavior>
        <a
          className="relative block rounded-full overflow-hidden shadow-lg group cursor-pointer h-16 sm:h-20
                     bg-white dark:bg-gray-800 transition-all duration-300 border border-gray-200 dark:border-gray-700
                     hover:border-transparent hover:shadow-xl hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-emerald-500"
        >
          {/* Background Image/Gradient */}
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={sub.name}
              fill
              sizes="20vw"
              loader={customLoader}
              onError={() => setImgError(true)}
              className="object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-500"
            />
          </div>

          {/* Centered Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <span className={`px-5 py-2 rounded-full font-bold text-lg transition-all duration-300 
              text-gray-900 dark:text-white 
              group-hover:text-white group-hover:${theme.bg} shadow-md`}>
              {sub.name}
            </span>
          </div>
        </a>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component V4 */
/* -------------------------------------------------------------------------- */

export default function CategoriesSectionV4({ store }: { store: StoreForm | null }) {
  const storeSlug = store?.slug ?? "site";

  const categoriesToShow = useMemo(() => {
    const raw = (store?.StoreCategory ?? [])
    .filter((c) => c.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return raw.length ? raw : fallbackCategories;
  }, [store]);

  const isFew = categoriesToShow.length <= 2;

  const limitedSubcategories = useMemo(() => {
    if (!isFew) return [];
    let list: (ISubcategory & { index: number })[] = [];
    categoriesToShow.forEach((pcat) => {
      if (pcat.subcategories) {
        list.push(
          ...(pcat.subcategories
            .filter((s) => s.visible ?? true)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .slice(0, MAX_SUBCATEGORIES / categoriesToShow.length)
            .map((s, i) => ({ ...s, index: i })) as (ISubcategory & { index: number })[])
        );
      }
    });
    return list.slice(0, MAX_SUBCATEGORIES); 
  }, [categoriesToShow, isFew]);


  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Dynamic Header */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.h2
          className="text-4xl lg:text-6xl font-extrabold text-center mb-4 text-gray-900 dark:text-gray-50"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {isFew ? (
            <>Popular Property <span className="text-amber-600 dark:text-amber-400">Sub-Types</span></>
          ) : (
            <>Explore Property <span className="text-emerald-600 dark:text-emerald-400">Categories</span></>
          )}
        </motion.h2>

        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto">
            {isFew 
                ? "Dive into specific property niches like apartments, villas, and commercial spaces."
                : "Browse our primary property classes to quickly narrow down your perfect search."
            }
        </p>

        {/* Dynamic Card Display */}
        {isFew ? (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {limitedSubcategories.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-10 flex items-center justify-center gap-2">
                <CubeTransparentIcon className="w-6 h-6"/> No subcategories found for display.
              </p>
            ) : (
              limitedSubcategories.map((sub) => (
                <SubcategoryCardV4
                  key={sub.id}
                  sub={sub}
                  storeSlug={storeSlug}
                  index={sub.index}
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {categoriesToShow.map((cat, idx) => (
              <CategoryCardV4
                key={cat.id}
                cat={cat}
                storeSlug={storeSlug}
                index={idx}
              />
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        <div className="text-center mt-20">
          <Link href={`/${storeSlug}/categories`} passHref>
            <motion.a
              whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center px-12 py-5 rounded-full bg-emerald-600 text-white font-extrabold text-lg uppercase tracking-wider transition-all duration-300 shadow-xl shadow-emerald-600/30
                         hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-50 focus-visible:ring-emerald-500"
            >
              View All Categories
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
          </Link>
        </div>
      </div>
    </section>
  );
}