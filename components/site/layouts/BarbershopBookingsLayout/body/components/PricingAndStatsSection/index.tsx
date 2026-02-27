'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
    CheckIcon, 
    StarIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    BriefcaseIcon,
    ArrowPathIcon,
    SparklesIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/solid'; 
import { PricingTier, Stat } from '@/types/typings';

// --- Helper Types & Maps ---
const StatIconMap: { [key: string]: React.ElementType } = {
    "Bookings Completed": CalendarDaysIcon,
    "Verified Professionals": BriefcaseIcon,
    "Happy Customers": UsersIcon,
    "Average Rating": StarIcon,
};

// Enhanced CountUp with easing
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
            const easedProgress = 1 - Math.pow(1 - progress, 4); // Quartic ease-out
            setCount(easedProgress * end);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [end, duration, isInView]);

    return <span ref={ref}>{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>;
};

interface PricingAndStatsSectionProps { 
    stats: Stat[] | null; 
    pricingTiers: PricingTier[]; 
    themeSettings: Record<string, any> | null; 
}

export default function PricingAndStatsSection({ stats, pricingTiers, themeSettings }: PricingAndStatsSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: false, amount: 0.1 });

    const primaryColor = themeSettings?.primaryColor || '#059669'; 
    const accentColor = '#FACC15'; 

    // Data handling
    const sampleStats = [
        { label: "Bookings Completed", value: 150.7, suffix: 'K+', icon: "CalendarDaysIcon" },
        { label: "Verified Professionals", value: 12.5, suffix: 'K+', icon: "BriefcaseIcon" },
        { label: "Happy Customers", value: 98.4, suffix: 'K+', icon: "UsersIcon" },
        { label: "Average Rating", value: 4.9, icon: "StarIcon" },
    ];
    
    const normalizedStats = stats && stats.length > 0 ? stats : sampleStats;
    const processedTiers = pricingTiers && pricingTiers.length > 0 ? pricingTiers : [];

    const getPriceDetails = (tier: PricingTier) => {
        const isMonthly = billingCycle === 'monthly';
        const basePrice = tier.monthlyPrice || tier.price || 0;
        
        if (tier.name.toLowerCase() === 'enterprise') {
            return { priceDisplay: 'Custom', cycleLabel: '', isCustom: true, annualNote: 'Tailored for scale', currency: '' };
        }

        const priceValue = isMonthly ? basePrice : (tier.annualPrice || basePrice * 12 * 0.8);
        return {
            priceDisplay: Math.round(Number(priceValue)).toLocaleString(),
            cycleLabel: isMonthly ? '/mo' : '/yr',
            isCustom: false,
            annualNote: isMonthly ? "Save 20% with annual" : "Best value for teams",
            currency: 'KES'
        };
    };

    return (
        <section ref={sectionRef} className="relative py-24 overflow-hidden bg-slate-50">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: primaryColor }} />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: accentColor }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                
                {/* --- Stats Section: The Bento Grid --- */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 mb-6"
                        >
                            <SparklesIcon className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Market Leader</span>
                        </motion.div>
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Numbers that <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #10b981)` }}>Speak Volumes</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {normalizedStats.map((stat, i) => {
                            const Icon = StatIconMap[stat.label] || UsersIcon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
                                >
                                    <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}10` }}>
                                        <Icon className="w-8 h-8" style={{ color: primaryColor }} />
                                    </div>
                                    <h3 className="text-5xl font-black text-slate-900 mb-2">
                                        <CountUp end={parseFloat(stat.value as string)} decimals={stat.label.includes('Rating') ? 1 : 0} />
                                        <span className="text-2xl ml-1 text-emerald-500">{stat.suffix || ''}</span>
                                    </h3>
                                    <p className="text-slate-500 font-bold uppercase tracking-tighter text-sm">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Pricing Section --- */}
                <div className="text-center">
                    <h2 className="text-5xl font-black text-slate-900 mb-8">Ready to Scale?</h2>
                    
                    {/* Modern Toggle */}
                    <div className="inline-flex items-center p-1.5 bg-slate-200/50 rounded-2xl mb-20 backdrop-blur-sm border border-slate-200">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setBillingCycle('annually')}
                            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annually' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}
                        >
                            Annually
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 text-[10px] border border-emerald-200">SAVE 20%</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
                        {processedTiers.map((tier, i) => {
                            const { priceDisplay, cycleLabel, isCustom, annualNote, currency } = getPriceDetails(tier);
                            const featured = tier.isFeatured;

                            return (
                                <motion.div
                                    key={tier.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-8 md:p-10 rounded-[3rem] transition-all duration-500 ${
                                        featured 
                                        ? 'bg-slate-900 text-white shadow-2xl shadow-emerald-900/20 scale-105 z-20' 
                                        : 'bg-white text-slate-900 shadow-xl border border-slate-100'
                                    }`}
                                >
                                    {featured && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
                                            <ShieldCheckIcon className="w-4 h-4" /> MOST POPULAR
                                        </div>
                                    )}

                                    <div className="mb-10 text-left">
                                        <h4 className={`text-2xl font-black mb-3 ${featured ? 'text-emerald-400' : 'text-slate-900'}`}>{tier.name}</h4>
                                        <p className={`text-sm leading-relaxed ${featured ? 'text-slate-400' : 'text-slate-500'}`}>{tier.description}</p>
                                    </div>

                                    <div className="text-left mb-10">
                                        <div className="flex items-baseline gap-1">
                                            {!isCustom && <span className="text-2xl font-bold opacity-60">{currency}</span>}
                                            <span className="text-6xl font-black tracking-tight">{priceDisplay}</span>
                                            <span className="text-lg font-medium opacity-60">{cycleLabel}</span>
                                        </div>
                                        <p className="text-xs font-bold mt-2 uppercase tracking-widest text-emerald-500">{annualNote}</p>
                                    </div>

                                    <ul className="space-y-4 mb-10 text-left">
                                        {tier.features.map((f, idx) => (
                                            <li key={idx} className="flex items-start gap-3 group">
                                                <div className={`mt-1 p-0.5 rounded-full ${featured ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                                    <CheckIcon className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                <span className={`text-sm font-medium ${featured ? 'text-slate-300' : 'text-slate-600'}`}>{f}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-5 rounded-2xl font-black text-base transition-all ${
                                            featured 
                                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30' 
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                                        }`}
                                    >
                                        {tier.name.includes('Enterprise') ? 'Contact Sales' : 'Get Started Now'}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Sync */}
                <div className="mt-20 flex flex-col items-center justify-center opacity-40">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowPathIcon className="w-5 h-5 animate-spin-slow" />
                        <span className="text-sm font-bold tracking-widest uppercase">Live System Status</span>
                    </div>
                    <p className="text-xs">Prices updated for 2026 • Secure SSL Encryption</p>
                </div>
            </div>
        </section>
    );
}