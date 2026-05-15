'use client';

import React, { useState, useMemo, useRef } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon, CheckIcon, MinusIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';

import { STORE_CATEGORY_MAP } from "@/constant/STORE_CATEGORY_MAP";
import { CategoryAction, IProductCategory, IStoreCategory, ISubcategory } from '@/types/typings';

type Props = {
    category: string;
    availableCategories: IProductCategory[];
    selectedCategories: IStoreCategory[];
    dispatch: React.Dispatch<CategoryAction>;
    onApply: () => void;
};

function SearchBar({ search, setSearch }: { search: string; setSearch: (value: string) => void; }) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="relative w-full md:w-80 group">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3.5 transform -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
                ref={inputRef} 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search categories or brands..." 
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-zinc-900 dark:text-zinc-100" 
            />
            <AnimatePresence>
                {search && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => { setSearch(""); inputRef.current?.focus(); }} 
                        className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" 
                        aria-label="Clear search"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </motion.button>
                )}
            </AnimatePresence>
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
        availableCategories?.forEach(cat => map.set(cat.id, cat));
        return map;
    }, [availableCategories]);

    const categoriesForContext = useMemo(() => {
        const allowedNames = new Set(STORE_CATEGORY_MAP[category] || []);
        return availableCategories?.filter(cat => allowedNames.has(cat.name || '')) || [];
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
            .filter(cat => cat.name?.toLowerCase().includes(q) || (cat?.subcategories && cat.subcategories.length > 0) || (cat.allBrands?.length || 0) > 0);
    }, [search, categoriesForContext]);

    const selectedParentMap = useMemo(() => {
        const map = new Map<string, IStoreCategory>();
        selectedCategories.forEach(p => p.categoryId && map.set(p.categoryId, p));
        return map;
    }, [selectedCategories]);

    const allFilteredIds = useMemo(() => {
        return new Set(filteredData.flatMap(cat => [
            ...cat.subcategories?.map(c => c.id) || [],
            ...(cat.allBrands || [])
        ]));
    }, [filteredData]);
    
    const toggleExpand = (id: string) => setExpanded(p => {
        const newSet = new Set(p);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
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
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start max-w-7xl mx-auto p-4">
            {/* Left Column: Fixed Sticky Selection Manifest */}
            <aside className="w-full lg:w-80 lg:sticky lg:top-24 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                        Current Selections
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md">
                        {selectedCategories.reduce((acc, curr) => acc + curr.subcategories.length + (curr.allBrands?.length || 0), 0)} Selected
                    </span>
                </div>

                <div className="space-y-5 max-h-[50vh] overflow-y-auto mt-4 pr-1 scrollbar-thin">
                    {!selectedCategories.length && (
                        <p className="text-zinc-400 dark:text-zinc-500 text-xs italic py-4 text-center">
                            No configurations selected yet.
                        </p>
                    )}
                    
                    <AnimatePresence>
                        {selectedCategories.map(parent => (
                            <motion.div 
                                key={parent.categoryId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-3 rounded-xl shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="h-6 w-6 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-lg text-xs font-semibold border border-indigo-100/50 dark:border-indigo-900/30">
                                        {parent.icon || '📦'}
                                    </span>
                                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 tracking-tight">
                                        {parent.displayName}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {parent.subcategories.map(item => (
                                        <div key={item.id} className="flex items-center gap-1 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 pl-2.5 pr-1.5 py-0.5 rounded-md text-xs border border-indigo-100 dark:border-indigo-900/40">
                                            <span>{item.name}</span>
                                            <button 
                                                onClick={() => {
                                                    const parentData = parent.categoryId ? availableMap.get(parent.categoryId) : undefined;
                                                    if (parentData) dispatch({ type: 'TOGGLE_SUB', payload: { parentId: parent.categoryId!, subcategory: item, parentData }});
                                                }} 
                                                className="p-0.5 rounded hover:bg-indigo-200/50 dark:hover:bg-indigo-900/60 text-indigo-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <XMarkIcon className="h-3 w-3 stroke-[2.5]" />
                                            </button>
                                        </div>
                                    ))}
                                    {(parent.allBrands || []).map(brand => (
                                        <div key={brand} className="flex items-center gap-1 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 pl-2.5 pr-1.5 py-0.5 rounded-md text-xs border border-purple-100 dark:border-purple-900/40">
                                            <span>{brand}</span>
                                            <button 
                                                onClick={() => {
                                                    const parentData = parent.categoryId ? availableMap.get(parent.categoryId) : undefined;
                                                    if (parentData) dispatch({ type: 'TOGGLE_BRAND', payload: { parentId: parent.categoryId!, brand: brand, parentData }});
                                                }} 
                                                className="p-0.5 rounded hover:bg-purple-200/50 dark:hover:bg-purple-900/60 text-purple-400 hover:text-purple-600 transition-colors"
                                            >
                                                <XMarkIcon className="h-3 w-3 stroke-[2.5]" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* <div className="mt-5 pt-3 border-t border-zinc-200/60 dark:border-zinc-800">
                    <button 
                        onClick={onApply} 
                        className="w-full py-2.5 bg-zinc-900 dark:bg-indigo-600 text-white hover:bg-zinc-800 dark:hover:bg-indigo-700 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition active:scale-[0.98]"
                    >
                        Apply Changes
                    </button>
                </div> */}
            </aside>

            {/* Right Column: Main Configuration Workspace */}
            <main className="flex-1 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/60">
                    <SearchBar search={search} setSearch={setSearch} />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => dispatch({ type: 'BULK_UPDATE', payload: { ids: allFilteredIds, availableForContext: categoriesForContext }})} 
                            className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition"
                        >
                            Select All Visible
                        </button>
                        <button 
                            onClick={() => dispatch({ type: 'BULK_UPDATE', payload: { ids: new Set(), availableForContext: categoriesForContext }})} 
                            className="flex-1 sm:flex-initial px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Primary Structured Feed Tree */}
                <ul className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredData.map(cat => {
                            const { isFullySelected, isPartiallySelected } = getSelectionStatus(cat);
                            const selectedParent = selectedParentMap.get(cat.id);
                            const isOpen = expanded.has(cat.id);
                            const totalCount = (cat.subcategories?.length || 0) + (cat.allBrands?.length || 0);
                            const selectedCount = (selectedParent?.subcategories.length || 0) + (selectedParent?.allBrands?.length || 0);

                            return (
                                <motion.li 
                                    key={cat.id} 
                                    layout 
                                    initial={{ opacity: 0, scale: 0.99 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.99 }} 
                                    className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden group"
                                >
                                    {/* Parent Node Strip */}
                                    <div className="flex items-center gap-4 px-5 py-4 select-none">
                                        <div className="relative flex items-center justify-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={isFullySelected} 
                                                onChange={() => dispatch({ type: 'TOGGLE_PARENT', payload: { parent: cat } })} 
                                                className="peer opacity-0 absolute w-5 h-5 cursor-pointer z-10" 
                                                ref={el => { if (el) el.indeterminate = isPartiallySelected; }} 
                                            />
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                                isFullySelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/20' :
                                                isPartiallySelected ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-600' :
                                                'bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 peer-hover:border-zinc-400 dark:peer-hover:border-zinc-500'
                                            }`}>
                                                {isFullySelected && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                                                {isPartiallySelected && <MinusIcon className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                        </div>

                                        <div onClick={() => toggleExpand(cat.id)} className="flex flex-1 items-center justify-between cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <span className="h-8 w-8 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/60 flex items-center justify-center rounded-xl text-zinc-700 dark:text-zinc-300 text-sm group-hover:scale-105 transition-transform">
                                                    {cat.icon || '📁'}
                                                </span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">
                                                        {cat.name}
                                                    </span>
                                                    {totalCount > 0 && (
                                                        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                                                            {selectedCount} of {totalCount} nodes selected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {totalCount > 0 && (
                                                <div className="p-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                                    <ChevronDownIcon className={`h-4 w-4 transform transition-transform duration-300 ${isOpen ? '-rotate-180' : ''}`} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Child Viewports Panel Accordion */}
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }} 
                                                animate={{ height: 'auto', opacity: 1 }} 
                                                exit={{ height: 0, opacity: 0 }} 
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                                className="overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-800"
                                            >
                                                {cat?.subcategories && cat?.subcategories.length > 0 && (
                                                    <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                        {cat.subcategories.map(item => {
                                                            const isSel = selectedParent?.subcategories.some(s => resolveId(s) === resolveId(item));
                                                            return (
                                                                <button
                                                                    key={resolveId(item)}
                                                                    onClick={() => dispatch({
                                                                        type: 'TOGGLE_SUB',
                                                                        payload: { parentId: cat.id, subcategory: item, parentData: cat }
                                                                    })}
                                                                    className={`px-3 py-2.5 rounded-xl border text-xs font-semibold tracking-tight transition-all text-center ${
                                                                        isSel
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/10 scale-[1.01]'
                                                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-900'
                                                                    }`}
                                                                >
                                                                    {item.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                                
                                                {/* Brands Section Matrix */}
                                                {(cat.allBrands || []).length > 0 && (
                                                    <div className="px-5 pb-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                                                        <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
                                                            Available Brands
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {cat.allBrands?.map(brand => {
                                                                const isBrandSelected = selectedParent?.allBrands?.includes(brand);
                                                                return (
                                                                    <button 
                                                                        key={brand} 
                                                                        onClick={() => dispatch({ type: 'TOGGLE_BRAND', payload: { parentId: cat.id, brand, parentData: cat } })} 
                                                                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                                                            isBrandSelected 
                                                                                ? 'bg-purple-600 border-purple-600 text-white shadow-sm' 
                                                                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:border-purple-300'
                                                                        }`}
                                                                    >
                                                                        {brand}
                                                                    </button>
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

                {filteredData.length === 0 && (
                    <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                            No matching categorical nodes found. Try redefining your parameters.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}