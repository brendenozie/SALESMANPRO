import React, { useState, useMemo, ChangeEvent } from 'react';
import { CheckCircleIcon, ChevronDownIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/solid';

export interface CategoryOption {
  id: string;
  name: string;
  children?: CategoryOption[];
}

export interface CategoryAccordionProps {
  availableCategories: CategoryOption[];
  selectedCategories: CategoryOption[];
  onToggleCategory: (category: CategoryOption) => void;
  onBulkToggle?: (ids: string[]) => void;
}


export default function CategoryAccordion({
  availableCategories,
  selectedCategories,
  onToggleCategory,
  onBulkToggle,
}: CategoryAccordionProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expanded);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpanded(newSet);
  };

  const filtered = useMemo(
    () => availableCategories
      .map(cat => ({
        ...cat,
        children: cat.children?.filter(child => child.name.toLowerCase().includes(search.toLowerCase()))
      }))
      .filter(cat => cat.name.toLowerCase().includes(search.toLowerCase()) || (cat.children?.length))
    , [search, availableCategories]
  );

  const handleSelectAll = (ids: string[]) => {
    onBulkToggle?.(ids);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Select Categories & Subcategories</h2>
          <p className="text-sm text-gray-600">Pick the categories and specific subcategories for your store.</p>
        </div>
        {onBulkToggle && (
          <div className="space-x-2">
            <button
              onClick={() => handleSelectAll(filtered.flatMap(cat => [cat.id, ...(cat.children?.map(c => c.id) || [])]))}
              className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
            >Select All</button>
            <button
              onClick={() => handleSelectAll(filtered.flatMap(_ => []))}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300 transition"
            >Clear All</button>
          </div>
        )}
      </div>
    
      <div className="relative mb-6">
        <MagnifyingGlassCircleIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-4">
        {filtered.map(cat => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isExpanded = expanded.has(cat.id);
          const isCatSelected = selectedCategories && selectedCategories.length > 0 && selectedCategories.includes(cat);
          return (
            <div key={cat.id} className="border rounded-xl">
              <div className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50" onClick={() => hasChildren ? toggleExpand(cat.id) : onToggleCategory(cat)}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); onToggleCategory(cat); }}
                    className="outline-none"
                  >
                    {isCatSelected
                      ? <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
                      : <CheckCircleIcon className="w-5 h-5 text-gray-300" />
                    }
                  </button>
                  <span className={`font-medium ${isCatSelected ? 'text-indigo-700' : 'text-gray-800'}`}>{cat.name}</span>
                </div>
                {hasChildren && (
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                )}
              </div>

              {hasChildren && isExpanded && (
                <div className="px-8 py-2 grid grid-cols-2 gap-3">
                  {cat.children!.map(child => {
                    const isSelected = selectedCategories && selectedCategories.length > 0 && selectedCategories.includes(child);
                    return (
                      <button
                        key={child.id}
                        onClick={() => onToggleCategory(child)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition transform hover:scale-105 focus:outline-none
                          ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                      >
                        {isSelected && <CheckCircleIcon className="w-4 h-4 text-white" />}
                        <span>{child.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            <MagnifyingGlassCircleIcon className="mx-auto w-8 h-8 mb-2" />
            <p>No results for “{search}”.</p>
          </div>
        )}
      </div>
    </div>
  );
}
