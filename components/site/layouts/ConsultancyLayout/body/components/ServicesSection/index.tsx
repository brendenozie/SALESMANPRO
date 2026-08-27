'use client';

import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, SparklesIcon, CalendarIcon, BriefcaseIcon, UsersIcon, LightBulbIcon, AcademicCapIcon, BoltIcon } from "@heroicons/react/24/outline";
// --- Data Integration Imports ---
import { useStoreContext } from '@/contexts/StoreContext';
// NOTE: Assuming StoreForm, IStoreCategory, ISubcategory are defined in your project
// import { StoreForm, IStoreCategory, ISubcategory } from '@/types/typings'; 
import clsx from "clsx"; 

// --- TYPE DEFINITIONS (Re-defined for completeness) ---
type StoreForm = {
    name?: string;
    description?: string;
    category?: string;
    themeSettings?: { primaryColor?: string };
    StoreCategory?: IStoreCategory[];
};
interface ISubcategory { name: string; id: string; }
interface IStoreCategory { displayName: string; id: string; subcategories?: ISubcategory[]; }
type Offering = {
    title: string;
    desc: string;
    id?: string;
    iconComponent: React.ElementType;
    iconColor: string;
};
// ----------------------------------------------------


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
    const primaryColor = storeFormData?.themeSettings?.primaryColor || "#F97316"; // Primary color from theme

    // const {
    //     name,
    //     description,
    //     StoreCategory = [],
    //     category,
    // } = storeFormData;

    // const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
    // let offeringsToShow: Offering[] = [];

    // // NOTE: Data mapping logic remains the same for correctness
    // if (hasCategories && StoreCategory.length < 6) {
    //     // Use Subcategories
    //     const enrichedSubcategories = (StoreCategory as IStoreCategory[]).flatMap(cat => 
    //         (cat.subcategories || []).map(subcat => ({
    //             ...subcat,
    //             parentName: cat.displayName,
    //         }))
    //     );

    //     const limitedSubcategories = enrichedSubcategories.slice(0, 6);
        
    //     offeringsToShow = limitedSubcategories.map((subcat, index) => ({
    //         title: subcat.name || 'Service',
    //         desc: `Specialized solutions for ${subcat.parentName || 'Coaching'}: ${subcat.name}.`, 
    //         id: subcat.id,
    //         iconComponent: dynamicHeroIconMap[subcat.name] || dynamicHeroIconMap[subcat.parentName || 'Service'] || SparklesIcon, 
    //         iconColor: iconColors[index % iconColors.length],
    //     }));

    // } else if (hasCategories) {
    //     // Display Categories themselves
    //     offeringsToShow = (StoreCategory as IStoreCategory[]).slice(0, 6).map((cat, index) => ({
    //         title: cat.displayName || 'Service',
    //         desc: `Explore our specialized ${cat.displayName} solutions.`,
    //         id: cat.id,
    //         iconComponent: dynamicHeroIconMap[cat.displayName || 'Service'] || SparklesIcon,
    //         iconColor: iconColors[index % iconColors.length],
    //     }));
    // } else {
    //     // Fallback if no categories exist
    //     offeringsToShow = defaultCoachingSolutions;
    // }
    // // --- Data Integration END ---

    const {
    name,
    description,
    StoreCategory = [],
    category,
} = storeFormData;

const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
let offeringsToShow: Offering[] = [];

// Normalize category text for consistent matching
const categoryText = (category || '').toLowerCase().trim();

// Define consulting-related keywords
const consultingKeywords = [
    'consultant',
    'consulting',
    'coach',
    'coaching',
    'consultant & coach',
    'consulting & coaching',
];

// Check if current category matches any consulting-related keyword
const isConsultingRelated = consultingKeywords.some(keyword =>
    categoryText.includes(keyword)
);

// --- Apply the consulting category filter ---
let filteredCategories = StoreCategory;

if (isConsultingRelated) {
    filteredCategories = StoreCategory.filter(cat => {
        const name = (cat.displayName || '').toLowerCase();
        return (
            name.includes('consulting') ||
            name.includes('coach') ||
            name.includes('consultant')
        );
    });
}

