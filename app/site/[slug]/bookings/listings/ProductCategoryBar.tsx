'use client';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';
import { ArrowTrendingUpIcon } from '@heroicons/react/20/solid';

type Category = { id: string; name: string; slug?: string; icon?: string | null };

export default function ProductCategoryBar({
  categories,
  parent,
  currentCategory,
  slug,
}: {
  categories: Category[];
  parent: { id: string; name: string } | null;
  currentCategory?: string;
  slug: string;
}) {
  const router = useRouter();

  const onClick = (catId: string) => {
    const q = new URLSearchParams();
    q.set('page', '1');
    if (catId) q.set('category', catId);
    const url = `/${slug}/automarket?${q.toString()}`;
    router.push(url);
  };

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {}}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900 text-sm font-medium whitespace-nowrap transition-colors"
        >
          <ArrowTrendingUpIcon className="w-4 h-4" />
          <span>Filters</span>
        </button>

        <div className="w-px h-8 bg-gray-200 mx-2 flex-shrink-0" />

        <div className="flex gap-2">
          <button
            onClick={() => onClick('')}
            className={classNames(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              {
                'bg-gray-900 text-white shadow-md scale-105': !currentCategory,
                'bg-gray-100 text-gray-600 hover:bg-gray-200': currentCategory,
              }
            )}
          >
            All
          </button>

          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onClick(c.id)}
              className={classNames(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                {
                  'bg-gray-900 text-white shadow-md scale-105': currentCategory === c.id,
                  'bg-gray-100 text-gray-600 hover:bg-gray-200': currentCategory !== c.id,
                }
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
