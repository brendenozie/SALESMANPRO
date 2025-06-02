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
  id:   string;
  name: string;
  slug: string;
};

export type ParentCategory = {
  id:       string;
  name:     string;
  children: SubObj[];
};

type SelectedCategory = {
  id:    string;
  name:  string;
  items: SubObj[];
};

type Props = {
  availableCategories: ParentCategory[];
  selectedCategories:  SelectedCategory[];
  onToggleParent:      (cat: ParentCategory) => void;
  onToggleSub:         (parentId: string, sub: SubObj) => void;
  onBulkToggle:        (ids: string[]) => void;
  onApply:             () => void;
};

export default function CategoryTree({
  availableCategories,
  selectedCategories,
  onToggleParent,
  onToggleSub,
  onBulkToggle,
  onApply,
}: Props) {
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  // 1) Filter parents & their children based on `search`
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableCategories
      .map((cat) => ({
        ...cat,
        children: cat.children && cat.children.filter((c) =>
          c.name.toLowerCase().includes(q)
        ),
      }))
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(q) ||
        cat.children && cat.children.length > 0
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

  return (
    <div className="max-w-4xl mx-auto mt-6">
      {/* CARD WRAPPER */}
      <div className="bg-white rounded-lg shadow">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 border-b">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              Select Categories
            </h3>
            <p className="mt-1 text-gray-600 text-sm">
              Pick a parent category or drill down to individual subcategories.
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={() =>
                onBulkToggle(
                  filtered.flatMap((cat) => [
                    cat.id,
                    ...cat.children.map((c) => c.id),
                  ])
                )
              }
              className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition"
            >
              Select All
            </button>
            <button
              onClick={() => onBulkToggle([])}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-6 py-4 border-b">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  searchRef.current?.focus();
                }}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY TREE (BODY) */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-10 animate-fadeIn">
              <MagnifyingGlassIcon className="mx-auto w-12 h-12 mb-3 text-gray-300" />
              <p className="text-lg">No categories match “{search}.”</p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-indigo-600 hover:underline focus:outline-none"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filtered.map((cat) => {
                const parentEntry = selectedCategories.find(
                  (s) => s.id === cat.id
                );
                const selectedCount =
                  (parentEntry?.items && parentEntry?.items.length) ?? 0;
                const hasChildren =
                  Array.isArray(cat.children) && cat.children.length > 0;
                const allSelected =
                  hasChildren && selectedCount === cat.children.length;
                const partial =
                  selectedCount > 0 &&
                  selectedCount < cat.children.length;
                const isOpen = expanded.has(cat.id);

                // Always toggle expand when the checkbox is clicked
                const handleParentCheckboxClick = (
                  e: React.MouseEvent
                ) => {
                  e.stopPropagation();
                  onToggleParent(cat);
                  // → Force expand right away
                  toggleExpand(cat.id);
                };

                return (
                  <li
                    key={cat.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    {/* PARENT ROW */}
                    <div
                      className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-indigo-50 transition"
                      onClick={() =>
                        hasChildren
                          ? toggleExpand(cat.id)
                          : onToggleParent(cat)
                      }
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(el) =>
                            el && (el.indeterminate = partial)
                          }
                          onClick={handleParentCheckboxClick}
                          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          aria-label={`Select parent category ${cat.name}`}
                        />
                        <span
                          className={`font-medium ${
                            allSelected
                              ? "text-indigo-600"
                              : "text-gray-800"
                          }`}
                        >
                          {highlightMatch(cat.name)}
                        </span>
                        {hasChildren && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({selectedCount} of {cat.children.length})
                          </span>
                        )}
                      </div>
                      {hasChildren && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(cat.id);
                          }}
                          aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                          {isOpen ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* CHILD ROWS (Indented) */}
                    <div
                      className={`overflow-hidden transition-[max-height] duration-300 ${
                        isOpen
                          ? "max-h-[600px]"
                          : "max-h-0"
                      } bg-gray-50`}
                    >
                      <div className="pl-6 pr-4 pb-4">
                        {cat.children && cat.children.map((child) => {
                          const isSel = parentEntry?.items.some(
                            (item) => item.id === child.id
                          );
                          return (
                            <label
                              key={child.id}
                              className="flex items-center py-2 space-x-2 hover:bg-gray-100 rounded-lg px-4 transition cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() =>
                                  onToggleSub(cat.id, child)
                                }
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                aria-label={`Select subcategory ${child.name}`}
                              />
                              <span className="ml-1 text-sm text-gray-700">
                                {highlightMatch(child.name)}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-5 border-t">
          <button
            onClick={onApply}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none transition"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
