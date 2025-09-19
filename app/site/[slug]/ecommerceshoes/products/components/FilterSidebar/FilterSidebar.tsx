// components/site/FilterSidebar/FilterSidebar.tsx
'use client';

import React from 'react';
import { FilterState } from '@/app/[slug]/products/page';
import Link from 'next/link';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: { id: string, name: string }[];
}

export default function FilterSidebar({ filters, setFilters, categories }: FilterSidebarProps) {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sort: e.target.value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseFloat(e.target.value);
    setFilters(prev => ({ ...prev, [type === 'min' ? 'minPrice' : 'maxPrice']: value }));
  };

  const handleColorChange = (color: string) => {
    setFilters(prev => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors };
    });
  };

  const handleClearAll = () => {
    setFilters({
      search: '',
      category: null,
      sort: 'newest',
      minPrice: 0,
      maxPrice: 1000,
      colors: [],
    });
  };

  const allColors = ['red', 'blue', 'black', 'white', 'green'];

  return (
    <div className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Filters</h3>
        <button onClick={handleClearAll} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
          Clear All
        </button>
      </div>
      
      {/* Search Input and Sort Dropdown */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full border rounded-full px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
        />
        <div>
          <label className="block text-sm font-semibold mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={handleSortChange}
            className="w-full border rounded px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="newest">Newest</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-bold mb-2">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => setFilters(prev => ({ ...prev, category: null }))}
            className={`w-full text-left p-2 rounded transition-colors ${!filters.category ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
              className={`w-full text-left p-2 rounded transition-colors ${filters.category === cat.id ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h4 className="font-bold mb-2">Color</h4>
        <div className="flex flex-wrap gap-2">
          {allColors.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-8 h-8 rounded-full border border-gray-300 transition-all ${filters.colors.includes(color) ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}`}
              style={{ backgroundColor: color }}
            ></button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-bold mb-2">Price Range</h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange(e, 'min')}
            className="w-1/2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
          />
          <span>-</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange(e, 'max')}
            className="w-1/2 border rounded px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
}