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
} from '@heroicons/react/24/outline';
import { HeroSlide, Stat } from '@/types/typings';

const storeData = {
    name: 'John Doe',
    tagline: 'Dedicated to Excellence and Innovation',
    description: `I am a passionate professional committed to crafting exceptional experiences and delivering innovative solutions. With a relentless focus on quality and a deep understanding of modern challenges, I help individuals and businesses achieve their full potential. My work is driven by curiosity, precision, and a genuine desire to make a lasting impact. My philosophy is simple: start with the client's end goal and work backward to design a flawless journey.`,
    themeSettings: {
        primaryColor: '#000000',
    },
    heroSlides: [{ productImageUrl: 'https://images.unsplash.com/photo-1519085360753-af0f19c307d8?q=80&w=2787&auto=format&fit=crop' }],
};

const iconMap: { [key: string]: React.ElementType } = {
    'Years Experience': BriefcaseIcon,
    'Clients Served': UsersIcon,
    'Projects Completed': ChartBarIcon,
    'Awards': StarIcon,
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 110,
            damping: 16,
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

export default function AboutSectionLight({ name, tagline, bannerUrl, description, themeSettings, stats, heroSlides, contactEmail }: AboutSectionLightProps) {
    
    const primaryColor = themeSettings?.primaryColor || '#000000';

    const title = name || storeData.name;
    const aboutTagline = tagline || storeData.tagline;
    const aboutText = description || storeData.description;

    const defaultStatsData = [
        { label: 'Years Experience', value: '10+' },
        { label: 'Clients Served', value: '250+' },
        { label: 'Projects Completed', value: '300+' },
        { label: 'Awards', value: '15' },
    ];

    const statsData: Stat[] = (Array.isArray(stats) && stats.length > 0 ? stats : defaultStatsData).map(stat => ({
        ...stat,
    }));

    const imgSrc = heroSlides?.[0]?.productImageUrl || storeData.heroSlides[0].productImageUrl || bannerUrl;
    const contactHref = contactEmail ? `mailto:${contactEmail}` : '#contact';

    return (
        <AnimatePresence>
            <section 
                id="about" 
                className="relative overflow-hidden bg-white text-slate-900 py-24 lg:py-32 border-b border-slate-100"
            >
                {/* Minimal Wire Grid Background Sync */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />
                
                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Left Column: Monochromatic Framed Media Port */}
                    <motion.div
                        className="lg:col-span-5 relative order-2 lg:order-1 flex justify-center lg:justify-start"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.div 
                            className="w-full max-w-sm lg:max-w-md aspect-[4/5] relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group transition-all duration-200 hover:border-slate-900 hover:shadow-xl"
                            variants={itemVariants}
                        >
                            <img
                                src={imgSrc || 'https://placehold.co/600x800/000000/FFFFFF?text=Professional+Portrait'}
                                alt={`Portrait of ${title}`}
                                className="w-full h-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                    e.currentTarget.src = 'https://placehold.co/600x800/000000/FFFFFF?text=Professional+Portrait';
                                }}
                            />
                        </motion.div>
                    </motion.div>

                    {/* Right Column: Architectural Content Matrix */}
                    <motion.div
                        className="lg:col-span-7 flex flex-col justify-center items-start order-1 lg:order-2"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        {/* Minimal Tagline Badge */}
                        <motion.div 
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
                            variants={itemVariants}
                        >
                          <SparklesIcon className="w-4 h-4 text-slate-600" />
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                            Strategic Overview
                          </p>
                        </motion.div>

                        {/* Title Headings */}
                        <motion.h2
                            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900 mb-6"
                            variants={itemVariants}
                        >
                            Hello, I'm <span style={{ color: primaryColor }}>{title}</span>
                            <span className="block text-2xl sm:text-3xl font-normal text-slate-500 mt-3 tracking-tight">{aboutTagline}</span>
                        </motion.h2>

                        {/* Professional Biography Narrative */}
                        <motion.p
                            className="text-base text-slate-500 leading-relaxed font-normal max-w-2xl mb-10 pb-8 border-b border-slate-100"
                            variants={itemVariants}
                        >
                            {aboutText}
                        </motion.p>

                        {/* Integrated Stats Matrix */}
                        <motion.div
                            className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-10"
                            variants={containerVariants}
                        >
                            {statsData.map((stat, idx) => {
                                let IconComponent = iconMap[stat.label] || ChartBarIcon;
                                
                                return (
                                    <motion.div
                                        key={idx}
                                        className="group p-5 bg-white border border-slate-200 rounded-xl flex flex-col items-start gap-2.5 transition-all duration-200 hover:border-slate-900 hover:shadow-lg"
                                        variants={itemVariants}
                                        whileHover={{ y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 transition-colors duration-200 group-hover:bg-slate-900 group-hover:border-slate-900">
                                            <IconComponent className="w-4 h-4 text-slate-800 transition-colors duration-200 group-hover:text-white" strokeWidth={2} />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">
                                                {stat.value}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                                {stat.label}
                                            </p>
                                        </div>
                                    </motion.div>
                                ); 
                            })}
                        </motion.div>

                        {/* Micro-Action Control Node */}
                        <motion.div variants={itemVariants} className="w-full sm:w-auto">
                            <a
                                href={contactHref}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider px-7 py-4 rounded-xl border border-slate-900 bg-slate-900 text-white transition-all duration-200 hover:bg-slate-800 active:scale-95 shadow-sm"
                            >
                                Get in Touch Today
                                <ArrowRightIcon className="w-4 h-4" strokeWidth={2.5} />
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </AnimatePresence>
    );
}