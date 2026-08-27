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
} from '@heroicons/react/24/solid'; 
import { PricingTier, Stat } from '@/types/typings';


// --- Helper Types & Maps (Retained) ---
const StatIconMap: { [key: string]: React.ElementType } = {
    "Bookings Completed": CalendarDaysIcon,
    "Verified Professionals": BriefcaseIcon,
    "Happy Customers": UsersIcon,
    "Average Rating": StarIcon,
};
// ------------------------------------------------------------------------

// CountUp component (Retained)
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
        themeSettings: { primaryColor: '#059669' }, // Emerald 600
    };

    const primaryColor = themeSettings?.primaryColor || '#059669'; 
    const accentColor = '#FACC15'; // Yellow 400 

    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.2 });

    // Animation variants (Retained)
    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.8 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.1, 
                duration: 0.7,
                type: "spring",
                stiffness: 120,
                damping: 10,
            },
        }),
    };
    
    // Data processing (Retained)
    const normalizedStats: Stat[] = Array.isArray(stats) && stats.length > 0 ? stats : sampleData.stats;
    const processedTiers = pricingTiers && pricingTiers.length > 0 ? pricingTiers : sampleData.pricingTiers;

    // Helper for Price Calculation (Retained)
    const getPriceDetails = (tier: PricingTier) => {
        const isMonthly = billingCycle === 'monthly';
        
        if (tier.name.toLowerCase() === 'enterprise' && (tier.monthlyPrice === 0 || tier.monthlyPrice === null)) {
            return { priceDisplay: 'Custom', cycleLabel: '', isCustom: true, annualNote: 'Contact us for a tailored enterprise solution.', currency: '' };
        }

        const basePrice = tier.monthlyPrice || tier.price || 0; 
        let priceValue;
        let annualNote;

        if (isMonthly) {
            priceValue = basePrice;
            const discountedAnnualPrice = (basePrice * 12 * 0.8).toFixed(0); 
            annualNote = `Billed annually at KES ${discountedAnnualPrice} per year (Save 20%)`;
        } else {
            priceValue = tier.annualPrice && tier.annualPrice > 0 ? tier.annualPrice : (basePrice * 12 * 0.8);
            annualNote = `Saving 20% annually compared to the monthly plan.`;
        }
        
        const priceDisplay = typeof priceValue === 'number' ? priceValue.toFixed(priceValue % 1 !== 0 ? 2 : 0) : 'Custom';
        const cycleLabel = isMonthly ? '/mo' : '/yr';
        
        return { priceDisplay, cycleLabel, isCustom: typeof priceValue !== 'number', annualNote, currency: 'KES' };
    };

    return (
        <section 
            ref={sectionRef} 
            className="relative pt-20 pb-32 overflow-hidden min-h-screen"
            // LIGHT MODE GRADIENT BACKGROUND
            style={{ background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f3f4f6 100%)' }} 
        >
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* =========================================================
                    1. HEADER & DYNAMIC STATS GRID (LIGHT MODE)
                    =========================================================
                */}
                <div className="pt-8 pb-16 text-center">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        Achieve <span style={{ color: primaryColor }}>Proven Results</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-16">
                        See why thousands of professionals trust us daily.
                    </p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        
                        {/* Core Stats (Dynamic Grid) */}
                        {normalizedStats?.map((item, i) => {
                            const numericValue = parseFloat(item.value as string) || 0;
                            const IconComponent = StatIconMap[item.label] || UsersIcon;
                            const isRating = item.label === "Average Rating";
                            
                            // Light Mode Stat Card Styling
                            const statCardClasses = isRating 
                                ? `bg-yellow-50 border-yellow-300 shadow-lg shadow-yellow-200/50` 
                                : `bg-white/80 border-gray-200 shadow-md`;
                            const statTextClasses = isRating ? 'text-yellow-700' : 'text-gray-900';
                            const statLabelClasses = isRating ? 'text-yellow-600' : 'text-gray-600';

                            return (
                                <motion.div
                                    key={item.label}
                                    custom={i}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    
                                    className={`relative p-6 rounded-3xl backdrop-blur-md border transition-transform duration-300 transform hover:scale-[1.03] flex flex-col items-center justify-center ${statCardClasses}`}
                                >
                                    {IconComponent && (
                                        <IconComponent 
                                            className={`w-10 h-10 mb-3`} 
                                            style={{ color: isRating ? accentColor : primaryColor }}
                                        />
                                    )}
                                    <h5 className={`text-4xl font-extrabold leading-tight ${statTextClasses}`}>
                                        <CountUp end={numericValue} duration={2000} decimals={isRating ? 1 : 0} />
                                        {item.suffix || ''}
                                    </h5>
                                    <p className={`mt-1 text-sm font-medium uppercase tracking-wider ${statLabelClasses}`}>{item.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="my-16 flex items-center justify-center">
                    <ArrowPathIcon className="w-8 h-8 text-gray-500 animate-spin mr-3" />
                    <span className="text-gray-500 text-lg">Real-time data synchronization.</span>
                </div>
                
                {/* =========================================================
                    2. PRICING SECTION (GLASS CARDS - LIGHT MODE)
                    =========================================================
                */}
                <div className="py-8 text-center">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.8 }}
                    >
                        <span style={{ color: primaryColor }}>Simple, Transparent Pricing</span>
                    </motion.h2>

                    {/* Pricing Toggle (Adjusted for Light BG) */}
                    <div className="mt-12 flex justify-center items-center space-x-3 mb-16">
                        <span className={`text-lg font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        
                        <div className="relative inline-block w-16 h-8 rounded-full cursor-pointer p-1 shadow-inner" 
                            style={{ backgroundColor: billingCycle === 'annually' ? primaryColor : '#E5E7EB' /* gray-200 */ }}
                            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
                        >
                            <motion.div
                                className="absolute w-6 h-6 rounded-full bg-white shadow-lg"
                                initial={false}
                                animate={{ x: billingCycle === 'annually' ? 'calc(100% + 2px)' : '0px' }}
                                transition={{ type: "spring", stiffness: 700, damping: 50 }}
                            />
                        </div>

                        <span className={`text-lg font-semibold transition-colors ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Annually 
                            <span className="ml-3 px-3 py-0.5 text-sm font-bold rounded-full text-gray-900 shadow-md" style={{ backgroundColor: accentColor }}>
                                Save 20%
                            </span>
                        </span>
                    </div>
                    {/* End Pricing Toggle */}
                    
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-y-12 lg:gap-x-8 items-stretch">
                        {processedTiers.map((tier, i) => {
                            const details = getPriceDetails(tier);
                            const { priceDisplay, cycleLabel, isCustom, annualNote, currency } = details;
                            const isFeatured = tier.isFeatured;

                            // Light Mode Glassmorphism Card Classes
                            const glassClasses = `bg-white/90 backdrop-blur-md border border-gray-300 shadow-xl transition-all duration-500 transform hover:translate-y-[-5px] z-10`;
                            
                            const buttonStyle = { 
                                backgroundColor: primaryColor,
                                color: 'white',
                                boxShadow: isFeatured ? `0 10px 20px -5px ${primaryColor}40` : 'none',
                            };

                            return (
                                <motion.div
                                    key={tier.name}
                                    custom={i + normalizedStats.length} 
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    
                                    className={`relative rounded-3xl p-8 lg:p-12 flex flex-col justify-between ${glassClasses} ${isFeatured ? 'ring-2 ring-offset-4 ring-offset-gray-50 ring-emerald-300 scale-[1.05] z-20' : ''}`}
                                >
                                    {/* Featured Tag */}
                                    {isFeatured && (
                                        <motion.div 
                                            className="absolute inset-0 rounded-3xl pointer-events-none"
                                            animate={{ opacity: [0.8, 0.4, 0.8] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            style={{ boxShadow: `inset 0 0 0 4px ${primaryColor}70` }} // Subtle inner border pulse
                                        />
                                    )}
                                    <div className="absolute -top-4 right-1/2 translate-x-1/2">
                                        <span className={`inline-block px-6 py-1 text-sm font-bold text-gray-900 uppercase tracking-wider rounded-full shadow-lg ${isFeatured ? '' : 'hidden'}`} style={{ backgroundColor: accentColor }}>
                                            Recommended
                                        </span>
                                    </div>
                                    
                                    <div className="text-center">
                                        <h3 className="text-3xl font-extrabold mt-4 text-gray-900">
                                            {tier.name}
                                        </h3>
                                        <p className={`mt-3 text-gray-600`}>{tier.description}</p>
                                        
                                        <motion.p 
                                            key={priceDisplay + cycleLabel} 
                                            className="mt-8 text-7xl font-extrabold leading-none text-gray-900"
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "tween", duration: 0.3 }}
                                        >
                                            {isCustom ? (
                                                <span className="text-4xl font-extrabold">{priceDisplay}</span>
                                            ) : (
                                                <>
                                                    <span className={`text-3xl font-normal align-top mr-1 text-gray-500`}>{currency}</span>
                                                    <span className="text-gray-900">{priceDisplay}</span>
                                                    <span className={`text-xl font-normal ml-1 text-gray-500`}>{cycleLabel}</span>
                                                </>
                                            )}
                                        </motion.p>
                                        
                                        {/* Annual Billing Note */}
                                        {(billingCycle === 'annually' || isCustom) && (
                                            <p className={`mt-2 text-sm italic font-medium`} style={{ color: primaryColor }}>
                                                {annualNote}
                                            </p>
                                        )}
                                    </div>

                                    {/* Feature List */}
                                    <ul className="mt-10 space-y-4 text-left w-full border-t pt-8 flex-grow border-gray-300">
                                        {tier.features.map((feature: string, idx: number) => {
                                            return (
                                                <motion.li 
                                                    key={idx} 
                                                    className="flex items-start text-gray-800"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 1 + i * 0.1 + idx * 0.05, duration: 0.4 }}
                                                >
                                                    <CheckIcon className={`h-6 w-6 mr-2 flex-shrink-0`} style={{ color: primaryColor }} />
                                                    <span className="text-base font-medium">{feature}</span>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`mt-10 w-full px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all duration-300 group shadow-lg`}
                                        style={buttonStyle}
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