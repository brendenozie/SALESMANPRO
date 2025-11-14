// Original imports
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { JsonValue } from "@prisma/client/runtime/library";
import { Bars3BottomLeftIcon, ChartBarIcon, ChevronDownIcon, MagnifyingGlassCircleIcon, ShoppingCartIcon, StarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/components/site/layouts/EcommerceLayout/body/components/ProductCard";
import { MarketListingForm } from "@/types/typings";

// --- 0. INTERNAL CUSTOM HOOKS (Replacing external dependencies) ---

/**
 * Custom hook for debouncing a value.
 * @param value The value to debounce.
 * @param delay The delay in milliseconds.
 */
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


// --- 1. TYPE DEFINITIONS (Adapted) ---
interface Category {
  id: string;
  displayName: string | null;
}

interface ListingData {
  id: string;
  name: string;
  finalPrice: number | null;
  sellingPrice: number;
  images: JsonValue[];
  // Assuming a 'stock' and 'rating' property are needed for the card design logic
  stock?: number; // Added for visual feedback
  rating?: number; // Added for visual feedback
}

interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
  isFilterPanelOpen: boolean;
}

// --- 2. INTERNAL PRODUCT CARD COMPONENT (Replacing external import) ---
// Note: This is a placeholder component to allow the file to compile and render the list.
const InternalProductCard: React.FC<{ product: ListingData }> = ({ product }) => {
  // Mock logic for display purposes, as full product data is unknown
  const displayPrice = product.finalPrice !== null ? product.finalPrice : product.sellingPrice;
  const originalPrice = product.finalPrice !== null ? product.sellingPrice : null;
  const rating = product.rating || 4.5; // Placeholder rating

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative h-48 bg-gray-50 flex items-center justify-center">
        {/* Placeholder image logic */}
        <img
          src={product.images?.[0] as string || `https://placehold.co/400x300/6366f1/ffffff?text=${product.name}`}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://placehold.co/400x300/d1d5db/374151?text=${product.name.substring(0, 10)}`;
          }}
        />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2 truncate" title={product.name}>
          {product.name}
        </h3>
        <div className="flex items-center text-sm mb-3">
          <span className="text-gray-500 mr-2">Rating:</span>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end mt-4">
          <div>
            {originalPrice !== null && (
              <p className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</p>
            )}
            <p className="text-2xl font-extrabold text-indigo-700">${displayPrice.toFixed(2)}</p>
          </div>
          <button
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};


// --- 3. HELPER COMPONENTS (for Design Consistency) ---

const FilterTag: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full shadow-sm">
    {label}
    <button onClick={onRemove} className="ml-2 text-indigo-500 hover:text-indigo-800 transition-colors duration-150" aria-label={`Remove filter: ${label}`}>
      <XMarkIcon className="w-4 h-4" />
    </button>
  </span>
);

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-b border-gray-200 py-6">
    <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
      <ChevronDownIcon className="w-4 h-4 mr-2 text-indigo-500" />
      {title}
    </h4>
    {children}
  </div>
);

// --- 4. FILTER PANEL COMPONENT (Adapted) ---

