'use client';

import React, { useState, useMemo, useRef } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';

import { STORE_CATEGORY_MAP } from "@/constant/STORE_CATEGORY_MAP";
import { CategoryAction, IProductCategory, IStoreCategory, ISubcategory } from '@/types/typings';


// Simplified props
type Props = {
    category: string; // The current context, e.g., 'Groceries'
    availableCategories: IProductCategory[];
    selectedCategories: IStoreCategory[];
    dispatch: React.Dispatch<CategoryAction>;
    onApply: () => void;
};

function SearchBar({ search, setSearch }: { search: string; setSearch: (value: string) => void; }) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="relative w-full md:w-72">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input ref={inputRef} type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter categories…" className="w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            {search && <button onClick={() => { setSearch(""); inputRef.current?.focus(); }} className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700" aria-label="Clear search"><XMarkIcon className="w-5 h-5" /></button>}
        </div>
    );
}

export default function CategoryTree({
    category,
    availableCategories,
    selectedCategories,
    dispatch,
    onApply,
}: Props) {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const availableMap = useMemo(() => {
        const map = new Map<string, IProductCategory>();
        availableCategories.forEach(cat => map.set(cat.id, cat));
        return map;
    }, [availableCategories]);

    const categoriesForContext = useMemo(() => {
        const allowedNames = new Set(STORE_CATEGORY_MAP[category] || []);
        return availableCategories.filter(cat => allowedNames.has(cat.name || ''));
    }, [category, availableCategories]);

    const filteredData = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return categoriesForContext;
        return categoriesForContext
            .map(cat => ({
                ...cat,
                subcategories: cat.subcategories?.filter(c => c.name.toLowerCase().includes(q)),
                allBrands: (cat.allBrands || []).filter(b => b.toLowerCase().includes(q)),
            }))
            .filter(cat => cat.name?.toLowerCase().includes(q) || cat?.subcategories && cat.subcategories.length > 0 || (cat.allBrands?.length || 0) > 0);
    }, [search, categoriesForContext]);

    const selectedParentMap = useMemo(() => {
        const map = new Map<string, IStoreCategory>();
        selectedCategories.forEach(p => p.categoryId && map.set(p.categoryId, p));
        return map;
    }, [selectedCategories]);

    const allFilteredIds = useMemo(() => {
        return new Set(filteredData.flatMap(cat => [
            ...cat.subcategories.map(c => c.id),
            ...(cat.allBrands || [])
        ]));
    }, [filteredData]);
    
    const toggleExpand = (id: string) => setExpanded(p => {
        const newSet = new Set(p);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });

    const getSelectionStatus = (cat: IProductCategory) => {
        const selected = selectedParentMap.get(cat.id);
        if (!selected) return { isFullySelected: false, isPartiallySelected: false };

        const totalItems = (cat.subcategories?.length || 0) + (cat.allBrands?.length || 0);
        const selectedItems = (selected.subcategories?.length || 0) + (selected.allBrands?.length || 0);
        
        if (totalItems === 0 || selectedItems === 0) return { isFullySelected: false, isPartiallySelected: false };

        return {
            isFullySelected: selectedItems === totalItems,
            isPartiallySelected: selectedItems > 0 && selectedItems < totalItems,
        };
    };

    const resolveId = (sub: ISubcategory) => sub.id || sub._id?.$oid || sub.tempId;

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <aside className="w-full lg:w-1/3 sticky top-20">
                <details className="lg:open">
                    <summary className="cursor-pointer text-lg font-semibold">Your Selection</summary>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto mt-4 p-1">
                        {!selectedCategories.length && <p className="text-gray-500 text-sm italic">No categories selected.</p>}
                        {selectedCategories.map(parent => (
                            <div key={parent.categoryId}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="h-8 w-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full text-sm font-medium">{parent.icon}</span>
                                    <span className="font-medium">{parent.displayName}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {parent.subcategories.map(item => (
                                        <div key={item.id} className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                                            {item.name}
                                            <button onClick={() => {
                                                const parentData = parent.categoryId ? availableMap.get(parent.categoryId) : undefined;
                                                if (parentData) dispatch({ type: 'TOGGLE_SUB', payload: { parentId: parent.categoryId!, subcategory: item, parentData }});
                                            }} className="ml-1 focus:outline-none"><XMarkIcon className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                    {(parent.allBrands || []).map(brand => (
                                        <div key={brand} className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                            {brand}
                                            <button onClick={() => {
                                                const parentData = parent.categoryId ? availableMap.get(parent.categoryId) : undefined;
                                                if (parentData) dispatch({ type: 'TOGGLE_BRAND', payload: { parentId: parent.categoryId!, brand: brand, parentData }});
                                            }} className="ml-1 focus:outline-none"><XMarkIcon className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <button onClick={onApply} className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition">Apply Changes</button>
                    </div>
                </details>
            </aside>

            <main className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between items-stretch md:items-center gap-3 mb-6">
                    <SearchBar search={search} setSearch={setSearch} />
                    <div className="flex space-x-2">
                        <button onClick={() => dispatch({ type: 'BULK_UPDATE', payload: { ids: allFilteredIds, availableForContext: categoriesForContext }})} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">Select All Visible</button>
                        <button onClick={() => dispatch({ type: 'BULK_UPDATE', payload: { ids: new Set(), availableForContext: categoriesForContext }})} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300">Clear All Visible</button>
                    </div>
                </div>

                <ul className="space-y-4">
                    <AnimatePresence>
                        {filteredData.map(cat => {
                            const { isFullySelected, isPartiallySelected } = getSelectionStatus(cat);
                            const selectedParent = selectedParentMap.get(cat.id);
                            const isOpen = expanded.has(cat.id);
                            const totalCount = (cat.subcategories?.length || 0) + (cat.allBrands?.length || 0);
                            const selectedCount = (selectedParent?.subcategories.length || 0) + (selectedParent?.allBrands?.length || 0);

                            return (
                                <motion.li key={cat.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="flex items-center gap-3 px-6 py-4">
                                        <input type="checkbox" checked={isFullySelected} onChange={() => dispatch({ type: 'TOGGLE_PARENT', payload: { parent: cat } })} className="form-checkbox h-5 w-5 text-indigo-600 rounded" ref={el => { if (el) el.indeterminate = isPartiallySelected; }} />
                                        <div onClick={() => toggleExpand(cat.id)} className="flex flex-1 items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <span className="h-6 w-6 flex items-center justify-center text-indigo-600">{cat.icon}</span>
                                                <span className="font-medium text-gray-900">{cat.name}</span>
                                                {totalCount > 0 && <span className="text-sm text-gray-500">({selectedCount}/{totalCount})</span>}
                                            </div>
                                            {totalCount > 0 && <ChevronDownIcon className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? '-rotate-180' : ''}`} />}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                {cat?.subcategories && cat?.subcategories.length > 0 && 
                                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 border-t">
                                                      {cat.subcategories.map(item => {
                                                          const isSel = selectedParent?.subcategories.some( s => resolveId(s) === resolveId(item));
                                                          return (
                                                              <motion.button
                                                                  key={resolveId(item)}
                                                                  onClick={() => dispatch({
                                                                      type: 'TOGGLE_SUB',
                                                                      payload: { parentId: cat.id, subcategory: item, parentData: cat }
                                                                  })}
                                                                  className={`px-3 py-2 rounded-lg border text-sm text-center ${
                                                                      isSel
                                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                                        : 'bg-white hover:bg-indigo-50 hover:border-indigo-300'
                                                                  }`}
                                                              >
                                                                  {item.name}
                                                              </motion.button>
                                                          );
                                                      })}
                                                    </div>
                                                }
                                                {(cat.allBrands || []).length > 0 && (
                                                    <div className="px-4 pb-4 pt-4 border-t">
                                                        <p className="text-sm font-semibold text-gray-700 mb-3">Brands</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {cat.allBrands?.map(brand => {
                                                                const isBrandSelected = selectedParent?.allBrands?.includes(brand);
                                                                return <motion.button key={brand} onClick={() => dispatch({ type: 'TOGGLE_BRAND', payload: { parentId: cat.id, brand, parentData: cat } })} className={`px-3 py-1 rounded-full border text-sm ${isBrandSelected ? 'bg-purple-600 text-white border-purple-600' : 'bg-white hover:bg-purple-50 hover:border-purple-300'}`}>{brand}</motion.button>;
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
                 {filteredData.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No categories match your search.</p>
                    </div>
                )}
            </main>
        </div>
    );
}