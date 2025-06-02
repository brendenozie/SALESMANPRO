// File: components/CategoryTree.tsx
"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type SubObj = {
  id: string;
  name: string;
  slug: string;
};

export type ParentCategory = {
  id: string;
  name: string;
  children: SubObj[];
};

type SelectedCategory = {
  id: string;
  name: string;
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
    <div className="flex items-center space-x-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm transition-shadow hover:shadow-md">
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
    <label className="flex items-center py-2 space-x-3 hover:bg-gray-100 rounded-lg px-4 transition cursor-pointer">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
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

// ─── Main Component: CategoryTree ──────────────────────────────────────────────
export default function CategoryTree({
  availableCategories,
  selectedCategories,
  onToggleParent,
  onToggleSub,
  onBulkToggle,
  onApply,
}: Props) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // 1) Filter parents & their children based on `search`
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableCategories
      .map((cat) => ({
        ...cat,
        children: cat.children.filter((c) => c.name.toLowerCase().includes(q)),
      }))
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(q) || (cat.children && cat.children.length > 0)
      );
  }, [search, availableCategories]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const highlightMatch = (text: string) => {
    const idx = text.toLowerCase().indexOf(search.toLowerCase());
    if (idx === -1 || !search) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-100 text-yellow-800">
          {text.slice(idx, idx + search.length)}
        </mark>
        {text.slice(idx + search.length)}
      </>
    );
  };

  // Flatten all IDs of filtered categories and their children
  const allFilteredIds = filtered.flatMap((cat) => [
    cat.id,
    ...cat.children.map((c) => c.id),
  ]);

  return (
    <div className="max-w-4xl mx-auto mt-6 border border-gray-100 rounded-lg shadow-sm bg-white">
      {/* ─── Selected Pills ──────────────────────────────────────────────────── */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 px-6 pt-6">
          {selectedCategories.map((parent) =>
            parent.items.map((child) => (
              <SelectedPill
                key={child.id}
                parentId={parent.id}
                child={child}
                onRemove={onToggleSub}
              />
            ))
          )}
        </div>
      )}

      {/* ─── Sticky Header & Search ──────────────────────────────────────────── */}
      <div className="sticky top-0 bg-white z-10 shadow-sm border-b">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Select Categories</h3>
            <p className="mt-1 text-gray-600 text-sm">
              Pick a parent category or drill down to subcategories.
            </p>
          </div>

          {/* Bulk Action Buttons */}
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={() => onBulkToggle(allFilteredIds)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition-shadow shadow-sm"
            >
              Select All
            </button>
            <button
              onClick={() => onBulkToggle([])}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300 transition-shadow"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                const nextSet = new Set<string>();
                if (expanded.size === 0) {
                  filtered.forEach((cat) => nextSet.add(cat.id));
                }
                setExpanded(nextSet);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-shadow"
            >
              {expanded.size === 0 ? "Expand All" : "Collapse All"}
            </button>
          </div>

          {/* Search Field */}
          <div className="mt-4 md:mt-0">
            <SearchBar search={search} setSearch={setSearch} />
          </div>
        </div>
      </div>

      {/* ─── Category List ───────────────────────────────────────────────────── */}
      <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16 animate-fadeIn">
            <MagnifyingGlassIcon className="mx-auto w-12 h-12 mb-3 text-gray-300" />
            <p className="text-lg">No categories match "<span className="italic">{search}</span>".</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-indigo-600 hover:underline focus:outline-none"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((cat) => {
              const parentEntry = selectedCategories.find((s) => s.id === cat.id);
              const selectedCount = parentEntry?.items.length ?? 0;
              const hasChildren = cat.children.length > 0;
              const isOpen = expanded.has(cat.id);

              // Prepare subcategory rows
              const subRows = cat.children.map((child) => {
                const isSel = parentEntry?.items.some((item) => item.id === child.id) ?? false;
                return (
                  <SubCategoryRow
                    key={child.id}
                    child={child}
                    isSelected={isSel}
                    onToggle={() => onToggleSub(cat.id, child)}
                    highlightMatch={highlightMatch}
                  />
                );
              });

              const handleParentCheckboxClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                onToggleParent(cat);
                toggleExpand(cat.id);
              };

              return (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  selectedCount={selectedCount}
                  totalChildren={cat.children.length}
                  isOpen={isOpen}
                  onToggleParentCheckbox={handleParentCheckboxClick}
                  onToggleExpand={() => toggleExpand(cat.id)}
                  childrenRows={subRows}
                />
              );
            })}
          </ul>
        )}
      </div>

      {/* ─── Footer: Apply Button ────────────────────────────────────────────── */}
      <div className="flex justify-end px-6 py-5 border-t bg-gray-50">
        <button
          onClick={onApply}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none transition-shadow shadow-sm"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