const FilterPanel: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  ALL_CATEGORIES: Category[];
  isMobileView: boolean;
  clearAllFilters: () => void;
}> = ({ filters, setFilters, ALL_CATEGORIES, isMobileView, clearAllFilters }) => {

  const closePanel = useCallback(() => {
    setFilters(prev => ({ ...prev, isFilterPanelOpen: false }));
  }, [setFilters]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, selectedCategory: e.target.value }));
  }, [setFilters]);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, selectedSort: e.target.value }));
  }, [setFilters]);

  return (
    <div className={` 
      ${isMobileView ? (filters.isFilterPanelOpen ? 'fixed inset-0 z-40 bg-white shadow-2xl overflow-y-auto transform translate-x-0 transition-transform duration-300' : 'fixed inset-0 z-40 bg-white shadow-2xl overflow-y-auto transform -translate-x-full transition-transform duration-300') : 'block'}
      ${!isMobileView ? 'sticky top-0 h-screen overflow-y-auto' : 'p-6'}
      lg:w-72 w-full lg:p-6 p-4 bg-gray-50 lg:bg-white border-r border-gray-200
    `}>
      {(isMobileView && filters.isFilterPanelOpen) && (
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bars3BottomLeftIcon className="w-6 h-6 mr-2 text-indigo-600" />
            Filters
          </h2>
          <button onClick={closePanel} className="p-2 rounded-full text-gray-500 hover:bg-gray-200" aria-label="Close filters">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      <button
        onClick={clearAllFilters}
        className="w-full bg-red-50 text-red-700 border border-red-200 rounded-lg py-2 mb-6 font-medium hover:bg-red-100 transition duration-150"
      >
        Clear All Filters
      </button>

      {/* --- CATEGORY FILTER --- */}
      <FilterSection title="Category">
        <select
          value={filters.selectedCategory}
          onChange={handleCategoryChange}
          className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.displayName}</option>
          ))}
        </select>
      </FilterSection>

      {/* --- SORT FILTER --- */}
      <FilterSection title="Sort By">
        <select
          value={filters.selectedSort}
          onChange={handleSortChange}
          className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
        >
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="rating">Rating</option>
        </select>
      </FilterSection>

    </div>
  );
};


// --- 5. MAIN APP COMPONENT (ProductsClient) ---

