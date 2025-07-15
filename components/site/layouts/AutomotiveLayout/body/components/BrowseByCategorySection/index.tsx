// components/BrowseByCategory.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

// Dummy Data
const categories = [
  {
    name: "SUVs",
    imageUrl:
      "https://images.unsplash.com/photo-1593257140889-13045330388d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/search?type=suv",
  },
  {
    name: "Sedans",
    imageUrl:
      "https://images.unsplash.com/photo-1502744040961-d70377bb4113?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/search?type=sedan",
  },
  {
    name: "Trucks",
    imageUrl:
      "https://images.unsplash.com/photo-1601616428283-d9333917a1d1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/search?type=truck",
  },
  {
    name: "Electric Cars",
    imageUrl:
      "https://images.unsplash.com/photo-1577717903185-bc879a957a15?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/search?type=electric",
  },
  {
    name: "Luxury Cars",
    imageUrl:
      "https://images.unsplash.com/photo-1502766861239-165f159a4358?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/search?type=luxury",
  },
  {
    name: "Sport Cars",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e133d3c63?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    link: "/search?type=sport",
  },
  // Add more categories as needed
];

const categoryCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const loader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function BrowseByCategory() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 drop-shadow-sm"
        >
          Browse By Category
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
        >
          Find your preferred vehicle type or explore popular brands with ease.
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              variants={categoryCardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <Link href={category.link} className="block">
                <div className="w-full h-48 relative">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover object-center transform group-hover:scale-110 transition-transform duration-500 ease-out"
                    loader={loader}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-colors" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white text-2xl font-bold text-center drop-shadow-md">
                    {category.name}
                  </h3>
                  <ArrowRightIcon className="absolute right-4 bottom-4 h-8 w-8 text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Link
            href="/all-categories"
            className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-bold rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Explore All Categories
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}