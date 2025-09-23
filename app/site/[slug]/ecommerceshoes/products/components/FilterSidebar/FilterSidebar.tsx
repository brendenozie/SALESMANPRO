'use client';

import React from 'react';
import { FilterState } from '../ProductListWrapper/ProductListWrapper';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: { id: string, name: string }[];
}

export default function FilterSidebar({ filters, setFilters, categories }: FilterSidebarProps) {
  // Generic handler to update a single filter state
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
    const value = parseFloat(e.target.value);
    if (type === 'min' && value > filters.maxPrice) {
      // Prevent minPrice from exceeding maxPrice
      handleFilterChange('minPrice', filters.maxPrice);
    } else if (type === 'max' && value < filters.minPrice) {
      // Prevent maxPrice from falling below minPrice
      handleFilterChange('maxPrice', filters.minPrice);
    } else {
      handleFilterChange(type === 'min' ? 'minPrice' : 'maxPrice', value);
    }
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
    <div className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      {/* Header and Clear Button */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Filters</h3>
        <button 
          onClick={handleClearAll} 
          className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors duration-200"
        >
          Clear All
        </button>
      </div>
      
      {/* Search Input and Sort Dropdown */}
      <div className="space-y-6">
        <div>
          <label htmlFor="search" className="block text-sm font-semibold mb-2">Search Products</label>
          <input
            id="search"
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-full px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            aria-label="Search products"
          />
        </div>
        <div>
          <label htmlFor="sort" className="block text-sm font-semibold mb-2">Sort By</label>
          <div className="relative">
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="block w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-5 py-2.5 pr-10 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              aria-label="Sort by"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
        <h4 className="font-bold mb-3 text-lg">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange('category', null)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${!filters.category ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleFilterChange('category', cat.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${filters.category === cat.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {cat.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
        <h4 className="font-bold mb-3 text-lg">Color</h4>
        <div className="flex flex-wrap gap-3">
          {allColors.map(color => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={`w-10 h-10 rounded-full border-2 border-transparent transition-all duration-200 transform hover:scale-110 focus:outline-none ${filters.colors.includes(color) ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-blue-400' : ''}`}
              style={{ backgroundColor: color }}
              aria-label={`Filter by ${color}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
        <h4 className="font-bold mb-3 text-lg">Price Range</h4>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="min-price" className="sr-only">Minimum Price</label>
            <input
              id="min-price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange(e, 'min')}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <span className="text-gray-500 dark:text-gray-400 font-medium">-</span>
          <div className="flex-1">
            <label htmlFor="max-price" className="sr-only">Maximum Price</label>
            <input
              id="max-price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange(e, 'max')}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
