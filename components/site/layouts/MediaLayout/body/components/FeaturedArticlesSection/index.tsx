"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CalendarDaysIcon, TagIcon } from '@heroicons/react/24/solid'; // Added relevant icons
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface Article {
  id: string;
  name: string; // Renamed from 'title' for consistency if needed, but 'title' is fine too
  title?:string;
  slug: string;
  imageUrl: string;
  subtitle: string; // Used as a short description/excerpt
  publishDate?: string; // e.g., "YYYY-MM-DD" or "Month Day, Year"
  category?: string; // e.g., "Reviews", "Interviews", "News"
  author?: string; // Optional author name
}

interface FeaturedArticlesSectionProps {
  featured: Article[];
  storeSlug: string; // To construct the navigation URL
}

/**
 * Intuitive, Engaging, and Innovative Featured Articles Section
 * Showcases key articles with a captivating visual design and interactive elements.
 */
export default function FeaturedArticlesSection({ featured, storeSlug }: FeaturedArticlesSectionProps) {
  const router = useRouter();

  // Animation variants for section heading
  const headingVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Animation variants for individual article cards
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 15 } },
    hover: {
      scale: 1.03,
      boxShadow: "0 18px 35px rgba(0,0,0,0.4)", // Deeper shadow on hover
      transition: { duration: 0.3 },
    },
  };

  return (
    <section id="articles" className="py-20 bg-gradient-to-br from-gray-950 to-black text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10 tracking-tight"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={headingVariants}
        >
          Insights & Stories 📖
          <span className="block w-28 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        {/* Featured Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"> {/* Adjusted grid layout and increased gap */}
          {featured && featured.map((art, index) => (
            <motion.div
              key={art.id}
              className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-xl cursor-pointer group" // Added group for combined hover effects
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }} // Staggered appearance
              onClick={() => router.push(`/${storeSlug}/article/${art.slug}`)}
              aria-label={`Read article: ${art.name}`}
            >
              {/* Article Thumbnail */}
              <div className="w-full h-56 md:h-64 relative overflow-hidden"> {/* Increased height */}
                <Image
                  src={art.imageUrl}
                  alt={art.name}
                  fill
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center brightness-[.7] group-hover:brightness-[.5] group-hover:scale-110 transition-all duration-500 ease-in-out" // Zoom & darken on hover
                  priority={index < 3} // Prioritize first few images
                />
                {/* Overlay for quick info on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  variants={{
                    hover: { opacity: 1, transition: { delay: 0.1 } }
                  }}
                >
                  <div className="p-5 w-full">
                    {art.category && (
                      <span className="inline-flex items-center text-xs font-medium bg-red-600 text-white px-3 py-1 rounded-full mb-2">
                        <TagIcon className="h-3 w-3 mr-1" /> {art.category}
                      </span>
                    )}
                    <p className="text-sm text-gray-300">
                      {art.author && <span className="font-semibold">{art.author}</span>}
                      {art.author && art.publishDate && " | "}
                      {art.publishDate && (
                        <span className="inline-flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" /> {art.publishDate}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Article Content */}
              <div className="p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                  {art.name || art.title}
                </h3>
                <p className="text-base text-gray-300 line-clamp-3 mb-4"> {/* Added line-clamp */}
                  {art.subtitle}
                </p>
                <motion.div
                  className="inline-flex items-center text-red-500 group-hover:text-red-400 font-semibold transition-colors duration-300"
                  whileHover={{ x: 5 }} // Slide arrow on hover
                >
                  Read More
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}