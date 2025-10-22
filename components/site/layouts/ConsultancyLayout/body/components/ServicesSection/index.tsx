'use client';

import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, SparklesIcon, CalendarIcon, BriefcaseIcon, UsersIcon, LightBulbIcon, AcademicCapIcon, BoltIcon } from "@heroicons/react/24/outline";
// --- Data Integration Imports ---
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreForm, IStoreCategory, ISubcategory } from '@/types/typings'; 
import clsx from "clsx"; // Added for icon styling

// --- Dynamic Icon Map for Visual Diversity ---
const dynamicHeroIconMap: Record<string, React.ElementType> = {
    'Executive Coaching': BriefcaseIcon,
    'Career Acceleration': BoltIcon,
    'Personal Development': LightBulbIcon,
    'Team Workshops': UsersIcon,
    'Mindset & Resilience': AcademicCapIcon,
    'Strategic Planning': CalendarIcon,
    'Service': SparklesIcon,
};

// Define the type for the offering in this component
type Offering = {
    title: string;
    desc: string;
    id?: string;
    iconComponent: React.ElementType; // Use component type for Heroicons
    iconColor: string; // Dynamic color for visual variation
};

// Fallback data for a standalone preview
const defaultCoachingSolutions: Offering[] = [
    { title: "Executive Coaching", desc: "Elevate your leadership, decision-making, and influence with high-impact executive sessions.", iconComponent: dynamicHeroIconMap['Executive Coaching'], iconColor: 'text-indigo-600' },
    { title: "Career Acceleration", desc: "Design your career path, refine your strengths, and fast-track your professional growth.", iconComponent: dynamicHeroIconMap['Career Acceleration'], iconColor: 'text-green-600' },
    { title: "Personal Development", desc: "Unlock your best self through purpose-driven growth and emotional intelligence mastery.", iconComponent: dynamicHeroIconMap['Personal Development'], iconColor: 'text-orange-600' },
    { title: "Team Workshops", desc: "Ignite collaboration and synergy within your team through engaging, result-oriented workshops.", iconComponent: dynamicHeroIconMap['Team Workshops'], iconColor: 'text-purple-600' },
    { title: "Mindset & Resilience", desc: "Overcome self-doubt, embrace change, and build the mental strength to thrive in any season.", iconComponent: dynamicHeroIconMap['Mindset & Resilience'], iconColor: 'text-sky-600' },
    { title: "Strategic Planning", desc: "Set a clear vision, craft actionable goals, and execute with precision and purpose.", iconComponent: dynamicHeroIconMap['Strategic Planning'], iconColor: 'text-pink-600' },
];

// Helper to cycle through colors for variety
const iconColors = [
    'text-orange-600',
    'text-indigo-600',
    'text-green-600',
    'text-purple-600',
    'text-sky-600',
    'text-pink-600',
];

const ServicesSection: React.FC = () => {
    
    // --- Data Integration START (Simplified) ---
    const { storeFormData } = useStoreContext() as { storeFormData: StoreForm };
    const {
        name,
        description,
        StoreCategory = [],
    } = storeFormData;

    const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
    let offeringsToShow: Offering[] = [];

    if (hasCategories && StoreCategory.length < 6) {
        // Use Subcategories
        const enrichedSubcategories = (StoreCategory as IStoreCategory[]).flatMap(cat => 
            (cat.subcategories || []).map(subcat => ({
                ...subcat,
                parentName: cat.displayName,
            }))
        );

        const limitedSubcategories = enrichedSubcategories.slice(0, 6);
        
        offeringsToShow = limitedSubcategories.map((subcat, index) => ({
            title: subcat.name || 'Service',
            desc: `Specialized solutions for ${subcat.parentName || 'Coaching'}: ${subcat.name}.`, 
            id: subcat.id,
            // Use dynamic Heroicons based on category name or default
            iconComponent: dynamicHeroIconMap[subcat.name] || dynamicHeroIconMap[subcat.parentName || 'Service'] || SparklesIcon, 
            iconColor: iconColors[index % iconColors.length], // Cycle colors
        }));

    } else if (hasCategories) {
        // Display Categories themselves
        offeringsToShow = (StoreCategory as IStoreCategory[]).slice(0, 6).map((cat, index) => ({
            title: cat.displayName || 'Service',
            desc: `Explore our specialized ${cat.displayName} solutions.`,
            id: cat.id,
            iconComponent: dynamicHeroIconMap[cat.displayName || 'Service'] || SparklesIcon,
            iconColor: iconColors[index % iconColors.length], // Cycle colors
        }));
    } else {
        // Fallback if no categories exist
        offeringsToShow = defaultCoachingSolutions;
    }
    // --- Data Integration END ---

    // Using the actual length of the dynamic offerings for the grid
    const gridOfferings = offeringsToShow.slice(0, 6); // Limit to 6 for the 3-column grid layout

    return (
        <section id="services" className="relative py-28 bg-gradient-to-br from-orange-50 via-white to-orange-100 overflow-hidden">
            {/* Subtle Background Accents */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-20 -left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow delay-500"></div>
            </div>

            <div className="relative container mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block">
                        Our Expertise
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                        {name || 'Transformative Coaching'} <span className="text-orange-600">Solutions</span>
                    </h2>
                    <p className="mt-5 text-xl text-gray-700 max-w-3xl mx-auto">
                        {description || 'Experience the synergy of strategy, mindset, and purpose — designed to help you lead with clarity, confidence, and impact.'}
                    </p>
                </div>

                {/* Services Grid with Visual Enhancements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {gridOfferings.map((service, i) => {
                        const Icon = service.iconComponent;
                        return (
                            <motion.div
                                key={service.id || i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="group relative p-8 rounded-3xl bg-white/90 backdrop-blur-sm border border-orange-100 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col"
                            >
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="relative z-10 flex-grow">
                                    {/* --- 🛑 VISUAL IMPROVEMENT: STYLED ICON CONTAINER 🛑 --- */}
                                    <div 
                                        className={clsx(
                                            "mb-6 p-3 rounded-full inline-flex items-center justify-center ring-4 ring-offset-2 transition-all duration-300",
                                            service.iconColor.replace('text', 'bg').replace('-600', '-100'), // Background color
                                            service.iconColor.replace('text', 'ring').replace('-600', '-500'), // Ring color
                                        )}
                                    >
                                        <Icon className={clsx("w-8 h-8", service.iconColor)} aria-hidden="true" />
                                    </div>
                                    {/* -------------------------------------------------------- */}

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                    <p className="text-gray-700 leading-relaxed mb-6">{service.desc}</p>
                                </div>

                                <a
                                    href={`#contact`} 
                                    className="relative z-10 inline-flex items-center text-orange-600 font-semibold hover:text-orange-800 transition-all group-hover:translate-x-1"
                                >
                                    Start Your Journey
                                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300" />
                                </a>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;