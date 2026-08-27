'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bars3BottomRightIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';

export default function ProductFilters({ slug, current, parentCategory, subcategories }: any) {
  const router = useRouter();
  const [search, setSearch] = useState(current?.search ?? '');
  const [sort, setSort] = useState(current?.sort ?? 'newest');
  const [minPrice, setMinPrice] = useState(current?.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(current?.maxPrice ?? '');

  useEffect(() => {
    setSearch(current?.search ?? '');
    setSort(current?.sort ?? 'newest');
    setMinPrice(current?.minPrice ?? '');
    setMaxPrice(current?.maxPrice ?? '');
  }, [current]);

  const apply = (opts?: { page?: number; search?: string; category?: string; sort?: string; minPrice?: string; maxPrice?: string }) => {
    const q = new URLSearchParams();
    q.set('page', String(opts?.page ?? current?.page ?? 1));
    const s = opts?.search !== undefined ? opts.search : search;
    if (s) q.set('search', s);
    const cat = opts?.category !== undefined ? opts.category : current?.category;
    if (cat) q.set('category', cat);
    const so = opts?.sort !== undefined ? opts.sort : sort;
    if (so) q.set('sort', so);
    if ((opts?.minPrice !== undefined ? opts.minPrice : minPrice)) q.set('minPrice', opts?.minPrice ?? minPrice);
    if ((opts?.maxPrice !== undefined ? opts.maxPrice : maxPrice)) q.set('maxPrice', opts?.maxPrice ?? maxPrice);

    router.push(`/${slug}/automarket?${q.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <form onSubmit={(e) => { e.preventDefault(); apply({ page: 1, search }); }} className="relative flex-1 max-w-lg">
        <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full shadow-sm"
          placeholder="Search services, names or locations..."
        />
      </form>

      <div className="flex items-center gap-2">
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="Min"
          className="w-20 px-3 py-2 border rounded-lg text-sm"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d]/g, ''))}
          placeholder="Max"
          className="w-20 px-3 py-2 border rounded-lg text-sm"
        />

        <select value={sort} onChange={(e) => { setSort(e.target.value); apply({ sort: e.target.value }); }} className="hidden md:inline-block border rounded px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>

        <button onClick={() => apply({ page: 1 })} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-shadow shadow-sm">
          <Bars3BottomRightIcon className="w-4 h-4" />
          <span className="text-sm">Filters</span>
        </button>
      </div>
    </div>
  );
}
