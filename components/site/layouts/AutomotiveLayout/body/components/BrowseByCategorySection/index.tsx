"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { StoreForm, ISubcategory } from "@/types/typings";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
};

const fallbackSubcategories: ISubcategory[] = [
  { id: "sedan", name: "Sedan", slug: "sedan", sortOrder: 0, visible: true, icon: "🚗" },
  { id: "suv", name: "SUV", slug: "suv", sortOrder: 1, visible: true, icon: "🚙" },
  { id: "truck", name: "Truck", slug: "truck", sortOrder: 2, visible: true, icon: "🚚" },
  { id: "coupe", name: "Coupe", slug: "coupe", sortOrder: 3, visible: true, icon: "🏎️" },
  { id: "convertible", name: "Convertible", slug: "convertible", sortOrder: 4, visible: true, icon: "🌞" },
];

type AutomotiveSubcategoriesSectionProps = {
  store: StoreForm | null;
};

export default function AutomotiveSubcategoriesSection({ store }: AutomotiveSubcategoriesSectionProps) {
  const allSubcategories: ISubcategory[] = [];
  (store?.StoreCategory ?? []).forEach(cat => {
    if (Array.isArray(cat.subcategories)) allSubcategories.push(...cat.subcategories);
  });

  const subcategories = allSubcategories.length > 0 ? allSubcategories : fallbackSubcategories;
  const limitedSubcategories = subcategories.slice(0, 10);

  const theme = store?.themeSettings || {};
  const primary = theme.primaryColor || "#2563eb"; // default blue
  const secondary = theme.secondaryColor || "#06b6d4"; // default cyan

  return (
    <section id="categories" className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Background Glow */}
      <div
        className="absolute inset-0 -z-10 blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle at top left, ${primary}33, transparent 60%), radial-gradient(circle at bottom right, ${secondary}33, transparent 60%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 mb-6 drop-shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          Explore by{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})`,
            }}
          >
            Type
          </span>
        </motion.h2>

        {/* Subcategories Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {limitedSubcategories.map((subcat) => {
            const icon = subcat.icon || "🚗";
            const hasImageIcon = icon.startsWith("http");

            return (
              <Link key={subcat.slug} href={`/search?subcategory=${subcat.slug}`} passHref>
                <motion.a
                  className="relative p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center shadow-sm
                             border border-white/20 backdrop-blur-xl
                             transition-all duration-300 group overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${primary}22, ${secondary}11)`,
                  }}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {/* Icon with glowing ring */}
                  {/* Floating Icon Badge */}
                  <motion.div
                    className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-xl
                               backdrop-blur-md border border-white/30 group-hover:scale-110 transition-transform duration-300  mb-4"
                    style={{
                      background: `linear-gradient(145deg, ${primary}55, ${secondary}55)`,
                      boxShadow: `0 4px 25px -5px ${primary}99`,
                    }}
                    whileHover={{ rotate: 5 }}
                  >
                    {hasImageIcon ? (
                      <img src={icon} alt={subcat.name} className="w-9 h-9 object-contain" />
                    ) : (
                      <span className="text-3xl">{icon}</span>
                    )}
                  </motion.div>

                  {/* Subcategory Name */}
                  <h3
                    className="text-lg font-semibold mb-1 transition-colors"
                    style={{
                      color: "var(--tw-prose-body)",
                    }}
                  >
                    {subcat.name}
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">View Listings</p>

                  {/* Glow Overlay on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${primary}66, ${secondary}66)`,
                    }}
                  />
                </motion.a>
              </Link>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <Link href={`/all-subcategories`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-medium shadow-lg
                         transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})`,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
