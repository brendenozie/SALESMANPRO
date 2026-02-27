"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
// Using Heroicons as requested
import {
    BoltIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    UserGroupIcon,
    StarIcon,
    ArrowRightIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/solid';

const IconMap: { [key: string]: React.ElementType } = {
    BoltIcon, ShieldCheckIcon, ChartBarIcon, UserGroupIcon, StarIcon, CheckBadgeIcon
};

const loader = ({ src }: { src: string }) => src;

export default function FeaturesSection({ name, description, themeSettings, CoreValues }: any) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const primaryColor = themeSettings?.primaryColor || '#C5A267'; // Premium Gold

    const defaultFeatures = [
        {
            icon: 'CheckBadgeIcon',
            title: 'Master Craftsmanship',
            highlight: 'Craft',
            description: 'Our barbers are artisans trained in classic techniques and modern trends.',
            imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop',
        },
        {
            icon: 'ShieldCheckIcon',
            title: 'Premium Sanctuary',
            highlight: 'Privacy',
            description: 'A private, high-end environment designed for the modern gentleman to unwind.',
            imageUrl: 'https://images.unsplash.com/photo-1621605815841-aa887ad436b7?q=80&w=2070&auto=format&fit=crop',
        },
        {
            icon: 'StarIcon',
            title: 'Tailored Experience',
            highlight: 'Style',
            description: 'Every consultation is unique, ensuring your cut matches your lifestyle and face shape.',
            imageUrl: 'https://images.unsplash.com/photo-1512690196236-407675713c32?q=80&w=2070&auto=format&fit=crop',
        },
    ];

    const features = CoreValues?.length ? CoreValues : defaultFeatures;

    return (
        <section className="relative py-24 px-6 bg-[#0a0a0a] overflow-hidden">
            {/* Background Texture - Subtle Grain */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* 1. EDITORIAL HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="max-w-2xl">
                        <motion.span 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C5A267] mb-4 block"
                        >
                            The Excellence Standard
                        </motion.span>
                        <h2 className="text-4xl md:text-6xl font-light text-white leading-tight">
                            Why choose <span className="font-serif italic text-[#C5A267]">{name || 'the Craft'}?</span>
                        </h2>
                    </div>
                    <p className="text-gray-400 text-lg max-w-sm font-light leading-relaxed border-l border-white/10 pl-6">
                        {description || "Elevating the standard of male grooming through precision, atmosphere, and heritage."}
                    </p>
                </div>

                {/* 2. INTERACTIVE FEATURE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature: any, idx: number) => {
                        const Icon = IconMap[feature.icon] || CheckBadgeIcon;
                        const isHovered = hoveredIndex === idx;

                        return (
                            <motion.div
                                key={idx}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="relative group h-[500px] rounded-3xl overflow-hidden cursor-pointer bg-neutral-900 border border-white/5"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                {/* Background Image with Parallax effect */}
                                <div className="absolute inset-0 z-0 transition-transform duration-700 ease-out scale-110 group-hover:scale-100">
                                    <Image
                                        src={feature.imageUrl}
                                        alt={feature.title}
                                        fill
                                        className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                                        loader={loader}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end">
                                    <div className="mb-6">
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center mb-6 border border-[#C5A267]/30 bg-[#C5A267]/10 backdrop-blur-sm"
                                        >
                                            <Icon className="w-6 h-6 text-[#C5A267]" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-[#C5A267] font-serif italic text-lg mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Mastering {feature.highlight || 'the details'}
                                        </p>
                                    </div>

                                    <div className="overflow-hidden h-0 group-hover:h-24 transition-all duration-500 ease-in-out">
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <div className="mt-4 flex items-center text-[10px] font-bold uppercase tracking-widest text-white">
                                            Explore more <ArrowRightIcon className="w-3 h-3 ml-2" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Accent Line */}
                                <motion.div 
                                    className="absolute bottom-0 left-0 h-1 bg-[#C5A267] z-20"
                                    initial={{ width: 0 }}
                                    animate={{ width: isHovered ? "100%" : "0%" }}
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* 3. SUBTLE FOOTER TRUST BAR */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center md:justify-between items-center gap-8"
                >
                    <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <StarIcon className="w-4 h-4 text-[#C5A267]" />
                        Top Rated in the District
                    </div>
                    <div className="flex gap-12 opacity-30 grayscale hover:grayscale-0 transition-all">
                        {/* Placeholder for partner logos/awards */}
                        <span className="text-white font-serif text-xl italic">GQ Magazine</span>
                        <span className="text-white font-serif text-xl italic">Vogue Men</span>
                        <span className="text-white font-serif text-xl italic">Barber Digest</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}