'use client';

import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FilterSidebarProps {
  filters: any;
  setFilters: React.Dispatch<React.SetStateAction<any>>;
  categories: { id: string, displayName: string | null, categoryId: string | null }[];
}

export default function FilterSidebar({ filters, setFilters, categories }: FilterSidebarProps) {
  
  // Update a single filter field
  const updateFilter = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setFilters({
      search: '',
      category: null,
      sort: 'newest',
      minPrice: 0,
      maxPrice: 100000, // Matching your Page.tsx default
      colors: [],
    });
  };

  return (
    <div className="space-y-10">
      {/* 1. Header with Reset */}
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Refine Selection</h4>
        <button 
          onClick={handleClearAll}
          className="text-[10px] font-bold uppercase text-red-500 hover:text-red-600 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* 2. Search - Functional */}
      <div className="relative group">
        <input 
          type="text" 
          placeholder="Find your style..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-zinc-900 dark:text-white"
        />
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        {filters.search && (
          <button 
            onClick={() => updateFilter('search', '')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <XMarkIcon className="w-4 h-4 text-zinc-400 hover:text-zinc-900" />
          </button>
        )}
      </div>

      {/* 3. Category - Chip Style Functional */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Categories</h4>
        <div className="flex flex-col gap-1">
          {/* "All" Option */}
          <button
            onClick={() => updateFilter('category', null)}
            className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              !filters.category 
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg scale-[1.02]" 
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            All Collection
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.id)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                filters.category === cat.id 
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg scale-[1.02]" 
                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {cat.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Price Range - Functional Inputs */}
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Price Range</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold text-zinc-400">Min (KES)</span>
            <input 
              type="number"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', Number(e.target.value))}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 font-bold text-xs focus:ring-1 focus:ring-zinc-400 transition-all text-zinc-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold text-zinc-400">Max (KES)</span>
            <input 
              type="number"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 font-bold text-xs focus:ring-1 focus:ring-zinc-400 transition-all text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 5. Sort By - Integrated Minimal Select */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Sort Order</h4>
        <select 
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="w-full bg-transparent border-2 border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-zinc-600 dark:text-zinc-300 focus:border-zinc-900 dark:focus:border-white transition-all appearance-none cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Most Popular</option>
        </select>
      </div>
    </div>
  );
}