'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';
import { XMarkIcon, MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Added ArrowRightIcon
// Assuming BookingForm and MarketListingForm types/components exist
// import BookingForm from '../../../components/BookingForm'; 
// import { MarketListingForm } from '@/types/typings'; 

// Placeholder types for external dependencies to make the component runnable
type MarketListingForm = {
    id: string;
    name: string;
    description: string;
    images?: string[];
    finalPrice: number;
    isAvailable: boolean;
};

// Placeholder for BookingForm component (assumed to be complex and imported)
const BookingForm = ({ service, slug }: { service: MarketListingForm, slug: string }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Booking Integration Placeholder:</p>
        <p className="text-xs text-gray-500">Service: **{service.name}**</p>
        <p className="text-xs text-gray-500">Price: **KES {service.finalPrice.toFixed(2)}**</p>
        <button
            className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
            disabled={!service.isAvailable}
        >
            {service.isAvailable ? 'Proceed to Checkout' : 'Notify Me When Available'}
        </button>
    </div>
);


const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function ServicesSection() {
    const { storeFormData } = useStoreContext();

    // Sample data (Refined descriptions and added a slightly different image for variety)
    const sampleData = {
        marketplaceListings: [
            {
                id: "1",
                name: "Premium Haircut & Styling",
                description: "Experience a top-tier haircut with our master stylists, including a relaxing wash and a personalized styling session to perfect your look.",
                images: ["https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
                finalPrice: 7500.00, // Adjusted price to be more realistic in KES
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

    const { marketplaceListings = [], themeSettings, slug } = storeFormData || sampleData;

    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MarketListingForm | null>(null);

    const primaryColor = themeSettings?.primaryColor || '#059669';

    // Filter logic has been fully implemented here
    const filteredListings = marketplaceListings.filter((item: MarketListingForm) =>
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
                
                {/* --- HEADER, TITLE, AND SEARCH BAR --- */}
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
                    <div className="mt-10 max-w-lg mx-auto relative">
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
                                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 hover:text-gray-800"
                                aria-label="Clear search"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* --- SERVICES CARDS GRID --- */}
                {filteredListings.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {(filteredListings as MarketListingForm[]).map((item, i) => (
                            <motion.div
                                key={item.id}
                                className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col group cursor-pointer"
                                variants={cardVariants}
                                onClick={() => setSelected(item)}
                            >
                                {/* Image Area */}
                                <div className="relative w-full h-56 overflow-hidden">
                                    <Image
                                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                        loader={loader}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Price Tag */}
                                    {item.finalPrice && (
                                        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-gray-900 text-lg font-extrabold px-4 py-2 rounded-xl shadow-lg border border-gray-100">
                                            KES {item.finalPrice.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Content Area */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 flex-grow mb-4 line-clamp-3">
                                        {item.description || 'A unique service designed to provide exceptional results and an unforgettable experience.'}
                                    </p>
                                    
                                    {/* Availability Status */}
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className={`text-sm font-semibold ${item.isAvailable ? 'text-green-600 bg-green-50 px-3 py-1 rounded-full' : 'text-red-600 bg-red-50 px-3 py-1 rounded-full'}`}>
                                            {item.isAvailable ? 'Instant Booking' : 'Currently Booked'}
                                        </span>
                                        <div className="flex items-center text-emerald-600 font-semibold group-hover:translate-x-1 transition-transform">
                                            View Details
                                            <ArrowRightIcon className="w-4 h-4 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl shadow-inner border border-dashed border-gray-300">
                        <p className="text-2xl font-bold text-gray-600">
                            No services found matching "<span className="text-emerald-600">{search}</span>"
                        </p>
                        <p className="text-lg text-gray-500 mt-2">Try a broader search term or explore our featured categories.</p>
                    </div>
                )}
            </div>

            {/* --- BOOKING MODAL (Re-styled for prominence) --- */}
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
                            className="absolute top-5 right-5 text-gray-500 hover:text-gray-800 transition-colors z-50 p-2 rounded-full bg-white/50 hover:bg-white"
                            onClick={() => setSelected(null)}
                            aria-label="Close"
                        >
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Service Details (Left Side) */}
                            <div className="space-y-6">
                                <div className="relative w-full h-[250px] md:h-[350px] rounded-xl overflow-hidden shadow-xl">
                                    <Image
                                        src={selected.images?.[0] || 'https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                                        loader={loader}
                                        alt={selected.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
                                </div>

                                <div>
                                    <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                        {selected.name}
                                    </h2>
                                    <p className="mt-3 text-lg text-gray-700 leading-relaxed">{selected.description || 'No detailed description available.'}</p>
                                </div>

                                {/* Price and Availability Bar */}
                                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg shadow-inner">
                                    <p className="font-bold text-gray-800 text-xl">
                                        Price: <span className="text-emerald-700 text-2xl font-extrabold">KES { (selected.finalPrice || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</span>
                                    </p>
                                    <span className={`inline-flex items-center gap-1.5 text-lg font-bold ${selected.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                                        {selected.isAvailable ? 'Available Now' : 'Booked Out'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Booking Form (Right Side) */}
                            <div className="flex flex-col space-y-6">
                                <h3 className="text-2xl font-bold text-gray-800 pt-1">Schedule Your Appointment</h3>
                                <BookingForm service={selected} slug={sampleData.slug || ''} />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}