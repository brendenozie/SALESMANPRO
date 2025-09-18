"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  BookOpenIcon,
  ChartBarIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { IBlog } from "@/types/typings";

// interface IBlogPost {
//   id: string;
//   title: string;
//   excerpt: string;
//   slug: string;
//   category?: string;   // e.g. article, guide, tool
//   coverImage?: string;
// }

// Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

// Map blog category to icons
const getIconForCategory = (category?: string) => {
  switch (category) {
    case "article":
      return <BookOpenIcon className="h-6 w-6 text-primary" />;
    case "tool":
      return <BeakerIcon className="h-6 w-6 text-green-500" />;
    case "guide":
      return <ChartBarIcon className="h-6 w-6 text-purple-500" />;
    case "report":
      return <ChartBarIcon className="h-6 w-6 text-blue-500" />;
    default:
      return <SparklesIcon className="h-6 w-6 text-gray-500" />;
  }
};

export default function WellnessHubSection({ blogs = [] }: { blogs?: IBlog[] }) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* background blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.h2
          className="mb-16 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          Unlock Your Potential with{" "}
          <span className="text-primary-dark">Health Insights & Smart Tools</span> ✨
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {blogs.map((blog) => (
            <motion.a
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="block bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100 relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              variants={itemVariants}
            >
              {blog.coverImage && (
                <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 blur-sm"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/50 to-white/0" />
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  {getIconForCategory(blog.category || 'report')}
                  <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    {blog.category ?? "Article"}
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-primary-dark transition-colors duration-200">
                  {blog.title}
                </h3>
                <p className="text-gray-700 mb-6 line-clamp-3 flex-grow">
                  {blog.excerpt}
                </p>

                <span className="mt-auto inline-flex items-center text-primary-dark font-semibold hover:underline group-hover:translate-x-1 transition-transform duration-200">
                  Explore Now <ArrowRightIcon className="h-4 w-4 ml-2" />
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <a
            href="/blog"
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            View All Resources
            <ArrowRightIcon className="h-5 w-5 ml-3" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
