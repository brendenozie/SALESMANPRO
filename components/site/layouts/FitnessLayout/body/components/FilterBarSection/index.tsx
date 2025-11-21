"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDownIcon, 
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon, 
    MapPinIcon, 
    TrophyIcon, 
    BoltIcon,
    XMarkIcon 
} from '@heroicons/react/24/solid';

// --- Types ---
interface FilterOption {
    id: string;
    name: string; // Unified displayName and name for simplicity
}


// Placeholder data and types for a hypothetical fitness store
interface FitnessFilters {
    searchTerm?: string;
    program?: string;
    location?: string;
    goal?: string;
}

interface IStoreCategory {
    id: string;
    displayName: string;
}

interface ILocation {
    name: string;
    id: string;
}

interface IGoal {
    name: string;
    id: string;
}

interface StoreForm {
    heroSlides?: any;
    programTypes?: IStoreCategory[];
    locations?: ILocation[];
    goals?: IGoal[];
}

interface Props {
    storeFormData?: StoreForm;
    onSearch: (filters: FitnessFilters) => void;
}

const defaultStoreFormData: StoreForm = {
    programTypes: [
        { id: "yoga", displayName: "Yoga" },
        { id: "pilates", displayName: "Pilates" },
        { id: "crossfit", displayName: "CrossFit" },
        { id: "weightlifting", displayName: "Weightlifting" },
        { id: "cardio", displayName: "Cardio" },
        { id: "nutrition", displayName: "Nutrition Coaching" },
    ],
    locations: [
        { id: "nyc", name: "New York" },
        { id: "la", name: "Los Angeles" },
        { id: "chicago", name: "Chicago" },
        { id: "online", name: "Online Classes" },
    ],
    goals: [
        { id: "weight-loss", name: "Weight Loss" },
        { id: "muscle-gain", name: "Muscle Gain" },
        { id: "flexibility", name: "Flexibility" },
        { id: "stress-reduction", name: "Stress Reduction" },
        { id: "wellness", name: "Overall Wellness" },
    ],
};

interface FitnessFilters {
    searchTerm?: string;
    program?: string;
    location?: string;
    goal?: string;
}

interface Props {
    storeFormData?: StoreForm;
    onSearch: (filters: FitnessFilters) => void;
}

// --- Default Data ---
// const defaultData: StoreForm = {
//     programTypes: [
//         { id: "yoga", name: "Yoga Flow" },
//         { id: "pilates", name: "Power Pilates" },
//         { id: "crossfit", name: "CrossFit" },
//         { id: "hiit", name: "HIIT Cardio" },
//     ],
//     locations: [
//         { id: "nyc", name: "New York, NY" },
//         { id: "la", name: "Los Angeles, CA" },
//         { id: "online", name: "Virtual / Online" },
//     ],
//     goals: [
//         { id: "weight-loss", name: "Burn Fat" },
//         { id: "muscle", name: "Build Muscle" },
//         { id: "endurance", name: "Endurance" },
//     ],
// };

// --- Animations ---
const menuVariants = {
    closed: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } },
    open: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

