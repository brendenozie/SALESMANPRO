"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { IStoreCategory, StoreForm, ISubcategory } from "@/types/typings";

// Framer Motion animation variants
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

// Loader for Next.js Image
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Sample fallback subcategories
const fallbackSubcategories: ISubcategory[] = [
  { id: "sedan", name: "Sedan", slug: "sedan", sortOrder: 0, visible: true },
  { id: "suv", name: "SUV", slug: "suv", sortOrder: 1, visible: true },
  { id: "truck", name: "Truck", slug: "truck", sortOrder: 2, visible: true },
  { id: "hatchback", name: "Hatchback", slug: "hatchback", sortOrder: 3, visible: true },
  { id: "coupe", name: "Coupe", slug: "coupe", sortOrder: 4, visible: true },
  { id: "minivan", name: "Minivan", slug: "minivan", sortOrder: 5, visible: true },
  { id: "convertible", name: "Convertible", slug: "convertible", sortOrder: 6, visible: true },
  { id: "van", name: "Van", slug: "van", sortOrder: 7, visible: true },
  { id: "wagon", name: "Wagon", slug: "wagon", sortOrder: 8, visible: true }, // This will be excluded
];

type AutomotiveSubcategoriesSectionProps = {
  store: StoreForm | null;
};

export default function AutomotiveSubcategoriesSection({ store }: AutomotiveSubcategoriesSectionProps) {
  const allSubcategories: ISubcategory[] = [];
  
  // Aggregate all subcategories from all parent categories
  (store?.StoreCategory ?? []).forEach(parentCat => {
    if (Array.isArray(parentCat.subcategories)) {
      allSubcategories.push(...parentCat.subcategories);
    }
  });

  // Filter, sort, and slice the subcategories
  const rawSubcategories = allSubcategories
    .filter(sub => sub.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const subcategoriesToShow = rawSubcategories.length > 0 ? rawSubcategories : fallbackSubcategories;

  // Limit the number of subcategories to a maximum of 8
  const limitedSubcategories = subcategoriesToShow.slice(0, 10);

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 mb-6 drop-shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          Explore by{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Type
          </span>
        </motion.h2>

        {/* Dynamic Grid of Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
          variants={containerVariants}
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
              <Link key={subcat.slug} href={`/search?subcategory=${subcat.slug}`} passHref>
                <motion.a
                  className="block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, zIndex: 1 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`View listings for ${subcat.name} vehicles`}
                >
                  <div className="relative w-full h-48 sm:h-56">
                    <Image
                      src={imageUrl}
                      alt={`${subcat.name} vehicle`}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90"
                      loader={customLoader}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <span
                      className="inline-block px-5 py-2 bg-blue-600/90 dark:bg-blue-700/90 text-white text-lg font-semibold uppercase tracking-wide rounded-full shadow-lg
                                   group-hover:bg-blue-400 group-hover:text-gray-900 group-hover:scale-105 transition-all duration-300 transform"
                    >
                      {subcat.name}
                    </span>
                  </div>
                </motion.a>
              </Link>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Link href={`/all-subcategories`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                         text-white bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700
                         dark:from-cyan-600 dark:to-blue-700 dark:hover:from-cyan-700 dark:hover:to-blue-800
                         focus:outline-none focus:ring-4 focus:ring-blue-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View all types"
            >
              View All Types
              <ArrowRightIcon className="ml-2 -mr-1 w-5 h-5" />
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}