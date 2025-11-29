'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Category = { id: string; name: string; icon?: string | null; slug?: string };
type Current = { page: number; search: string; category: string; sort: string; slug: string };

export default function ProductFilters({ categories, current, totalCount }: { categories: Category[]; current: Current; totalCount?: number }) {
  const router = useRouter();
  const [search, setSearch] = useState(current.search || '');
  const [active, setActive] = useState(current.category || '');
  const [sort, setSort] = useState(current.sort || 'newest');

  useEffect(() => {
    setSearch(current.search || '');
    setActive(current.category || '');
    setSort(current.sort || 'newest');
  }, [current]);

  const apply = (opts: { category?: string; page?: number; search?: string; sort?: string }) => {
    const q = new URLSearchParams();
    q.set('page', String(opts.page ?? 1));
    const s = opts.search !== undefined ? opts.search : search;
    if (s) q.set('search', s);
    const c = opts.category !== undefined ? opts.category : active;
    if (c) q.set('category', c);
    const so = opts.sort !== undefined ? opts.sort : sort;
    if (so) q.set('sort', so);

    const url = `/travel/listings?${q.toString()}`;
    router.push(url);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    apply({ search, page: 1 });
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Main Floating Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-xl shadow-black/5 ring-1 ring-slate-900/5 md:flex-row md:items-center">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="What are you looking for?" 
            className="w-full rounded-xl border-0 bg-gray-100 py-3 pl-11 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 transition-shadow"
          />
          {search && (
              <button 
                type="button" 
                onClick={() => { setSearch(''); apply({ search: '', page: 1 }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                  <XMarkIcon className="h-4 w-4" />
              </button>
          )}
        </form>

        <div className="hidden h-8 w-[1px] bg-gray-200 md:block"></div>

        {/* Sort Dropdown (Styled as button) */}
        <div className="relative min-w-[160px]">
             <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); apply({ sort: e.target.value }); }}
              className="w-full appearance-none rounded-xl bg-gray-50 py-3 pl-4 pr-10 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-teal-500 border-none cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <AdjustmentsHorizontalIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Category Pills (Below floating bar) */}
      <div className="mt-6 flex items-center justify-between">
         <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mask-fade-right">
            <button 
                onClick={() => { setActive(''); apply({ category: '', page: 1 }); }}
                className={`flex items-center whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  active === '' 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                All
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { setActive(cat.id); apply({ category: cat.id, page: 1 }); }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${
                  active === cat.id 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
         </div>
         <p className="hidden text-sm font-medium text-gray-500 lg:block whitespace-nowrap pl-4">
             {totalCount} Items
         </p>
      </div>
    </div>
  );
}