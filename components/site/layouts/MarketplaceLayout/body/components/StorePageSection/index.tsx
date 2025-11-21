// Featured Products Section (Next.js + Tailwind + Framer Motion)

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBagIcon, ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid";
import { MarketListingForm } from "@/types/typings";

interface FeaturedProductsSectionProps {
  products: MarketListingForm[];
  storeSlug?: string;
}

export default function FeaturedProductsSection({ products = [], storeSlug = "site" }: FeaturedProductsSectionProps) {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <section className="relative py-24 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide mb-4"
          >
            <StarIcon className="w-4 h-4" /> Featured
          </motion.div>

          <motion.h2
            className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4"
            initial={{ opacity: 0, y: -16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Top Picks Just for You
          </motion.h2>

          <motion.p
            className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Discover customer favorites and hand‑selected products trending right now.
          </motion.p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No featured products available.</div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product.id}
                variants={item}
                className="group bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-800"
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={product.images?.[0].url || "https://via.placeholder.com/300/300/FFFFFF?text=No+Image"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-1 truncate">{product.name}</h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {product.description || "Beautifully crafted product just for you."}
                  </p>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xl font-extrabold">${product.finalPrice}</span>
                    {product.sellingPrice && (
                      <span className="text-sm line-through text-gray-400">${product.sellingPrice}</span>
                    )}
                  </div>

                  <Link
                    href={`/${storeSlug}/products/${product.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-3 font-semibold shadow hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all"
                  >
                    <ShoppingBagIcon className="w-5 h-5" /> View Product
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 text-center"
        >
          <Link
            href={`/${storeSlug}/products`}
            className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:bg-white dark:text-gray-900 dark:hover:bg-indigo-400"
          >
            View All Products
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
