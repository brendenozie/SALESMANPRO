"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
    CheckIcon, 
    StarIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    BriefcaseIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline'; 
import { useStoreContext } from "@/contexts/StoreContext";

const StatIconMap: { [key: string]: React.ElementType } = {
    "Bookings Completed": CalendarDaysIcon,
    "Rituals Completed": CalendarDaysIcon,
    "Verified Professionals": BriefcaseIcon,
    "Master Artisans": BriefcaseIcon,
    "Happy Customers": UsersIcon,
    "Elite Members": UsersIcon,
    "Average Rating": StarIcon,
    "Satisfaction": StarIcon,
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
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#C5A267';
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const sampleStats = [
        { label: "Rituals Completed", value: 150.7, suffix: 'K', icon: "CalendarDaysIcon" },
        { label: "Master Artisans", value: 12.5, suffix: 'K', icon: "BriefcaseIcon" },
        { label: "Elite Members", value: 98.4, suffix: 'K', icon: "UsersIcon" },
        { label: "Satisfaction", value: 4.9, suffix: '/5', icon: "StarIcon" },
    ];
    
    const normalizedStats = stats && stats.length > 0 ? stats : sampleStats;

    return (
        <section className="relative py-24 lg:py-40 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden text-zinc-900 dark:text-white">
            {/* Ambient Background Gradient */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] blur-[160px] rounded-full pointer-events-none opacity-[0.07] dark:opacity-[0.05]" 
                style={{ backgroundColor: primaryColor }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* --- STATS: THE SCOREBOARD --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden mb-40 shadow-sm dark:shadow-none">
                    {normalizedStats.map((stat: any, i: number) => {
                        const Icon = StatIconMap[stat.label] || SparklesIcon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-[#0A0A0A] p-10 lg:p-14 flex flex-col items-center text-center group hover:bg-zinc-50 dark:hover:bg-[#0D0D0D] transition-colors"
                            >
                                <Icon className="w-6 h-6 text-zinc-400 dark:text-zinc-600 mb-6 group-hover:scale-110 transition-transform" style={{ color: i % 2 === 0 ? primaryColor : undefined }} />
                                <h3 className="text-4xl lg:text-5xl font-black tracking-tighter mb-2">
                                    <CountUp end={parseFloat(stat.value)} decimals={stat.label.includes('Satisfaction') || stat.value.toString().includes('.') ? 1 : 0} />
                                    <span style={{ color: primaryColor }}>{stat.suffix || ''}</span>
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- PRICING HEADER --- */}
                <div className="text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-3 mb-6"
                    >
                        <div className="h-px w-8" style={{ backgroundColor: primaryColor }} />
                        <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: primaryColor }}>Membership</span>
                        <div className="h-px w-8" style={{ backgroundColor: primaryColor }} />
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-12">
                        CHOOSE YOUR <br />
                        <span className="font-serif italic font-light text-zinc-300 dark:text-zinc-700">Legacy.</span>
                    </h2>

                    {/* Minimalist Toggle */}
                    <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'text-white dark:text-black' : 'text-zinc-400 dark:text-zinc-500'}`}
                            style={billingCycle === 'monthly' ? { backgroundColor: primaryColor } : {}}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('annually')}
                            className={`px-10 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annually' ? 'text-white dark:text-black' : 'text-zinc-400 dark:text-zinc-500'}`}
                            style={billingCycle === 'annually' ? { backgroundColor: primaryColor } : {}}
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
                                    ? 'bg-zinc-50 dark:bg-[#111] border-transparent shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_-20px_rgba(197,162,103,0.15)]' 
                                    : 'bg-transparent border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                                style={featured ? { borderColor: `${primaryColor}4D` } : {}}
                            >
                                {featured && (
                                    <div 
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-white dark:text-black text-[9px] font-black px-6 py-2 rounded-full tracking-[0.2em]"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        RECOMMENDED
                                    </div>
                                )}

                                <div className="mb-12">
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-4" style={{ color: primaryColor }}>{tier.name}</h4>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black tracking-tighter">
                                            ${billingCycle === 'monthly' ? tier.monthlyPrice : Math.round(tier.monthlyPrice * 0.8)}
                                        </span>
                                        <span className="text-zinc-400 dark:text-zinc-600 font-serif italic text-xl">
                                            /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                        </span>
                                    </div>
                                </div>

                                <ul className="flex-1 space-y-5 mb-12">
                                    {tier.features.map((feature: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-4 group/item">
                                            <CheckIcon className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium group-hover/item:text-zinc-900 dark:group-hover/item:text-zinc-200 transition-colors">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 ${
                                        featured 
                                        ? 'text-white dark:text-black' 
                                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                    }`}
                                    style={featured ? { backgroundColor: primaryColor } : {}}
                                >
                                    Secure Membership
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- FOOTER SYNC --- */}
                <div className="mt-32 pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Systems Operational</span>
                        </div>
                        <span className="text-zinc-200 dark:text-zinc-800">|</span>
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">PCI DSS Compliant</span>
                        </div>
                    </div>
                    
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-700">
                        Prices Adjusted March 2026 • © {new Date().getFullYear()} Elite Rituals
                    </p>
                </div>
            </div>
        </section>
    );
}