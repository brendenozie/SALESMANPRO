'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import {
    CheckCircleIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ClockIcon,
    StarIcon,
    HandThumbUpIcon, // Used for 'Quality'
    TagIcon, // Used for 'Pricing'
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
        Icon: HandThumbUpIcon, // Changed to HandThumbUpIcon
    },
    {
        title: 'Transparent Pricing',
        description: 'No hidden fees, no surprises. What you see is exactly what you pay.',
        Icon: TagIcon, // Changed to TagIcon
    },
    {
        title: '24/7 Flexibility', // Refined title
        description: 'We offer flexible scheduling to fit your busy life, anytime, anywhere.',
        Icon: ClockIcon,
    },
];

export default function AboutAndBenefitsSection() {
    const { storeFormData } = useStoreContext();

    // Sample data (Using our established Emerald/Amber colors)
    const sampleData = {
        name: 'SwiftServe',
        description: 'At SwiftServe, we’re committed to connecting you with top-tier professionals for all your needs. From home services to personal care, our platform guarantees a seamless and satisfying experience from start to finish. We handle the complexity so you can enjoy the results.',
        bannerUrl: 'https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        themeSettings: {
            primaryColor: '#059669', // Emerald 600
            secondaryColor: '#FBBF24', // Amber 400
        },
        promotions: [],
    };

    const {
        description,
        bannerUrl,
        themeSettings,
        promotions,
    } = storeFormData || sampleData;

    const primaryColor = themeSettings?.primaryColor || '#059669';
    const secondaryColor = themeSettings?.secondaryColor || '#FBBF24';

    // Logic to determine benefits
    const brandBenefits = promotions?.[0]?.perks?.length > 0
        ? promotions[0].perks.map((perk: any) => ({
            title: perk.label,
            description: perk.description || '',
            Icon: StarIcon, // Generic icon for dynamic perks
        }))
        : defaultBenefits;

    // Animation variants for staggered effects
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Faster stagger for snappier feel
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12, mass: 0.5 } },
    };

    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

    return (
        <section className="relative bg-white py-24 lg:py-36 text-gray-900 overflow-hidden" ref={sectionRef}>
            
            {/* 🎨 Background Grids & Blobs (Increased Opacity/Refined Look) */}
            <div className="absolute inset-0 z-0 opacity-10 blur-3xl">
                <motion.div
                    className="absolute rounded-full -top-40 -left-40 w-96 h-96"
                    style={{ backgroundColor: primaryColor }}
                    animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
                />
                <motion.div
                    className="absolute rounded-full -bottom-40 -right-40 w-[500px] h-[500px]"
                    style={{ backgroundColor: secondaryColor }}
                    animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 5 }}
                />
            </div>

            {/* Subtle Texture Grid for depth */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                <div className="h-full w-full bg-repeat bg-[size:40px_40px] [background-image:radial-gradient(circle_at_center,_#9ca3af_2px,_transparent_0)]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    
                    {/* 🖼️ Left Column: Image with 3D Pop and Shadow */}
                    <motion.div
                        className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white/60 transition-all duration-500 group border border-gray-100"
                        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                        animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                        transition={{ duration: 0.9, ease: [0.17, 0.67, 0.83, 0.67] }} // Custom spring-like easing
                    >
                        <Image
                            src={bannerUrl || 'https://images.unsplash.com/photo-1542626991-cbc9322c34d4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                            loader={loader}
                            alt="A happy customer enjoying a service"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        {/* Corner Accent Box */}
                        <div className="absolute bottom-0 right-0 w-28 h-28 p-4 flex items-center justify-center text-white font-bold text-sm uppercase tracking-widest rounded-tl-3xl shadow-lg" 
                             style={{ backgroundColor: secondaryColor }}>
                            {/* Decorative element, e.g., Sparkles icon here */}
                            <SparklesIcon className="w-10 h-10 text-white animate-pulse-slow" />
                        </div>
                    </motion.div>

                    {/* 📝 Right Column: Text Content and Benefits Grid */}
                    <motion.div
                        className="space-y-8"
                        initial="hidden"
                        animate={isInView ? "show" : "hidden"}
                        variants={containerVariants}
                    >
                        {/* Subtitle Badge */}
                        <motion.span
                            className="inline-block text-sm font-bold px-5 py-2 rounded-full shadow-lg uppercase tracking-wider"
                            style={{ backgroundColor: primaryColor, color: 'white' }}
                            variants={itemVariants}
                        >
                            Our Commitment to You
                        </motion.span>
                        
                        {/* Main Heading */}
                        <motion.h2
                            className="text-4xl sm:text-6xl font-extrabold leading-tight text-gray-900"
                            variants={itemVariants}
                        >
                            Experience the <span style={{ color: primaryColor }}>Difference</span>: Seamless Service, Unmatched Quality.
                        </motion.h2>
                        
                        {/* Description */}
                        <motion.p
                            className="text-xl text-gray-600 max-w-xl leading-relaxed border-l-4 pl-4"
                            style={{ borderColor: primaryColor }}
                            variants={itemVariants}
                        >
                            {description || 'We are dedicated to providing an unparalleled service experience, focusing on your comfort, convenience, and complete satisfaction.'}
                        </motion.p>

                        {/* Benefits Grid (Visually Enhanced Cards) */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 pt-8"
                            variants={containerVariants}
                        >
                            {brandBenefits.map(({ title, description, Icon }, i) => (
                                <motion.div
                                    key={title}
                                    // Removed border/shadow from card body to emphasize the icon block
                                    className="flex items-start space-x-5 transition-all duration-200 group"
                                    variants={itemVariants}
                                >
                                    {/* Icon with Strong Gradient and Animated Hover */}
                                    <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6"
                                        style={{
                                            backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, #10B981)`,
                                            boxShadow: `0 8px 25px ${primaryColor}66`,
                                        }}
                                    >
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    
                                    {/* Text Content */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">{title}</h3>
                                        {description && <p className="text-md text-gray-500 mt-1">{description}</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}