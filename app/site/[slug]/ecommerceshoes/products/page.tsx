// app/[slug]/products/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockProducts } from '@/lib/mock-api';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import ProductCard from './components/ProductCard/ProductCard';

// Define types for data and filters
type Product = {
  id: string;
  name: string;
  finalPrice: number;
  sellingPrice?: number; // Optional
  images: { url: string }[];
  category: string;
  color: string;
  rating: number;
};

type FilterState = {
  search: string;
  category: string | null;
  sort: string;
  minPrice: number;
  maxPrice: number;
  colors: string[];
};

// In a real app, this would be an API call or a server component fetching data
const fetchProducts = async (filters: FilterState): Promise<Product[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const filtered = mockProducts.filter(p => {
        if (filters.category && p.category !== filters.category) return false;
        if (filters.colors.length > 0 && !filters.colors.includes(p.color)) return false;
        if (p.finalPrice < filters.minPrice || p.finalPrice > filters.maxPrice) return false;
        if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
      });

      const sorted = filtered.sort((a, b) => {
        if (filters.sort === 'priceAsc') return a.finalPrice - b.finalPrice;
        if (filters.sort === 'priceDesc') return b.finalPrice - a.finalPrice;
        if (filters.sort === 'rating') return b.rating - a.rating;
        return 0; // default to original order
      });

      resolve(sorted);
    }, 500);
  });
};

const fetchCategories = async () => {
  return [
    { id: 'cat_1', name: 'Clothing' },
    { id: 'cat_2', name: 'Accessories' },
    { id: 'cat_3', name: 'Home Goods' },
  ];
};

export default function ProductListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || null,
    sort: searchParams.get('sort') || 'newest',
    minPrice: parseFloat(searchParams.get('minPrice') || '0'),
    maxPrice: parseFloat(searchParams.get('maxPrice') || '1000'),
    colors: searchParams.get('colors')?.split(',') || [],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Update URL and fetch data whenever filters change
  useEffect(() => {
    const fetchAndFilter = async () => {
      setLoading(true);
      const newParams = new URLSearchParams();
      if (filters.search) newParams.set('search', filters.search);
      if (filters.category) newParams.set('category', filters.category);
      if (filters.sort) newParams.set('sort', filters.sort);
      newParams.set('minPrice', filters.minPrice.toString());
      newParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.colors.length > 0) newParams.set('colors', filters.colors.join(','));

      router.push(`?${newParams.toString()}`, { scroll: false });

      const newProducts = await fetchProducts(filters);
      setProducts(newProducts);
      setLoading(false);
    };

    fetchAndFilter();
  }, [filters, router]);

  // Fetch categories once on component mount
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-8 mt-8">
      {/* Filter Sidebar */}
      <div className="w-1/4 pr-8 sticky top-0 self-start">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          categories={categories}
        />
      </div>

      {/* Main Content Area */}
      <div className="w-3/4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products</h1>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            {loading ? 'Loading...' : `Showing ${products.length} Products`}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-xl">
            Loading products...
          </div>
        ) : (
          <div
            className="
              columns-1
              sm:columns-2
              md:columns-3
              lg:columns-4
              gap-6
              space-y-6
            "
          >
            {products.map(product => (
              <div key={product.id} className="break-inside-avoid">
                <ProductCard
                  product={{
                    id: product.id,
                    name: product.name,
                    finalPrice: product.finalPrice,
                    imageUrl: product.images[0]?.url,
                    rating: product.rating,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
