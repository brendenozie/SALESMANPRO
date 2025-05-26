import React, { useState, useMemo, ChangeEvent } from 'react';
import { CheckCircleIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/solid';

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CategoryAccordionProps {
  availableCategories: CategoryOption[];
  selectedCategories: CategoryOption[];
  onToggleCategory: (category: CategoryOption) => void;
}

export default function CategoryAccordion({
  availableCategories,
  selectedCategories,
  onToggleCategory,
}: CategoryAccordionProps) {
  const [search, setSearch] = useState('');

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredCategories = useMemo(
    () => availableCategories.filter(cat =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    ),
    [search, availableCategories]
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Select Product Categories
        </h2>
        <p className="text-sm text-gray-500">
          Choose the categories that best describe your product.
        </p>
      </div>

      <div className="relative mb-6">
        <MagnifyingGlassCircleIcon className="w-5 h-5 text-gray-400 absolute top-3.5 left-3" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 shadow-sm text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {filteredCategories.map(cat => {
          const isSelected = selectedCategories.some(c => c.id === cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onToggleCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all transform hover:scale-[1.03] duration-200 focus:outline-none
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            >
              {isSelected && (
                <CheckCircleIcon className="w-4 h-4 text-white" />
              )}
              {cat.name}
            </button>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="mt-8 flex flex-col items-center text-gray-400">
          <MagnifyingGlassCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-sm">No categories match “{search}”.</p>
        </div>
      )}
    </div>
  );
}
