'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
    CheckIcon, 
    StarIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    BriefcaseIcon,
    CurrencyDollarIcon 
} from '@heroicons/react/24/solid'; 
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { PricingTier, Stat } from '@/types/typings';


// --- Helper Types & Maps ---
const StatIconMap: { [key: string]: React.ElementType } = {
    "Bookings Completed": CalendarDaysIcon,
    "Verified Professionals": BriefcaseIcon,
    "Happy Customers": UsersIcon,
    "Average Rating": StarIcon,
};
// ------------------------------------------------------------------------

// CountUp component (Unchanged for smooth animations)
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

// --- START: Main Component ---
export default function PricingAndStatsSection({ stats, pricingTiers, themeSettings }: PricingAndStatsSectionProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    // Sample Data
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
        themeSettings: { primaryColor: '#059669' }, // Emerald 600
    };

    const primaryColor = themeSettings?.primaryColor || '#059669'; 

    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.2 });

    // Animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.15,
                duration: 0.6,
                type: "spring",
                stiffness: 100
            },
        }),
    };
    
    // Safely normalize stats
    const normalizedStats: Stat[] = Array.isArray(stats) && stats.length > 0 ? stats : sampleData.stats;

    // Split stats for distinct visual treatment
    const ratingStat = normalizedStats.find((s) => s.label === "Average Rating") || sampleData.stats.find((s) => s.label === "Average Rating");
    const coreStats = normalizedStats.filter((s) => s.label !== "Average Rating");

    // Use provided tiers or sample tiers
    const processedTiers = pricingTiers && pricingTiers.length > 0 ? pricingTiers : sampleData.pricingTiers;


    // Helper for Price Calculation
    const getPriceDetails = (tier: PricingTier) => {
        const isMonthly = billingCycle === 'monthly';
        // Note: Using a fixed 20% discount for annual pricing for consistency in the sample logic
        let priceValue = isMonthly ? tier.monthlyPrice : (tier.annualPrice || (tier.monthlyPrice || tier.price) * 12 * 0.8);
        
        if (tier.name.toLowerCase() === 'enterprise' && tier.monthlyPrice === 0) {
            return {
                priceDisplay: 'Custom',
                cycleLabel: '',
                isCustom: true,
                annualNote: 'Contact us for tailored enterprise solutions.',
            };
        }

        const priceDisplay = typeof priceValue === 'number' ? priceValue.toFixed(priceValue % 1 !== 0 ? 2 : 0) : 'Custom';
        const cycleLabel = isMonthly ? '/mo' : '/yr';
        
        return {
            priceDisplay,
            cycleLabel,
            isCustom: typeof priceValue !== 'number',
            annualNote: isMonthly ? `Billed as KES ${((tier.monthlyPrice || tier.price) * 12 * 0.8).toFixed(0)} per year` : `Saving 20% annually`,
        };
    };

    return (
        <section ref={sectionRef} className="relative bg-gray-50 pt-20 pb-32 overflow-hidden">
            
            {/* 🌊 Visual Background Element (Subtle Wave Effect) */}
            <div 
                className="absolute top-0 w-full h-1/2 opacity-5 pointer-events-none" 
                style={{ 
                    backgroundImage: `radial-gradient(circle at center, ${primaryColor} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    filter: 'blur(1px)'
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* =========================================================
                    1. TRUST & STATS SECTION (ENHANCED VISUAL HIERARCHY)
                    =========================================================
                */}
                <div className="pt-8 pb-16 text-center">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <span style={{ color: primaryColor }}>Trusted by Thousands.</span> <span className="text-gray-500">Data-Driven Results.</span>
                    </motion.h2>

                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        
                        {/* Rating Stat (Emphasis: Largest, Featured Color) */}
                        {ratingStat && (
                            <motion.div
                                key={ratingStat.label}
                                custom={0}
                                variants={itemVariants}
                                initial="hidden"
                                animate={inView ? "visible" : "hidden"}
                                className="md:col-span-2 lg:col-span-1 bg-white ring-4 ring-yellow-400 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-[1.05] relative overflow-hidden group"
                            >
                                <span className="absolute inset-0 bg-yellow-50 opacity-40 z-0 rounded-3xl transition-opacity group-hover:opacity-70" />
                                <StarIcon className="w-16 h-16 text-yellow-500 mb-4 relative z-10" />
                                <h5 className="text-7xl font-extrabold text-gray-900 leading-tight relative z-10">
                                    <CountUp end={parseFloat(ratingStat.value as string)} duration={1500} decimals={1} />
                                </h5>
                                <p className="mt-3 text-lg font-bold text-gray-700 relative z-10">{ratingStat.label}</p>
                            </motion.div>
                        )}
                        
                        {/* Core Stats (Clean, professional look) */}
                        {coreStats?.map((item, i) => {
                            const numericValue = parseFloat(item.value as string) || 0;
                            const IconComponent = StatIconMap[item.label] || UsersIcon;

                            return (
                                <motion.div
                                    key={item.label}
                                    custom={i + 1}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl group"
                                >
                                    {IconComponent && (
                                        <div 
                                            className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-white ring-4 ring-offset-4 ring-offset-white transition-all duration-300 group-hover:ring-8" 
                                            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                                        >
                                            <IconComponent className="w-7 h-7" />
                                        </div>
                                    )}
                                    <h5 className="text-4xl font-extrabold text-gray-900 leading-tight">
                                        <CountUp end={numericValue} duration={2000} decimals={1} />
                                        {item.suffix || ''}
                                    </h5>
                                    <p className="mt-1 text-md font-medium text-gray-600">{item.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <hr className="my-16 border-gray-200" />
                
                {/* =========================================================
                    2. PRICING SECTION (PREMIUM CARD DESIGN)
                    =========================================================
                */}
                <div className="py-8 text-center bg-gray-50">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Choose Your Power-Up: <span style={{ color: primaryColor }}>Simple, Transparent Pricing</span>
                    </motion.h2>

                    {/* Pricing Toggle (Sleeker design) */}
                    <div className="mt-12 flex justify-center items-center space-x-3">
                        <span className={`text-lg font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        
                        <div className="relative inline-block w-16 h-8 rounded-full cursor-pointer p-1 transition-all duration-300 shadow-inner" 
                            style={{ backgroundColor: billingCycle === 'annually' ? primaryColor : '#D1D5DB' /* gray-300 */ }}
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
                        >
                            <motion.div
                                className="absolute w-6 h-6 rounded-full bg-white shadow-lg"
                                initial={false}
                                animate={{ x: billingCycle === 'annually' ? 'calc(100% + 2px)' : '0px' }}
                                transition={{ type: "spring", stiffness: 700, damping: 50 }}
                            />
                            <span className="sr-only">Toggle billing cycle</span>
                        </div>

                        <span className={`text-lg font-semibold transition-colors ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Annually 
                            <span className="ml-3 px-3 py-0.5 text-sm font-bold rounded-full text-white shadow-md bg-orange-500">
                                Save 20%
                            </span>
                        </span>
                    </div>
                    {/* End Pricing Toggle */}
                    
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10 items-stretch">
                        {processedTiers.map((tier, i) => {
                            const details = getPriceDetails(tier);
                            const { priceDisplay, cycleLabel, isCustom, annualNote } = details;
                            const isFeatured = tier.isFeatured;
                            const primaryBg = primaryColor; // e.g., #059669
                            const featuredTextColor = isFeatured ? 'white' : primaryBg; 

                            return (
                                <motion.div
                                    key={tier.name}
                                    custom={i}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    
                                    // Featured Card Styling Update: Dark background, primary color glow/ring on featured card
                                    className={`relative rounded-3xl p-8 lg:p-12 flex flex-col justify-between transition-all duration-500 transform ${
                                        isFeatured 
                                            ? `bg-gray-900 text-white shadow-2xl shadow-green-500/30 ring-4 ring-[${primaryBg}] scale-[1.05] z-20` 
                                            : 'bg-white text-gray-900 border border-gray-200 hover:shadow-xl hover:-translate-y-2'
                                    }`}
                                >
                                    {/* Featured Tag */}
                                    {isFeatured && (
                                        <div className="absolute -top-4 right-1/2 translate-x-1/2">
                                            <span className="inline-block px-6 py-1 text-sm font-bold text-gray-900 uppercase tracking-wider rounded-full shadow-lg bg-yellow-300">
                                                Recommended
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="text-center">
                                        <h3 className="text-3xl font-extrabold mt-4" style={{ color: featuredTextColor }}>
                                            {tier.name}
                                        </h3>
                                        <p className={`mt-3 ${isFeatured ? 'text-gray-300' : 'text-gray-500'}`}>{tier.description}</p>
                                        
                                        <motion.p 
                                            key={priceDisplay + cycleLabel} 
                                            className="mt-8 text-7xl font-extrabold leading-none"
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "tween", duration: 0.3 }}
                                        >
                                            {isCustom ? (
                                                <span className="text-4xl font-extrabold">{priceDisplay}</span>
                                            ) : (
                                                <>
                                                    <span className={`text-3xl font-normal align-top mr-1 ${isFeatured ? 'text-gray-400' : 'text-gray-500'}`}>KES</span>
                                                    <span className={isFeatured ? 'text-white' : 'text-gray-900'}>{priceDisplay}</span>
                                                    <span className={`text-xl font-normal ml-1 ${isFeatured ? 'text-gray-400' : 'text-gray-500'}`}>{cycleLabel}</span>
                                                </>
                                            )}
                                        </motion.p>
                                        
                                        {/* Annual Billing Note */}
                                        {(billingCycle === 'annually' || isCustom) && (
                                            <p className={`mt-2 text-sm italic font-medium`} style={{ color: isFeatured ? '#6EE7B7' : primaryBg }}>
                                                {annualNote}
                                            </p>
                                        )}
                                    </div>

                                    {/* Refined Feature List */}
                                    <ul className="mt-10 space-y-4 text-left w-full border-t pt-8 flex-grow" style={{ borderColor: isFeatured ? '#374151' : '#F3F4F6' }}>
                                        {tier.features.map((feature: string, idx: number) => {
                                            return (
                                                <motion.li 
                                                    key={idx} 
                                                    className={`flex items-start ${isFeatured ? 'text-gray-200' : 'text-gray-700'}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                                    transition={{ delay: 0.8 + i * 0.1 + idx * 0.05, duration: 0.4 }}
                                                >
                                                    <CheckIcon className={`h-6 w-6 mr-2 flex-shrink-0 ${isFeatured ? 'text-yellow-400' : 'text-emerald-500'}`} />
                                                    <span className="text-base font-medium">{feature}</span>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>

                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`mt-10 w-full px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all duration-300 group shadow-lg ${
                                            isFeatured 
                                                ? `bg-white text-gray-900 hover:bg-gray-100` 
                                                : `text-white hover:opacity-90`
                                        }`}
                                        style={{ backgroundColor: isFeatured ? 'white' : primaryBg }}
                                    >
                                        {isFeatured ? 'Book Now' : (isCustom ? 'Contact Sales' : 'Start Free Trial')}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </section>
    );
}