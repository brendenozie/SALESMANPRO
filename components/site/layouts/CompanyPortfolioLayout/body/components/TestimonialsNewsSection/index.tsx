"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRightIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// --- INSTITUTIONAL LEDGER CONFIGURATION & MOCK DATA ---

const accentAmber = '#F59E0B'; // System Accent: Amber Node

const mockVerifications = [
    {
        id: 'ver-1',
        authorName: 'Marcus Vance',
        quote: "The company portfolio clearly showcased their expertise and successful projects. It gave me total confidence in their capabilities",
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
        role: 'Managing Director, Global Liquidity Pools',
        order: 1,
    },
    {
        id: 'ver-2',
        authorName: 'Hanae Tanaka',
        quote: "AURUM PRECIOUS METALS LIMITED's automated security systems protected our investments during the recent market volatility. Their team handles physical assets with absolute precision.",
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
        role: 'Chief Operations Officer, Pacific Rim Logistics',
        order: 2,
    },
    {
        id: 'ver-3',
        authorName: 'David Sterling',
        quote: "Compliance architectures within their multi-sovereign clearing systems are flawless. They have transformed how we secure cross-border settlement channels under volatility.",
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
        role: 'Head of Quantitative Risk, Sovereign Capital',
        order: 3,
    },
];

const mockStoreFormData = {
    slug: 'grey-trading',
    testimonials: mockVerifications,
    themeSettings: { primaryColor: accentAmber, secondaryColor: '#18181B' },
};

const useStoreContext = () => ({ storeFormData: mockStoreFormData });


// --- FRAMER MOTION VARIANTS ---

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// --- PARTNER VERIFICATION CARD COMPONENT ---

const VerificationCard = ({ ver, primaryColor }: { ver: typeof mockVerifications[0]; primaryColor: string }) => {
    return (
        <motion.div
            variants={itemVariants}
            className="p-8 rounded-xl border border-zinc-900 bg-zinc-900/10 relative group transition-all duration-300 hover:bg-zinc-900/30 hover:border-zinc-800 flex flex-col justify-between h-full shadow-lg"
        >
            {/* Top Structural Security Node Layout */}
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity duration-300 text-zinc-600">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </div>

            {/* Quote Body Block */}
            <div className="mb-8 relative z-10">
                <p className="text-zinc-300 text-base font-light leading-relaxed tracking-wide text-justify">
                    "{ver.quote}"
                </p>
            </div>

            {/* Counterparty Institutional Identity Panel */}
            <div className="flex items-center mt-auto pt-6 border-t border-zinc-900/60">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-4 border border-zinc-800 bg-zinc-950">
                    <img
                        src={ver.avatarUrl}
                        alt={ver.authorName || 'Asset Counterparty'}
                        className="object-cover w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-90 transition-all duration-500"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://placehold.co/60x60/18181B/A1A1AA?text=${ver.authorName?.split(' ').map(n => n[0]).join('') || 'CP'}`;
                        }}
                    />
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-zinc-200 text-sm tracking-tight truncate">{ver.authorName}</h4>
                    <p className="text-[11px] font-mono mt-0.5 tracking-wider truncate text-zinc-500 group-hover:text-amber-500 transition-colors duration-300">
                        {ver.role}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

// --- MAIN SECTION COMPONENT ---

export default function App({pagedata}: {pagedata: any}) {
    // const { storeFormData } = useStoreContext();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

    const primaryColor = pagedata?.themeSettings?.primaryColor || accentAmber;
    const organizationSlug = pagedata?.slug || 'grey-trading';

    const allVerifications = pagedata?.testimonials || mockVerifications;
    const verificationsToRender = (allVerifications.length >= 3 
        ? allVerifications.slice(0, 3) 
        : allVerifications)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <section id="testimonials" className="py-24 md:py-36 bg-zinc-950 text-white font-sans relative overflow-hidden">
            
            {/* Structural Accent Top Boundary Border */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-zinc-900" />
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                
                {/* Micro-Tracked Infrastructure Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <p className="text-xs uppercase tracking-[0.3em] font-bold text-amber-500 mb-3">
                        Institutional Validation
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight uppercase">
                        What Our Partners Say
                    </h2>
                    <div className="w-12 h-[1px] bg-zinc-800 mx-auto my-6" />
                    <p className="text-sm text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                        We are proud of the trust our partners place in us. Below are verified performance reports and testimonials from the industry leaders we work with every day.
                    </p>
                </motion.div>

                {/* Ledger Verification Grid Matrix */}
                <div className="relative" ref={ref}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={inView ? "show" : "hidden"}
                        className={`grid grid-cols-1 md:grid-cols-2 ${verificationsToRender.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 lg:max-w-4xl lg:mx-auto'} gap-6`}
                    >
                        {verificationsToRender.map((ver:any) => (
                            <VerificationCard
                                key={ver.id}
                                ver={ver}
                                primaryColor={primaryColor}
                            />
                        ))}
                    </motion.div>
                </div>

                {/* Modern Execution CTA Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7 }}
                    className="p-8 md:p-12 rounded-xl border border-zinc-900 bg-zinc-900/10 flex flex-col lg:flex-row items-center justify-between mt-24 text-center lg:text-left shadow-2xl relative"
                >
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 max-w-3xl">
                        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-amber-500 flex-shrink-0 hidden sm:block">
                            <ShieldCheckIcon className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 uppercase">
                                Ready to scale capital throughput safely?
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                                Establish your clearance endpoint today. Coordinate with our clearing desks to isolate liquidity volatility.
                            </p>
                        </div>
                    </div>
                    
                    {/* <motion.a
                        href={`/${organizationSlug}/onboarding`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-8 lg:mt-0 inline-flex items-center gap-3 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-200 hover:text-white font-bold py-3.5 px-8 rounded-xl text-xs tracking-wider uppercase transition-all duration-300 shadow-md whitespace-nowrap"
                    >
                        Initialize Onboarding
                        <ArrowRightIcon className="w-4 h-4 text-zinc-500" />
                    </motion.a> */}
                </motion.div>

            </div>
        </section>
    );
}