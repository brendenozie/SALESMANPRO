"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ArrowRightIcon,
    ShieldCheckIcon,
    SparklesIcon,
    BeakerIcon,
    HandRaisedIcon,
    SunIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const laundryBenefits = [
    {
        title: 'Molecular Care',
        description: 'We use pH-balanced, biodegradable solvents that protect fabric fibers while removing the deepest stains.',
        Icon: BeakerIcon,
    },
    {
        title: 'Artisan Finish',
        description: 'Every garment is hand-pressed by specialists with over 15 years of experience in textile restoration.',
        Icon: HandRaisedIcon,
    },
    {
        title: 'Eco-Guard',
        description: 'Our closed-loop cleaning system ensures 99% of our solvents are recycled, leaving zero footprint.',
        Icon: SunIcon,
    },
];

export default function AboutAndBenefitsSection({ name, description, bannerUrl }: any) {
    const brandColor = '#0d9488'; // Teal 600
    const sectionRef = useRef(null);
    
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
    const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

    return (
        <section ref={sectionRef} className="relative py-24 lg:py-48 bg-white dark:bg-[#080a0c] overflow-hidden text-slate-900 dark:text-white">
            
            {/* Background Texture - Subtle "Thread" Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="grid grid-cols-8 gap-16 transform rotate-12 scale-125">
                    {[...Array(32)].map((_, i) => (
                        <div key={i} className="w-12 h-12 border-t-2 border-l-2 border-teal-600 rounded-tl-full" />
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* --- HEADER: The Philosophy --- */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-32">
                    <div className="max-w-2xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className="h-px w-12 bg-teal-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">The Fabric Philosophy</span>
                        </motion.div>
                        <motion.h2 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] uppercase"
                        >
                            REVIVING THE <br />
                            <span className="font-serif italic font-light text-slate-300">Soul of Cloth.</span>
                        </motion.h2>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="lg:max-w-md pb-2"
                    >
                        <p className="text-slate-500 text-lg font-medium leading-relaxed dark:text-slate-400">
                            {description || `At ${name || 'Pristine'}, we treat every thread as a heritage piece. Our process isn't just about cleaning—it's about extending the life of your most cherished investments.`}
                        </p>
                    </motion.div>
                </div>

                {/* --- INTERACTIVE VISUAL CANVAS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center mb-40">
                    
                    {/* Left: Masked Image with Parallax */}
                    <div className="lg:col-span-7 relative group">
                        <div className="relative aspect-[4/5] md:aspect-video rounded-[3rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-2xl">
                            <motion.div style={{ scale: imgScale }} className="h-full w-full">
                                <Image decoding="async"
                                    src={bannerUrl || "https://images.unsplash.com/photo-1545173168-9f1947eebb9f?q=80&w=2070"}
                                    alt="Textile Care"
                                    fill
                                    className="object-cover transition-all duration-1000 group-hover:scale-105"
                                />
                            </motion.div>
                            
                            {/* Soft Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/20 via-transparent to-transparent" />
                            
                            {/* Floating "Eco" Badge */}
                            <div className="absolute top-10 left-10 p-6 bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-xl">
                                <p className="text-[10px] font-black tracking-[0.3em] text-teal-600 uppercase mb-1">Eco-Certified</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-slate-900 tracking-tighter">GreenEarth®</p>
                                    <CheckBadgeIcon className="w-5 h-5 text-teal-600" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Satisfaction Card */}
                        <motion.div 
                            initial={{ x: 50, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            className="absolute -bottom-10 -right-4 md:right-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 hidden md:block"
                        >
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm">
                                            <Image decoding="async" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="client" width={40} height={40}/>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="flex gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => <SparklesIcon key={i} className="w-3 h-3 text-teal-500 fill-teal-500" />)}
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Trusted with</p>
                                    <p className="text-lg font-bold text-slate-900 leading-tight">12k+ Garments</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: The Commitment */}
                    <motion.div className="lg:col-span-5 space-y-12" style={{ y: textY }}>
                        <div className="space-y-6">
                            <h3 className="text-4xl font-bold tracking-tighter uppercase leading-tight">
                                UNCOMPROMISING <br />
                                <span className="text-teal-600">FIBER-FIRST</span> TECHNOLOGY.
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-light">
                                We’ve replaced harsh chemicals with fluid silicone and organic detergents. It’s better for the planet, and significantly gentler on your silk, wool, and couture pieces.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: ShieldCheckIcon, label: 'Full Insurance Coverage' },
                                { icon: SparklesIcon, label: 'White Glove Delivery' },
                                { icon: CheckBadgeIcon, label: 'Anti-Allergen Cleaning' },
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center group-hover:bg-teal-600 group-hover:border-teal-600 transition-all duration-300">
                                        <badge.icon className="w-5 h-5 text-teal-600 group-hover:text-white" />
                                    </div>
                                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{badge.label}</span>
                                </div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-6 py-6 px-12 rounded-full bg-teal-600 font-bold text-white shadow-xl shadow-teal-600/20 transition-all"
                        >
                            Schedule a Pickup
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </motion.div>
                </div>

                {/* --- BENEFITS BENTO --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {laundryBenefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-12 rounded-[3.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 hover:shadow-2xl hover:shadow-teal-600/5 transition-all duration-500 relative overflow-hidden"
                        >
                            {/* Hover Soft Background */}
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl mb-10 flex items-center justify-center bg-teal-50 dark:bg-teal-950/30 group-hover:bg-teal-600 transition-all duration-500">
                                    <benefit.Icon className="w-8 h-8 text-teal-600 group-hover:text-white transition-colors" />
                                </div>
                                
                                <h4 className="text-2xl font-bold uppercase tracking-tighter mb-4 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                                    {benefit.title}
                                </h4>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                                    {benefit.description}
                                </p>
                                
                                <div className="mt-10 h-[2px] w-12 bg-slate-100 dark:bg-slate-800 group-hover:w-full transition-all duration-700 group-hover:bg-teal-600/30" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}