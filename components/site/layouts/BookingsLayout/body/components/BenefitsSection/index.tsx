'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon,
    HandThumbUpIcon,
    TagIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';

// Utility function for Next.js Image loader
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Icon mapping configuration
const IconMap: { [key: string]: React.ElementType } = {
    CheckCircleIcon, ShieldCheckIcon, SparklesIcon, ClockIcon,
    StarIcon, HandThumbUpIcon, TagIcon
};

const defaultBenefits = [
    {
        title: 'Effortless Booking',
        description: 'A seamless, intuitive workflow designed to get you scheduled in just a few clicks.',
        icon: 'CheckCircleIcon',
    },
    {
        title: 'Unmatched Quality',
        description: 'Our carefully vetted professionals are dedicated to delivering excellence every single time.',
        icon: 'HandThumbUpIcon', 
    },
    {
        title: 'Transparent Pricing',
        description: 'No hidden fees, commitments, or surprises. What you see is exactly what you pay.',
        icon: 'TagIcon', 
    },
];

interface AboutAndBenefitsSectionProps {
    name?: string | undefined | null;
    description?: string | undefined | null;
    bannerUrl?: string | undefined | null;
    themeSettings?: {
        primaryColor?: string;
        secondaryColor?: string;
    } | null;
    promotions?: any[]; 
}

const sampleData = {
    name: 'SwiftServe',
    description: 'We are committed to connecting you with top-tier professionals for all your personal and corporate needs. From specialized home operations to daily task management, our architecture ensures a flawless delivery cycle from start to finish.',
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
    themeSettings: {
        primaryColor: '#059669',
        secondaryColor: '#FBBF24',
    },
    promotions: [],
};

export default function AboutAndBenefitsSection({ name, description, bannerUrl, themeSettings, promotions }: AboutAndBenefitsSectionProps) {
    const primaryColor = themeSettings?.primaryColor || sampleData.themeSettings.primaryColor;

    // Normalizing benefit processing logic
    const rawPerks = promotions?.[0]?.perks;
    const brandBenefits = (rawPerks && rawPerks.length > 0
        ? rawPerks.map((perk: any) => ({
              title: perk.label,
              description: perk.description || '',
              icon: 'StarIcon',
          }))
        : defaultBenefits).slice(0, 3);

    return (
        <section className="bg-neutral-50 dark:bg-neutral-950 py-20 lg:py-28 text-neutral-900 dark:text-neutral-100 border-b border-neutral-200/60 dark:border-neutral-900/60 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Asymmetric Core Hero Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">
                    
                    {/* Narrative Text Block */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                                Global Commitments
                            </span>
                        </div>
                        
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
                            Why working with <span style={{ color: primaryColor }}>{name || sampleData.name}</span> shifts outcomes
                        </h2>
                        
                        <p className="text-neutral-500 dark:text-neutral-400 text-base sm:text-lg leading-relaxed max-w-2xl">
                            {description || sampleData.description}
                        </p>

                        <div className="pt-2">
                            <button 
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-[0.98]"
                            >
                                <span>Explore Core Ecosystem</span>
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Clean Visual Preview Card */}
                    <div className="lg:col-span-5">
                        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800/80 shadow-md bg-neutral-100 dark:bg-neutral-900 group">
                            <Image
                                src={bannerUrl || sampleData.bannerUrl}
                                loader={loader}
                                alt="Service Infrastructure Dashboard"
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                sizes="(max-w: 1024px) 100vw, 40vw"
                                priority
                            />
                            <div className="absolute inset-0 bg-neutral-950/5 dark:bg-neutral-950/10 mix-blend-multiply" />
                        </div>
                    </div>

                </div>

                {/* Subdued Structural 3-Column Perks Layout */}
                <div className="border-t border-neutral-200/80 dark:border-neutral-900/80 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {brandBenefits.map((benefit: any, idx: number) => {
                            const Icon = IconMap[benefit.icon] || CheckCircleIcon;

                            return (
                                <div key={idx} className="flex flex-col space-y-4">
                                    {/* Icon Housing */}
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors"
                                    >
                                        <Icon className="w-5 h-5" style={{ color: primaryColor }} />
                                    </div>
                                    
                                    {/* Content Assembly */}
                                    <div className="space-y-1.5">
                                        <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}