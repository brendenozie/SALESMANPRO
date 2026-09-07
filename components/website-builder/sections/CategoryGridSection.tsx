"use client";

import React from "react";
import Link from "next/link";
import { ThemeTokens, CommerceDataSource } from "@/types/website-builder";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface CategoryGridProps {
  content: {
    title?: string;
    subtitle?: string;
    showProductCount?: boolean;
    layout?: "grid" | "carousel" | "pills";
  };
  dataSource?: CommerceDataSource;
  theme: ThemeTokens;
  categories?: any[];
  isEditorPreview?: boolean;
}

const DEFAULT_CATEGORIES = [
  { id: "c1", name: "Fashion & Apparel", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=400&auto=format&fit=crop", productCount: 42 },
  { id: "c2", name: "Electronics & Audio", image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop", productCount: 28 },
  { id: "c3", name: "Home & Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop", productCount: 35 },
  { id: "c4", name: "Beauty & Wellness", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop", productCount: 19 },
  { id: "c5", name: "Watches & Accessories", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop", productCount: 14 },
  { id: "c6", name: "Sports & Fitness", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop", productCount: 22 },
];

export default function CategoryGridSection({
  content,
  theme,
  categories = DEFAULT_CATEGORIES,
}: CategoryGridProps) {
  const { title = "Shop by Category", subtitle = "Explore curated collections", showProductCount = true } = content;
  const displayCategories = categories.length ? categories : DEFAULT_CATEGORIES;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {displayCategories.map((cat: any) => (
          <Link
            key={cat.id || cat.slug || cat.name}
            href={`/shop?category=${cat.slug || cat.id || ""}`}
            className="group relative flex flex-col items-center text-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 transition-all hover:bg-white dark:hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-zinc-200 dark:bg-zinc-800">
              <img
                src={cat.image || cat.icon || "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=400&auto=format&fit=crop"}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-rose-500 transition-colors">
              {cat.displayName || cat.name}
            </h3>

            {showProductCount && cat.productCount !== undefined && (
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {cat.productCount} items
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
