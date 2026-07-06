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
    ArrowRightIcon
} from '@heroicons/react/24/outline'; 
import { PricingTier, Stat } from '@/types/typings';

// --- Helper Types & Maps (Retained) ---
const StatIconMap: { [key: string]: React.ElementType } = {
    "Bookings Completed": CalendarDaysIcon,
    "Verified Professionals": BriefcaseIcon,
    "Happy Customers": UsersIcon,
    "Average Rating": StarIcon,
};

// CountUp component (Retained & Optimized)
const CountUp = ({ end, duration = 2000, decimals = 0 }: { end: number; duration?: number; decimals?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;

        const startTimestamp = performance.now();
        const step = (timestamp: number) => {
            const progress = Math.min(1, (timestamp - startTimestamp) / duration);
            const easedProgress = 1 - Math.pow(1 - progress, 3); 
            const currentValue = easedProgress * end;
            setCount(currentValue);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);

    }, [end, duration, isInView]);

    const formattedCount = count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return <span ref={ref}>{formattedCount}</span>;
};

interface PricingAndStatsSectionProps { 
    stats: Stat[] | null; 
    pricingTiers: PricingTier[]; 
    themeSettings: Record<string, any> | null; 
}

export default function PricingAndStatsSection({ stats, pricingTiers, themeSettings }: PricingAndStatsSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    // Sample Data (Retained)
    const sampleData = {
        stats: [
            { label: "Bookings Completed", value: 150.7, icon: "CalendarDaysIcon", suffix: 'K+' }, 
            { label: "Verified Professionals", value: 12.5, icon: "BriefcaseIcon", suffix: 'K+' },
            { label: "Happy Customers", value: 98.4, icon: "UsersIcon", suffix: 'K+' },
            { label: "Average Rating", value: 4.9, icon: "StarIcon" },
        ] as Stat[],
        pricingTiers: [
            { name: "Starter", monthlyPrice: 9, annualPrice: 86.4, description: "Jumpstart your presence with essential booking tools and basic analytics.", features: ["5 client bookings/month limit", "Basic availability calendar", "Email support", "Single user license"], isFeatured: false },
            { name: "Growth Pro", monthlyPrice: 29, annualPrice: 278.4, description: "Maximize growth with unlimited scheduling, team features, and advanced branding.", features: ["Unlimited client bookings", "Automated SMS reminders", "Priority chat support", "Custom branding & logo upload", "Up to 5 team members"], isFeatured: true },
            { name: "Enterprise", monthlyPrice: 0, annualPrice: 0, description: "Tailored infrastructure for high-volume operations, large teams, and custom integration.", features: ["Dedicated account manager", "Full CRM integration", "24/7 Phone and emergency support", "Custom team roles & SSO", "Unlimited users"], isFeatured: false },
        ] as PricingTier[],
        themeSettings: { primaryColor: '#059669' },
    };

    const primaryColor = themeSettings?.primaryColor || '#059669'; 
    const accentColor = '#FACC15'; // Yellow 400 

    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.1 });

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.08, 
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            },
        }),
    };
    
    const normalizedStats: Stat[] = Array.isArray(stats) && stats.length > 0 ? stats : sampleData.stats;
    const processedTiers = pricingTiers && pricingTiers.length > 0 ? pricingTiers : sampleData.pricingTiers;

    const getPriceDetails = (tier: PricingTier) => {
        const isMonthly = billingCycle === 'monthly';
        
        if (tier.name.toLowerCase() === 'enterprise' && (tier.monthlyPrice === 0 || tier.monthlyPrice === null)) {
            return { priceDisplay: 'Custom', cycleLabel: '', isCustom: true, annualNote: 'Contact our team for a tailored framework setup.', currency: '' };
        }

        const basePrice = tier.monthlyPrice || tier.price || 0; 
        let priceValue;
        let annualNote;

        if (isMonthly) {
            priceValue = basePrice;
            const discountedAnnualPrice = (basePrice * 12 * 0.8).toFixed(0); 
            annualNote = `Billed annually at KES ${Number(discountedAnnualPrice).toLocaleString('en-KE')}/yr (Save 20%)`;
        } else {
            priceValue = tier.annualPrice && tier.annualPrice > 0 ? tier.annualPrice : (basePrice * 12 * 0.8);
            annualNote = `Saving 20% compared to standard monthly structural configurations.`;
        }
        
        const priceDisplay = typeof priceValue === 'number' ? priceValue.toFixed(priceValue % 1 !== 0 ? 2 : 0) : 'Custom';
        const cycleLabel = isMonthly ? '/mo' : '/yr';
        
        return { priceDisplay, cycleLabel, isCustom: typeof priceValue !== 'number', annualNote, currency: 'KES' };
    };

    return (
        <section 
            ref={sectionRef} 
            className="relative bg-[#fafafa] py-28 overflow-hidden min-h-screen text-gray-900"
        >
            {/* Ambient Blurred Accents */}
            <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[150px] opacity-[0.12] pointer-events-none -translate-x-1/2" style={{ backgroundColor: primaryColor }} />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.08] pointer-events-none translate-x-1/3" style={{ backgroundColor: primaryColor }} />

            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                
                {/* 📊 SECTION 1: METRICS AND STATISTICS */}
                <div className="text-center mb-12">
                    <motion.span
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md border"
                        style={{ backgroundColor: primaryColor + '08', color: primaryColor, borderColor: primaryColor + '20' }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4 }}
                    >
                        <SparklesIcon className="w-3.5 h-3.5" /> Performance Data
                    </motion.span>

                    <motion.h2
                        className="mt-6 text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-[1.15]"
                        initial={{ opacity: 0, y: 15 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        Achieve <span className="relative inline-block"><span className="relative z-10" style={{ color: primaryColor }}>Proven Results</span><span className="absolute bottom-2 left-0 w-full h-3 opacity-15" style={{ backgroundColor: primaryColor }} /></span>
                    </motion.h2>
                    
                    <motion.p
                        className="mt-4 text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Discover why elite industry professionals streamline and coordinate their operations using our architecture ecosystem.
                    </motion.p>
                </div>

                {/* Core Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
                    {normalizedStats?.map((item, i) => {
                        const numericValue = parseFloat(item.value as string) || 0;
                        const IconComponent = StatIconMap[item.label] || UsersIcon;
                        const isRating = item.label === "Average Rating";
                        
                        return (
                            <motion.div
                                key={item.label}
                                custom={i}
                                variants={itemVariants}
                                initial="hidden"
                                animate={inView ? "visible" : "hidden"}
                                className={`
                                    relative p-7 rounded-[2rem] bg-white border border-gray-100/80 backdrop-blur-xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.03)]
                                    transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)]
                                    flex flex-col items-center text-center group
                                `}
                            >
                                <div 
                                    className="p-3.5 rounded-2xl border mb-5 transition-transform duration-500 group-hover:scale-110"
                                    style={{ 
                                        backgroundColor: isRating ? '#FEF3C7' + '50' : primaryColor + '08', 
                                        borderColor: isRating ? '#FDE68A' : primaryColor + '15' 
                                    }}
                                >
                                    {IconComponent && (
                                        <IconComponent 
                                            className="w-6 h-6 stroke-[1.75]" 
                                            style={{ color: isRating ? '#D97706' : primaryColor }}
                                        />
                                    )}
                                </div>
                                <h5 className="text-4xl font-black text-gray-900 tracking-tight flex items-baseline">
                                    <CountUp end={numericValue} duration={1800} decimals={isRating ? 1 : 0} />
                                    <span className="text-xl font-bold text-gray-400 ml-0.5">{item.suffix || ''}</span>
                                </h5>
                                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-400">{item.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Modern Telemetry Metrics Sync Bar */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="my-20 max-w-xs mx-auto flex items-center justify-center gap-2.5 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.02)]"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }} />
                    </span>
                    <span className="text-xs font-semibold text-gray-500 tracking-wide">Live telemetry data active</span>
                </motion.div>
                
                {/* 💳 SECTION 2: PRICING SECTION */}
                <div className="text-center">
                    <motion.h2
                        className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight"
                        initial={{ opacity: 0, y: 15 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Transparent, <span style={{ color: primaryColor }}>Predictable Plans</span>
                    </motion.h2>

                    {/* Fluid High-End Pricing Toggle Switch */}
                    <div className="mt-8 flex justify-center items-center mb-20">
                        <div className="p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl border border-gray-200/40 flex items-center relative">
                            <button 
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly Billing
                            </button>
                            <button 
                                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 flex items-center gap-1.5 ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                onClick={() => setBillingCycle('annually')}
                            >
                                Annual Plan
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black tracking-wide text-white" style={{ backgroundColor: primaryColor }}>
                                    -20%
                                </span>
                            </button>

                            {/* Slider Element */}
                            <motion.div 
                                className="absolute top-1.5 bottom-1.5 left-1.5 bg-white rounded-xl shadow-sm border border-gray-200/50"
                                layout
                                animate={{
                                    width: billingCycle === 'monthly' ? '110px' : '122px',
                                    x: billingCycle === 'monthly' ? 0 : 114
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        </div>
                    </div>
                    
                    {/* Pricing Cards Structural Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
                        {processedTiers.map((tier, i) => {
                            const details = getPriceDetails(tier);
                            const { priceDisplay, cycleLabel, isCustom, annualNote, currency } = details;
                            const isFeatured = tier.isFeatured;

                            return (
                                <motion.div
                                    key={tier.name}
                                    custom={i + normalizedStats.length} 
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    className={`
                                        relative rounded-[2.25rem] p-8 sm:p-10 flex flex-col justify-between bg-white text-left
                                        border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                                        ${isFeatured 
                                            ? 'border-gray-900/5 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] lg:scale-[1.03] lg:-translate-y-2 z-20' 
                                            : 'border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] hover:-translate-y-1 z-10'}
                                    `}
                                >
                                    {/* Accent strip on the featured card */}
                                    {isFeatured && (
                                        <div className="absolute top-0 inset-x-0 h-2 rounded-t-[2.25rem]" style={{ backgroundColor: primaryColor }} />
                                    )}

                                    {/* Top Metadata Header Segment */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                                                {tier.name}
                                            </h3>
                                            {isFeatured && (
                                                <span className="inline-flex px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg" style={{ backgroundColor: primaryColor + '12', color: primaryColor }}>
                                                    Recommended
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed min-h-[40px]">{tier.description}</p>
                                        
                                        {/* Cost Matrix Representation */}
                                        <div className="mt-8 mb-6 relative overflow-hidden py-2">
                                            <AnimatePresence mode="wait">
                                                <motion.div 
                                                    key={priceDisplay}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="flex items-baseline text-gray-900"
                                                >
                                                    {isCustom ? (
                                                        <span className="text-4xl font-black tracking-tight">{priceDisplay}</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-sm font-bold text-gray-400 mr-1">{currency}</span>
                                                            <span className="text-5xl font-black tracking-tight">
                                                                {Number(priceDisplay).toLocaleString('en-KE')}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-400 ml-1.5">{cycleLabel}</span>
                                                        </>
                                                    )}
                                                </motion.div>
                                            </AnimatePresence>
                                            
                                            {/* Annual Discount Subtext */}
                                            {(billingCycle === 'annually' || isCustom) && (
                                                <p className="mt-2 text-xs font-semibold tracking-wide text-emerald-600">
                                                    {annualNote}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features Checklist Block */}
                                    <ul className="space-y-4 border-t border-gray-50 pt-8 flex-grow">
                                        {tier.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start text-gray-600 gap-3">
                                                <div className="p-0.5 rounded-md mt-0.5 flex-shrink-0" style={{ backgroundColor: primaryColor + '12' }}>
                                                    <CheckIcon className="h-3.5 w-3.5 stroke-[3]" style={{ color: primaryColor }} />
                                                </div>
                                                <span className="text-sm font-medium tracking-wide leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Core Strategic Call to Action Trigger */}
                                    <button
                                        className="mt-10 w-full py-4 px-6 rounded-2xl text-sm font-bold shadow-sm transition-all duration-300 flex items-center justify-center gap-1.5 group/btn"
                                        style={{ 
                                            backgroundColor: isFeatured ? primaryColor : '#F3F4F6',
                                            color: isFeatured ? '#ffffff' : '#374151'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isFeatured) {
                                                e.currentTarget.style.backgroundColor = primaryColor + '12';
                                                e.currentTarget.style.color = primaryColor;
                                            } else {
                                                e.currentTarget.style.filter = 'brightness(1.05)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isFeatured) {
                                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                                                e.currentTarget.style.color = '#374151';
                                            } else {
                                                e.currentTarget.style.filter = 'none';
                                            }
                                        }}
                                    >
                                        {isFeatured ? 'Book Now' : (isCustom ? 'Contact Sales' : 'Start Free Trial')}
                                        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}