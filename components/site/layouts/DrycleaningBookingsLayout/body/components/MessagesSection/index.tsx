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
    ScissorsIcon,
    TicketIcon
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.2 }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
};

const BookingForm = ({ service }: { service: MarketListingForm }) => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Select Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:border-[#C5A267] transition-all outline-none text-sm text-white appearance-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Arrival Time</label>
                    <input
                        type="time"
                        required
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:border-[#C5A267] transition-all outline-none text-sm text-white appearance-none"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={!service.isAvailable || loading}
                className="w-full relative group overflow-hidden py-5 bg-[#C5A267] rounded-xl text-black font-black uppercase tracking-[0.3em] text-[11px] transition-transform active:scale-[0.98]"
            >
                <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? "Processing..." : "Confirm Ritual"}
                    {!loading && <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
            </button>
        </form>
    );
};

export default function ServicesSection({ marketplaceListings }: any) {
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MarketListingForm | null>(null);

    const filteredListings = useMemo(() => {
        return (marketplaceListings || []).filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [marketplaceListings, search]);

    return (
        <section id="services" className="relative bg-[#050505] py-24 lg:py-40 overflow-hidden text-white">
            {/* Dark Mode Background Effects */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#C5A267]/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="h-px w-8 bg-[#C5A267]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C5A267]">The Menu</span>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]"
                        >
                            ELITE <br />
                            <span className="font-serif italic font-light text-zinc-700">Treatments.</span>
                        </motion.h2>
                    </div>

                    <div className="relative w-full lg:w-80 group">
                        <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-[#C5A267] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            className="w-full bg-transparent border-b border-zinc-800 py-4 pl-10 focus:border-[#C5A267] outline-none text-sm transition-all placeholder:text-zinc-700"
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16"
                >
                    {filteredListings.map((item: any) => (
                        <motion.div
                            key={item.id}
                            variants={cardVariants}
                            onClick={() => setSelected(item)}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-8 bg-zinc-900">
                                <Image
                                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070'}
                                    alt={item.name}
                                    fill
                                    className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 scale-[1.02] group-hover:scale-110"
                                    loader={({ src }) => src}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                
                                <div className="absolute bottom-6 left-6 right-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <SparklesIcon className="w-4 h-4 text-[#C5A267]" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C5A267]">Signature Ritual</span>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">{item.name}</h3>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.duration || '45 MIN'}</span>
                                <div className="h-px flex-1 mx-4 bg-zinc-900 group-hover:bg-[#C5A267]/30 transition-colors" />
                                <span className="text-xl font-serif italic">${item.finalPrice}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* --- DARK DRAWER --- */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelected(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                        />
                        
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="relative w-full max-w-xl h-screen bg-[#0A0A0A] border-l border-zinc-800 flex flex-col"
                        >
                            <div className="relative h-1/3 w-full">
                                <Image 
                                    src={selected.images?.[0] || ''} 
                                    alt={selected.name} 
                                    fill 
                                    className="object-cover opacity-40" 
                                    loader={({ src }) => src}
                                />
                                <button 
                                    onClick={() => setSelected(null)}
                                    className="absolute top-8 right-8 p-3 bg-black/50 border border-white/10 text-white hover:bg-[#C5A267] hover:text-black transition-all rounded-full"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto">
                                <h2 className="text-4xl font-black tracking-tighter mb-4">{selected.name}</h2>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-10">
                                    {selected.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-10">
                                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Fee</span>
                                        <span className="text-2xl font-serif italic text-[#C5A267]">${selected.finalPrice}</span>
                                    </div>
                                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30">
                                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mb-1">Duration</span>
                                        <span className="text-xl font-bold uppercase tracking-tight">{selected.duration || '45 MIN'}</span>
                                    </div>
                                </div>

                                <BookingForm service={selected} />

                                <div className="mt-12 flex items-start gap-4 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                    <ShieldCheckIcon className="w-6 h-6 text-[#C5A267] shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Appointment Protection</p>
                                        <p className="text-[9px] text-zinc-500 mt-1 uppercase tracking-wider leading-relaxed">
                                            Reschedule up to 24 hours prior. Secure payments powered by Stripe.
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