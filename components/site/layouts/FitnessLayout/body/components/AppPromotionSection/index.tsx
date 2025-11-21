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
    FireIcon
} from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 20 }
    }
};

const floatAnimation = {
    y: [-10, 10, -10],
    transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

const floatAnimationDelayed = {
    y: [10, -10, 10],
    transition: {
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

// --- Sub-Components for cleaner code ---

const FeaturePill = ({ icon: Icon, text }: { icon: any, text: string }) => (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl hover:bg-white/10 transition-colors duration-300">
        <div className="p-2 rounded-full bg-indigo-500/20">
            <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="text-gray-200 font-medium text-sm md:text-base">{text}</span>
    </div>
);

const FloatingStatCard = ({ icon: Icon, label, value, color, className, delay }: any) => (
    <motion.div
        className={`absolute z-20 p-4 rounded-2xl bg-gray-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[180px] ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        animate={delay ? floatAnimationDelayed : floatAnimation}
    >
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
        </div>
    </motion.div>
);

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
export default function AppPromotion() {
    return (
        <section className="relative py-24 lg:py-32 overflow-hidden bg-gray-950">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* LEFT: Content */}
                    <motion.div
                        className="flex-1 text-center lg:text-left"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/30 border border-indigo-500/30 mb-8">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                            </span>
                            <span className="text-indigo-300 text-sm font-semibold tracking-wide uppercase">New Version 2.0 Live</span>
                        </motion.div>

                        <motion.h2 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                            Pocket-Sized <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                                Personal Trainer
                            </span>
                        </motion.h2>

                        <motion.p variants={itemVariants} className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Experience fitness evolved. Join live classes, track detailed biometrics, and follow AI-generated workout plans tailored specifically to your goals.
                        </motion.p>

                        {/* Feature Pills Grid */}
                        <motion.div variants={itemVariants} className="flex flex-wrap justify-center lg:justify-start gap-4 mb-12">
                            <FeaturePill icon={CalendarDaysIcon} text="Smart Scheduling" />
                            <FeaturePill icon={VideoCameraIcon} text="Live 4K Classes" />
                            <FeaturePill icon={ChartBarSquareIcon} text="Real-time Analytics" />
                            <FeaturePill icon={SparklesIcon} text="AI Coaching" />
                        </motion.div>

                        {/* App Store Buttons */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <a href="#" className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Image
                                    src="/images/app-store-badge.svg"
                                    alt="Download on App Store"
                                    width={160}
                                    height={48}
                                    className="relative z-10 block h-12 w-auto"
                                    loader={loader}
                                />
                            </a>
                            <a href="#" className="group relative overflow-hidden rounded-xl bg-white shadow-lg transition-transform hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Image
                                    src="/images/play-store-badge.svg"
                                    alt="Get it on Google Play"
                                    width={160}
                                    height={48}
                                    className="relative z-10 block h-12 w-auto"
                                    loader={loader}
                                />
                            </a>
                            
                            {/* QR Code Hint */}
                            <div className="hidden xl:flex items-center gap-3 pl-4 border-l border-gray-800 ml-2">
                                <div className="w-10 h-10 bg-white rounded-md p-0.5">
                                    {/* Placeholder for a real QR code image */}
                                    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-[6px] text-white text-center leading-tight">SCAN<br/>ME</div>
                                </div>
                                <span className="text-xs text-gray-500 w-20">Scan to install immediately</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT: Visual Mockup */}
                    <motion.div
                        className="flex-1 relative flex justify-center items-center"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                    >
                        {/* Glow behind phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-[60px] opacity-40" />

                        {/* Floating Element 1: Calories */}
                        <FloatingStatCard 
                            icon={FireIcon} 
                            label="Active Energy" 
                            value="840 kCal" 
                            color="bg-orange-500" 
                            className="top-10 -left-10 hidden md:flex" 
                            delay={false}
                        />

                         {/* Floating Element 2: Success/Streak */}
                         <FloatingStatCard 
                            icon={CheckCircleIcon} 
                            label="Weekly Streak" 
                            value="5 Days" 
                            color="bg-emerald-500" 
                            className="bottom-20 -right-4 hidden md:flex" 
                            delay={true}
                        />

                        {/* Main Phone Image */}
                        <div className="relative z-10 w-[300px] h-[600px] drop-shadow-2xl transform rotate-[-6deg] transition-transform duration-500 hover:rotate-0">
                            {/* Using a frame for the phone gives it more realism if the image is just a screenshot */}
                            <div className="absolute inset-0 rounded-[3rem] border-8 border-gray-900 bg-gray-900 overflow-hidden shadow-2xl">
                                <Image
                                    src="/images/app-mockup-main.png"
                                    alt="App Interface"
                                    fill
                                    className="object-cover"
                                    loader={loader}
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    priority
                                />
                                {/* Reflection overlay for glossy feel */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-[2.5rem]" />
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}