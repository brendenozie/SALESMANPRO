'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from "next/navigation";
import { 
    XMarkIcon, 
    MagnifyingGlassIcon, 
    CalendarDaysIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    ArrowRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { MarketListingForm } from '@/types/typings';

// --- PREMIUM FUNCTIONAL BOOKING FORM ---
const BookingForm = ({ service, primaryColor }: { service: MarketListingForm; primaryColor: string }) => {
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

        const query: Record<string, string> = {
            listingId: String(service.id),
            name: service.name ?? "",
            price: service.finalPrice !== undefined ? String(service.finalPrice) : String(service.sellingPrice ?? 0),
            date,
            timeSlot,
        };
        const params = new URLSearchParams(query);

        router.push(`/bookings/checkout?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] flex flex-col h-full relative overflow-hidden">
            {/* Top decorative glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
            
            <div className="mb-6 relative z-10">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    Reserve This Space
                </h3>
                <p className="text-sm text-gray-500 mt-1">Select your preferred window below to secure your booking.</p>
            </div>

            <div className="space-y-5 flex-grow relative z-10">
                {/* Date Input */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Select Appointment Date
                    </label>
                    <div className="relative group">
                        <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--pc)] transition-colors" style={{ '--pc': primaryColor } as any} />
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[color:var(--pc)] rounded-2xl transition-all outline-none text-gray-800 font-medium text-sm"
                            style={{ '--pc': primaryColor } as any}
                        />
                    </div>
                </div>

                {/* Time Input */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Preferred Arrival Time
                    </label>
                    <div className="relative group">
                        <ClockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--pc)] transition-colors" style={{ '--pc': primaryColor } as any} />
                        <input
                            type="time"
                            required
                            value={timeSlot}
                            onChange={(e) => setTimeSlot(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[color:var(--pc)] rounded-2xl transition-all outline-none text-gray-800 font-medium text-sm"
                            style={{ '--pc': primaryColor } as any}
                        />
                    </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3.5 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex items-center gap-2"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Button */}
            <div className="mt-8 relative z-10">
                <button
                    type="submit"
                    disabled={!service.isAvailable || loading}
                    className="w-full py-4 px-6 rounded-2xl text-sm font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center relative overflow-hidden group/btn"
                    style={{ backgroundColor: service.isAvailable && !loading ? primaryColor : '#9ca3af' }}
                >
                    {service.isAvailable && !loading && (
                        <div className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover/btn:animate-shine" />
                    )}
                    
                    {loading ? (
                         <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming Slot...
                         </span>
                    ) : !service.isAvailable ? (
                        'Fully Reserved'
                    ) : (
                        <span className="flex items-center gap-1">
                            Book Session <ArrowRightIcon className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                        </span>
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
    const sampleData = {
        marketplaceListings: [
            {
                id: "1",
                name: "Premium Haircut & Styling",
                description: "Experience a top-tier haircut with our master stylists, including a relaxing wash and a personalized styling session to perfect your look.",
                images: ["https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop"],
                finalPrice: 7500.00,
                isAvailable: true
            },
            {
                id: "2",
                name: "Full Body Deep Tissue Massage",
                description: "Melt away stress and tension with our deep tissue massage. Our therapists use firm pressure to target deeper layers of muscle and fascia.",
                images: ["https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop"],
                finalPrice: 12000.00,
                isAvailable: true
            },
            {
                id: "3",
                name: "Home Electrical Inspection",
                description: "A comprehensive safety inspection of your home's electrical system, performed by certified and insured electricians. Ensure peace of mind and compliance.",
                images: ["https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop"],
                finalPrice: 15000.00,
                isAvailable: true
            },
            {
                id: "4",
                name: "Wedding Makeup & Hair",
                description: "Look and feel absolutely stunning on your big day with our professional wedding makeup and hair services. Includes a consultation and trial run.",
                images: ["https://images.unsplash.com/photo-1519396349547-681615d681c6?q=80&w=2670&auto=format&fit=crop"],
                finalPrice: 25000.00,
                isAvailable: false
            },
            {
                id: "5",
                name: "Residential Plumbing Repair",
                description: "Professional plumbing services for all your home needs, from fixing leaky faucets to major pipe repairs. Fast, reliable, and guaranteed service.",
                images: ["https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop"],
                finalPrice: 9000.00,
                isAvailable: true
            },
            {
                id: "6",
                name: "Lawn Mowing & Gardening",
                description: "Keep your lawn looking pristine with our weekly mowing and gardening services. Includes trimming, edging, and responsible waste removal.",
                images: ["https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop"],
                finalPrice: 6000.00,
                isAvailable: true
            }
        ],
        themeSettings: {
            primaryColor: '#059669'
        },
        slug: 'default-service-slug'
    } as any;

    const listings = marketplaceListings || sampleData.marketplaceListings;
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MarketListingForm | null>(null);

    const primaryColor = themeSettings?.primaryColor || '#059669';

    const filteredListings = listings.filter((item: MarketListingForm) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.08 },
        },
    };

    return (
        <section id="services" className="relative bg-[#fafafa] py-28 overflow-hidden text-gray-900">
            {/* Ambient Background Glow Elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-40 pointer-events-none -translate-y-1/2" style={{ backgroundColor: primaryColor + '20' }} />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-30 pointer-events-none translate-y-1/3" style={{ backgroundColor: primaryColor + '15' }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">

                {/* 🎨 HEADER & SEARCH OVERHAUL */}
                <div className="text-center mb-20">
                    <motion.span
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md border"
                        style={{ backgroundColor: primaryColor + '08', color: primaryColor, borderColor: primaryColor + '20' }}
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        viewport={{ once: true }}
                    >
                        <SparklesIcon className="w-3.5 h-3.5" /> Curated Offerings
                    </motion.span>

                    <motion.h2
                        className="mt-6 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]"
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        Experience Exceptional <span className="relative inline-block"><span className="relative z-10" style={{ color: primaryColor }}>Services</span><span className="absolute bottom-2 left-0 w-full h-3 -rotate-1 opacity-20" style={{ backgroundColor: primaryColor }} /></span>
                    </motion.h2>

                    <motion.p
                        className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        Immerse yourself in precision craftsmanship and bespoke solutions tailored directly around your timeline.
                    </motion.p>

                    {/* Sophisticated Search Wrapper */}
                    <motion.div
                        className="mt-12 max-w-xl mx-auto relative group"
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute -inset-1 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition-all duration-300" style={{ backgroundColor: primaryColor }} />
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--pc)] transition-colors" style={{ '--pc': primaryColor } as any} />
                            <input
                                type="text"
                                placeholder="What service can we help you find today?"
                                className="pl-13 pr-12 py-5 w-full rounded-2xl bg-white border border-gray-200/80 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-opacity-10 focus:border-[color:var(--pc)] transition-all shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)] text-sm font-medium"
                                style={{ '--pc': primaryColor, '--tw-ring-color': primaryColor } as any}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* 🌟 PREMIUM CARDS GRID */}
                {filteredListings.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.05 }}
                    >
                        {(filteredListings as MarketListingForm[]).map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                onClick={() => setSelected(item)}
                                className={`
                                    group relative flex flex-col w-full overflow-hidden
                                    bg-white rounded-[2.25rem] cursor-pointer
                                    border border-gray-100/70
                                    transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                                    hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] hover:-translate-y-1.5
                                    ${!item.isAvailable ? 'opacity-85' : ''}
                                `}
                            >
                                {/* Image Box */}
                                <div className="relative w-full h-60 overflow-hidden bg-gray-50">
                                    <Image
                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop'}
                                        loader={loader}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Floating Status Pill */}
                                    <div className={`
                                        absolute top-4 left-4 px-3 py-1.5 rounded-xl
                                        flex items-center gap-1.5 text-[10px] font-black tracking-widest backdrop-blur-md shadow-sm border
                                        ${item.isAvailable 
                                            ? 'bg-white/90 text-emerald-800 border-emerald-200/40' 
                                            : 'bg-white/90 text-gray-500 border-gray-200/40'}
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                        {item.isAvailable ? 'AVAILABLE' : 'RESERVED'}
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="flex flex-col flex-grow p-7">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-snug group-hover:text-[color:var(--pc)] transition-colors duration-300" style={{ '--pc': primaryColor } as any}>
                                            {item.name}
                                        </h3>
                                    </div>

                                    {/* Inline Clean Description */}
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed line-clamp-2 mb-6 flex-grow">
                                        {item.description || 'Premium custom solutions engineered to deliver exceptional results.'}
                                    </p>

                                    {/* Pricing & Premium Interactive CTA Row */}
                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Investment</span>
                                            <div className="flex items-baseline gap-0.5 text-gray-900">
                                                <span className="text-xs font-bold text-gray-400">KES</span>
                                                <span className="text-xl font-black tracking-tight">
                                                    {(item.finalPrice || item.sellingPrice || 0).toLocaleString('en-KE')}
                                                </span>
                                            </div>
                                        </div>

                                        <div 
                                            className="inline-flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 border bg-gray-50 text-gray-700 group-hover:text-white"
                                            style={{ 
                                                '--hover-bg': primaryColor,
                                                '--hover-border': primaryColor 
                                            } as any}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = primaryColor;
                                                e.currentTarget.style.borderColor = primaryColor;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '';
                                                e.currentTarget.style.borderColor = '';
                                            }}
                                        >
                                            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 max-w-md mx-auto shadow-sm">
                        <p className="text-lg font-bold text-gray-700">No alignments discovered</p>
                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">We couldn't match "{search}". Try broadening your search criteria.</p>
                    </div>
                )}
            </div>

            {/* 🗓️ PREMIUM OVERLAY GLASS MODAL */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop with sophisticated heavy blur */}
                        <div
                            className="fixed inset-0 bg-gray-950/40 backdrop-blur-md"
                            onClick={() => setSelected(null)}
                        />

                        {/* Modal Chassis */}
                        <motion.div
                            className="relative bg-white rounded-[2.5rem] max-w-5xl w-full mx-auto z-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-6 sm:p-10 lg:p-12 transform overflow-hidden border border-white/40 my-auto"
                            initial={{ scale: 0.96, y: 15, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.96, y: 15, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                        >
                            {/* Close Trigger */}
                            <button
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors z-30 p-2.5 rounded-full bg-gray-50 hover:bg-gray-100"
                                onClick={() => setSelected(null)}
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                                {/* Left Side: Branding / Preview */}
                                <div className="lg:col-span-7 flex flex-col space-y-6">
                                    <div className="relative w-full h-64 sm:h-80 lg:h-[380px] rounded-3xl overflow-hidden shadow-md">
                                        <Image
                                            src={selected.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop'}
                                            loader={loader}
                                            alt={selected.name}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            className="object-cover"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent"></div>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                            {selected.name}
                                        </h2>
                                        <p className="mt-3 text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                                            {selected.description || 'Enjoy refined expertise built strictly to prioritize premium end-to-end execution.'}
                                        </p>
                                    </div>

                                    {/* Micro Meta Data Container */}
                                    <div className="flex flex-wrap items-center justify-between p-5 rounded-2xl border border-gray-100 bg-gray-50/50 mt-auto gap-4">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block">Pricing Scale</span>
                                            <span style={{ color: primaryColor }} className="text-2xl font-black tracking-tight">
                                                KES {(selected.finalPrice || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${selected.isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {selected.isAvailable ? 'Instant Schedule Active' : 'Allocation Filled'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Dynamic Transaction Module */}
                                <div className="lg:col-span-5 flex flex-col justify-center">
                                    <BookingForm service={selected} primaryColor={primaryColor} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}