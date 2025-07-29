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
import { SelectedLocation, Location } from "@/types/typings";

type Props = {
    availableLocations: Location[];
    // FIX: Change selectedLocations type to SelectedLocation[]
    selectedLocations: SelectedLocation[];
    onToggleLocation: (location: Location, isSelected: boolean) => void;
    onBulkToggle: (locationIds: string[]) => void;
    onApply?: () => void; // Optional, if you have an "Apply" button outside
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

// Helper to build the location tree (copied from your admin page)
const buildLocationTree = (locations: Location[]): Location[] => {
    const locationMap: { [key: string]: Location } = {};
    const tree: Location[] = [];

    locations.forEach(location => {
        locationMap[location.id] = { ...location, children: [] };
    });

    locations.forEach(location => {
        if (location.parentId && locationMap[location.parentId]) {
            locationMap[location.parentId].children?.push(locationMap[location.id]);
            // Sort children for consistent display
            locationMap[location.parentId].children?.sort((a, b) => a.name.localeCompare(b.name));
        } else {
            tree.push(locationMap[location.id]);
        }
    });
    // Sort top-level nodes
    tree.sort((a, b) => a.name.localeCompare(b.name));
    return tree;
};


export default function LocationSelectionAccordion({
    availableLocations,
    selectedLocations, // Now correctly typed as SelectedLocation[]
    onToggleLocation,
    onBulkToggle,
    onApply,
}: Props) {
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    // Build the tree structure from the flat list of available locations
    const locationTree = useMemo(() => buildLocationTree(availableLocations), [availableLocations]);

    // Filter the tree based on search query
    const filteredTree = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return locationTree;

        const filterNodes = (nodes: Location[]): Location[] => {
            return nodes.reduce((acc: Location[], node) => {
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

    // Create a map for quick lookup of selected locations
    const selectedMap = useMemo(() => {
        const map = new Set<string>();
        // FIX: Change populateMap parameter type to SelectedLocation[]
        const populateMap = (locations: SelectedLocation[]) => {
            locations &&locations.forEach(loc => {
                map.add(loc.id);
                if (loc.children) {
                    populateMap(loc.children);
                }
            });
        };
        populateMap(selectedLocations);
        return map;
    }, [selectedLocations]);

    // Get all IDs from the filtered tree for "Select All" functionality
    const allFilteredLocationIds = useMemo(() => {
        const ids: string[] = [];
        const collectIds = (nodes: Location[]) => {
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

    // Auto-expand nodes that match the search query or have selected children
    useEffect(() => {
        if (search.trim()) {
            const newExpanded = new Set<string>();
            const expandMatchingParents = (nodes: Location[]) => {
                nodes.forEach(node => {
                    const matches = node.name.toLowerCase().includes(search.toLowerCase()) ||
                                    (node.city && node.city.toLowerCase().includes(search.toLowerCase())) ||
                                    (node.country && node.country.toLowerCase().includes(search.toLowerCase())) ||
                                    node.slug.toLowerCase().includes(search.toLowerCase());

                    const hasSelectedChildren = node.children?.some(child => selectedMap.has(child.id));

                    if (matches || hasSelectedChildren) {
                        newExpanded.add(node.id);
                        if (node.parentId) {
                             // Also expand ancestors if they are part of the availableLocations
                             let currentParentId = node.parentId;
                             while(currentParentId) {
                                 newExpanded.add(currentParentId);
                                 const parentNode = availableLocations.find(loc => loc.id === currentParentId);
                                 currentParentId = parentNode?.parentId || ""; // Changed to null for safety
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
            // Collapse all when search is cleared, or manage initial expansion
            setExpanded(new Set());
        }
    }, [search, filteredTree, selectedMap, availableLocations]); // Depend on availableLocations to trace parent chain


    const renderLocationNode = (node: Location, level: number = 0) => {
        const isSelected = selectedMap.has(node.id);
        const isOpen = expanded.has(node.id) || search.trim() !== ''; // Always open if searching
        const hasChildren = node.children && node.children.length > 0;

        const getIcon = (lvl: number) => {
            if (lvl === 0) return <GlobeAltIcon className='w-5 h-5 text-blue-500' />; // Continent/Country
            if (lvl === 1) return <MapIcon className="w-5 h-5 text-green-500" />; // State/City
            return <BuildingLibraryIcon className="w-5 h-5 text-purple-500" />; // Specific building/venue
        };

        // Check if any child is selected (for partial state)
        const hasSelectedChild = hasChildren && node.children?.some(child => selectedMap.has(child.id));

        return (
            <motion.li
                key={node.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-lg shadow hover:shadow-md overflow-hidden"
            >
                <div
                    // Only allow accordion toggle if there are children
                    onClick={() => hasChildren && toggleExpand(node.id)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors
                        ${isOpen ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-gray-50'}`}
                    style={{ paddingLeft: `${16 + level * 20}px` }} // Indentation for tree view
                >
                    <div className="flex items-center gap-2 flex-grow">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation(); // Prevent accordion from toggling
                                onToggleLocation(node, !isSelected);
                            }}
                            className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                        />
                        {getIcon(level)}
                        <span className="font-medium text-gray-900">{node.name}</span>
                        {node.city && <span className="text-sm text-gray-500 hidden sm:inline-block">({node.city})</span>}
                        {node.country && <span className="text-sm text-gray-500 hidden md:inline-block">[{node.country}]</span>}
                        {hasSelectedChild && !isSelected && (
                             <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                                Partial
                            </span>
                        )}
                    </div>
                    {hasChildren && (
                        <ChevronDownIcon
                            className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? '-rotate-180' : ''}`}
                        />
                    )}
                </div>

                <AnimatePresence>
                    {isOpen && hasChildren && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <ul className="space-y-1 py-1">
                                {node.children?.map(child => renderLocationNode(child, level + 1))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.li>
        );
    };

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* Selected Locations Pane */}
            <aside className="w-full lg:w-1/3 sticky lg:top-4"> {/* Adjusted sticky top */}
                <details className="lg:open">
                    <summary className="cursor-pointer text-lg font-semibold mb-4 lg:mb-0">
                        Your Selected Locations
                    </summary>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto mt-4 p-2 bg-gray-50 rounded-lg border border-gray-100">
                        {selectedLocations.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No locations selected yet.</p>
                        ) : (
                            // Iterate through selectedLocations which is now SelectedLocation[]
                            selectedLocations.map(parent => (
                                <div key={parent.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="h-7 w-7 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full text-sm font-medium">
                                            {parent.name[0]}
                                        </span>
                                        <span className="font-medium text-gray-800">{parent.name}</span>
                                        <button
                                            // Cast parent to Location for onToggleLocation, as it expects Location type
                                            onClick={() => onToggleLocation(parent as Location, false)}
                                            className="ml-auto p-1 text-gray-500 hover:text-red-500 focus:outline-none rounded-full hover:bg-red-50"
                                            aria-label={`Remove ${parent.name}`}
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {parent.children && parent.children.length > 0 && (
                                        <div className="pl-4 border-l border-gray-200 mt-2 space-y-1">
                                            {parent.children.map(child => (
                                                <div
                                                    key={child.id}
                                                    className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs"
                                                >
                                                    {child.name}
                                                    <button
                                                        // Cast child to Location for onToggleLocation
                                                        onClick={() => onToggleLocation(child as Location, false)}
                                                        className="ml-1 focus:outline-none text-indigo-500 hover:text-indigo-700"
                                                    >
                                                        <XMarkIcon className="h-3 w-3" />
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

            {/* Location List Panel */}
            <main className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:justify-between items-stretch md:items-center gap-3 mb-6">
                    <SearchBar search={search} setSearch={setSearch} placeholder="Filter locations…" />
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onBulkToggle(allFilteredLocationIds)}
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

                {/* Location Accordion Tree */}
                <ul className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filteredTree.length === 0 && search.trim() !== '' ? (
                            <motion.li
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-8 text-gray-500 italic"
                            >
                                No locations found matching your search.
                            </motion.li>
                        ) : filteredTree.length === 0 && search.trim() === '' ? (
                            <motion.li
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-8 text-gray-500 italic"
                            >
                                No locations available to display.
                            </motion.li>
                        ) : (
                            filteredTree.map(node => renderLocationNode(node))
                        )}
                    </AnimatePresence>
                </ul>

                {onApply && (
                    <div className="mt-8 text-right">
                        <button
                            onClick={onApply}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
                        >
                            Apply Selection
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
