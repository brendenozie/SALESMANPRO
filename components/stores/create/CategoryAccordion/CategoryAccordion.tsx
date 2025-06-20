'use client';

import React, { useState, useMemo, useRef } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CATEGORY_MAP } from "@/constant/STORE_CATEGORY_MAP";

export type SubObj = { id: string; name: string; slug: string; };
export type ParentCategory = { id: string; name: string; icon: string; children: SubObj[]; };
type SelectedCategory = { id: string; name: string; icon: string; items: SubObj[]; };

type Props = {
  category: string;
  availableCategories: ParentCategory[];
  selectedCategories: SelectedCategory[];
  onToggleParent: (cat: ParentCategory) => void;
  onToggleSub: (parentId: string, sub: SubObj) => void;
  onBulkToggle: (ids: string[]) => void;
  onApply: () => void;
};

function SearchBar({
  search,
  setSearch,
  placeholder = "Search categories...",
}: {
  search: string;
  setSearch: (value: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full md:w-72">
      <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
      />
      {search && (
        <button
          onClick={() => {
            setSearch("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Clear search"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export default function CategoryTree({
  category,
  availableCategories,
  selectedCategories,
  onToggleParent,
  onToggleSub,
  onBulkToggle,
  onApply,
}: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredBySite = useMemo(() => {
    const allowedNames = STORE_CATEGORY_MAP[category] || [];
    return availableCategories.filter(cat => allowedNames.includes(cat.name));
  }, [category, availableCategories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return filteredBySite
      .map(cat => ({
        ...cat,
        children: cat.children.filter(c => c.name.toLowerCase().includes(q)),
      }))
      .filter(cat =>
        cat.name.toLowerCase().includes(q) || cat.children.length > 0
      );
  }, [search, filteredBySite]);

  const selectedMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    selectedCategories.forEach(p => {
      map[p.id] = p.items.map(i => i.id);
    });
    return map;
  }, [selectedCategories]);

  const allFilteredIds = filtered.flatMap(cat => [cat.id, ...cat.children.map(c => c.id)]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Selected Categories Pane */}
      <aside className="w-full lg:w-1/3 sticky top-20">
        <details className=" lg:open">
          <summary className="cursor-pointer text-lg font-semibold mb-4 lg:mb-0">
            Your Selection
          </summary>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto mt-4">
            {selectedCategories.map(parent => (
              <div key={parent.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-8 w-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full text-sm font-medium">
                    {parent.icon || parent.name[0]}
                  </span>
                  <span className="font-medium">{parent.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parent.items.map(child => (
                    <div
                      key={child.id}
                      className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                    >
                      {child.name}
                      <button
                        onClick={() => onToggleSub(parent.id, child)}
                        className="ml-1 focus:outline-none"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* <button
            onClick={onApply}
            className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Apply
          </button> */}
        </details>
      </aside>

      {/* Category List Panel */}
      <main className="flex-1">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:justify-between items-stretch md:items-center gap-3 mb-6">
          <SearchBar search={search} setSearch={setSearch} placeholder="Filter categories…" />
          <div className="flex space-x-2">
            <button
              onClick={() => onBulkToggle(allFilteredIds)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
            >
              Select All
            </button>
            <button
              onClick={() => onBulkToggle([])}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Category Accordion */}
        <ul className="space-y-4">
          <AnimatePresence>
            {filtered.map(cat => {
              const selIds = selectedMap[cat.id] || [];
              const selCount = selIds.length;
              const totalChildren = cat.children.length;
              const isOpen = expanded.has(cat.id);

              return (
                <motion.li
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-lg shadow hover:shadow-md overflow-hidden"
                >
                  <div
                    onClick={() => toggleExpand(cat.id)}
                    className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors
                      ${isOpen ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-6 w-6 flex items-center justify-center text-indigo-600 text-sm">
                        {cat.icon}
                      </span>
                      <span className="font-medium text-gray-900">{cat.name}</span>
                      {totalChildren > 0 && (
                        <span className="text-sm text-gray-500">
                          ({selCount}/{totalChildren})
                        </span>
                      )}
                    </div>
                    {totalChildren > 0 && (
                      <ChevronDownIcon
                        className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? '-rotate-180' : ''}`}
                      />
                    )}
                  </div>

                  {isOpen && totalChildren > 0 && (
                    <div className="p-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {cat.children.map(child => {
                        const isSel = selIds.includes(child.id);
                        return (
                          <motion.button
                            key={child.id}
                            onClick={() => onToggleSub(cat.id, child)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-2 rounded-lg border text-sm text-center min-w-[90px]
                              ${isSel
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50'}`}
                          >
                            {child.name}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </main>
    </div>
  );
}
