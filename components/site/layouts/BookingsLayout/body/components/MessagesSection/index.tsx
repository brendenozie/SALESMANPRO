'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation"; // Added for routing
import { useStoreContext } from '@/contexts/StoreContext';
import { XMarkIcon, MagnifyingGlassIcon, TagIcon, CalendarDaysIcon, ClockIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';

// --- UPDATED FUNCTIONAL BOOKING FORM ---
const BookingForm = ({ service }: { service: MarketListingForm }) => {
    const router = useRouter();
    const [date, setDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!date || !timeSlot) {
            setError("Please select both a preferred date and time.");
            return;
        }

        setLoading(true);

        // Build the query string based on your logic
        const query: Record<string, string> = {
            listingId: String(service.id),
            name: service.name ?? "",
            price: service.finalPrice !== undefined ? String(service.finalPrice) : String(service.sellingPrice ?? 0),
            date,
            timeSlot,
        };
        const params = new URLSearchParams(query);

        // Navigate to checkout
        router.push(`/bookings/checkout?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-xl flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">Finalize Booking</h3>
                <p className="text-sm text-gray-500 mt-1">Select a time to reserve this service.</p>
            </div>

            <div className="space-y-4 flex-grow">
                {/* Date Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Date
                    </label>
                    <div className="relative">
                        <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                        />
                    </div>
                </div>

                {/* Time Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Time
                    </label>
                    <div className="relative">
                        <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="time"
                            required
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                        />
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="mt-8">
                <button
                    type="submit"
                    disabled={!service.isAvailable || loading}
                    className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center
                    ${!service.isAvailable 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-1'
                    }`}
                >
                    {loading ? (
                         <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                         </span>
                    ) : !service.isAvailable ? (
                        'Temporarily Unavailable'
                    ) : (
                        `Book for KES ${service.finalPrice?.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`
                    )}
                </button>
            </div>
        </form>
    );
};


const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

interface ServicesSectionProps {
    marketplaceListings?: MarketListingForm[] | null;
    slug?: string;
    themeSettings?: {
        primaryColor?: string;
    } | null;
}

