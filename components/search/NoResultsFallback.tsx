"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ArrowPathIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { CompactListingCardDTO } from "@/lib/search/types";

interface NoResultsFallbackProps {
  searchTerm?: string;
  category?: string;
  hasActiveFilters?: boolean;
  onClearFilters: () => void;
  onSelectAlternativeQuery?: (query: string) => void;
  alternativeQueries?: string[];
  relatedCategories?: Array<{ id: string; name: string; slug: string; count?: number }>;
  recommendedProducts?: CompactListingCardDTO[];
  scope?: "GHUBA" | "STORE";
}

export default function NoResultsFallback({
  searchTerm,
  category,
  hasActiveFilters,
  onClearFilters,
  onSelectAlternativeQuery,
  alternativeQueries = [],
  relatedCategories = [],
  recommendedProducts = [],
  scope = "GHUBA",
}: NoResultsFallbackProps) {
  return (
    <div className="space-y-10 py-6">
      {/* 1. Main Notice Card */}
      <div className="flex flex-col items-center justify-center py-14 px-6 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
          <MagnifyingGlassIcon className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          {searchTerm ? (
            <>
              No results found for <span className="text-amber-600 dark:text-amber-400">"{searchTerm}"</span>
            </>
          ) : (
            "No products match your selected filters"
          )}
        </h3>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
          Check for spelling mistakes, try more general terms, or remove some filters to broaden your search.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Clear Active Filters
            </button>
          )}

          {category && (
            <Link
              href={scope === "GHUBA" ? `/ghuba/productlist` : `/ecommerce/products`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              View All Products
            </Link>
          )}
        </div>

        {/* Alternative Query Suggestions */}
        {alternativeQueries.length > 0 && onSelectAlternativeQuery && (
          <div className="mt-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-sm">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Did you mean:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {alternativeQueries.map((alt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectAlternativeQuery(alt)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors"
                >
                  "{alt}"
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Related Categories Shortcuts */}
      {relatedCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-blue-500" />
            <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Explore Popular Categories
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={
                  scope === "GHUBA"
                    ? `/ghuba/productlist?category=${encodeURIComponent(cat.name)}`
                    : `/ecommerce/products?category=${encodeURIComponent(cat.name)}`
                }
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. Recommended / Trending Products Grid */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              You Might Also Like
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendedProducts.slice(0, 4).map((prod) => (
              <Link
                key={prod.id}
                href={
                  scope === "GHUBA"
                    ? `/ghuba/productlist/${prod.id}`
                    : `/ecommerce/products/${prod.id}`
                }
                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800">
                  {prod.images?.[0] && (
                    <Image
                      src={prod.images[0]}
                      alt={prod.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-3.5 space-y-1">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 transition-colors">
                    {prod.name}
                  </p>
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                    KES {prod.finalPrice?.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
