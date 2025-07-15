"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/solid'; // Keeping ArrowRightIcon for category navigation

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  icon?: React.ElementType; // Optional icon for the category
}

interface EnhancedCategoriesSectionProps {
  categories: Category[];
  slug: string; // Base slug for navigation, e.g., 'movies', 'tv-shows'
}

/**
 * Enhanced Categories Section
 * Displays visually appealing and interactive category cards for media content.
 */
export default function EnhancedCategoriesSection({
  categories,
  slug,
}: EnhancedCategoriesSectionProps) {
  const router = useRouter();

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.05, boxShadow: "0 15px 30px rgba(0,0,0,0.4)" }, // More pronounced shadow on hover
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Explore Diverse Worlds 🌍
          <span className="block w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span> {/* Underline effect */}
        </motion.h2>

        {/* Categories Grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat, index) => {
            const IconComponent = cat.icon; // Get the icon component if provided
            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 15,
                  delay: index * 0.1, // Staggered animation
                }}
                className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group aspect-video" // Added aspect-video for consistent ratio
                onClick={() => router.push(`/${slug}/category/${cat.slug}`)}
                aria-label={`Explore ${cat.name} category`}
              >
                {/* Background Image */}
                <Image
                  src={cat.imageUrl || 'jump'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover w-full h-full brightness-[.6] group-hover:brightness-[.5] group-hover:scale-110 transition-all duration-500 ease-in-out" // Subtle zoom on hover
                  priority={index < 4} // Prioritize loading for the first few categories
                />

                {/* Overlay Gradient (Darker on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/90 transition-all duration-300" />

                {/* Content */}
                <motion.div
                  className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start"
                  variants={textVariants}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }} // Staggered text reveal
                >
                  {IconComponent && (
                    <motion.div
                      className="mb-2 p-2 bg-red-600 rounded-full text-white"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.6, duration: 0.5, type: "spring", stiffness: 300 }}
                    >
                      <IconComponent className="h-6 w-6" />
                    </motion.div>
                  )}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-md">
                    {cat.name}
                  </h3>
                  <div className="inline-flex items-center text-red-400 group-hover:text-red-300 transition-colors duration-300">
                    <span className="text-sm font-medium">View All</span>
                    <ArrowRightIcon className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}