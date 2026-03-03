"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    CalendarDaysIcon,
    VideoCameraIcon,
    ChartBarSquareIcon,
    SparklesIcon,
    CheckCircleIcon,
    FireIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

const loader = ({ src }: { src: string }) => src;

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

const floatAnimation = {
    y: [0, -12, 0],
    transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

// --- Sub-Components ---

const FeaturePill = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-3 px-4 py-2 border border-white/5 bg-white/[0.02] backdrop-blur-sm group hover:border-orange-500/50 transition-colors duration-500">
        <Icon className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
        <span className="text-gray-400 group-hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-colors">{text}</span>
    </div>
);

const TacticalStat = ({ icon: Icon, label, value, className, delay = 0 }: any) => (
    <motion.div
        className={`absolute z-30 p-5 bg-black/80 border border-white/10 backdrop-blur-md flex flex-col gap-2 min-w-[160px] ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        animate={floatAnimation}
        transition={{ delay }}
    >
        <div className="flex justify-between items-center">
            <Icon className="w-5 h-5 text-orange-500" />
            <div className="h-1 w-1 rounded-full bg-orange-500 animate-pulse" />
        </div>
        <div>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">{label}</p>
            <p className="text-xl font-black text-white italic tracking-tighter uppercase">{value}</p>
        </div>
    </motion.div>
);

export default function AppPromotion() {
    return (
        <section className="relative py-32 overflow-hidden bg-[#050505]">
            {/* Structural Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-20">

                    {/* LEFT: Content */}
                    <motion.div
                        className="flex-1 order-2 lg:order-1"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                            <div className="h-[1px] w-12 bg-orange-500" />
                            <span className="text-orange-500 text-xs font-black tracking-[0.4em] uppercase">System v2.0 Operational</span>
                        </motion.div>

                        <motion.h2 variants={itemVariants} className="text-6xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.8] mb-10">
                            Digital <br />
                            <span className="text-white/10 group-hover:text-white transition-colors duration-700">Architecture</span>
                        </motion.h2>

                        <motion.p variants={itemVariants} className="text-gray-500 font-medium text-sm md:text-base leading-relaxed uppercase mb-12 max-w-lg">
                            Your performance ecosystem, recalibrated. AI-driven protocols, biometric syncing, and world-class instructional content delivered with surgical precision.
                        </motion.p>

                        {/* Tactical Grid */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mb-12 overflow-hidden">
                            <FeaturePill icon={CpuChipIcon} text="Neural Sync" />
                            <FeaturePill icon={VideoCameraIcon} text="4K Live Stream" />
                            <FeaturePill icon={ChartBarSquareIcon} text="Bio-Analytics" />
                            <FeaturePill icon={CalendarDaysIcon} text="Duty Cycles" />
                        </motion.div>

                        {/* Download Interface */}
                        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-8">
                            <div className="flex gap-4">
                                <a href="#" className="h-14 w-40 bg-white hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center p-4">
                                    <Image src="/images/app-store-badge.svg" alt="iOS" width={120} height={40} className="invert group-hover:invert-0" loader={loader}/>
                                </a>
                                <a href="#" className="h-14 w-40 bg-white hover:bg-orange-500 transition-colors rounded-sm flex items-center justify-center p-4">
                                    <Image src="/images/play-store-badge.svg" alt="Android" width={120} height={40} className="invert" loader={loader}/>
                                </a>
                            </div>
                            
                            <div className="flex items-center gap-4 py-2 px-4 border-l border-white/10">
                                <div className="p-1 bg-white">
                                    <div className="w-8 h-8 bg-black flex items-center justify-center text-[7px] font-black text-white">QR</div>
                                </div>
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-tight">Instant <br/> Deploy</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT: Visual Command Center */}
                    <motion.div
                        className="flex-1 relative order-1 lg:order-2 py-12"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        {/* Central Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-[100px]" />

                        {/* Floating Telemetry */}
                        <TacticalStat 
                            icon={FireIcon} 
                            label="Metabolic Output" 
                            value="1,240 KCAL" 
                            className="-top-4 -left-12 hidden xl:flex" 
                        />

                        <TacticalStat 
                            icon={CheckCircleIcon} 
                            label="Compliance" 
                            value="98.4%" 
                            className="bottom-12 -right-8 hidden xl:flex" 
                            delay={0.5}
                        />

                        {/* The Device */}
                        <div className="relative z-20 group">
                            <div className="relative w-[280px] h-[580px] mx-auto border-[12px] border-[#111] rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
                                <Image
                                    src="/images/app-mockup-main.png"
                                    alt="Interface"
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    loader={loader}
                                    priority
                                />
                                {/* Scanning line effect */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-scan z-30" />
                                
                                {/* Overlay Glass */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            </div>
                            
                            {/* Device Frame Accents */}
                            <div className="absolute -inset-4 border border-white/5 rounded-[4rem] pointer-events-none group-hover:border-orange-500/20 transition-colors duration-1000" />
                        </div>
                    </motion.div>

                </div>
            </div>
            
            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </section>
    );
}