"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
  ArrowRightIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CubeTransparentIcon,
  HomeIcon,
  LightBulbIcon,
  MegaphoneIcon,
  PhoneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import type { StoreForm, IStoreCategory, ISubcategory } from "@/types/typings";

/* -------------------------------------------------------------------------- */
/* Configuration / Helpers                                                     */
/* -------------------------------------------------------------------------- */

const MAX_SUBCATEGORIES = 8;
const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1600596542815-2250c36ee326?q=80&w=2000&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

function getCategoryImageUrl(cat: Partial<IStoreCategory>) {
  const anyCat = cat as any;
  if (anyCat.imageUrl) return anyCat.imageUrl;
  if (anyCat.image) return anyCat.image;
  return FALLBACK_IMAGE_URL;
}

function f(sub: Partial<ISubcategory>) {
  const anySub = sub as any;
  if (anySub.imageUrl) return anySub.imageUrl;
  if (anySub.image) return anySub.image;
  return FALLBACK_IMAGE_URL;
}

/**
 * Color + icon resolver to keep visuals consistent
 */
function resolveCategoryStyle(_name: string | undefined, index: number) {
  const themes = [
    {
      accent: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "group-hover:border-emerald-500",
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      accent: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "group-hover:border-blue-500",
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      accent: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "group-hover:border-violet-500",
      gradient: "from-violet-600 to-purple-600",
    },
    {
      accent: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "group-hover:border-amber-500",
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  const icons = [
    <HomeIcon className="w-6 h-6" key="home" />,
    <BuildingOffice2Icon className="w-6 h-6" key="office" />,
    <BuildingLibraryIcon className="w-6 h-6" key="bldg" />,
    <LightBulbIcon className="w-6 h-6" key="idea" />,
    <PhoneIcon className="w-6 h-6" key="phone" />,
    <CubeTransparentIcon className="w-6 h-6" key="cube" />,
    <MegaphoneIcon className="w-6 h-6" key="megaphone" />,
  ];

  const idx = Math.abs(index) % themes.length;
  const icon = icons[index % icons.length] || icons[0];
  const theme = themes[idx];

  return { icon, theme };
}

/* -------------------------------------------------------------------------- */
/* Animations                                                                  */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

/* -------------------------------------------------------------------------- */
/* Small components                                                            */
/* -------------------------------------------------------------------------- */

function DotPattern() {
  return (
    <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
        <defs>
          <pattern id="dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* CategoryCard - big visual tile                                              */
/* -------------------------------------------------------------------------- */
function CategoryCard({
  cat,
  storeSlug,
  index,
}: {
  cat: IStoreCategory;
  storeSlug?: string | null;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const catSlug = safeSlug(cat.categoryId || cat.displayName || "category");
  const imageUrl = imgError ? FALLBACK_IMAGE_URL : getCategoryImageUrl(cat);
  const { icon, theme } = resolveCategoryStyle(cat.displayName || "", index);
  const subCount = (cat.subcategories || []).filter((s) => s.visible ?? true).length;

  return (
    <motion.div variants={itemVariants} className="group h-full">
      <Link
        href={`/${storeSlug}/category/${catSlug}`}
        className="block relative h-[360px] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-lg transition-all duration-500 hover:shadow-2xl dark:bg-gray-800"
        aria-label={`View category ${cat.displayName}`}
      >
        {/* Image */}
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={cat.displayName || "Category"}
            fill
            loader={customLoader}
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-85 transition-opacity" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
          <div className="absolute top-6 right-6 translate-y-[-10px] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
              <ArrowRightIcon className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
          </div>

          <div className="translate-y-4 transition-transform duration-500 ease-out group-hover:translate-y-0">
            <div
              className={`mb-3 inline-flex items-center justify-center rounded-xl p-2.5 text-white bg-gradient-to-br ${theme.gradient} shadow-lg`}
            >
              {icon}
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight mb-1">
              {cat.displayName}
            </h3>

            <div className="flex items-center justify-between border-t border-white/20 pt-3 mt-3 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium text-gray-300">
                {subCount > 0 ? `${subCount} Collections` : "Explore"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/90 bg-white/10 px-2 py-1 rounded">
                View
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* SubcategoryTile - compact tile                                               */
/* -------------------------------------------------------------------------- */
function SubcategoryTile({
  sub,
  storeSlug,
  index,
}: {
  sub: ISubcategory & { index?: number };
  storeSlug?: string | null;
  index: number;
}) {
  const { icon, theme } = resolveCategoryStyle(sub.name, index);

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={`/${storeSlug}/subcategory/${safeSlug(sub.slug || sub.name)}`}
        className={`group relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${theme.border}`}
        aria-label={`View subcategory ${sub.name}`}
      >
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${theme.bg} ${theme.accent}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="truncate text-base font-bold text-gray-900 dark:text-gray-100">
            {sub.name}
          </h4>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
            Browse <ArrowRightIcon className="w-3 h-3" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Fallback categories for empty states                                         */
/* -------------------------------------------------------------------------- */
const fallbackCategories: IStoreCategory[] = [
  {
    id: "fallback-1",
    categoryId: "general",
    displayName: "General",
    visible: true,
    sortOrder: 0,
    subcategories: [],
  } as unknown as IStoreCategory,
];

/* -------------------------------------------------------------------------- */
/* Public component                                                            */
/* -------------------------------------------------------------------------- */

export default function CategoriesSection({
  store,
  showSkeleton = false,
}: {
  store: StoreForm | null;
  showSkeleton?: boolean;
}) {
  const storeSlug = store?.slug ?? "site";

  const categoriesToShow = useMemo(() => {
    const raw = (store?.StoreCategory ?? [])
      .filter((c: IStoreCategory) => (c.visible ?? true))
      .sort((a: IStoreCategory, b: IStoreCategory) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return raw.length ? raw : fallbackCategories;
  }, [store]);

  const isFew = categoriesToShow.length <= 8;

  const limitedSubcategories = useMemo(() => {
    if (!isFew) return [];
    let list: (ISubcategory & { index?: number })[] = [];
    categoriesToShow.forEach((pcat) => {
      if (pcat.subcategories) {
        list.push(
          ...(pcat.subcategories
            .filter((s) => (s.visible ?? true))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .slice(0, Math.ceil(MAX_SUBCATEGORIES / Math.max(1, categoriesToShow.length)))
            .map((s, i) => ({ ...s, index: i } as ISubcategory & { index?: number })))
        );
      }
    });
    return list.slice(0, MAX_SUBCATEGORIES);
  }, [categoriesToShow, isFew]);

  return (
    <section className="relative overflow-hidden bg-gray-50 py-24 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <DotPattern />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wide mb-4"
          >
            <SparklesIcon className="w-4 h-4" />
            {isFew ? "Curated Selections" : "Discover More"}
          </motion.div>

          <motion.h2
            className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 text-gray-900 dark:text-white"
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            {isFew ? (
              <>
                Popular{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  Collections
                </span>
              </>
            ) : (
              <>
                Explore by{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                  Category
                </span>
              </>
            )}
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
          >
            {isFew
              ? "Refine your search with our most popular specific collections."
              : "Browse our categories to discover products and collections curated for you."}
          </motion.p>
        </div>

        {/* Content */}
        {showSkeleton ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[360px] rounded-3xl bg-gray-200/60 animate-pulse" />
            ))}
          </div>
        ) : isFew ? (
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
          >
            {limitedSubcategories.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center text-gray-500">
                <CubeTransparentIcon className="mb-3 h-10 w-10 text-gray-400" />
                <p>No specific subcategories found.</p>
              </div>
            ) : (
              limitedSubcategories.map((sub, idx) => (
                <SubcategoryTile
                  key={sub.id}
                  sub={sub}
                  storeSlug={storeSlug}
                  index={idx}
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
          >
            {categoriesToShow.map((cat, idx) => (
              <CategoryCard key={cat.id} cat={cat} storeSlug={storeSlug} index={idx} />
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <Link href={`/${storeSlug}/categories`}  className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-white dark:text-gray-900 dark:hover:bg-emerald-400">
              View Full Catalog
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
