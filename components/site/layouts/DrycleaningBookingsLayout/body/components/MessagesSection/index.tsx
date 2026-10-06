"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";
import { 
    XMarkIcon, 
    MagnifyingGlassIcon, 
    CalendarDaysIcon, 
    ClockIcon, 
    ArrowRightIcon,
    SparklesIcon,
    ShieldCheckIcon,
    CheckBadgeIcon,
    InboxStackIcon
} from '@heroicons/react/24/outline';

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } 
    }
};

const BookingForm = ({ service }: { service: any }) => {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const params = new URLSearchParams({
            listingId: String(service.id),
            name: service.name ?? "",
            price: String(service.finalPrice ?? service.sellingPrice ?? 0),
            date,
            timeSlot,
        });
        router.push(`/bookings/checkout?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pickup Date</label>
                    <div className="relative">
                        <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-teal-500 rounded-2xl transition-all outline-none text-sm text-slate-900 dark:text-white appearance-none"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preferred Window</label>
                    <div className="relative">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-600" />
                        <input
                            type="time"
                            required
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full pl-11 pr-5 py-4 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-teal-500 rounded-2xl transition-all outline-none text-sm text-slate-900 dark:text-white appearance-none"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden py-5 bg-teal-600 rounded-2xl text-white font-bold uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] shadow-xl shadow-teal-600/20"
            >
                <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? "Scheduling..." : "Schedule Pickup"}
                    {!loading && <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
            </button>
        </form>
    );
};

export default function ServicesSection({ marketplaceListings, name }: any) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<any | null>(null);

    const filteredListings = useMemo(() => {
        return (marketplaceListings || []).filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [marketplaceListings, search]);

    return (
        <section id="services" className="relative bg-slate-50 dark:bg-[#080a0c] py-24 lg:py-40 transition-colors duration-700 overflow-hidden">
            {/* Soft Ambient Glows */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-teal-400/5 blur-[120px] rounded-full -translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="h-[2px] w-8 bg-teal-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600 dark:text-teal-400">The Collection</span>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-bold tracking-tight leading-[0.9] text-slate-900 dark:text-white"
                        >
                            IMPECCABLE <br />
                            <span className="font-serif italic font-light text-teal-500">Solutions.</span>
                        </motion.h2>
                    </div>

                    <div className="relative w-full lg:w-96 group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="What can we clean for you?"
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-5 pl-12 pr-6 focus:border-teal-500 outline-none text-sm transition-all shadow-sm dark:shadow-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- GRID --- */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                    {filteredListings.map((item: any) => (
                        <motion.div
                            key={item.id}
                            variants={cardVariants}
                            onClick={() => setSelected(item)}
                            className="group cursor-pointer bg-white dark:bg-[#111]/40 rounded-[2rem] border border-slate-200 dark:border-white/5 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2"
                        >
                            <div className="relative aspect-square overflow-hidden rounded-[1.5rem] mb-6">
                                <Image decoding="async"
                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1545173153-936277f9f80a?q=80&w=2070'}
                                    alt={item.name}
                                    fill
                                    className="object-cover transition-all duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="absolute top-4 right-4">
                                    <div className="bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                        <p className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest">${item.finalPrice}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-4 pb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <SparklesIcon className="w-4 h-4 text-teal-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Premium Care</span>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{item.name}</h3>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.duration || '24H TURNAROUND'}</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-600 transition-colors">
                                        <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* --- CLEAN DRAWER --- */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelected(null)}
                            className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm" 
                        />
                        
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="relative w-full max-w-xl h-screen bg-white dark:bg-[#0A0A0A] border-l border-slate-200 dark:border-zinc-800 flex flex-col shadow-2xl"
                        >
                            <div className="relative h-2/5 w-full">
                                <Image decoding="async" 
                                    src={selected.images?.[0] || ''} 
                                    alt={selected.name} 
                                    fill 
                                    className="object-cover"
                                />
                                <button 
                                    onClick={() => setSelected(null)}
                                    className="absolute top-8 right-8 p-3 bg-white/90 dark:bg-black/50 text-slate-900 dark:text-white hover:bg-teal-600 hover:text-white transition-all rounded-full shadow-lg"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0A0A0A] to-transparent" />
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckBadgeIcon className="w-5 h-5 text-teal-600" />
                                    <span className="text-xs font-black text-teal-600 uppercase tracking-[0.2em]">Quality Guaranteed</span>
                                </div>
                                <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">{selected.name}</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-10">
                                    {selected.description || "Our professional treatment ensures your garment is returned in pristine condition, using only eco-friendly solvents and artisanal pressing techniques."}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Service Fee</span>
                                        <span className="text-3xl font-serif italic text-teal-600 dark:text-teal-400">${selected.finalPrice}</span>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Estimated Prep</span>
                                        <span className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{selected.duration || '24 HOURS'}</span>
                                    </div>
                                </div>

                                <BookingForm service={selected} />

                                <div className="mt-12 flex items-start gap-4 p-6 rounded-2xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-900/20">
                                    <InboxStackIcon className="w-6 h-6 text-teal-600 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-400">Garment Safety Protocol</p>
                                        <p className="text-[11px] text-teal-600/70 dark:text-teal-400/60 mt-1 font-medium leading-relaxed">
                                            Your clothes are insured up to 10x the service value. We handle every stitch with absolute care.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}