// --- Offerings logic ---
if (filteredCategories.length > 0 && filteredCategories.length < 6) {
    // Use subcategories when there are fewer than 6 categories
    const enrichedSubcategories = filteredCategories.flatMap(cat =>
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
        iconComponent:
            dynamicHeroIconMap[subcat.name] ||
            dynamicHeroIconMap[subcat.parentName || 'Service'] ||
            SparklesIcon,
        iconColor: iconColors[index % iconColors.length],
    }));
} else if (filteredCategories.length > 0) {
    // Show top-level categories
    offeringsToShow = filteredCategories.slice(0, 6).map((cat, index) => ({
        title: cat.displayName || 'Service',
        desc: `Explore our specialized ${cat.displayName} solutions.`,
        id: cat.id,
        iconComponent:
            dynamicHeroIconMap[cat.displayName || 'Service'] || SparklesIcon,
        iconColor: iconColors[index % iconColors.length],
    }));
} else {
    // Fallback if no valid categories found
    offeringsToShow = defaultCoachingSolutions;
}


    const gridOfferings = offeringsToShow.slice(0, 6);

    return (
        <section id="services" className="relative py-28 md:py-36 bg-gray-50 overflow-hidden">
            {/* Background Accent Grid (Visually richer background) */}
            <div className="absolute inset-0 z-0 opacity-10">
                <svg className="h-full w-full" fill="none">
                    <defs>
                        <pattern id="grid-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M19 0H0V19" stroke="#E5E7EB" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>
            {/* Top right gradient blob */}
            <div 
                className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"
                style={{ backgroundColor: primaryColor }}
            ></div>


            <div className="relative container mx-auto px-6 max-w-7xl z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span 
                        className="text-lg font-semibold uppercase tracking-wider mb-3 block"
                        style={{ color: primaryColor }}
                    >
                        Our Expertise
                    </span>
                    <motion.h2 
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        {name || 'Transformative Coaching'} <span style={{ color: primaryColor }}>Solutions</span>
                    </motion.h2>
                    <motion.p 
                        className="mt-5 text-xl text-gray-700 max-w-3xl mx-auto line-clamp-3 text-ellipsis"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        {description || 'Experience the synergy of strategy, mindset, and purpose — designed to help you lead with clarity, confidence, and impact.'}
                    </motion.p>
                </div>

                {/* Services Grid with Visual Enhancements */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gridOfferings.map((service, i) => {
                        const Icon = service.iconComponent;
                        return (
                            <motion.div
                                key={service.id || i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="group relative p-8 rounded-3xl bg-white shadow-xl border-t-4 border-white transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] flex flex-col items-start"
                                // Dynamic border-t-4 and a subtle hover gradient from the primary color
                                style={{ 
                                    borderTopColor: primaryColor,
                                    // Subtle inner shadow on hover
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' 
                                }}
                            >
                                {/* Hover Gradient Overlay for Polish */}
                                <div 
                                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    style={{ background: `radial-gradient(circle at 100% 0%, ${primaryColor}1A, transparent 70%)` }}
                                ></div>

                                <div className="relative z-10 flex-grow">
                                    {/* --- 🛑 VISUAL IMPROVEMENT: STYLED ICON CONTAINER 🛑 --- */}
                                    <div 
                                        className={clsx(
                                            "mb-6 p-4 rounded-xl inline-flex items-center justify-center ring-4 ring-offset-2 transition-all duration-500 group-hover:ring-offset-4",
                                            service.iconColor.replace('text', 'bg').replace('-600', '-100'), // Background color (e.g., bg-orange-100)
                                            service.iconColor.replace('text', 'ring').replace('-600', '-500'), // Ring color (e.g., ring-orange-500)
                                        )}
                                    >
                                        <Icon className={clsx("w-7 h-7", service.iconColor)} aria-hidden="true" />
                                    </div>
                                    {/* -------------------------------------------------------- */}

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                    <p className="text-gray-600 leading-relaxed mb-6">{service.desc}</p>
                                </div>

                                <a
                                    href={`#contact`} 
                                    className="relative z-10 inline-flex items-center font-semibold transition-all group-hover:translate-x-1"
                                    style={{ color: primaryColor }}
                                >
                                    Explore Solution
                                    <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300" />
                                </a>
                            </motion.div>
                        );
                    })}
                </div>
                
                {/* Final CTA outside the grid */}
                <motion.div 
                    className="mt-20 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <p className="text-lg text-gray-700 mb-6">Ready to take the next step towards your goals?</p>
                    <a
                        href="#contact"
                        className="inline-flex items-center px-10 py-4 font-bold rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                        style={{
                            backgroundColor: primaryColor,
                            color: "white",
                            border: `2px solid ${primaryColor}`
                        }}
                    >
                        Book a Discovery Call
                        <CalendarIcon className="w-5 h-5 ml-2" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default ServicesSection;