"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { AvailableFiltersResponseDTO, FilterFacetGroup } from "@/lib/search/types";

interface FilterState {
  brand: string[];
  category: string[];
  subCategory: string[];
  condition: string[];
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  make?: string[];
  transmission?: string[];
  fuelType?: string[];
  bodyType?: string[];
  yearFrom?: number;
  yearTo?: number;
  propertyType?: string[];
  bedrooms?: string[];
  bathrooms?: string[];
  storage?: string[];
  ram?: string[];
  size?: string[];
  gender?: string[];
  sort?: string;
  [key: string]: any;
}

interface CategoryAwareFilterDrawerProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  scope?: "GHUBA" | "STORE";
  companyId?: string;
  category?: string;
  className?: string;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export default function CategoryAwareFilterDrawer({
  filters,
  onFilterChange,
  scope = "GHUBA",
  companyId,
  category,
  className = "",
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
}: CategoryAwareFilterDrawerProps) {
  const [facetData, setFacetData] = useState<AvailableFiltersResponseDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    subCategory: true,
    brand: true,
    price: true,
    condition: true,
    categorySpecific: true,
  });

  const [localMinPrice, setLocalMinPrice] = useState<string>(
    filters.minPrice !== undefined ? String(filters.minPrice) : ""
  );
  const [localMaxPrice, setLocalMaxPrice] = useState<string>(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ""
  );

  // Synchronize local price state when props update
  useEffect(() => {
    setLocalMinPrice(filters.minPrice !== undefined ? String(filters.minPrice) : "");
    setLocalMaxPrice(filters.maxPrice !== undefined ? String(filters.maxPrice) : "");
  }, [filters.minPrice, filters.maxPrice]);

  // Stable category key to avoid redundant fetch cycles
  const categoryKey = useMemo(() => {
    const cats =
      filters.category && filters.category.length > 0
        ? filters.category
        : category
        ? [category]
        : [];
    return [...cats].sort().join(",");
  }, [filters.category, category]);

  // Fetch dynamic available filter metadata for current category & scope
  useEffect(() => {
    const fetchFacets = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          scope,
          ...(companyId && { companyId }),
        });

        const cats =
          filters.category && filters.category.length > 0
            ? filters.category
            : category
            ? [category]
            : [];
        cats.forEach((c: string) => params.append("category", c));

        const res = await fetch(`/api/search/filters?${params}`);
        if (res.ok) {
          const data: AvailableFiltersResponseDTO = await res.json();
          setFacetData(data);
        }
      } catch (err) {
        console.error("Facet fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacets();
  }, [categoryKey, scope, companyId]);

  const categoryOptions = useMemo(() => {
    return (
      facetData?.categories ||
      facetData?.genericFilters?.find((g) => g.key === "category")?.options ||
      []
    );
  }, [facetData]);

  const filteredCategoryOptions = useMemo(() => {
    if (!categorySearch.trim()) return categoryOptions;
    const term = categorySearch.toLowerCase().trim();
    return categoryOptions.filter((c) => c.label.toLowerCase().includes(term));
  }, [categoryOptions, categorySearch]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryToggle = (categoryValue: string) => {
    const current = (filters.category || []) as string[];
    const exists = current.includes(categoryValue);
    const updated = exists
      ? current.filter((c) => c !== categoryValue)
      : [...current, categoryValue];

    // Reset subCategory and category-specific specs on category change
    onFilterChange({
      ...filters,
      category: updated,
      subCategory: [],
      make: [],
      model: [],
      propertyType: [],
      bedrooms: [],
      bathrooms: [],
      storage: [],
      ram: [],
      size: [],
      gender: [],
    });
  };

  const handleCheckboxChange = (groupKey: string, value: string) => {
    if (groupKey === "category") {
      handleCategoryToggle(value);
      return;
    }

    const current = (filters[groupKey] || []) as string[];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onFilterChange({
      ...filters,
      [groupKey]: updated,
    });
  };

  const handlePriceApply = () => {
    const min = localMinPrice ? parseFloat(localMinPrice) : undefined;
    const max = localMaxPrice ? parseFloat(localMaxPrice) : undefined;
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleClearAll = () => {
    onFilterChange({
      brand: [],
      category: [],
      subCategory: [],
      condition: [],
      minPrice: undefined,
      maxPrice: undefined,
      isAvailable: true,
      make: [],
      transmission: [],
      fuelType: [],
      bodyType: [],
      yearFrom: undefined,
      yearTo: undefined,
      propertyType: [],
      bedrooms: [],
      bathrooms: [],
      storage: [],
      ram: [],
      size: [],
      gender: [],
      sort: filters.sort,
    });
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setCategorySearch("");
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Filters
          </h3>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs font-bold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* 1. Category Section */}
      <div className="space-y-3 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80">
        <button
          onClick={() => toggleSection("category")}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider"
        >
          <div className="flex items-center gap-2">
            <span>Categories</span>
            {filters.category && filters.category.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              openSections.category ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.category && (
          <div className="space-y-2 pt-1">
            {categoryOptions.length > 6 && (
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 mb-1"
              />
            )}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredCategoryOptions.map((cat) => {
                const isChecked = (filters.category || []).includes(cat.value);
                return (
                  <label
                    key={cat.value}
                    className={`flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded-md transition-colors ${
                      isChecked
                        ? "bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat.value)}
                        className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span>{cat.label}</span>
                    </div>
                    {cat.count !== undefined && cat.count > 0 && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {cat.count}
                      </span>
                    )}
                  </label>
                );
              })}
              {filteredCategoryOptions.length === 0 && (
                <p className="text-xs text-zinc-400 py-1 italic">
                  {loading ? "Loading categories..." : "No categories found"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Generic Facets (Subcategory, Brand, Condition) */}
      {facetData?.genericFilters
        ?.filter((group) => group.key !== "category")
        .map((group) => {
          const isOpen = openSections[group.key] ?? true;
          const selectedValues = (filters[group.key] || []) as string[];

          return (
            <div
              key={group.key}
              className="space-y-3 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80"
            >
              <button
                onClick={() => toggleSection(group.key)}
                className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <span>{group.title}</span>
                  {selectedValues.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
                <ChevronDownIcon
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && group.options && group.options.length > 0 && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {group.options.map((opt) => {
                    const isChecked = selectedValues.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center justify-between text-xs cursor-pointer py-1 px-1.5 rounded-md transition-colors ${
                          isChecked
                            ? "bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 font-bold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(group.key, opt.value)}
                            className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span>{opt.label}</span>
                        </div>
                        {opt.count !== undefined && opt.count > 0 && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {opt.count}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      {/* 3. Price Range Section */}
      <div className="space-y-3 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider"
        >
          <span>Price (KES)</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  value={localMinPrice}
                  onChange={(e) => setLocalMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Max</label>
                <input
                  type="number"
                  placeholder={String(facetData?.priceRange?.max || "Max")}
                  value={localMaxPrice}
                  onChange={(e) => setLocalMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
            <button
              onClick={handlePriceApply}
              className="w-full py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Apply Price
            </button>
          </div>
        )}
      </div>

      {/* 3. Dynamic Category-Specific Attributes */}
      {facetData?.categorySpecificFilters && facetData.categorySpecificFilters.length > 0 && (
        <div className="space-y-4 pt-1">
          <div className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {facetData.categoryName} Specifications
          </div>

          {facetData.categorySpecificFilters.map((attr) => {
            const isOpen = openSections[attr.key] ?? true;
            const selectedValues = (filters[attr.key] || []) as string[];

            return (
              <div
                key={attr.key}
                className="space-y-2 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/80"
              >
                <button
                  onClick={() => toggleSection(attr.key)}
                  className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200"
                >
                  <span>{attr.title}</span>
                  <ChevronDownIcon
                    className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && attr.options && (
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {attr.options.map((opt) => {
                      const isChecked = selectedValues.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 py-0.5 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCheckboxChange(attr.key, opt.value)}
                            className="rounded border-zinc-300 text-amber-500 focus:ring-amber-500"
                          />
                          <span>{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <aside
        className={`hidden md:block w-full bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Drawer (Bottom Sheet / Slide-over) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileDrawer}
          />

          {/* Drawer Panel */}
          <div className="relative bg-white dark:bg-zinc-900 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-base font-black text-zinc-900 dark:text-white">
                Filter Products
              </span>
              <button
                onClick={onCloseMobileDrawer}
                className="p-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {content}

            <div className="pt-6 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
              <button
                onClick={onCloseMobileDrawer}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
