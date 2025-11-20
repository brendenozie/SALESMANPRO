'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BriefcaseIcon,
    UsersIcon,
    ChartBarIcon,
    StarIcon,
    ArrowRightIcon,
    SparklesIcon,
    RocketLaunchIcon, // A great icon for ambition/tagline
    HandRaisedIcon // Good for dedication/contact
} from '@heroicons/react/24/outline';
import { HeroSlide, Stat } from '@/types/typings';
// Removed Next.js Image for standalone runnability, replaced with standard <img>
// import Image from 'next/image';

const storeData = {
    name: 'John Doe',
    tagline: 'Dedicated to Excellence and Innovation',
    description: `I am a passionate professional committed to crafting exceptional experiences and delivering innovative solutions. With a relentless focus on quality and a deep understanding of modern challenges, I help individuals and businesses achieve their full potential. My work is driven by curiosity, precision, and a genuine desire to make a lasting impact. My philosophy is simple: start with the client's end goal and work backward to design a flawless journey.`,
    themeSettings: {
        primaryColor: '#6366F1', // Indigo 500
        secondaryColor: '#EC4899', // Pink 500
        accentColor: '#F97316',
    },
    heroSlides: [{ productImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0f19c307d8?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }],
    slug: 'john-doe',
    contactEmail: 'contact@example.com',
};

// Map stat labels to appropriate HeroIcons
const iconMap: { [key: string]: React.ElementType } = {
    'Years Experience': BriefcaseIcon,
    'Clients Served': UsersIcon,
    'Projects Completed': ChartBarIcon,
    'Awards': StarIcon,
};

// Framer Motion Variants
const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: 'easeOut',
            staggerChildren: 0.1,
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
            damping: 12,
        },
    },
};

const statVariants = {
    hidden: { opacity: 0, scale: 0.9, rotateX: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 14,
        },
    },
};

interface AboutSectionLightProps {
    name: string;
    bannerUrl: string | undefined | null;
    tagline: string | undefined | null;
    description: string | undefined | null;
    themeSettings: Record<string, any> | undefined | null;
    stats: Stat[] | undefined | null;
    heroSlides: HeroSlide[] | undefined | null;
    slug: string | undefined | null;
    contactEmail: string | undefined | null;
}

export default function AboutSectionLight({ name, tagline, bannerUrl, description, themeSettings, stats, heroSlides, slug, contactEmail }: AboutSectionLightProps) {
    
    // Fallback colors
    const primaryColor = themeSettings?.primaryColor || '#6366F1';
    const secondaryColor = themeSettings?.secondaryColor || '#EC4899';

    const title = name || storeData.name;
    const aboutTagline = tagline || storeData.tagline;
    const aboutText = description || storeData.description;

    const defaultStatsData = [
        { label: 'Years Experience', value: '10+' },
        { label: 'Clients Served', value: '250+' },
        { label: 'Projects Completed', value: '300+' },
        { label: 'Awards', value: '15' },
    ];

    // Combine stats data with corresponding icons
    const statsData: Stat[] = (Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData).map(stat => ({
        ...stat,
    }));

    const imgSrc = heroSlides?.[0]?.productImageUrl || storeData.heroSlides[0].productImageUrl || bannerUrl;
    const contactHref = contactEmail ? `mailto:${contactEmail}` : '#contact';

    return (
        <AnimatePresence>
            <section 
                id="about" 
                className="relative overflow-hidden bg-white text-gray-900 py-24 md:py-36"
            >
                {/* Subtle Geometric Background */}
                <div 
                    className="absolute inset-0 z-0 opacity-5 pointer-events-none"
                    style={{
                        background: `repeating-linear-gradient(-45deg, #f0f0f0, #f0f0f0 2px, transparent 2px, transparent 4px)`
                    }}
                />
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                    {/* Left Column (lg:col-span-5): Dynamic Image Presentation */}
                    <motion.div
                        className="lg:col-span-5 relative order-2 lg:order-1 flex justify-center lg:justify-start"
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {/* Image Container with Stylish Frame */}
                        <div 
                            className="w-full max-w-sm md:max-w-md h-[400px] md:h-[550px] relative rounded-3xl shadow-2xl overflow-hidden"
                            style={{ boxShadow: `0 25px 50px -12px ${primaryColor}40` }}
                        >
                            <img
                                src={imgSrc || 'https://placehold.co/600x800/6366F1/FFFFFF?text=Professional+Portrait'}
                                alt={`Portrait of ${title}`}
                                className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                    e.currentTarget.src = 'https://placehold.co/600x800/6366F1/FFFFFF?text=Professional+Portrait';
                                }}
                            />
                            {/* Gradient overlay for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-100/30 to-transparent" />
                        </div>
                    </motion.div>

                    {/* Right Column (lg:col-span-7): Text Content and Enhanced Stats */}
                    <motion.div
                        className="lg:col-span-7 flex flex-col justify-center space-y-8 order-1 lg:order-2"
                        variants={sectionVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        
                        <motion.div variants={itemVariants} className="flex items-center space-x-3">
                            <SparklesIcon className="w-8 h-8" style={{ color: secondaryColor }} />
                            <p
                                className="uppercase tracking-[0.3em] text-sm font-extrabold"
                                style={{ color: secondaryColor }}
                            >
                                OUR VISION & MISSION
                            </p>
                        </motion.div>

                        <motion.h2
                            className="text-5xl md:text-6xl font-extrabold leading-snug drop-shadow-sm text-gray-900"
                            variants={itemVariants}
                        >
                            Hello, I'm <span style={{ color: primaryColor }}>{title}</span>
                            <span className="block text-3xl font-light mt-2 text-gray-700">{aboutTagline}</span>
                        </motion.h2>

                        <motion.p
                            className="text-xl text-gray-600 leading-relaxed max-w-prose border-l-4 pl-4"
                            style={{ borderColor: primaryColor }}
                            variants={itemVariants}
                        >
                            {aboutText}
                        </motion.p>

                        {/* Stats Grid - Feature Block Style */}
                        <motion.div
                            className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-100"
                            variants={sectionVariants}
                        >
                            {statsData.map((stat, idx) => {
                                let IconComponent = iconMap[stat.label] || ChartBarIcon;
                                
                                return (
                                <motion.div
                                    key={idx}
                                    className="p-5 bg-gray-50 rounded-xl transition-all duration-300 transform hover:bg-white hover:shadow-lg flex flex-col items-start space-y-2"
                                    variants={statVariants}
                                    whileHover={{ y: -3 }}
                                >
                                    <IconComponent className="w-8 h-8 text-indigo-500" />                                    
                                    <p className="text-3xl font-extrabold text-gray-900">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">
                                        {stat.label}
                                    </p>
                                </motion.div>
                            ); })}
                        </motion.div>

                        {/* Call to Action - Vibrant Gradient Button */}
                        <motion.div variants={itemVariants} className="mt-6">
                            <a
                                href={contactHref}
                                className="inline-flex items-center justify-center px-10 py-4 rounded-full text-lg font-bold shadow-2xl transition-all duration-300 transform hover:scale-105"
                                style={{
                                    // Use a gradient for a powerful visual appeal
                                    background: `linear-gradient(45deg, ${secondaryColor}, ${primaryColor})`,
                                    color: 'white',
                                    boxShadow: `0 15px 30px -5px ${secondaryColor}66`,
                                }}
                            >
                                Get in Touch Today
                                <HandRaisedIcon className="ml-3 w-5 h-5" />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </AnimatePresence>
    );
}