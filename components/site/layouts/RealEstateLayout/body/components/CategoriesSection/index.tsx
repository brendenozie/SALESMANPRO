"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

// Loader for Next.js Image
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion animation variants for categories
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

// Framer Motion animation variants for subcategories
const subcategoryContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};
const subcategoryItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

// Sample fallback categories for a property store
const fallbackCategories: IStoreCategory[] = [
  {
    id: "sample-1",
    categoryId: "property",
    displayName: "Property",
    icon: "🏠",
    sortOrder: 0,
    visible: true,
    subcategories: [
      { id: "Ho0", name: "Houses", slug: "houses", sortOrder: 0, visible: true },
      { id: "Ap1", name: "Apartments", slug: "apartments", sortOrder: 1, visible: true },
      { id: "La2", name: "Land", slug: "land", sortOrder: 2, visible: true },
      { id: "Co3", name: "Commercial", slug: "commercial", sortOrder: 3, visible: true },
      { id: "Va4", name: "Vacation Rentals", slug: "vacation-rentals", sortOrder: 4, visible: true },
      { id: "Du5", name: "Duplexes", slug: "duplexes", sortOrder: 5, visible: true },
      { id: "To6", name: "Townhouses", slug: "townhouses", sortOrder: 6, visible: true },
      { id: "Ru7", name: "Rural Properties", slug: "rural-properties", sortOrder: 7, visible: true },
      { id: "Fa8", name: "Farms", slug: "farms", sortOrder: 8, visible: true }, // This will be excluded due to the 8-item limit
    ],
    allBrands: [],
    companyId: "",
  },
  {
    id: "sample-2",
    categoryId: "vehicle",
    displayName: "Vehicles",
    icon: "🚗",
    sortOrder: 1,
    visible: true,
    subcategories: [
      { id: "Ca0", name: "Cars", slug: "cars", sortOrder: 0, visible: true },
      { id: "Mo1", name: "Motorcycles", slug: "motorcycles", sortOrder: 1, visible: true },
    ],
    allBrands: [],
    companyId: "",
  },
  {
    id: "sample-3",
    categoryId: "electronics",
    displayName: "Electronics",
    icon: "📱",
    sortOrder: 2,
    visible: true,
    subcategories: [],
    allBrands: [],
    companyId: "",
  },
];

type CategoriesSectionProps = {
  store: StoreForm | null;
};

export default function CategoriesSection({ store }: CategoriesSectionProps) {
  const rawCategories = (store?.StoreCategory ?? [])
    .slice()
    .filter((c) => c.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const categoriesToShow = rawCategories.length > 0 ? rawCategories : fallbackCategories;

  const isFewParentCategories = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const subcategoriesToDisplay: ISubcategory[] = [];
  if (isFewParentCategories) {
    categoriesToShow.forEach((parentCat:any) => {
      if (Array.isArray(parentCat.subcategories)) {
        subcategoriesToDisplay.push(...parentCat.subcategories
          .filter((sub:any) => sub.visible ?? true)
          .sort((a:any, b:any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        );
      }
    });
  }

  // Limit the number of subcategories to a maximum of 8
  const limitedSubcategories = subcategoriesToDisplay.slice(0, 10);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {isFewParentCategories ? (
            <>
              Explore Properties by{" "}
              <span className="text-emerald-600 dark:text-teal-400">Category</span>
            </>
          ) : (
            <>
              Explore Properties by{" "}
              <span className="text-emerald-600 dark:text-teal-400">Type</span>
            </>
          )}
          <span className="block w-24 h-1 bg-amber-400 mx-auto mt-4 rounded-full" />
        </motion.h2>

        {isFewParentCategories ? (
          // Render subcategory cards
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
            variants={subcategoryContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {limitedSubcategories.length === 0 && (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg">
                No subcategories available.
              </p>
            )}
            {limitedSubcategories.map((subcat) => {
              const imageUrl = `/images/subcategory-${subcat.slug}.jpg`;
              return (
                <Link key={subcat.id} href={`/${store?.slug}/subcategory/${subcat.slug}`} passHref>
                  <motion.a
                    className="block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group
                                   focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    variants={subcategoryItemVariants}
                    whileHover={{ scale: 1.03, zIndex: 1 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`View properties in ${subcat.name} subcategory`}
                  >
                    <div className="relative h-48 sm:h-56 w-full">
                      <Image
                        src={imageUrl}
                        alt={`Image of a ${subcat.name} property`}
                        layout="fill"
                        objectFit="cover"
                        className="transform transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90"
                        loader={customLoader}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                      <span
                        className="inline-block px-5 py-2 bg-emerald-600/90 dark:bg-emerald-700/90 text-white text-lg font-semibold uppercase tracking-wide rounded-full shadow-lg
                                   group-hover:bg-amber-400 group-hover:text-gray-900 group-hover:scale-105 transition-all duration-300 transform"
                      >
                        {subcat.name}
                      </span>
                    </div>
                  </motion.a>
                </Link>
              );
            })}
          </motion.div>
        ) : (
          // Render parent category cards
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {categoriesToShow.map((cat) => {
              const catSlug = cat.categoryId ?? (cat.displayName ?? "").toLowerCase().replace(/\s+/g, '-');
              const imageUrl = cat.category?.image ?? "/images/category-placeholder.jpg";
              return (
                <Link key={cat.id} href={`/${store?.slug}/category/${catSlug}`} passHref>
                  <motion.a
                    className="block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group
                                   focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                    variants={itemVariants}
                    whileHover={{ scale: 1.03, zIndex: 1 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`View properties in ${cat.displayName} category`}
                  >
                    <div className="relative h-48 sm:h-56 w-full">
                      <Image
                        src={imageUrl}
                        alt={`Image of a ${cat.displayName} property`}
                        layout="fill"
                        objectFit="cover"
                        className="transform transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90"
                        loader={customLoader}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                      <span
                        className="inline-block px-5 py-2 bg-emerald-600/90 dark:bg-emerald-700/90 text-white text-lg font-semibold uppercase tracking-wide rounded-full shadow-lg
                                   group-hover:bg-amber-400 group-hover:text-gray-900 group-hover:scale-105 transition-all duration-300 transform"
                      >
                        {cat.displayName}
                        {cat.subcategories.length > 0 && (
                          <span className="ml-2 text-xs opacity-80">({cat.subcategories.length})</span>
                        )}
                      </span>
                    </div>
                  </motion.a>
                </Link>
              );
            })}
          </motion.div>
        )}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Link href={`/${store?.slug}/categories`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                         text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                         dark:from-teal-600 dark:to-emerald-700 dark:hover:from-teal-700 dark:hover:to-emerald-800
                         focus:outline-none focus:ring-4 focus:ring-amber-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View all categories"
            >
              View All Categories
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}