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
} from '@heroicons/react/24/outline'; // Using outline for the elite look

interface FitnessFilters {
    searchTerm?: string;
    program?: string;
    location?: string;
    goal?: string;
}

interface Props {
    storeFormData: any;
    onSearch: (filters: FitnessFilters) => void;
}

const menuVariants = {
    closed: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    open: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
};

export default function EngagingFilterBar({ storeFormData, onSearch }: Props) {
    const [filters, setFilters] = useState<FitnessFilters>({});
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [resultCount, setResultCount] = useState(124);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // --- Data Mapping from storeFormData ---
    const programTypes = storeFormData?.programTypes || [];
    const locations = storeFormData?.locations || [];
    const goals = storeFormData?.goals || [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFilterChange = (key: keyof FitnessFilters, value: string) => {
        const newVal = filters[key] === value ? undefined : value;
        const newFilters = { ...filters, [key]: newVal };
        if (!newVal) delete newFilters[key];
        
        setFilters(newFilters);
        onSearch(newFilters);
        setActiveDropdown(null);
    };

    const categories = [
        { key: 'program', label: 'MODALITY', icon: BoltIcon, options: programTypes },
        { key: 'location', label: 'SECTOR', icon: MapPinIcon, options: locations },
        { key: 'goal', label: 'OBJECTIVE', icon: TrophyIcon, options: goals },
    ];

    const activeCount = Object.keys(filters).filter(k => k !== 'searchTerm').length;

    return (
        <div className="w-full sticky top-4 z-50 px-4 md:px-10">
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mx-auto max-w-7xl bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible relative"
                ref={dropdownRef}
            >
                {/* Tactical Top Accent */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                <div className="flex flex-col lg:flex-row items-stretch">
                    
                    {/* 1. Search Terminal */}
                    <div className="relative lg:w-[30%] border-r border-white/5 group">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-orange-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH PROTOCOLS..."
                            value={filters.searchTerm || ''}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                            className="w-full pl-14 pr-6 py-6 bg-transparent text-white placeholder:text-gray-700 text-[10px] font-black tracking-[0.3em] uppercase focus:outline-none focus:bg-white/[0.02] transition-all"
                        />
                    </div>

                    {/* 2. Tactical Filters */}
                    <div className="flex-1 flex items-center overflow-x-auto no-scrollbar bg-white/[0.01]">
                        {categories.map((cat) => {
                            const selectedId = filters[cat.key as keyof FitnessFilters];
                            const selectedOption = cat.options?.find((o: any) => o.id === selectedId);

                            return (
                                <div key={cat.key} className="relative h-full border-r border-white/5 flex-1 min-w-[160px]">
                                    <button
                                        onClick={() => setActiveDropdown(activeDropdown === cat.key ? null : cat.key)}
                                        className={`w-full h-full flex items-center justify-between px-6 py-6 transition-all duration-300 group
                                            ${selectedId ? 'bg-orange-500 text-black' : 'hover:bg-white/5 text-gray-500'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <cat.icon className={`h-4 w-4 ${selectedId ? 'text-black' : 'text-orange-500'}`} />
                                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase`}>
                                                {selectedOption ? (selectedOption.displayName || selectedOption.name) : cat.label}
                                            </span>
                                        </div>
                                        <ChevronDownIcon className={`h-3 w-3 transition-transform ${activeDropdown === cat.key ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {activeDropdown === cat.key && (
                                            <motion.div
                                                variants={menuVariants}
                                                initial="closed"
                                                animate="open"
                                                exit="closed"
                                                className="absolute top-full left-[-1px] right-[-1px] z-50 bg-[#0F0F0F] border border-white/10 shadow-2xl"
                                            >
                                                <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
                                                    {cat.options?.map((opt: any) => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => handleFilterChange(cat.key as keyof FitnessFilters, opt.id)}
                                                            className={`text-left px-6 py-4 text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-between
                                                                ${selectedId === opt.id 
                                                                    ? 'bg-orange-500 text-black' 
                                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                                        >
                                                            {opt.displayName || opt.name}
                                                            {selectedId === opt.id && <div className="h-1 w-1 bg-black rounded-full" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* 3. Global Status / Matches */}
                    <div className="hidden lg:flex items-center gap-6 px-10 bg-white/[0.02]">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">Live Matches</p>
                            <div className="flex items-baseline gap-1">
                                <motion.span 
                                    key={resultCount}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-2xl font-black text-white italic leading-none"
                                >
                                    {resultCount}
                                </motion.span>
                                <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                            </div>
                        </div>
                        
                        {activeCount > 0 && (
                            <button 
                                onClick={() => { setFilters({}); onSearch({}); }}
                                className="p-2 border border-orange-500/20 hover:bg-orange-500/10 transition-colors group"
                                title="Reset System"
                            >
                                <XMarkIcon className="h-4 w-4 text-orange-500" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}