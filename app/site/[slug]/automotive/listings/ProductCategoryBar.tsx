// components/automarket/CategoryBar.tsx
'use client';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/navigation';

type Category = { id: string; name: string; slug?: string; icon?: string | null };
export default function CategoryBar({ categories, parent, currentCategory, slug }: { categories: Category[]; parent: { id: string; name: string } | null; currentCategory?: string; slug: string }) {
  const router = useRouter();

  const onClick = (catId: string) => {
    const q = new URLSearchParams();
    q.set('page', '1');
    if (catId) q.set('category', catId);
    const url = `/${slug}/automarket?${q.toString()}`;
    router.push(url);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-600">Category</h3>
          <div className="text-xs text-slate-400">{parent ? parent.name : 'All'}</div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-3 gap-2 no-scrollbar">
        <button
          onClick={() => onClick('')}
          className={classNames(
            'whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
            { 'bg-slate-900 text-white shadow-md transform scale-105': !currentCategory },
            { 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50': currentCategory }
          )}
        >
          All
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onClick(c.id)}
            className={classNames(
              'whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              { 'bg-slate-900 text-white shadow-md transform scale-105': currentCategory === c.id },
              { 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50': currentCategory !== c.id }
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
