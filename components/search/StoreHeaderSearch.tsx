"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import UniversalSearchBar from "./UniversalSearchBar";

interface StoreHeaderSearchProps {
  variant?: "button" | "inline" | "pill";
  companyId?: string;
  storeSlug?: string;
  productsBasePath?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  showHotkeyBadge?: boolean;
}

export function StoreHeaderSearch({
  variant = "button",
  companyId: propCompanyId,
  storeSlug: propStoreSlug,
  productsBasePath,
  placeholder,
  className = "",
  buttonClassName = "",
  iconClassName = "w-5 h-5",
  showHotkeyBadge = true,
}: StoreHeaderSearchProps) {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const [isOpen, setIsOpen] = useState(false);

  const companyId = propCompanyId || storeFormData?.id;
  const storeSlug = propStoreSlug || storeFormData?.slug;
  const storeName = storeFormData?.name || "Store";
  const searchPlaceholder = placeholder || `Search ${storeName} catalog, categories...`;

  // Global hotkey: Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      setIsOpen(false);
      const q = encodeURIComponent(query.trim());
      const basePath = productsBasePath || "/ecommerce/products";
      if (storeSlug && typeof window !== "undefined" && window.location.pathname.startsWith(`/site/${storeSlug}`)) {
        router.push(`/site/${storeSlug}${basePath}?search=${q}`);
      } else {
        router.push(`${basePath}?search=${q}`);
      }
    },
    [productsBasePath, storeSlug, router]
  );

  // If inline variant is requested
  if (variant === "inline") {
    return (
      <div className={`relative w-full ${className}`}>
        <UniversalSearchBar
          scope="STORE"
          companyId={companyId}
          storeSlug={storeSlug}
          productsBasePath={productsBasePath}
          placeholder={searchPlaceholder}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>
    );
  }

  return (
    <>
      {variant === "pill" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 transition-all ${buttonClassName}`}
          aria-label="Search store products"
        >
          <MagnifyingGlassIcon className={iconClassName} />
          <span className="text-xs font-medium truncate max-w-[140px] sm:max-w-none">
            {placeholder || `Search in ${storeName}...`}
          </span>
          {showHotkeyBadge && (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded shadow-xs ml-auto">
              ⌘K
            </kbd>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`p-2.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors ${buttonClassName}`}
          aria-label="Search store products"
        >
          <MagnifyingGlassIcon className={iconClassName} />
        </button>
      )}

      {/* Modal / Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden z-10"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Search {storeName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Search Bar Container */}
              <div className="p-4 sm:p-6">
                <UniversalSearchBar
                  scope="STORE"
                  companyId={companyId}
                  storeSlug={storeSlug}
                  productsBasePath={productsBasePath}
                  placeholder={searchPlaceholder}
                  autoFocus={true}
                  onSearchSubmit={handleSearchSubmit}
                />
              </div>

              {/* Quick Footer hint */}
              <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded">ESC</kbd> to exit</span>
                <span>Real-time instant suggestions</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default StoreHeaderSearch;
