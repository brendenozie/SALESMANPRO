"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';

export type SubObj = {
  id: string;
  name: string;
  slug: string;
};

export type ParentCategory = {
  id: string;
  name: string;
  icon:string;
  children: SubObj[];
};

type SelectedCategory = {
  id: string;
  name: string;
  icon:string;
  items: SubObj[];
};

type Props = {
  availableCategories: ParentCategory[];
  selectedCategories: SelectedCategory[];
  onToggleParent: (cat: ParentCategory) => void;
  onToggleSub: (parentId: string, sub: SubObj) => void;
  onBulkToggle: (ids: string[]) => void;
  onApply: () => void;
};

// ─── Sub-component: Selected Pill (showing selected subcategory tags) ───────────
function SelectedPill({
  parentId,
  child,
  onRemove,
}: {
  parentId: string;
  child: SubObj;
  onRemove: (parentId: string, sub: SubObj) => void;
}) {
  return (
    <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-md text-sm transition-shadow hover:shadow-md">
      <span>{child.name}</span>
      <button
        onClick={() => onRemove(parentId, child)}
        className="flex-shrink-0 focus:outline-none"
        aria-label={`Remove ${child.name}`}
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Sub-component: Search Bar ─────────────────────────────────────────────────
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

// ─── Sub-component: Single Subcategory Row ────────────────────────────────────
function SubCategoryRow({
  child,
  isSelected,
  onToggle,
  highlightMatch,
}: {
  child: SubObj;
  isSelected: boolean;
  onToggle: () => void;
  highlightMatch: (text: string) => React.ReactNode;
}) {
  return (
    <label 
    className="flex items-center py-2 space-x-3 hover:bg-gray-100 rounded-lg px-4 transition cursor-pointer"
    onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) =>{
          e.stopPropagation();
          onToggle();
        }}
        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        aria-label={`Select subcategory ${child.name}`}
      />
      <span className="ml-1 text-sm text-gray-700">
        {highlightMatch(child.name)}
      </span>
    </label>
  );
}

// ─── Sub-component: Parent Category Card ──────────────────────────────────────
function CategoryCard({
  cat,
  selectedCount,
  totalChildren,
  isOpen,
  onToggleParentCheckbox,
  onToggleExpand,
  childrenRows,
}: {
  cat: ParentCategory;
  selectedCount: number;
  totalChildren: number;
  isOpen: boolean;
  onToggleParentCheckbox: (e: React.MouseEvent) => void;
  onToggleExpand: () => void;
  childrenRows: React.ReactNode[];
}) {
  const allSelected = totalChildren > 0 && selectedCount === totalChildren;
  const partial = selectedCount > 0 && selectedCount < totalChildren;

  return (
    <li className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      {/* Parent Row */}
      <div
        className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors
          ${isOpen ? "bg-indigo-50 border-l-4 border-indigo-600" : "hover:bg-indigo-50"}
        `}
        onClick={totalChildren > 0 ? onToggleExpand : () => {}}
      >
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => el && (el.indeterminate = partial)}
            onClick={(e) => {
              e.stopPropagation();
              onToggleParentCheckbox(e);
            }}
            className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            aria-label={`Select parent category ${cat.name}`}
          />
          <span className={`font-medium ${allSelected ? "text-indigo-600" : "text-gray-800"}`}>
            {cat.name}
          </span>
          {totalChildren > 0 && (
            <span className="ml-2 text-sm text-gray-500">
              ({selectedCount} of {totalChildren})
            </span>
          )}
        </div>
        {totalChildren > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-label={isOpen ? "Collapse" : "Expand"}
            className="focus:outline-none"
          >
            {isOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Child Rows (expand/collapse) */}
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300
          ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}
          bg-gray-50
        `}
      >
        <div className="border-t border-gray-200 pl-6 pr-4 pb-4 transition-opacity duration-300">
          {childrenRows.length > 0 ? childrenRows : (
            <p className="text-gray-500 italic px-4 py-2 text-sm">No subcategories</p>
          )}
        </div>
      </div>
    </li>
  );
}

export default function CategoryTree({
  availableCategories,
  selectedCategories,
  onToggleParent,
  onToggleSub,
  onBulkToggle,
  onApply,
}: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Filter logic
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableCategories
      .map(cat => ({
        ...cat,
        children: cat.children.filter(c => c.name.toLowerCase().includes(q)),
      }))
      .filter(
        cat =>
          cat.name.toLowerCase().includes(q) || (cat.children && cat.children.length > 0)
      );
  }, [search, availableCategories]);

  // Map for quick lookup
  const selectedMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    selectedCategories.forEach(p => {
      map[p.id] = p.items.map((i:any) => i.id);
    });
    return map;
  }, [selectedCategories]);

  // Flatten IDs
  const allFilteredIds = filtered.flatMap(cat => [
    cat.id,
    ...cat.children.map((c:any) => c.id),
  ]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Selected Pane */}
      <aside className="w-full lg:w-1/3 bg-gray-50 p-4 rounded-lg shadow-sm sticky top-20">
        <h4 className="text-lg font-semibold mb-4">Your Selection</h4>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {selectedCategories.map(parent => (
            <div key={parent.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-8 w-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full">
                  {parent.icon || parent.name[0]}
                </span>
                <span className="font-medium">{parent.name}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parent.items.map((child:any) => (
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
        <button
          onClick={onApply}
          className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Apply
        </button>
      </aside>

      {/* Browse & Select Pane */}
      <main className="flex-1">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
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

        {/* Category List */}
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
                      <span className="h-6 w-6 flex items-center justify-center text-indigo-600">
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
                    <div className="p-4 border-t border-gray-100 grid grid-cols-3 md:grid-cols-4 gap-2">
                      {cat.children.map((child:any) => {
                        const isSel = selIds.includes(child.id);
                        return (
                          <motion.button
                            key={child.id}
                            onClick={() => onToggleSub(cat.id, child)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-2 rounded-lg border text-sm transition-colors flex items-center justify-center
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
