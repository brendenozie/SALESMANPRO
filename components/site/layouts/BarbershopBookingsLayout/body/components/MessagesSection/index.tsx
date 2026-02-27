'use client';

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
    InformationCircleIcon,
    ShieldCheckIcon,
    ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';

// --- ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

// --- PREMIUM BOOKING FORM ---
const BookingForm = ({ service, primaryColor }: { service: MarketListingForm, primaryColor: string }) => {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!date || !timeSlot) {
            setError("Selection required: Please choose a date and time.");
            return;
        }
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Date</label>
                    <div className="relative group">
                        <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-offset-2 transition-all outline-none text-sm font-medium"
                            style={{ ['--tw-ring-color' as any]: primaryColor }}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Time</label>
                    <div className="relative group">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="time"
                            required
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-offset-2 transition-all outline-none text-sm font-medium"
                            style={{ ['--tw-ring-color' as any]: primaryColor }}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 p-4 bg-red-50 text-red-600 text-xs font-semibold rounded-2xl border border-red-100"
                    >
                        <InformationCircleIcon className="w-4 h-4 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="submit"
                disabled={!service.isAvailable || loading}
                className="w-full py-5 rounded-2xl text-white font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 shadow-2xl shadow-emerald-900/10"
                style={{ backgroundColor: primaryColor }}
            >
                {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <span>Confirm Reservation</span>
                        <ArrowRightIcon className="w-5 h-5" />
                    </>
                )}
            </button>
            <p className="text-center text-[10px] text-gray-400 font-medium">Secure checkout powered by Stripe encrypted systems.</p>
        </form>
    );
};

export default function ServicesSection({ marketplaceListings, themeSettings }: any) {
    const primaryColor = themeSettings?.primaryColor || '#059669';
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MarketListingForm | null>(null);

    const filteredListings = useMemo(() => {
        return (marketplaceListings || []).filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase())
        );
    }, [marketplaceListings, search]);

    return (
        <section id="services" className="relative bg-[#FFFFFF] py-24 lg:py-32 overflow-hidden">
            {/* Minimalist Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
            
            <div className="max-w-7xl mx-auto px-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-10">
                    <div className="max-w-xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6"
                        >
                            <SparklesIcon className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 font-bold uppercase tracking-widest text-[10px]">Curated Experiences</span>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.9]"
                        >
                            Our <span className="text-gray-400 italic font-serif">Services.</span>
                        </motion.h2>
                    </div>

                    <div className="relative group w-full lg:w-96">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="Search our catalog..."
                            className="w-full pl-14 pr-12 py-5 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-emerald-500/20 shadow-sm text-gray-800 transition-all placeholder:text-gray-400 font-medium"
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredListings.map((item: any) => (
                            <motion.div
                                key={item.id}
                                layout
                                variants={itemVariants}
                                onClick={() => setSelected(item)}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-[16/11] rounded-[2.5rem] overflow-hidden mb-6 bg-gray-100">
                                    <Image
                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2835&auto=format&fit=crop'}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        loader={({ src }) => src}
                                    />
                                    
                                    {/* Availability Badge */}
                                    <div className="absolute top-5 right-5">
                                        <div className={`px-4 py-2 rounded-2xl backdrop-blur-xl border text-[10px] font-bold uppercase tracking-widest ${
                                            item.isAvailable ? 'bg-white/80 border-white/50 text-emerald-900' : 'bg-red-500/80 border-red-400 text-white'
                                        }`}>
                                            {item.isAvailable ? 'Available' : 'Booked'}
                                        </div>
                                    </div>

                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <div className="bg-white p-4 rounded-full scale-50 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                                            <ArrowUpRightIcon className="w-6 h-6 text-black" />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{item.name}</h3>
                                        <p className="text-xl font-black text-gray-900">
                                            <span className="text-[10px] text-gray-400 mr-1">KES</span>
                                            {item.finalPrice?.toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="text-gray-500 text-sm line-clamp-2 font-medium leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* --- MODAL --- */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelected(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                        />
                        
                        <motion.div 
                            layoutId={`card-${selected.id}`}
                            className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-3xl flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto lg:overflow-visible"
                        >
                            {/* Left: Sticky Image Gallery Feel */}
                            <div className="lg:w-1/2 relative min-h-[300px] lg:h-auto">
                                <Image 
                                    src={selected.images?.[0] || ''} 
                                    alt={selected.name} 
                                    fill 
                                    className="object-cover" 
                                    loader={({ src }) => src}
                                />
                                <button 
                                    onClick={() => setSelected(null)}
                                    className="absolute top-8 left-8 p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                                
                                <div className="absolute bottom-8 left-8 flex items-center gap-3">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white flex items-center gap-2">
                                        <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Verified Listing</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Modern Checkout Experience */}
                            <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col bg-white">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                        <div className="h-px w-8 bg-emerald-200" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exclusive Service</span>
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-4">{selected.name}</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        {selected.description}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Investment</span>
                                        <span className="text-3xl font-black text-gray-900">
                                            <span className="text-sm font-medium text-emerald-500 mr-2">KES</span>
                                            {selected.finalPrice?.toLocaleString()}
                                        </span>
                                    </div>
                                    
                                    <BookingForm service={selected} primaryColor={primaryColor} />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}