export default function EngagingFilterBar({ storeFormData = defaultStoreFormData, onSearch }: Props) {
    const [filters, setFilters] = useState<FitnessFilters>({});
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [resultCount, setResultCount] = useState(124);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Consolidate props
    const programTypes = storeFormData.programTypes || defaultStoreFormData.programTypes;
    const locations = storeFormData.locations || defaultStoreFormData.locations;
    const goals = storeFormData.goals || defaultStoreFormData.goals;

    // Handle Click Outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Simulate result count changing based on filters
    useEffect(() => {
        // Simulating a backend fetch delay for realism
        const timeout = setTimeout(() => {
            const base = 124;
            const reduction = Object.keys(filters).length * 30;
            setResultCount(Math.max(4, base - reduction + Math.floor(Math.random() * 10)));
        }, 300);
        return () => clearTimeout(timeout);
    }, [filters]);

    const handleFilterChange = (key: keyof FitnessFilters, value: string) => {
        const newVal = filters[key] === value ? undefined : value; // Toggle logic
        const newFilters = { ...filters, [key]: newVal };
        
        // Remove undefined keys
        if (!newVal) delete newFilters[key];
        
        setFilters(newFilters);
        onSearch(newFilters);
        setActiveDropdown(null); // Close dropdown on selection
    };

    const categories = [
        { key: 'program', label: 'Program', icon: BoltIcon, options: programTypes, color: 'text-blue-400' },
        { key: 'location', label: 'Location', icon: MapPinIcon, options: locations, color: 'text-emerald-400' },
        { key: 'goal', label: 'Goal', icon: TrophyIcon, options: goals, color: 'text-orange-400' },
    ];

    const activeCount = Object.keys(filters).filter(k => k !== 'searchTerm').length;
    const getOptionLabel = (opt: any) => opt?.displayName ?? opt?.name ?? opt?.id ?? '';

    return (
        <div className="w-full sticky top-2 z-50 px-2 sm:px-6">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mx-auto max-w-6xl bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl overflow-visible relative"
                ref={dropdownRef}
            >
                {/* --- Decorative Gradient Top Line --- */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70" />

                <div className="p-3 sm:p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
                    
                    {/* 1. Search Area */}
                    <div className="relative w-full lg:w-[35%] group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Find your workout..."
                            value={filters.searchTerm || ''}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                            className="block w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-slate-800 transition-all"
                        />
                    </div>

                    {/* 2. Filter Pills (Horizontal Scroll on Mobile) */}
                    <div className="w-full flex-1 flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 sm:pb-0 mask-linear-fade">
                        {categories.map((cat) => {
                            const isActive = !!filters[cat.key as keyof FitnessFilters];
                            const selectedOption = cat.options?.find((o: any) => o.id === filters[cat.key as keyof FitnessFilters]);

                            return (
                                <div key={cat.key} className="relative shrink-0">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveDropdown(activeDropdown === cat.key ? null : cat.key)}
                                        className={`
                                            flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300
                                            ${isActive 
                                                ? 'bg-slate-800 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                                                : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                                            }
                                        `}
                                    >
                                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                        <span>{selectedOption ? getOptionLabel(selectedOption) : cat.label}</span>
                                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${activeDropdown === cat.key ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {activeDropdown === cat.key && (
                                            <motion.div
                                                variants={menuVariants}
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                className="absolute top-[120%] left-0 z-50 w-56 p-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    {cat.options?.map((opt: any) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => handleFilterChange(cat.key as keyof FitnessFilters, opt.id)}
                                                            className={`
                                                                text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group
                                                                ${filters[cat.key as keyof FitnessFilters] === opt.id 
                                                                    ? 'bg-purple-500/20 text-purple-200' 
                                                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                                                }
                                                            `}
                                                        >
                                                            {opt.name}
                                                            {filters[cat.key as keyof FitnessFilters] === opt.id && (
                                                                <motion.div layoutId="check" className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                        
                        {/* Divider */}
                        {activeCount > 0 && <div className="h-8 w-[1px] bg-slate-700 mx-1" />}

                        {/* Clear Button */}
                        <AnimatePresence>
                            {activeCount > 0 && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={() => { setFilters({}); onSearch({}); }}
                                    className="shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                    Reset
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* 3. Results Indicator */}
                    <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-700">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Matches</span>
                            <motion.span 
                                key={resultCount}
                                initial={{ scale: 1.5, color: '#a855f7' }}
                                animate={{ scale: 1, color: '#f8fafc' }}
                                className="text-xl font-bold leading-none font-mono"
                            >
                                {resultCount}
                            </motion.span>
                        </div>
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <AdjustmentsHorizontalIcon className="h-5 w-5 text-purple-400" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Mobile Results floating pill (Visible only on small screens) */}
            <motion.div 
                className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-5 py-2 rounded-full shadow-lg shadow-purple-500/40 flex items-center gap-2 z-40 font-semibold text-sm"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
            >
                <BoltIcon className="h-4 w-4" />
                {resultCount} Programs Found
            </motion.div>
        </div>
    );
}