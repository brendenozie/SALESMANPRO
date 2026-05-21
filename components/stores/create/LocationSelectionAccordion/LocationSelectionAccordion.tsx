'use client';

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
    ChevronDownIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    GlobeAltIcon,
    MapIcon,
    BuildingLibraryIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from 'framer-motion';
import { SelectedLocation, ILocation } from "@/types/typings";

type Props = {
    availableLocations: ILocation[];
    selectedLocations: SelectedLocation[];
    onToggleLocation: (location: ILocation, isSelected: boolean) => void;
    onBulkToggle: (locationIds: string[]) => void;
    onApply?: () => void;
};

function SearchBar({
    search,
    setSearch,
    placeholder = "Search locations...",
}: {
    search: string;
    setSearch: (value: string) => void;
    placeholder?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative w-full md:w-80 group">
            <MagnifyingGlassIcon className="absolute top-1/2 left-3.5 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-indigo-500" />
            <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {search && (
                <button
                    onClick={() => {
                        setSearch("");
                        inputRef.current?.focus();
                    }}
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none"
                    aria-label="Clear search"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

const buildLocationTree = (locations: ILocation[]): ILocation[] => {
    const locationMap: { [key: string]: ILocation } = {};
    const tree: ILocation[] = [];

    locations.forEach(location => {
        locationMap[location.id] = { ...location, children: [] };
    });

    locations.forEach(location => {
        if (location.parentId && locationMap[location.parentId]) {
            locationMap[location.parentId].children?.push(locationMap[location.id]);
            locationMap[location.parentId].children?.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            tree.push(locationMap[location.id]);
        }
    });
    tree.sort((a, b) => a.name.localeCompare(b.name));
    return tree;
};

export default function LocationSelectionAccordion({
    availableLocations,
    selectedLocations,
    onToggleLocation,
    onBulkToggle,
    onApply,
}: Props) {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const locationTree = useMemo(() => buildLocationTree(availableLocations), [availableLocations]);

    const filteredTree = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return locationTree;

        const filterNodes = (nodes: ILocation[]): ILocation[] => {
            return nodes.reduce((acc: ILocation[], node) => {
                const matches = node.name.toLowerCase().includes(q) ||
                                node.city?.toLowerCase().includes(q) ||
                                node.country?.toLowerCase().includes(q) ||
                                node.slug.toLowerCase().includes(q);

                const filteredChildren = node.children ? filterNodes(node.children) : [];

                if (matches || filteredChildren.length > 0) {
                    acc.push({ ...node, children: filteredChildren });
                }
                return acc;
            }, []);
        };
        return filterNodes(locationTree);
    }, [search, locationTree]);

    const selectedMap = useMemo(() => {
        const map = new Set<string>();
        const populateMap = (locations: SelectedLocation[]) => {
            locations && locations.forEach(loc => {
                map.add(loc.id);
                if (loc.children) {
                    populateMap(loc.children);
                }
            });
        };
        populateMap(selectedLocations);
        return map;
    }, [selectedLocations]);

    const allFilteredLocationIds = useMemo(() => {
        const ids: string[] = [];
        const collectIds = (nodes: ILocation[]) => {
            nodes.forEach(node => {
                ids.push(node.id);
                if (node.children) {
                    collectIds(node.children);
                }
            });
        };
        collectIds(filteredTree);
        return ids;
    }, [filteredTree]);

    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (search.trim()) {
            const newExpanded = new Set<string>();
            const expandMatchingParents = (nodes: ILocation[]) => {
                nodes.forEach(node => {
                    const matches = node.name.toLowerCase().includes(search.toLowerCase()) ||
                                    (node.city && node.city.toLowerCase().includes(search.toLowerCase())) ||
                                    (node.country && node.country.toLowerCase().includes(search.toLowerCase())) ||
                                    node.slug.toLowerCase().includes(search.toLowerCase());

                    const hasSelectedChildren = node.children?.some(child => selectedMap.has(child.id));

                    if (matches || hasSelectedChildren) {
                        newExpanded.add(node.id);
                        if (node.parentId) {
                            let currentParentId = node.parentId;
                            while(currentParentId) {
                                newExpanded.add(currentParentId);
                                const parentNode = availableLocations.find(loc => loc.id === currentParentId);
                                currentParentId = parentNode?.parentId || "";
                            }
                        }
                    }
                    if (node.children) {
                        expandMatchingParents(node.children);
                    }
                });
            };
            expandMatchingParents(filteredTree);
            setExpanded(newExpanded);
        } else {
            setExpanded(new Set());
        }
    }, [search, filteredTree, selectedMap, availableLocations]);

    const renderLocationNode = (node: ILocation, level: number = 0) => {
        const isSelected = selectedMap.has(node.id);
        const isOpen = expanded.has(node.id) || search.trim() !== '';
        const hasChildren = node.children && node.children.length > 0;

        const getIcon = (lvl: number) => {
            if (lvl === 0) return <GlobeAltIcon className='w-4 h-4 text-blue-500 dark:text-blue-400' />;
            if (lvl === 1) return <MapIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
            return <BuildingLibraryIcon className="w-4 h-4 text-violet-500 dark:text-violet-400" />;
        };

        const hasSelectedChild = hasChildren && node.children?.some(child => selectedMap.has(child.id));

        return (
            <motion.li
                key={node.id}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
                <div
                    onClick={() => hasChildren && toggleExpand(node.id)}
                    className={`flex items-center justify-between px-4 py-3.5 cursor-pointer select-none transition-colors
                        ${isOpen && hasChildren ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600 dark:border-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 border-l-4 border-transparent'}`}
                    style={{ paddingLeft: `${16 + level * 16}px` }}
                >
                    <div className="flex items-center gap-3 flex-grow min-w-0">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => onToggleLocation(node, !isSelected)}
                            className="form-checkbox h-4 w-4 text-indigo-600 dark:text-indigo-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded transition cursor-pointer focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2 min-w-0">
                            {getIcon(level)}
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{node.name}</span>
                            {node.city && <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline truncate">({node.city})</span>}
                            {node.country && <span className="text-xs text-gray-400 dark:text-gray-500 hidden md:inline truncate">[{node.country}]</span>}
                        </div>
                        {hasSelectedChild && !isSelected && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100/40 dark:border-indigo-900/40 animate-fade-in">
                                Partial
                            </span>
                        )}
                    </div>
                    {hasChildren && (
                        <ChevronDownIcon
                            className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isOpen ? '-rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`}
                        />
                    )}
                </div>

                <AnimatePresence initial={false}>
                    {isOpen && hasChildren && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden bg-gray-50/30 dark:bg-gray-900/30 border-t border-gray-100/60 dark:border-gray-800/40"
                        >
                            <ul className="p-2 space-y-1.5">
                                {node.children?.map(child => renderLocationNode(child, level + 1))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.li>
        );
    };

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start text-gray-900 dark:text-gray-100">
            {/* Selected Locations Drawer/Sidebar */}
            <aside className="w-full lg:w-80 lg:sticky lg:top-6 order-1 lg:order-2">
                <details className="group lg:open bg-gray-50/50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200/60 dark:border-gray-800/60" open>
                    <summary className="list-none flex items-center justify-between cursor-pointer font-semibold text-base text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                            <span>Selected Locations</span>
                            <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full font-medium">
                                {selectedLocations.length}
                            </span>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180 lg:hidden" />
                    </summary>
                    
                    <div className="space-y-2.5 max-h-[40vh] lg:max-h-[65vh] overflow-y-auto mt-4 pr-1 scrollbar-thin">
                        {selectedLocations.length === 0 ? (
                            <p className="text-gray-400 dark:text-gray-500 text-xs italic py-2">No locations selected yet.</p>
                        ) : (
                            selectedLocations.map(parent => (
                                <div key={parent.id} className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800/80 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="h-6 w-6 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center rounded-lg text-xs font-semibold uppercase">
                                            {parent.name[0]}
                                        </span>
                                        <span className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate max-w-[160px]">{parent.name}</span>
                                        <button
                                            onClick={() => onToggleLocation(parent as ILocation, false)}
                                            className="ml-auto p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                            aria-label={`Remove ${parent.name}`}
                                        >
                                            <XMarkIcon className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    
                                    {parent.children && parent.children.length > 0 && (
                                        <div className="pl-3 border-l-2 border-gray-100 dark:border-gray-800 mt-2 flex flex-wrap gap-1.5">
                                            {parent.children.map(child => (
                                                <div
                                                    key={child.id}
                                                    className="inline-flex items-center bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 pl-2.5 pr-1.5 py-0.5 rounded-md text-xs border border-gray-200/40 dark:border-gray-700/40"
                                                >
                                                    <span className="truncate max-w-[120px]">{child.name}</span>
                                                    <button
                                                        onClick={() => onToggleLocation(child as ILocation, false)}
                                                        className="ml-1.5 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                                    >
                                                        <XMarkIcon className="h-2.5 w-2.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </details>
            </aside>

            {/* Main Selection Area */}
            <main className="flex-1 order-2 lg:order-1 min-w-0">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
                    <SearchBar search={search} setSearch={setSearch} placeholder="Filter locations…" />
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            onClick={() => onBulkToggle(allFilteredLocationIds)}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs shadow-sm shadow-indigo-600/10 transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => onBulkToggle([])}
                            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-xs transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Main Interactive Tree Wrapper */}
                <ul className="space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredTree.length === 0 ? (
                            <motion.li
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm italic bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800"
                            >
                                {search.trim() !== '' ? 'No locations found matching your search.' : 'No locations available to display.'}
                            </motion.li>
                        ) : (
                            filteredTree.map(node => renderLocationNode(node))
                        )}
                    </AnimatePresence>
                </ul>

                {/* {onApply && (
                    <div className="mt-6 text-right">
                        <button
                            onClick={onApply}
                            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all duration-150 text-sm"
                        >
                            Apply Selection
                        </button>
                    </div>
                )} */}
            </main>
        </div>
    );
}