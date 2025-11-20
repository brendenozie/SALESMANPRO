'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon,
    HandThumbUpIcon,
    TagIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/solid';

// Utility function for Next.js Image loader
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Define fallback benefits with icons and descriptions
const defaultBenefits = [
    {
        title: 'Effortless Booking',
        description: 'A seamless, intuitive process that gets you scheduled in just a few clicks.',
        Icon: CheckCircleIcon,
    },
    {
        title: 'Unmatched Quality',
        description: 'Our certified professionals are dedicated to delivering excellence every time.',
        Icon: HandThumbUpIcon, 
    },
    {
        title: 'Transparent Pricing',
        description: 'No hidden fees, no surprises. What you see is exactly what you pay.',
        Icon: TagIcon, 
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

// Sample data
const sampleData = {
    name: 'SwiftServe',
    description: 'At SwiftServe, we’re committed to connecting you with top-tier professionals for all your needs. From home services to personal care, our platform guarantees a seamless and satisfying experience from start to finish.',
    bannerUrl: 'https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    themeSettings: {
        primaryColor: '#059669', // Emerald 600
        secondaryColor: '#FBBF24', // Amber 400
    },
    promotions: [],
};


export default function AboutAndBenefitsSection({name, description, bannerUrl, themeSettings, promotions}: AboutAndBenefitsSectionProps) {
    
    const primaryColor = themeSettings?.primaryColor || sampleData.themeSettings.primaryColor;
    const secondaryColor = themeSettings?.secondaryColor || sampleData.themeSettings.secondaryColor;
    const itemsRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: itemsRef, offset: ["start end", "end start"] });

    // Parallax effect for the central image
    const yImage = useTransform(scrollYProgress, [0, 1], [-50, 50]);

    // Logic to determine benefits (limiting to 3 for the new 3-column layout)
    const brandBenefits = (promotions?.[0]?.perks?.length > 0
        ? promotions?.[0].perks.map((perk: any) => ({
              title: perk.label,
              description: perk.description || '',
              Icon: StarIcon,
          }))
        : defaultBenefits).slice(0, 3);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, 
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { 
                type: "spring", 
                stiffness: 80, 
                damping: 15, 
                mass: 0.8,
                duration: 0.6
            } 
        },
    };

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

    return (
        <section className="relative bg-white py-24 lg:py-36 text-gray-900 overflow-hidden" ref={sectionRef}>
            
            {/* 🎨 Background: Large Primary Color Shape */}
            <div className="absolute top-0 w-full h-[50%] bg-gray-50 z-0">
                {/* Optional: Add a subtle texture or line to the background */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                    <div className="h-full w-full bg-repeat bg-[size:30px_30px] [background-image:radial-gradient(circle_at_center,_#9ca3af_1px,_transparent_0)]"></div>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

                {/* --- 1. Top Section: Heading and Description --- */}
                <motion.div
                    className="text-center max-w-4xl mx-auto space-y-4 mb-20"
                    initial="hidden"
                    animate={isInView ? "show" : "hidden"}
                    variants={containerVariants}
                >
                    <motion.span
                        className="inline-block text-sm font-bold px-5 py-2 rounded-full shadow-md uppercase tracking-wider"
                        style={{ backgroundColor: primaryColor, color: 'white' }}
                        variants={itemVariants}
                    >
                        Our Core Values
                    </motion.span>
                    
                    <motion.h2
                        className="text-4xl sm:text-6xl font-extrabold leading-tight text-gray-900"
                        variants={itemVariants}
                    >
                        Why Clients Choose <span style={{ color: primaryColor }}>{name || 'SwiftServe'}</span>
                    </motion.h2>
                    
                    <motion.p
                        className="text-xl text-gray-600 leading-relaxed pt-2"
                        variants={itemVariants}
                    >
                        {description || sampleData.description}
                    </motion.p>
                </motion.div>

                {/* --- 2. Middle Section: Image and Floating Card --- */}
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-24" ref={itemsRef}>
                    
                    {/* Image Column (Left) */}
                    <motion.div
                        style={{ y: yImage }} // Apply Parallax effect
                        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white/60 z-10 mx-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        whileHover={{ 
                            boxShadow: `0 40px 80px -20px rgba(0, 0, 0, 0.5), 0 0 0 4px ${primaryColor}40`
                        }}
                    >
                        <Image
                            src={bannerUrl || sampleData.bannerUrl}
                            loader={loader}
                            alt="A happy customer enjoying a service"
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                         {/* Secondary Color accent box */}
                        <div className="absolute top-0 left-0 w-24 h-24 rounded-br-3xl flex items-center justify-center text-white shadow-xl" 
                            style={{ backgroundColor: secondaryColor }}>
                            <SparklesIcon className="w-12 h-12 text-white/90" />
                        </div>
                    </motion.div>

                    {/* Placeholder/Extra Detail Column (Right) */}
                    <motion.div
                        className="lg:pl-10 space-y-6"
                        initial={{ opacity: 0, x: 30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <h3 className="text-3xl font-extrabold text-gray-900 leading-snug">
                            Dedicated to Building <span style={{ color: primaryColor }}>Trust and Reliability</span> in Every Interaction.
                        </h3>
                        <p className="text-lg text-gray-600">
                            We meticulously vet every professional and streamline every step of the booking process, ensuring your satisfaction is always our top priority. We're more than a service platform; we're your partner in wellness and efficiency.
                        </p>
                        <motion.button
                            className="flex items-center space-x-2 text-lg font-semibold py-3 px-6 rounded-full transition-all duration-300 group mt-6 border-2"
                            style={{ color: primaryColor, borderColor: primaryColor + '40' }}
                            whileHover={{ backgroundColor: primaryColor, color: 'white' }}
                        >
                            <span>View All Commitments</span>
                            <ArrowRightIcon className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </motion.button>
                    </motion.div>

                </div>

                {/* --- 3. Bottom Section: Elevated Benefits Grid (3 Columns) --- */}
                <div className="pt-10 lg:pt-20">
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10"
                        initial="hidden"
                        animate={isInView ? "show" : "hidden"}
                        variants={containerVariants}
                    >
                        {brandBenefits.map(({ title, description, Icon }:{ title: string; description: string; Icon: React.ElementType }, i:number) => (
                            <motion.div
                                key={title}
                                className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col space-y-4 h-full transition-all duration-300 transform group"
                                style={{ 
                                    boxShadow: `0 10px 30px ${primaryColor}10`, // Subtle primary color shadow
                                }}
                                whileHover={{ 
                                    scale: 1.05, 
                                    y: -10,
                                    boxShadow: `0 20px 40px ${primaryColor}20`,
                                }}
                                variants={itemVariants}
                            >
                                {/* Icon Container: Theme-aware circle */}
                                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-md ring-4 ring-white transition-all duration-300"
                                    style={{ 
                                        backgroundColor: primaryColor,
                                    }}
                                >
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                
                                {/* Text Content */}
                                <div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 leading-snug">
                                        {title}
                                    </h3>
                                    <p className="text-md text-gray-600 mt-2">{description}</p>
                                </div>
                                
                                {/* Bottom Accent Line on Hover */}
                                <div className="w-full h-1 mt-auto rounded-full transition-all duration-300" 
                                    style={{ backgroundColor: primaryColor + '40', width: '25%' }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

            </div>
        </section>
    );
}