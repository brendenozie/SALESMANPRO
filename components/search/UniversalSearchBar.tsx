"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { AutocompleteResponseDTO } from "@/lib/search/types";

interface UniversalSearchBarProps {
  scope?: "GHUBA" | "STORE";
  companyId?: string;
  storeSlug?: string;
  placeholder?: string;
  className?: string;
  onSearchSubmit?: (query: string) => void;
  autoFocus?: boolean;
}

export default function UniversalSearchBar({
  scope = "GHUBA",
  companyId,
  storeSlug,
  placeholder = "Search products, categories, brands...",
  className = "",
  onSearchSubmit,
  autoFocus = false,
}: UniversalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AutocompleteResponseDTO | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        setData(null);
        setIsOpen(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          q: searchTerm.trim(),
          scope,
          ...(companyId && { companyId }),
        });

        const res = await fetch(`/api/search/suggestions?${params}`, {
          signal: abortControllerRef.current.signal,
        });

        if (res.ok) {
          const json: AutocompleteResponseDTO = await res.json();
          setData(json);
          const hasContent =
            (json.products?.length || 0) > 0 ||
            (json.categories?.length || 0) > 0 ||
            (json.brands?.length || 0) > 0 ||
            (json.stores?.length || 0) > 0 ||
            (json.suggestions?.length || 0) > 0;
          setIsOpen(hasContent);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Autocomplete error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [scope, companyId]
  );

  // Debounced input handler
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine target search URL based on scope & context
  const getSearchUrl = useCallback(
    (searchTerm: string) => {
      const q = encodeURIComponent(searchTerm.trim());
      if (scope === "GHUBA") {
        return `/ghuba/productlist?search=${q}`;
      }
      if (storeSlug) {
        return `/site/${storeSlug}/ecommerce/products?search=${q}`;
      }
      return `/ecommerce/products?search=${q}`;
    },
    [scope, storeSlug]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query.trim());
    } else {
      router.push(getSearchUrl(query.trim()));
    }
  };

  const handleSelectKeyword = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    } else {
      router.push(getSearchUrl(term));
    }
  };

  const handleSelectCategory = (catName: string) => {
    setIsOpen(false);
    const cat = encodeURIComponent(catName);
    if (scope === "GHUBA") {
      router.push(`/ghuba/productlist?category=${cat}`);
    } else {
      router.push(`/ecommerce/products?category=${cat}`);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full flex items-center">
        <div className="absolute left-4 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-11 pr-20 py-2.5 sm:py-3 bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:focus:border-amber-400 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all shadow-inner"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-1" />
          )}

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setData(null);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Clear search query"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-transform active:scale-95 shadow-sm"
            aria-label="Submit search"
          >
            <MagnifyingGlassIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && data && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[80vh] overflow-y-auto">
          {/* Keyword Suggestions */}
          {data.suggestions?.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 flex items-center gap-1.5">
                <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-amber-500" />
                Popular Searches
              </div>
              <div className="space-y-0.5">
                {data.suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectKeyword(item)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {data.categories?.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-blue-500" />
                Categories
              </div>
              <div className="flex flex-wrap gap-1.5 px-2 py-1">
                {data.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.name)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <span>{cat.icon || "📁"}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Products */}
          {data.products?.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 flex items-center gap-1.5">
                <ShoppingBagIcon className="w-3.5 h-3.5 text-emerald-500" />
                Products
              </div>
              <div className="space-y-1">
                {data.products.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(
                        scope === "GHUBA"
                          ? `/ghuba/productlist/${prod.id}`
                          : `/ecommerce/products/${prod.id}`
                      );
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3 group"
                  >
                    <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                      {prod.image ? (
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          sizes="44px"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {prod.brand && <span className="font-semibold">{prod.brand}</span>}
                        {prod.brand && prod.category && <span>•</span>}
                        {prod.category && <span>{prod.category}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        KES {prod.price?.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stores (if Ghuba scope) */}
          {scope === "GHUBA" && data.stores?.length > 0 && (
            <div className="p-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1 flex items-center gap-1.5">
                <BuildingStorefrontIcon className="w-3.5 h-3.5 text-indigo-500" />
                Stores & Sellers
              </div>
              <div className="space-y-1">
                {data.stores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/site/${store.slug}`);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-200/50">
                      {store.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {store.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View All Results Button */}
          <div className="p-2 bg-zinc-50 dark:bg-zinc-950 text-center">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="w-full py-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline"
            >
              See all results for "{query}" →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
