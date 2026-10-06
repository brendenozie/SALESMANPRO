"use client";

import React from 'react';
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
    CreditCardIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { ICoreValue } from '@/types/typings';

// --- UTILS ---
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// --- ICONS MAP ---
const IconMap: { [key: string]: React.ElementType } = {
    CheckIcon, UserGroupIcon, LockClosedIcon, AdjustmentsVerticalIcon,
    ClockIcon, Cog6ToothIcon, SparklesIcon, RocketLaunchIcon, 
    ShieldCheckIcon, BoltIcon, CreditCardIcon, ChartBarIcon
};

interface FeaturesSectionProps {
    name: string | null | undefined;
    description: string | null | undefined;
    themeSettings: Record<string, any> | null | undefined;
    CoreValues: ICoreValue[] | null | undefined;
}

const sampleProps: FeaturesSectionProps = {
    name: 'SwiftCare',
    description: "All the power you need, condensed into one simple, high-performance workspace.",
    themeSettings: { primaryColor: '#00A880' },
    CoreValues: [],
};

export default function FeaturesSection({ name, description, themeSettings, CoreValues }: FeaturesSectionProps = sampleProps) {
    const primaryColor = themeSettings?.primaryColor || '#00A880';

    const defaultFeatures = [
        {
            icon: 'BoltIcon',
            title: 'Instant Speed',
            description: 'Experience zero-latency interactions with our global edge network infrastructure.',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
        },
        {
            icon: 'ShieldCheckIcon',
            title: 'Secure Core',
            description: 'Bank-grade multi-layer encryption keeps your data safe, private, and fully audited.',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
        },
        {
            icon: 'ChartBarIcon',
            title: 'Smart Analytics',
            description: 'Track growth, retention, and performance benchmarks with real-time data engines.',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
        },
        {
            icon: 'UserGroupIcon',
            title: 'Team Sync',
            description: 'Collaborate seamlessly across distributed groups with unified permission logic.',
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
        },
    ];

    const features = CoreValues?.length ? CoreValues : defaultFeatures;

    return (
        <section id="benefits" className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200/60 dark:border-neutral-900/60 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                
                {/* Minimal Header Layout */}
                <div className="max-w-3xl mb-16">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Features</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                        Built for modern scaling
                    </h2>
                    <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-base md:text-lg leading-relaxed">
                        {description || sampleProps.description}
                    </p>
                </div>

                {/* Clean Feature Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = IconMap[(feature.icon ?? 'CheckIcon') as keyof typeof IconMap] ?? CheckIcon;

                        return (
                            <div
                                key={idx}
                                className="group relative bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800/80 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700/80 transition-all duration-300"
                            >
                                <div>
                                    {/* Small Visual Card Asset */}
                                    {feature.imageUrl && (
                                        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-5 bg-neutral-100 dark:bg-neutral-800">
                                            <Image decoding="async"
                                                src={feature.imageUrl}
                                                alt={feature.title}
                                                fill
                                                sizes="(max-w: 768px) 100vw, (max-w: 1200px) 50vw, 25vw"
                                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-neutral-950/5 dark:bg-neutral-950/10 mix-blend-multiply" />
                                        </div>
                                    )}

                                    {/* Icon & Title Grouping */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                            <Icon className="w-4 h-4" style={{ '--primary-accent': primaryColor } as React.CSSProperties} />
                                        </div>
                                        <h3 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                    </div>

                                    {/* Feature Description text */}
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                                
                                {/* Micro Accent Indicator Ring on Hover */}
                                <div 
                                    className="absolute bottom-0 right-0 w-8 h-8 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-end pr-2 pb-2"
                                    style={{ color: primaryColor }}
                                >
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}