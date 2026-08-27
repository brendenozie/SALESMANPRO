"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    SparklesIcon,
    ShieldCheckIcon,
    TruckIcon,
    ArrowPathIcon,
    StarIcon,
    ArrowRightIcon,
    CloudIcon,
} from '@heroicons/react/24/outline';

const IconMap: { [key: string]: React.ElementType } = {
    SparklesIcon, ShieldCheckIcon, TruckIcon, ArrowPathIcon, StarIcon, CloudIcon
};

const loader = ({ src }: { src: string }) => src;

export default function FeaturesSection({ name, description, CoreValues }: any) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const defaultFeatures = [
        {
            icon: 'SparklesIcon',
            title: 'Organic Cleaning',
            highlight: 'Pure',
            description: 'We use 100% eco-friendly, non-toxic detergents that are gentle on your skin and the planet.',
            imageUrl: 'https://images.unsplash.com/photo-1545173153-936277f9f80a?q=80&w=2070&auto=format&fit=crop',
        },
        {
            icon: 'TruckIcon',
            title: 'Express Delivery',
            highlight: 'Fast',
            description: 'Scheduled pickups and 24-hour turnaround for your busiest days. We value your time.',
            imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
        },
        {
            icon: 'ShieldCheckIcon',
            title: 'Fabric Protection',
            highlight: 'Care',
            description: 'Every garment is inspected by experts and handled with specialized care for long-lasting wear.',
            imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=2070&auto=format&fit=crop',
        },
    ];

    const features = CoreValues?.length ? CoreValues : defaultFeatures;

    return (
        <section className="relative py-32 px-6 bg-white dark:bg-[#080a0c] transition-colors duration-700 overflow-hidden">
            {/* Soft Ambient Background Orbs */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-teal-100/30 dark:bg-teal-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-100/20 dark:bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* 1. FRESH HEADER */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-10">
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <span className="h-[2px] w-8 bg-teal-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-400">
                                The Gold Standard
                            </span>
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            Elevating the <span className="italic font-serif font-light text-teal-500">Service</span> <br /> of {name || 'the Craft'}.
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm font-medium leading-relaxed border-l-2 border-teal-500/20 pl-8">
                        {description || "Redefining garment care through sustainable technology, artisanal precision, and absolute convenience."}
                    </p>
                </div>

                {/* 2. BENTO FEATURE GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature: any, idx: number) => {
                        const Icon = IconMap[feature.icon] || SparklesIcon;
                        const isHovered = hoveredIndex === idx;

                        return (
                            <motion.div
                                key={idx}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="relative group h-[550px] rounded-[2.5rem] overflow-hidden cursor-pointer bg-slate-50 dark:bg-[#111]/40 border border-slate-200 dark:border-white/5 transition-all duration-500"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.8 }}
                            >
                                {/* High-Speed Background Image */}
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <Image
                                        src={feature.imageUrl}
                                        alt={feature.title}
                                        fill
                                        className="object-cover opacity-10 group-hover:opacity-30 group-hover:scale-105 transition-all duration-1000 grayscale group-hover:grayscale-0"
                                        loader={loader}
                                    />
                                    {/* Glass Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#080a0c] via-transparent to-transparent" />
                                </div>

                                {/* Content Container */}
                                <div className="absolute inset-0 z-10 p-10 flex flex-col justify-end">
                                    <div 
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-white dark:bg-white/10 shadow-xl dark:shadow-none group-hover:scale-110 group-hover:bg-teal-500 transition-all duration-500"
                                    >
                                        <Icon className="w-8 h-8 text-teal-600 dark:text-teal-400 group-hover:text-white" />
                                    </div>

                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                                        {feature.title}
                                    </h3>
                                    
                                    <div className="overflow-hidden">
                                        <p className="text-teal-600 dark:text-teal-400 font-serif italic text-xl mb-4 transform transition-transform duration-500 translate-y-0 group-hover:translate-y-0">
                                            {feature.highlight || 'Impeccable'} Standards
                                        </p>
                                        
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                            {feature.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                                        Learn More <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </div>

                                {/* Animated Top Edge Glow */}
                                <motion.div 
                                    className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-teal-400 to-blue-500 z-20"
                                    initial={{ width: 0 }}
                                    animate={{ width: isHovered ? "100%" : "0%" }}
                                    transition={{ duration: 0.4 }}
                                />
                            </motion.div>
                        );
                    })}
                </div>

                {/* 3. TRUST FOOTER */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-24 pt-10 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#080a0c] bg-slate-200 overflow-hidden">
                                    <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" width={40} height={40} loader={loader} />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold">4.9/5 from 2k+ Local Customers</p>
                        </div>
                    </div>

                    <div className="flex gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 text-slate-900 dark:text-white font-serif text-lg italic">
                        <span>The NY Times</span>
                        <span>EcoWash Daily</span>
                        <span>Urban Living</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}