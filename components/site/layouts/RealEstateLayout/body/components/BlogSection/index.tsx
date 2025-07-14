"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDaysIcon, UserCircleIcon } from '@heroicons/react/24/solid'; // New icons for date and author

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each item animates with a slight delay
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring", // More natural bounce
      stiffness: 100, // Less stiff
      damping: 10,    // More damping
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// BlogSection
//──────────────────────────────────────────────────────────────────────────────
export default function BlogSection({ posts, slug }: any) {
  // Handle empty posts array gracefully
  if (!posts || posts.length === 0) {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No blog posts available at the moment. Check back soon for new insights!</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Our Latest <span className="text-emerald-600 dark:text-teal-400">Insights</span>
          <span className="block w-32 h-1 bg-amber-500 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Blog Posts Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {posts.map((post) => (
            <Link key={post.id} href={`/site/${slug}/blog/${post.slug}`} passHref>
              <motion.article
                className="block bg-white dark:bg-gray-850 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }} // Lift and slightly scale on hover
                whileTap={{ scale: 0.98 }} // Satisfying tap effect
                aria-label={`Read post: ${post.title}`}
              >
                {post.imageUrl && (
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={`Cover image for ${post.title}`}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-115 group-hover:brightness-90"
                      loader={customLoader}
                    />
                    {/* Image Overlay for text readability */}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                )}

                <div className="p-6 flex flex-col justify-between min-h-[180px]"> {/* Added min-height for consistent card size */}
                  <div>
                    {post.category && (
                      <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                        {post.category}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3 line-clamp-2"> {/* line-clamp for title */}
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-base text-gray-700 dark:text-gray-300 mb-4 line-clamp-3"> {/* line-clamp for excerpt */}
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      {post.author?.avatarUrl ? (
                        <Image
                          src={post.author.avatarUrl}
                          alt={post.author.name}
                          width={36} // Slightly larger avatar
                          height={36}
                          className="rounded-full ring-2 ring-emerald-500 dark:ring-teal-400" // Ring for prominence
                          loader={customLoader}
                        />
                      ) : (
                        <UserCircleIcon className="w-9 h-9 text-gray-400 dark:text-gray-600" /> // Placeholder if no avatar
                      )}
                      <div className="flex flex-col">
                        {post.author?.name && (
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {post.author.name}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <CalendarDaysIcon className="w-3 h-3 mr-1" />
                          {new Date(post.publishedAt).toLocaleDateString("en-KE", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <Link href={`/site/${slug}/blog/${post.slug}`} passHref>
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center text-sm font-semibold bg-gradient-to-br from-emerald-500 to-teal-600 text-white uppercase px-5 py-2.5 rounded-full
                                   shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/70 transition duration-300"
                        aria-label={`Read the full article: ${post.title}`}
                      >
                        Read More
                        <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                      </motion.a>
                    </Link>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </motion.div>

        {/* Optional: View All Blog Posts Button */}
        {posts.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <Link href={`/site/${slug}/blog`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                           text-white bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700
                           dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800
                           focus:outline-none focus:ring-4 focus:ring-emerald-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all blog posts"
              >
                View All Posts
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}