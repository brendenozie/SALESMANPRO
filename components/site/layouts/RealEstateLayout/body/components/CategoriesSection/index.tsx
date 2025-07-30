"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { StoreCategory, Subcategory, StoreForm } from "@/types/typings"; // Ensure Subcategory is imported

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


// Sample fallback categories (updated to include subcategories if applicable)
const fallbackCategories: StoreCategory[] = [
  {
    id: "sample-1",
    categoryId: "property", // Changed to 'property' as per your sample
    displayName: "Property",
    name: "Property", // Added name for consistency
    icon: "🏠",
    sortOrder: 0,
    visible: true,
    items: [ // Populate with sample subcategories
      { id: "Ho0", name: "Houses", slug: "houses", sortOrder: 0, visible: true },
      { id: "La1", name: "Land", slug: "land", sortOrder: 1, visible: true },
      { id: "Co2", name: "Commercial", slug: "commercial", sortOrder: 2, visible: true },
      { id: "Ap3", name: "Apartments", slug: "apartments", sortOrder: 3, visible: true },
      { id: "Va4", name: "Vacation Rentals", slug: "vacation-rentals", sortOrder: 4, visible: true },
    ],
    allBrands: [],
    companyId: "",
    category: {
      id: "", name: "", slug: "", description: undefined, longDescription: undefined,
      seoTitle: undefined, seoDescription: undefined, metaKeywords: undefined,
      sortOrder: undefined, visible: undefined, isFeatured: undefined,
      showInHomepage: undefined, attributes: undefined, subcategories: undefined,
      icon: undefined, image: undefined
    }
  },
  { // Example of a second parent category if needed for testing isFewCategories = 2
    id: "sample-2",
    categoryId: "vehicle",
    displayName: "Vehicles",
    name: "Vehicles",
    icon: "🚗",
    sortOrder: 1,
    visible: true,
    items: [
      { id: "Ca0", name: "Cars", slug: "cars", sortOrder: 0, visible: true },
      { id: "Mo1", name: "Motorcycles", slug: "motorcycles", sortOrder: 1, visible: true },
    ],
    allBrands: [],
    companyId: "",
    category: {
      id: "", name: "", slug: "", description: undefined, longDescription: undefined,
      seoTitle: undefined, seoDescription: undefined, metaKeywords: undefined,
      sortOrder: undefined, visible: undefined, isFeatured: undefined,
      showInHomepage: undefined, attributes: undefined, subcategories: undefined,
      icon: undefined, image: undefined
    }
  },
  {
    id: "sample-3",
    categoryId: "electronics",
    displayName: "Electronics",
    name: "Electronics",
    icon: "📱",
    sortOrder: 2,
    visible: true,
    items: [], // No subcategories for this example
    allBrands: [],
    companyId: "",
    category: {
      id: "", name: "", slug: "", description: undefined, longDescription: undefined,
      seoTitle: undefined, seoDescription: undefined, metaKeywords: undefined,
      sortOrder: undefined, visible: undefined, isFeatured: undefined,
      showInHomepage: undefined, attributes: undefined, subcategories: undefined,
      icon: undefined, image: undefined
    }
  },
];

type CategoriesSectionProps = {
  store: StoreForm | null;
};

export default function CategoriesSection({ store }: CategoriesSectionProps) {
  // Pull categories from store, sorted and filtered by visibility
  const rawCategories = ((store && store.storeCategories) ?? [])
    .slice()
    .filter((c) => c.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // Decide whether to use store categories or fallback
  const categoriesToShow = rawCategories.length > 0 ? rawCategories : fallbackCategories;

  // Determine if we have few parent categories (1 or 2)
  const isFewParentCategories = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  // Collect all subcategories from the few parent categories to display
  const subcategoriesToDisplay: Subcategory[] = [];
  if (isFewParentCategories) {
    categoriesToShow.forEach(parentCat => {
      // Ensure parentCat.items is an array before concatenating
      if (Array.isArray(parentCat.items)) {
        subcategoriesToDisplay.push(...parentCat.items
          .filter(sub => sub.visible ?? true) // Filter visible subcategories
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) // Sort subcategories
        );
      }
    });
  }

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
              <span className="text-emerald-600 dark:text-teal-400">Subcategory</span>
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
          // Render subcategory cards if there are 1 or 2 parent categories
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
            variants={subcategoryContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {subcategoriesToDisplay.length === 0 && (
              <p className="col-span-full text-center text-gray-600 dark:text-gray-400 text-lg">
                No subcategories available for these parent categories.
              </p>
            )}
            {subcategoriesToDisplay.map((subcat) => {
              // You might need a more sophisticated way to get an image for a subcategory
              // For now, using a placeholder or a generic image
              const imageUrl = `/images/subcategory-placeholder-${subcat.slug}.jpg` || "/images/category-placeholder.jpg"; // You can map slugs to specific images

              return (
                <Link key={subcat.id} href={`/${store!.slug}/subcategory/${subcat.slug}`} passHref>
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
          // Render parent category cards as before if there are more than 2 parent categories
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {categoriesToShow.map((cat) => {
              const catSlug = (cat.categoryId || cat.displayName || "").toString().toLowerCase();
              const imageUrl = (cat as any).image || "/images/category-placeholder.jpg"; // Assuming `image` might be on StoreCategory

              return (
                <Link key={cat.id} href={`/${store!.slug}/category/${catSlug}`} passHref>
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
                        {cat.name || cat.displayName}
                        {cat.items.length > 0 && (
                          <span className="ml-2 text-xs opacity-80">({cat.items.length})</span>
                        )}
                      </span>
                    </div>
                  </motion.a>
                </Link>
              );
            })}
          </motion.div>
        )}

        {/* View All CTA - Adjust link based on context */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Link href={`/${store!.slug}/categories`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                         text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                         dark:from-teal-600 dark:to-emerald-700 dark:hover:from-teal-700 dark:hover:to-emerald-800
                         focus:outline-none focus:ring-4 focus:ring-amber-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View all categories" // Simplified as it always goes to categories page now
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
                  d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5
                    5a1 1 0 010 1.414l-5
                    5a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M4.293 15.707a1 1 0 010-1.414L8.586
                    10 4.293 5.707a1 1 0 011.414-1.414l5
                    5a1 1 0 010 1.414l-5 5a1 1 0
                    01-1.414 0z"
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