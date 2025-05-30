import React, { useState, useMemo, ChangeEvent } from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  MinusCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function CategoryAccordion({
  availableCategories,
  selectedCategories,
  onToggleCategory,
  onBulkToggle,
  onApply,
}:any) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return availableCategories
      .map((cat: { children: any[]; }) => ({
        ...cat,
        children: cat.children?.filter((c: { name: string; }) => c.name.toLowerCase().includes(q)) || [],
      }))
      .filter((cat: { name: string; children: string | any[]; }) => cat.name.toLowerCase().includes(q) || cat.children.length > 0);
  }, [search, availableCategories]);

  const toggleExpand = (id: unknown) => {
    const next = new Set(expanded);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpanded(next);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Title and bulk actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">Select Categories</h3>
          <p className="mt-1 text-gray-600">Add categories and subcategories to your store.</p>
        </div>
        {onBulkToggle && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onBulkToggle(filtered.flatMap((c: { id: any; children: any[]; }) => [c.id, ...c.children.map((ch: { id: any; }) => ch.id)]))}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
            >Select All</button>
            <button
              type="button"
              onClick={() => onBulkToggle([])}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300 transition"
            >Clear All</button>
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="relative w-full md:w-1/2">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            <MagnifyingGlassIcon className="mx-auto w-10 h-10 mb-2" />
            No categories found.
          </div>
        ) : (
          filtered.map((cat: { children: { length: number; filter: (arg0: (c: any) => any) => { (): any; new(): any; length: any; }; map: (arg0: (child: any) => JSX.Element) => string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }; id: unknown; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
            const hasChildren = cat.children.length > 0;
            const selectedChildrenCount = cat.children.filter((c: { id: any; }) => selectedCategories.some((s: { id: any; }) => s.id === c.id)).length;
            const isCategorySelected = selectedCategories.some((s: { id: any; }) => s.id === cat.id);
            const allSelected = hasChildren && isCategorySelected && selectedChildrenCount === cat.children.length;
            const partial = (isCategorySelected || selectedChildrenCount > 0) && !allSelected;
            const isOpen = expanded.has(cat.id);

            return (
              <div key={String(cat.id)} className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-md transition">
                <div className="flex justify-between items-center px-4 py-3 cursor-pointer" onClick={() => hasChildren ? toggleExpand(cat.id) : onToggleCategory(cat)}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onToggleCategory(cat); }}
                      className="focus:outline-none"
                      aria-pressed={allSelected || partial}
                    >
                      {allSelected ? (
                        <CheckIcon className="w-6 h-6 text-indigo-600" />
                      ) : partial ? (
                        <MinusCircleIcon className="w-6 h-6 text-indigo-400" />
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </button>
                    <span className={`font-medium ${allSelected ? 'text-indigo-600' : 'text-gray-800'}`}>{cat.name}</span>
                  </div>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); toggleExpand(cat.id); }}
                      className="focus:outline-none"
                    >
                      {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-500" /> : <ChevronDownIcon className="w-5 h-5 text-gray-500" />}
                    </button>
                  )}
                </div>
                {hasChildren && isOpen && (
                  <div className="px-6 py-4 bg-gray-50 animate-fadeIn">
                    <div className="flex flex-wrap gap-2">
                      {cat.children.map((child: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined; }) => {
                        const isSel = selectedCategories.some((s: { id: any; }) => s.id === child.id);
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => onToggleCategory(child)}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transform transition hover:scale-105 focus:outline-none
                              ${isSel ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {isSel && <CheckIcon className="w-4 h-4" />}
                            <span>{child.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Apply action */}
      {onApply && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onApply}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none transition"
          >Apply</button>
        </div>
      )}
    </div>
  );
}