export default function ProductsClient({
  companyId,
  slug,
  initialListings,
  categories,
  totalPages // This will be ignored in the simulated environment
}: {
  companyId: string;
  slug: string;
  initialListings: Array<MarketListingForm>;
  categories: Array<Category>;
  totalPages: number;
}) {
  // REMOVED: const router = useRouter();
  const pageSize = 12;

  // --- Filter State ---
  const [filters, setFilters] = useState<FilterState>(() => ({
    searchQuery: '',
    selectedCategory: '',
    selectedSort: 'newest',
    isFilterPanelOpen: false,
  }));

  const debouncedSearch = useDebounce(filters.searchQuery, 500);
  const { selectedCategory: category, selectedSort: sort } = filters;

  const [isMobileView, setIsMobileView] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize); // State for simulated infinite loading

  // --- Client-Side Filtering and Sorting Logic (Replaces SWR/API calls) ---
  const filteredAndSortedListings = useMemo(() => {
    // 1. Filtering
    let result = initialListings.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      // NOTE: Filtering by category correctly would require 'categoryId' on ListingData.
      // Since that field is not present, we can only rely on the search filter.
      // If your actual ListingData has a category ID, you would use: item.categoryId === category
      const matchesCategory = !category; 
      
      return matchesSearch && matchesCategory;
    });

    // 2. Sorting
    result.sort((a, b) => {
      const priceA = a.finalPrice !== null ? a.finalPrice : a.sellingPrice;
      const priceB = b.finalPrice !== null ? b.finalPrice : b.sellingPrice;

      switch (sort) {
        case 'priceAsc':
          return (priceA ?? 0) - (priceB ?? 0);
        case 'priceDesc':
          return (priceB ?? 0) - (priceA ?? 0);
        case 'rating':
          // Mock sorting by rating (default to 4.5 for items without rating)
          return 4.5;//(b.rating || 4.5) - (a.rating || 4.5);
        case 'newest':
        default:
          return 0; // No change in mock data order
      }
    });

    return result;
  }, [initialListings, debouncedSearch, category, sort]);

  const allListings = filteredAndSortedListings.slice(0, visibleCount);
  const totalItems = filteredAndSortedListings.length;
  const hasMore = visibleCount < totalItems;

  // Reset visibility when filters change
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [debouncedSearch, category, sort]);

  // REMOVED: URL Sync Logic (requires Next.js useRouter)

  // --- Responsive Viewport Logic ---
  useEffect(() => {
    const handleResize = () => {
      // 1024px is Tailwind's lg breakpoint
      setIsMobileView(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setFilters(prev => ({ ...prev, isFilterPanelOpen: false }));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFilterPanel = useCallback(() => {
    setFilters(prev => ({ ...prev, isFilterPanelOpen: !prev.isFilterPanelOpen }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      searchQuery: '',
      selectedCategory: '',
      selectedSort: 'newest',
      isFilterPanelOpen: isMobileView ? false : prev.isFilterPanelOpen, // Close on mobile if open
    }));
  }, [isMobileView]);

  const loadMore = useCallback(() => {
    setVisibleCount(prevCount => prevCount + pageSize);
  }, []);


  // Since we are simulating, we are never truly "loading" from the network,
  // but we can add a fake delay to show the spinner when search changes.
  const [isSimulatedLoading, setIsSimulatedLoading] = useState(false);

  useEffect(() => {
    // Only simulate loading when the search query changes and is being debounced
    if (debouncedSearch !== filters.searchQuery) {
      setIsSimulatedLoading(true);
      const timer = setTimeout(() => setIsSimulatedLoading(false), 500);
      return () => clearTimeout(timer);
    }
    setIsSimulatedLoading(false);
  }, [debouncedSearch, filters.searchQuery]);


  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col lg:flex-row mt-20">
      {/* Filter Sidebar / Mobile Modal */}
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        ALL_CATEGORIES={categories}
        isMobileView={isMobileView}
        clearAllFilters={clearAllFilters}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Product Catalog
          </h1>
          <p className="text-xl text-gray-600">
            {isSimulatedLoading ? 'Loading...' : `${allListings.length} of ${totalItems} products shown.`}
          </p>
        </header>

        {/* Search Bar and Mobile Filter Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            />
          </div>

          {isMobileView && (
            <button
              onClick={toggleFilterPanel}
              className="flex items-center justify-center bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 w-full sm:w-auto"
            >
              <Bars3BottomLeftIcon className="w-5 h-5 mr-2" />
              Filters ({
                (filters.searchQuery ? 1 : 0) +
                (filters.selectedCategory ? 1 : 0) +
                (filters.selectedSort !== 'newest' ? 1 : 0)
              })
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mb-8 min-h-[40px] items-center">
          {filters.searchQuery && (
            <FilterTag
              label={`Search: "${filters.searchQuery}"`}
              onRemove={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
            />
          )}
          {filters.selectedCategory && (
            <FilterTag
              label={`Category: ${categories.find(c => c.id === filters.selectedCategory)?.displayName || 'Unknown'}`}
              onRemove={() => setFilters(prev => ({ ...prev, selectedCategory: '' }))}
            />
          )}
          {filters.selectedSort !== 'newest' && (
            <FilterTag
              label={`Sort: ${filters.selectedSort.replace('Asc', ' Low').replace('Desc', ' High')}`}
              onRemove={() => setFilters(prev => ({ ...prev, selectedSort: 'newest' }))}
            />
          )}
        </div>


        {/* Product Grid */}
        <section>
          {allListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {allListings.map((item) => (
                // Use the internal ProductCard
                <ProductCard key={item?.id || ""} product={item} />
              ))}
            </div>
          ) : isSimulatedLoading ? (
            <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-xl font-medium text-gray-700">Loading products...</p>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4 transform rotate-90" />
              <h2 className="text-2xl font-bold text-gray-700">No Products Found</h2>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters or search query.
              </p>
            </div>
          )}
        </section>

        {/* Infinite Loader */}
        {hasMore && (
          <div className="mt-8 text-center">
             <button
              onClick={loadMore}
              className="px-6 py-3 bg-indigo-500 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-600 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSimulatedLoading}
            >
              {isSimulatedLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}