export default function ServicesSection({ marketplaceListings, slug, themeSettings }: ServicesSectionProps) {
    // --- Data Initialization and State ---
    const sampleData = {
        marketplaceListings: [
            {
                id: "1",
                name: "Premium Haircut & Styling",
                description: "Experience a top-tier haircut with our master stylists, including a relaxing wash and a personalized styling session to perfect your look.",
                images: ["https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 7500.00,
                isAvailable: true
            },
            {
                id: "2",
                name: "Full Body Deep Tissue Massage",
                description: "Melt away stress and tension with our deep tissue massage. Our therapists use firm pressure to target deeper layers of muscle and fascia.",
                images: ["https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 12000.00,
                isAvailable: true
            },
            {
                id: "3",
                name: "Home Electrical Inspection",
                description: "A comprehensive safety inspection of your home's electrical system, performed by certified and insured electricians. Ensure peace of mind and compliance.",
                images: ["https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 15000.00,
                isAvailable: true
            },
            {
                id: "4",
                name: "Wedding Makeup & Hair",
                description: "Look and feel absolutely stunning on your big day with our professional wedding makeup and hair services. Includes a consultation and trial run.",
                images: ["https://images.unsplash.com/photo-1519396349547-681615d681c6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 25000.00,
                isAvailable: false
            },
            {
                id: "5",
                name: "Residential Plumbing Repair",
                description: "Professional plumbing services for all your home needs, from fixing leaky faucets to major pipe repairs. Fast, reliable, and guaranteed service.",
                images: ["https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 9000.00,
                isAvailable: true
            },
            {
                id: "6",
                name: "Lawn Mowing & Gardening",
                description: "Keep your lawn looking pristine with our weekly mowing and gardening services. Includes trimming, edging, and responsible waste removal.",
                images: ["https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 6000.00,
                isAvailable: true
            }
        ],
        themeSettings: {
            primaryColor: '#059669' // Emerald 600
        },
        slug: 'default-service-slug'
    } as any;

    const listings = marketplaceListings || sampleData.marketplaceListings;
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MarketListingForm | null>(null);

    const primaryColor = themeSettings?.primaryColor || '#059669';

    // Filter logic
    const filteredListings = listings.filter((item: MarketListingForm) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    // Staggered animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    return (
        <section id="services" className="relative bg-white py-24 overflow-hidden text-gray-900">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">

                {/* 🎨 HEADER, TITLE, AND SEARCH BAR */}
                <div className="text-center mb-16">
                    <motion.span
                        className="inline-block text-sm font-semibold px-4 py-1.5 rounded-full shadow-md"
                        style={{ backgroundColor: primaryColor + '10', color: primaryColor }}
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                    >
                        Our Offerings
                    </motion.span>

                    <motion.h2
                        className="mt-6 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        Discover Our Signature <span style={{ color: primaryColor }}>Services</span>
                    </motion.h2>

                    <motion.p
                        className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        Browse our carefully curated catalog of services designed to provide exceptional quality and value for all your needs.
                    </motion.p>

                    {/* Search Input with modern styling */}
                    <motion.div
                        className="mt-10 max-w-lg mx-auto relative"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for services or keywords..."
                            className="pl-14 pr-5 py-4 w-full rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-200/50 focus:border-emerald-500 transition-all shadow-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                                aria-label="Clear search"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </motion.div>
                </div>

                {/* 🌟 SERVICES CARDS GRID */}
                {filteredListings.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {(filteredListings as MarketListingForm[]).map((item, i) => (
                            <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    onClick={() => setSelected(item)}
                                    className={`
                                        group relative flex flex-col w-full overflow-hidden
                                        bg-white rounded-[2rem] cursor-pointer
                                        border border-gray-100
                                        transition-all duration-500 ease-out
                                        hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]
                                        ${!item.isAvailable ? 'grayscale-[0.8] opacity-90' : ''}
                                    `}
                                    >
                                    {/* --- Image Section --- */}
                                    <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                                        <Image
                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop'}
                                        loader={loader}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        />
                                        
                                        {/* Gradient Overlay for text contrast if needed, or purely aesthetic */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Modern Floating Status Pill */}
                                        <div className={`
                                        absolute top-4 left-4 px-3 py-1.5 rounded-full
                                        flex items-center gap-1.5 text-xs font-bold tracking-wide shadow-sm backdrop-blur-md
                                        ${item.isAvailable 
                                            ? 'bg-white/90 text-emerald-700 border border-emerald-100' 
                                            : 'bg-white/90 text-red-600 border border-red-100'}
                                        `}>
                                        {item.isAvailable ? (
                                            <><CheckCircleIcon className="w-3.5 h-3.5" /> AVAILABLE</>
                                        ) : (
                                            <><XMarkIcon className="w-3.5 h-3.5" /> BOOKED</>
                                        )}
                                        </div>
                                    </div>

                                    {/* --- Content Section --- */}
                                    <div className="flex flex-col flex-grow p-6 pt-5">
                                        
                                        {/* Header & Price Row */}
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-[color:var(--primary)] transition-colors" style={{ '--primary': primaryColor } as any}>
                                            {item.name}
                                        </h3>
                                        </div>

                                        {/* Price Tag - Large and Clear */}
                                        <div className="mb-4">
                                        <div className="flex items-baseline gap-1" style={{ color: primaryColor }}>
                                            <span className="text-sm font-medium text-gray-400">KES</span>
                                            <span className="text-2xl font-extrabold tracking-tight">
                                            {(item.finalPrice || item.sellingPrice || 0).toLocaleString('en-KE')}
                                            </span>
                                        </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-6 flex-grow">
                                        {item.description || 'Experience premium service quality designed to exceed your expectations.'}
                                        </p>

                                        {/* Interactive Button */}
                                        <div className="mt-auto">
                                        <button
                                            className="relative w-full overflow-hidden rounded-xl p-[1px] group/btn transition-transform active:scale-[0.98]"
                                        >
                                            {/* Button Border Gradient (Optional visual flair) */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 group-hover/btn:from-[color:var(--primary)] group-hover/btn:to-[color:var(--primary)] transition-colors opacity-50" style={{ '--primary': primaryColor } as any} />
                                            
                                            {/* Button Content */}
                                            <div className={`
                                            relative flex items-center justify-center gap-2 w-full px-4 py-3 bg-white rounded-[11px]
                                            text-sm font-bold transition-all duration-300
                                            group-hover/btn:bg-opacity-95
                                            `}
                                            style={{ color: primaryColor }}
                                            >
                                            <span>View Details</span>
                                            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                                            </div>
                                        </button>
                                        </div>
                                    </div>
                                    </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl shadow-inner border border-dashed border-gray-300">
                        <p className="text-2xl font-bold text-gray-600">
                            No services found matching "<span style={{ color: primaryColor }}>{search}</span>"
                        </p>
                        <p className="text-lg text-gray-500 mt-2">Try a broader search term or explore our featured categories.</p>
                    </div>
                )}
            </div>

            {/* 🗓️ BOOKING MODAL */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm"
                            onClick={() => setSelected(null)}
                        />

                        {/* Modal Content */}
                        <motion.div
                            className="relative bg-white rounded-3xl max-w-5xl w-full mx-auto z-50 shadow-2xl p-6 sm:p-10 transform overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 transition-colors z-50 p-2 rounded-full bg-white/70 hover:bg-white shadow-md border border-gray-100"
                                onClick={() => setSelected(null)}
                                aria-label="Close"
                            >
                                <XMarkIcon className="w-7 h-7" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Service Details (Left Side) */}
                                <div className="space-y-6">
                                    <div className="relative w-full h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-xl border border-gray-200">
                                        <Image
                                            src={selected.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                            loader={loader}
                                            alt={selected.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent"></div>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                                        {selected.name}
                                    </h2>
                                    <p className="mt-3 text-lg text-gray-700 leading-relaxed">{selected.description || 'No detailed description available.'}</p>

                                    {/* Price and Availability Bar */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg shadow-inner" style={{ backgroundColor: primaryColor + '10' }}>
                                        <p className="font-bold text-gray-800 text-xl">
                                            Price: <span style={{ color: primaryColor }} className="text-2xl font-extrabold">KES {(selected.finalPrice || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </p>
                                        <span className={`inline-flex items-center gap-1.5 text-lg font-bold mt-2 sm:mt-0 ${selected.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                                            {selected.isAvailable ? 'Available Now' : 'Booked Out'}
                                        </span>
                                    </div>
                                </div>

                                {/* Booking Form (Right Side) */}
                                <div className="flex flex-col space-y-6 pt-0 md:pt-4">
                                    <BookingForm service={selected} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}