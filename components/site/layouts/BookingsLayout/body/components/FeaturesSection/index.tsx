'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import {
    CheckIcon,
    Cog6ToothIcon,
    LockClosedIcon,
    AdjustmentsVerticalIcon,
    ClockIcon,
    UserGroupIcon,
    SparklesIcon,
    ArrowRightIcon,
    // Using a new outline icon for the sticky feature box to distinguish it
    RocketLaunchIcon, 
} from '@heroicons/react/24/outline'; 
import { motion, useInView } from 'framer-motion';
import { ICoreValue } from '@/types/typings';

const loader = ({ src }: { src: string }) => {
    return src;
};

// --- ANIMATION VARIANTS (Optimized) ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

// Map string icon names to Heroicon components
const IconMap: { [key: string]: React.ElementType } = {
    CheckIcon,
    UserGroupIcon,
    LockClosedIcon,
    AdjustmentsVerticalIcon,
    ClockIcon,
    Cog6ToothIcon,
    SparklesIcon,
    RocketLaunchIcon,
};

interface FeaturesSectionProps {
    name : string | null | undefined;
    description : string | null | undefined;
    themeSettings: Record<string, any> | null | undefined;
    CoreValues: ICoreValue[] | null | undefined ;
}

// Sample props for demonstration (if context data is missing)
const sampleProps: FeaturesSectionProps = {
    name: 'SwiftCare',
    description: 'Experience seamless booking and unparalleled service quality for all your needs—fast, flexible, and utterly reliable. Simplify your life with us by eliminating the hassle of finding and managing services.',
    themeSettings: { primaryColor: '#059669' },
    CoreValues: [] , 
}

