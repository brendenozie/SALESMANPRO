'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    CheckIcon,
    Cog6ToothIcon,
    LockClosedIcon,
    AdjustmentsVerticalIcon,
    ClockIcon,
    UserGroupIcon,
    SparklesIcon,
    RocketLaunchIcon,
    ShieldCheckIcon,
    BoltIcon,
    ArrowRightIcon,
    CreditCardIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { ICoreValue } from '@/types/typings';

// --- UTILS ---
const loader = ({ src }: { src: string }) => src;

// --- ICONS ---
const IconMap: { [key: string]: React.ElementType } = {
    CheckIcon, UserGroupIcon, LockClosedIcon, AdjustmentsVerticalIcon,
    ClockIcon, Cog6ToothIcon, SparklesIcon, RocketLaunchIcon, 
    ShieldCheckIcon, BoltIcon, CreditCardIcon, ChartBarIcon
};

// --- PROPS ---
interface FeaturesSectionProps {
    name: string | null | undefined;
    description: string | null | undefined;
    themeSettings: Record<string, any> | null | undefined;
    CoreValues: ICoreValue[] | null | undefined;
}

const sampleProps: FeaturesSectionProps = {
    name: 'SwiftCare',
    description: "All the power you need, condensed into one simple interface.",
    themeSettings: { primaryColor: '#6366f1' }, // Indigo
    CoreValues: [],
};

export default function FeaturesSection({ name, description, themeSettings, CoreValues }: FeaturesSectionProps = sampleProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false); // Pause auto-play on hover
    const primaryColor = themeSettings?.primaryColor || '#6366f1';

    const defaultFeatures: any[] = [
        {
            icon: 'BoltIcon',
            title: 'Instant Speed',
            description: 'Experience zero-latency booking with our edge-cached network.',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
        },
        {
            icon: 'ShieldCheckIcon',
            title: 'Secure Core',
            description: 'Bank-grade encryption keeps every transaction completely private.',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
        },
        {
            icon: 'ChartBarIcon',
            title: 'Smart Analytics',
            description: 'Track your usage patterns with beautiful, real-time dashboards.',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
        },
        {
            icon: 'UserGroupIcon',
            title: 'Team Sync',
            description: 'Collaborate effortlessly with shared calendars and permissions.',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop',
        },
    ];

    const features = CoreValues?.length ? CoreValues : defaultFeatures;

    // --- AUTO PLAY LOGIC ---
    useEffect(() => {
        if (isHovering) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 4000); // Rotate every 4 seconds
        return () => clearInterval(timer);
    }, [features.length, isHovering]);

    return (
        <section id="benefits" className="relative py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
            
            {/* Background Decor - Minimalist */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
            
            <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
                
                {/* 1. COMPACT HEADER */}
                <div className="text-center mb-10 max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3">
                        Why {name || 'Us'}?
                    </h2>
                    <p className="text-gray-500 text-lg">
                        {description || sampleProps.description}
                    </p>
                </div>

                {/* 2. TAB NAVIGATION (The "Pill") */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 p-1.5 rounded-full bg-gray-100/80 border border-gray-200 backdrop-blur-sm shadow-inner overflow-hidden max-w-full">
                    {features.map((feature, idx) => {
                        const isActive = activeIndex === idx;
                        const Icon = IconMap[(feature.icon ?? 'CheckIcon') as keyof typeof IconMap] ?? CheckIcon;

                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 z-10 ${isActive ? 'text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'}`}
                                style={{ outline: 'none' }}
                            >
                                {/* Animated Background Pill for Active State */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 rounded-full"
                                        style={{ backgroundColor: primaryColor }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                
                                {/* Icon & Text (Relative z-index to sit on top of the bg) */}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{feature.title}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. MAIN CONTENT CARD (The "Screen") */}
                <div 
                    className="w-full relative aspect-[16/10] sm:aspect-[21/9] md:h-[400px] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 group"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 flex flex-col md:flex-row"
                        >
                            {/* LEFT: Text Content */}
                            <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative z-20 bg-white/95 backdrop-blur-md md:bg-white">
                                <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg"
                                    style={{ backgroundColor: `${primaryColor}15` }}
                                >
                                    {React.createElement(IconMap[features[activeIndex].icon || 'CheckIcon'], { 
                                        className: "w-6 h-6",
                                        style: { color: primaryColor }
                                    })}
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {features[activeIndex].title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-8">
                                    {features[activeIndex].description}
                                </p>

                                <button className="flex items-center text-sm font-bold hover:underline transition-all group/btn w-max" style={{ color: primaryColor }}>
                                    Learn more 
                                    <ArrowRightIcon className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                </button>

                                {/* Progress Bar (Visual Timer) */}
                                {!isHovering && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                                        <motion.div 
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 4, ease: "linear" }} // Matches auto-play timer
                                            className="h-full"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* RIGHT: Image Background */}
                            <div className="absolute inset-0 md:relative md:w-3/5 h-full z-10 md:z-auto">
                                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent md:hidden z-20" /> {/* Mobile text legibility overlay */}
                                <Image
                                    src={features[activeIndex].imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"}
                                    alt={features[activeIndex].title}
                                    fill
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    loader={loader}
                                />
                                {/* Dark overlay for depth */}
                                <div className="absolute inset-0 bg-black/10 md:bg-transparent" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}