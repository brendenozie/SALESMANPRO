"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
    CheckIcon, 
    StarIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    TruckIcon,
    ArrowPathIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ChevronRightIcon,
    GlobeAltIcon,
    InboxStackIcon
} from '@heroicons/react/24/outline'; 

const StatIconMap: { [key: string]: React.ElementType } = {
    "Items Processed": InboxStackIcon,
    "Delivery Partners": TruckIcon,
    "Active Subscriptions": UsersIcon,
    "Satisfaction Score": StarIcon,
};

const CountUp = ({ end, duration = 2000, decimals = 0 }: { end: number; duration?: number; decimals?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;
        let startTimestamp: number;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min(1, (timestamp - startTimestamp) / duration);
            const easedProgress = 1 - Math.pow(1 - progress, 4); 
            setCount(easedProgress * end);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [end, duration, isInView]);

    return <span ref={ref}>{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>;
};

export default function PricingAndStatsSection({ stats, pricingTiers }: any) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const sampleStats = [
        { label: "Items Processed", value: 420.5, suffix: 'K+', icon: "InboxStackIcon" },
        { label: "Delivery Partners", value: 85, suffix: '', icon: "TruckIcon" },
        { label: "Active Subscriptions", value: 12.8, suffix: 'K', icon: "UsersIcon" },
        { label: "Satisfaction Score", value: 4.9, suffix: '/5', icon: "StarIcon" },
    ];
    
    const normalizedStats = stats && stats.length > 0 ? stats : sampleStats;

    return (
        <section className="relative py-24 lg:py-40 bg-white dark:bg-[#080a0c] overflow-hidden transition-colors duration-700">
            {/* Ambient Background Glow (Teal for Cleanliness) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* --- STATS: THE OPERATIONAL PULSE --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-[3rem] overflow-hidden mb-40 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    {normalizedStats.map((stat: any, i: number) => {
                        const Icon = StatIconMap[stat.label] || SparklesIcon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-[#0A0A0A] p-10 lg:p-14 flex flex-col items-center text-center group hover:bg-slate-50 dark:hover:bg-[#0D0D0D] transition-colors"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <h3 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                                    <CountUp end={parseFloat(stat.value)} decimals={stat.label.includes('Score') ? 1 : 0} />
                                    <span className="text-teal-600 dark:text-teal-500">{stat.suffix || ''}</span>
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- PRICING HEADER --- */}
                <div className="text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <div className="h-px w-8 bg-teal-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600 dark:text-teal-400">Flexible Plans</span>
                        <div className="h-px w-8 bg-teal-500" />
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-none mb-12">
                        CARE FOR EVERY <br />
                        <span className="font-serif italic font-light text-slate-400 dark:text-zinc-700">Wardrobe.</span>
                    </h2>

                    {/* Modern Toggle */}
                    <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-teal-600 text-teal-600 dark:text-white shadow-lg shadow-teal-600/10' : 'text-slate-400'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('annually')}
                            className={`px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annually' ? 'bg-white dark:bg-teal-600 text-teal-600 dark:text-white shadow-lg shadow-teal-600/10' : 'text-slate-400'}`}
                        >
                            Annually
                        </button>
                    </div>
                </div>

                {/* --- PRICING CARDS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {pricingTiers.map((tier: any, i: number) => {
                        const featured = tier.isFeatured;
                        return (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className={`relative flex flex-col p-12 rounded-[3rem] border transition-all duration-500 group ${
                                    featured 
                                    ? 'bg-white dark:bg-[#111] border-teal-500/30 shadow-[0_40px_80px_-20px_rgba(20,184,166,0.1)]' 
                                    : 'bg-transparent border-slate-200 dark:border-zinc-800 hover:border-teal-500/20'
                                }`}
                            >
                                {featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[9px] font-black px-6 py-2 rounded-full tracking-[0.2em] shadow-xl shadow-teal-600/20">
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-12">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-teal-600 dark:text-teal-500 mb-4">{tier.name}</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
                                            ${billingCycle === 'monthly' ? tier.monthlyPrice : Math.round(tier.monthlyPrice * 0.8)}
                                        </span>
                                        <span className="text-slate-400 font-serif italic text-xl">
                                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                        </span>
                                    </div>
                                </div>

                                <ul className="flex-1 space-y-6 mb-12">
                                    {tier.features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-4 group/item">
                                            <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                                                <CheckIcon className="w-3 h-3 text-teal-600" />
                                            </div>
                                            <span className="text-sm text-slate-500 dark:text-zinc-400 font-medium group-hover/item:text-teal-600 transition-colors">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 ${
                                    featured 
                                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xl shadow-teal-600/20' 
                                    : 'bg-slate-900 dark:bg-zinc-900 text-white border border-transparent hover:bg-black'
                                }`}>
                                    Select Plan
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- FOOTER SYNC --- */}
                <div className="mt-32 pt-12 border-t border-slate-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Express Delivery Active</span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-slate-200 dark:bg-zinc-800" />
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Eco-Friendly Solvents</span>
                        </div>
                    </div>
                    
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-700">
                        Updated 2026 • © {new Date().getFullYear()} Pristine Laundry Co.
                    </p>
                </div>
            </div>
        </section>
    );
}