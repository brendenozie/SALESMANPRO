// components/site/products/ProductFilters.tsx
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import classNames from 'classnames';
import { AdjustmentsHorizontalIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';

type Category = { id: string; name: string; icon?: string | null; slug?: string };
type Current = { page: number; search: string; category: string; sort: string; slug: string };

export default function ProductFilters({ categories, current, totalCount }: { categories: Category[]; current: Current; totalCount?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(current.search || '');
  const [active, setActive] = useState(current.category || ''); // category id
  const [sort, setSort] = useState(current.sort || 'newest');

  useEffect(() => {
    setSearch(current.search || '');
    setActive(current.category || '');
    setSort(current.sort || 'newest');
  }, [current.search, current.category, current.sort]);

  const apply = (opts?: { category?: string; page?: number; search?: string; sort?: string }) => {
    const q = new URLSearchParams();
    q.set('page', String(opts?.page ?? 1));
    if (opts?.search !== undefined ? opts.search : search) q.set('search', opts?.search ?? search);
    if (opts?.category !== undefined ? opts.category : active) q.set('category', opts?.category ?? active);
    if (opts?.sort !== undefined ? opts.sort : sort) q.set('sort', opts?.sort ?? sort);

    const url = `/${current.slug}/products?${q.toString()}`;
    router.push(url);
  };

  const onCategoryClick = (catId: string) => {
    setActive(catId);
    apply({ category: catId, page: 1 });
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    apply({ search, page: 1 });
  };

  return (
    <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100/50 mb-6">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Top row: search + sort */}
        <div className="flex items-center gap-3">
          <form onSubmit={onSearchSubmit} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border px-4 py-2 pl-10 text-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60">
                <MagnifyingGlassCircleIcon className='w-5 h-5 '/>
              </div>
            </div>

            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); apply({ sort: e.target.value }); }}
              className="hidden md:inline-block border rounded px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-black"
            >
              Search
            </button>
          </form>

          <button
            onClick={() => {
              // open filter drawer or fallback - simply toggles settings for now
              // Keep for future filter expansion
              // eslint-disable-next-line no-console
              console.log('open filters');
            }}
            className="hidden md:flex items-center gap-2 border px-3 py-2 rounded-full text-sm"
            aria-label="Open filters"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Category pills (Airbnb style) */}
        <div className="relative">
          <div className="overflow-x-auto no-scrollbar py-3">
            <div className="flex items-center gap-4">
              {/* All */}
              <button
                onClick={() => onCategoryClick('')}
                className={classNames(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  { 'bg-gray-900 text-white scale-105': active === '' },
                  { 'bg-white text-gray-700 border': active !== '' }
                )}
              >
                All
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryClick(cat.id)}
                  className={classNames(
                    'flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-transform',
                    { 'bg-gray-900 text-white scale-105': active === cat.id },
                    { 'bg-white text-gray-700 border': active !== cat.id }
                  )}
                >
                  <span className="text-lg">
                    {cat.icon ? cat.icon : cat.name.charAt(0)}
                  </span>
                  <span className="hidden sm:inline-block">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* optional left/right chevrons for wide overflow */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 flex items-center bg-gradient-to-r from-white/90 to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 flex items-center justify-end bg-gradient-to-l from-white/90 to-transparent"></div>
        </div>

        {/* small meta row */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>{totalCount ?? 0} products</div>
          <div className="hidden md:block">Showing results for <span className="font-medium">{active ? categories.find(c => c.id === active)?.name : 'All'}</span></div>
        </div>
      </div>
    </div>
  );
}