export default function FeaturesSection({ name, description, themeSettings, CoreValues }: FeaturesSectionProps = sampleProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const defaultFeatures: ICoreValue[] = [
        {
            icon: 'RocketLaunchIcon', // New featured icon
            title: 'Lightning-Fast Booking',
            description: 'Find, schedule, and confirm any service in seconds. Seamlessly integrated for modern life.',
        },
        {
            icon: 'UserGroupIcon',
            title: 'Elite Network of Pros',
            description: `Access a curated list of highly-rated, insured, and experienced local service providers.`,
        },
        {
            icon: 'LockClosedIcon',
            title: 'Guaranteed Secure Payment',
            description: 'Protected transactions using cards and digital wallets. Safety is built into every click.',
        },
        {
            icon: 'AdjustmentsVerticalIcon',
            title: 'Customized Solutions',
            description: 'Easily modify and adapt packages to get a service that perfectly matches your specific requirements.',
        },
        {
            icon: 'ClockIcon',
            title: 'Live Schedule Sync',
            description: 'View real-time availability and lock in your appointment instantly. No more phone tag or guesswork.',
        },
        {
            icon: 'SparklesIcon',
            title: 'Quality Vetting Process',
            description: 'Every expert is rigorously vetted and background-checked, ensuring exceptional quality and trust.',
        },
    ];

    const primaryColor = themeSettings?.primaryColor || '#059669';
    const processCoreValues = CoreValues?.length ? CoreValues : defaultFeatures;
    
    const featuredFeature = processCoreValues[0];
    const secondaryFeatures = processCoreValues.slice(1);

    // Helper for gradient background (used for text clip)
    const primaryGradient = `linear-gradient(135deg, ${primaryColor}, #10B981)`; 
    // Static placeholder image/illustration URL
    const illustrationUrl = "https://images.unsplash.com/photo-1556740738-b6766444d324?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";


    return (
        <section id="benefits" ref={ref} className="relative bg-white py-24 px-4 sm:px-6 lg:px-8 text-gray-900 overflow-hidden">
            
            {/* 1. BACKGROUND ELEMENT: Subtle Color Panel */}
            <div className="absolute inset-0 z-0 top-1/2 w-full h-1/2" style={{ backgroundColor: primaryColor + '05' }} />
            
            {/* 2. Main Content Wrapper: Split Layout */}
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 relative z-10">

                {/* --- LEFT COLUMN: Header, Description, Illustration, and CTA (Sticky Marketing Focus) --- */}
                <div className="lg:sticky lg:top-10 lg:h-[80vh] self-start lg:pr-10 flex flex-col justify-center">
                    <motion.div
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                        variants={containerVariants}
                    >
                        <motion.span
                            className="inline-block text-sm font-bold px-4 py-1.5 rounded-full text-white shadow-lg uppercase tracking-wider"
                            style={{ backgroundColor: primaryColor }}
                            variants={itemVariants}
                        >
                            Uncover the {name || 'Platform'} Difference
                        </motion.span>

                        <motion.h2
                            className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tighter text-gray-900 leading-tight"
                            variants={itemVariants}
                        >
                            Why Our Users <span className="text-transparent bg-clip-text" style={{ backgroundImage: primaryGradient }}>Choose Us</span>
                        </motion.h2>

                        <motion.p
                            className="mt-6 text-xl text-gray-700 leading-relaxed max-w-lg border-l-4 pl-4"
                            style={{ borderColor: primaryColor + '40' }}
                            variants={itemVariants}
                        >
                            {description || sampleProps.description}
                        </motion.p>
                        
                        {/* Image/Illustration Anchor */}
                        <motion.div
                             className="relative w-full aspect-video mt-10 rounded-2xl overflow-hidden shadow-2xl transition-shadow duration-300"
                             style={{ boxShadow: `0 10px 40px ${primaryColor}40` }}
                             variants={itemVariants}
                        >
                            <Image
                                src={illustrationUrl}
                                alt="Conceptual illustration of service quality and efficiency"
                                fill
                                loader={loader}
                                sizes="(max-width: 1024px) 100vw, 40vw"
                                className="object-cover"
                            />
                            {/* Feature Badge Overlay */}
                             <motion.div
                                 className="absolute bottom-4 right-4 bg-white py-2 px-4 rounded-full text-sm font-semibold flex items-center shadow-lg"
                                 initial={{ scale: 0 }}
                                 animate={{ scale: 1 }}
                                 transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 10 }}
                             >
                                 <RocketLaunchIcon className="w-5 h-5 mr-1" style={{ color: primaryColor }} />
                                 {featuredFeature.title}
                             </motion.div>
                        </motion.div>
                        
                    </motion.div>
                </div>

                {/* --- RIGHT COLUMN: Secondary Features Grid (Detail Focus) --- */}
                <div className="pt-10 lg:pt-0">
                    {/* Featured/Primary Benefit Card (Highly Prominent) - Placed at the top for emphasis */}
                    {featuredFeature && (
                        <motion.div
                            className="mb-8 bg-white p-8 rounded-3xl border shadow-xl text-left transition-shadow duration-300 hover:shadow-2xl flex flex-col space-y-3"
                            style={{ 
                                border: `2px solid ${primaryColor}20`,
                                boxShadow: `0 15px 40px ${primaryColor}15`,
                                transform: 'scale(1.02)' // Slightly larger for emphasis
                            }}
                            initial={{ opacity: 0, x: 50 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                        >
                            <div className="flex items-center space-x-3">
                                {/* Icon with Primary color background */}
                                <div className='w-10 h-10 flex items-center justify-center rounded-full text-white' style={{ backgroundColor: primaryColor }}>
                                    <RocketLaunchIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{featuredFeature.title}</h3>
                            </div>
                            <p className="mt-2 text-lg text-gray-700">{featuredFeature.description}</p>
                            <button className="mt-4 flex items-center text-base font-semibold transition-colors w-fit" style={{ color: primaryColor }}>
                                See Details
                                <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>
                    )}

                    {/* Secondary Features Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? 'visible' : 'hidden'}
                    >
                        {secondaryFeatures.map(({ icon, title, description }, i) => {
                            const FeatureIcon = IconMap[(icon ?? 'CheckIcon') as keyof typeof IconMap] ?? CheckIcon;
                            return (
                                <motion.div
                                    key={title}
                                    custom={i}
                                    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md transition-all duration-300 group relative flex flex-col hover:shadow-xl hover:translate-y-[-5px]"
                                    style={{ borderBottom: `4px solid ${primaryColor}10` }}
                                    variants={itemVariants}
                                    whileHover={{ boxShadow: `0 15px 30px rgba(0,0,0,0.05)`, scale: 1.01 }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                                        style={{ backgroundColor: primaryColor + '10' }} // Light background for the icon
                                    >
                                        {/* Icon in primary color */}
                                        {FeatureIcon && <FeatureIcon className="w-6 h-6" style={{ color: primaryColor }} />}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-gray-900 relative z-10">
                                        {title}
                                    </h3>
                                    <p className="text-base text-gray-600 mt-1 relative z-10 flex-grow">{description}</p>
                                    
                                    {/* Small primary color hover indicator */}
                                    <div className="absolute bottom-0 left-0 w-0 h-1 rounded-br-2xl transition-all duration-300 group-hover:w-full" style={{ backgroundColor: primaryColor }} />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

            </div>
        </section>
    );
}