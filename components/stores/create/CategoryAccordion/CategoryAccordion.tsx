'use client';

import React, { useState, useMemo, useRef } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';
import { STORE_CATEGORY_MAP } from "@/constant/STORE_CATEGORY_MAP";
import { IProductCategory, IStoreCategory, ISubcategory } from "@/types/typings";


type Props = {
  category: string;
  availableCategories: IProductCategory[];
  selectedCategories: IStoreCategory[];
  onToggleParent: (cat: IProductCategory) => void;
  onToggleSub: (parentId: string, sub: ISubcategory) => void;
  onToggleBrand: (parentId: string, brand: string) => void;
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
  onToggleBrand,
  onToggleSub,
  onBulkToggle,
  onApply,
}: Props) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  console.log("selectedCategories");
  console.log(selectedCategories);
  console.log("availableCategories");
  console.log(availableCategories);

  const filteredBySite = useMemo(() => {
    const allowedNames = STORE_CATEGORY_MAP[category] || [];
    return availableCategories.filter(cat => allowedNames.includes(cat.name || ''));
  }, [category, availableCategories]);
  

  // Inside your CategoryTree component
const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();
  
  return filteredBySite
    .map(cat => ({
      ...cat,
      // Map over subcategories to ensure each has a unique ID
      subcategories: cat.subcategories.map((sub, index) => {
        // Create a unique, stable ID if one doesn't exist
        const subId = sub._id?.$oid || sub.id || `${cat.id}-${sub.name}-${index}`;
        return {
          ...sub,
          id: subId, // Explicitly set the id field
        };
      }).filter(c => c.name.toLowerCase().includes(q)),
      
      allBrands: cat.allBrands?.filter(b => b.toLowerCase().includes(q)),
    }))
    .filter(cat =>
      cat.name?.toLowerCase().includes(q) || cat.subcategories.length > 0 || (cat.allBrands && cat.allBrands.length > 0)
    );
}, [search, filteredBySite]);

  const selectedParentMap = useMemo(() => {
    const map = new Map<string, IStoreCategory>();
    selectedCategories.forEach(p => map.set(p.id, p));
    return map;
  }, [selectedCategories]);

  const allFilteredIds = useMemo(() => {
    return filtered.flatMap(cat => [
      ...cat.subcategories.map((c:any) => c._id?.$oid || c.id), // Use correct ID here
      ...(cat.allBrands || [])
    ]);
  }, [filtered]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isParentFullySelected = (cat: IProductCategory) => {
    const selected = selectedParentMap.get(cat.id);
    if (!selected) return false;

    const allSubcategoryIds = new Set(cat.subcategories.map((s:any) => s._id?.$oid || s.id)); // Use correct ID
    const selectedSubIds = new Set(selected.subcategories.map(s => s.id));

    const totalBrandIds = new Set(cat.allBrands || []);
    const selectedBrandIds = new Set(selected.allBrands || []);

    const allSubcategoriesSelected = cat.subcategories.every((sub:any) => selectedSubIds.has(sub._id?.$oid || sub.id)); // Use correct ID
    const allBrandsSelected = (cat.allBrands || []).every(brand => selectedBrandIds.has(brand));

    return allSubcategoriesSelected && allBrandsSelected;
  };

  const isParentPartiallySelected = (cat: IProductCategory) => {
    const selected = selectedParentMap.get(cat.id);
    if (!selected) return false;
    
    const hasSomeSubcategories = selected.subcategories.length > 0;
    const hasSomeBrands = selected.allBrands && selected.allBrands.length > 0;

    return (hasSomeSubcategories || hasSomeBrands) && !isParentFullySelected(cat);
  };
  
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Selected Categories Pane */}
      <aside className="w-full lg:w-1/3 sticky top-20">
        <details className="lg:open">
          <summary className="cursor-pointer text-lg font-semibold mb-4 lg:mb-0">
            Your Selection
          </summary>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto mt-4">
            {selectedCategories.length === 0 && (
              <p className="text-gray-500 text-sm italic">No categories selected yet.</p>
            )}
            {selectedCategories.map(parent => (
              <div key={parent.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-8 w-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full text-sm font-medium">
                    {parent.icon}
                  </span>
                  <span className="font-medium">{parent.displayName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parent.subcategories && parent.subcategories.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                    >
                      {item.name}
                      <button
                        onClick={() => onToggleSub(parent.id, item)}
                        className="ml-1 focus:outline-none"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {parent.allBrands && parent.allBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {parent.allBrands.map(brand => (
                      <div
                        key={brand}
                        className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {brand}
                        <button
                          onClick={() => onToggleBrand(parent.id, brand)}
                          className="ml-1 focus:outline-none"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              onClick={onApply}
              className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
            >
              Apply
            </button>
          </div>
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
              const selectedParent = selectedParentMap.get(cat.id);
              const selSubIds = selectedParent?.subcategories.map(i => i.id) || [];
              const totalItems = cat.subcategories.length;
              const isOpen = expanded.has(cat.id);
              const isPartiallySelected = isParentPartiallySelected(cat);

              return (
                <motion.li
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-lg shadow hover:shadow-md overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                    <input
                      type="checkbox"
                      checked={isParentFullySelected(cat)}
                      onChange={() => onToggleParent(cat)}
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                      ref={el => {
                        if (el) {
                          el.indeterminate = isPartiallySelected;
                        }
                      }}
                    />
                    <div
                      onClick={() => toggleExpand(cat.id)}
                      className={`flex flex-1 items-center justify-between cursor-pointer transition-colors ${isOpen ? 'bg-indigo-50' : 'hover:bg-gray-50'} py-2 -my-2 -mx-4 px-4 rounded-md`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 flex items-center justify-center text-indigo-600 text-sm">
                          {cat.icon}
                        </span>
                        <span className="font-medium text-gray-900">{cat.name}</span>
                        {(cat.subcategories.length > 0 || (cat.allBrands && cat.allBrands.length > 0)) && (
                          <span className="text-sm text-gray-500">
                            {selectedParent ? `(${selectedParent.subcategories.length + (selectedParent.allBrands?.length || 0)}/${cat.subcategories.length + (cat.allBrands?.length || 0)})` : `(0/${cat.subcategories.length + (cat.allBrands?.length || 0)})`}
                          </span>
                        )}
                      </div>
                      {(cat.subcategories.length > 0 || (cat.allBrands && cat.allBrands.length > 0)) && (
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? '-rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {cat.subcategories.length > 0 && (
                          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {cat.subcategories.map((item:any) => {
                              const subId = item._id?.$oid || item.id; // Correctly get the ID
                              const isSel = selSubIds.includes(subId);
                              return (
                                <motion.button
                                  key={subId} // Use the correct ID for the key
                                  onClick={() => onToggleSub(cat.id, item)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`px-3 py-2 rounded-lg border text-sm text-center min-w-[90px]
                                    ${isSel
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-white text-gray-700 border-gray-200 hover:bg-indigo-50'}`}
                                >
                                  {item.name}
                                </motion.button>
                              );
                            })}
                          </div>
                        )}

                        {cat.allBrands && cat.allBrands.length > 0 && (
                          <div className={`px-4 pb-4 ${cat.subcategories.length > 0 ? 'border-t border-gray-100 pt-4' : 'pt-4'}`}>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Brands</p>
                            <div className="flex flex-wrap gap-2">
                              {cat.allBrands.map((brand: string, index: number) => {
                                const isBrandSelected = selectedParent?.allBrands?.includes(brand);
                                return (
                                  <motion.button
                                    key={index}
                                    onClick={() => onToggleBrand(cat.id, brand)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`px-3 py-1 rounded-full border text-sm
                                      ${isBrandSelected
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50'}`}
                                  >
                                    {brand}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
        <div className="mt-8">
          <button
            onClick={onApply}
            className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition lg:hidden"
          >
            Apply
          </button>
        </div>
      </main>
    </div>
  );
}