"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { IStoreCategory, StoreForm, ISubcategory } from "@/types/typings";

// Animation Variants
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

// Example fallback categories (for demonstration)
const fallbackSubcategories: ISubcategory[] = [
  { id: "leadership", name: "Leadership Coaching", slug: "leadership", sortOrder: 0, visible: true },
  { id: "career", name: "Career Transition", slug: "career", sortOrder: 1, visible: true },
  { id: "mindset", name: "Mindset Mastery", slug: "mindset", sortOrder: 2, visible: true },
  { id: "team", name: "Team Building", slug: "team", sortOrder: 3, visible: true },
  { id: "confidence", name: "Confidence Coaching", slug: "confidence", sortOrder: 4, visible: true },
  { id: "executive", name: "Executive Coaching", slug: "executive", sortOrder: 5, visible: true },
  { id: "relationship", name: "Relationship Coaching", slug: "relationship", sortOrder: 6, visible: true },
  { id: "growth", name: "Personal Growth", slug: "growth", sortOrder: 7, visible: true },
  { id: "clarity", name: "Clarity & Vision", slug: "clarity", sortOrder: 8, visible: true },
];

type CoachingProgramsSectionProps = {
  store: StoreForm | null;
};

export default function CoachingProgramsSection({ store }: CoachingProgramsSectionProps) {
  const allSubcategories: ISubcategory[] = [];
  (store?.StoreCategory ?? []).forEach(parentCat => {
    if (Array.isArray(parentCat.subcategories)) {
      allSubcategories.push(...parentCat.subcategories);
    }
  });

  const rawSubcategories = allSubcategories
    .filter(sub => sub.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const subcategoriesToShow = rawSubcategories.length > 0 ? rawSubcategories : fallbackSubcategories;
  const limitedSubcategories = subcategoriesToShow.slice(0, 9);

  return (
    <section id="programs" className="py-20 md:py-28 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-black relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100/10 to-red-100/10 dark:from-orange-600/10 dark:to-red-800/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          Explore My{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
            Coaching Programs
          </span>
        </motion.h2>

        <motion.p
          className="max-w-3xl mx-auto text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2 }}
        >
          Discover personalized coaching and consulting experiences designed to help you lead, grow, and thrive — both personally and professionally.
        </motion.p>

        {/* Program Cards Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {limitedSubcategories.map((subcat) => {
            const imageUrl = `/images/program-${subcat.slug}.jpg`;
            return (
              <Link key={subcat.slug} href={`/programs/${subcat.slug}`} passHref>
                <motion.a
                  className="block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                  variants={itemVariants}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="relative w-full h-48 sm:h-56">
                    <Image
                      src={imageUrl}
                      alt={`${subcat.name}`}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-110"
                      loader={customLoader}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <span
                      className="inline-block px-5 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white text-lg font-semibold uppercase tracking-wide rounded-full shadow-lg
                                   group-hover:from-orange-500 group-hover:to-red-500 group-hover:scale-105 transition-all duration-300"
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
          <Link href="/programs" passHref>
            <motion.a
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full shadow-xl
                         text-white bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700
                         focus:outline-none focus:ring-4 focus:ring-orange-400/70 transition-all duration-300 transform hover:scale-[1.04]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All Programs
              <ArrowRightIcon className="ml-2 -mr-1 w-6 h-6" />
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
