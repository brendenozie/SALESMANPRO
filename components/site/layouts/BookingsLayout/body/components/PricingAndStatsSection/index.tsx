'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
    CheckIcon, 
    StarIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    BriefcaseIcon,  
} from '@heroicons/react/24/solid'; 
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';

// --- Helper Types & Maps ---
type ITier = {
    name: string;
    monthlyPrice: number | string;
    annualPrice: number | string; 
    description: string;
    features: string[];
    isFeatured: boolean;
};
type IStat = {
    label: string;
    value: number | string;
    icon: string;
    suffix?: string;
};

const StatIconMap: { [key: string]: React.ElementType } = {
    "Bookings Completed": CalendarDaysIcon,
    "Verified Professionals": BriefcaseIcon,
    "Happy Customers": UsersIcon,
    "Average Rating": StarIcon,
};
// ------------------------------------------------------------------------

// Placeholder loader function (assuming Next.js Image component setup)
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// CountUp component for animating stats
const CountUp = ({ end, duration = 2000, decimals = 0 }: { end: number; duration?: number; decimals?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;

        const startTimestamp = performance.now();
        const step = (timestamp: number) => {
            const progress = Math.min(1, (timestamp - startTimestamp) / duration);
            const currentValue = progress * end;
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

// --- START: Main Component ---
export default function PricingAndStatsSection() {
    // Assuming context provides data; falling back to comprehensive sample data
    const { storeFormData } = useStoreContext();
    
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

    const sampleData = {
        stats: [
            { label: "Bookings Completed", value: 150.7, icon: "CalendarDaysIcon", suffix: 'K+' }, 
            { label: "Verified Professionals", value: 12.5, icon: "BriefcaseIcon", suffix: 'K+' },
            { label: "Happy Customers", value: 98.4, icon: "UsersIcon", suffix: 'K+' },
            { label: "Average Rating", value: 4.9, icon: "StarIcon" },
        ] as IStat[],
        pricingTiers: [
            {
                name: "Basic",
                monthlyPrice: 9,
                annualPrice: 9 * 12 * 0.8, // 20% Discount
                description: "Jumpstart your presence with essential booking tools.",
                features: [
                    "5 client bookings/month limit",
                    "Basic availability calendar",
                    "Email and FAQ support only",
                    "Public profile page (standard URL)",
                ],
                isFeatured: false,
            },
            {
                name: "Pro",
                monthlyPrice: 29,
                annualPrice: 29 * 12 * 0.8, // 20% Discount
                description: "Maximize growth with unlimited scheduling and advanced branding.",
                features: [
                    "Unlimited client bookings",
                    "Automated SMS reminders", // Highlighted for Pro
                    "Priority chat support (within 4 hours)",
                    "Custom branding & logo upload",
                    "Advanced sales analytics dashboard",
                    "Collect secure client payments",
                ],
                isFeatured: true,
            },
            {
                name: "Enterprise",
                monthlyPrice: 'Custom',
                annualPrice: 'Custom',
                description: "Tailored infrastructure for high-volume operations and large teams.",
                features: [
                    "Dedicated account manager",
                    "Full CRM integration (Salesforce/HubSpot)", // Highlighted for Enterprise
                    "24/7 Phone and emergency support",
                    "Custom team roles & permissions",
                    "Private cloud hosting option",
                    "Full API access for custom development",
                ],
                isFeatured: false,
            },
        ] as ITier[],
        themeSettings: {
            primaryColor: '#059669', // Emerald 600
        },
    };

    const { stats = [], pricingTiers = [], themeSettings } = storeFormData || sampleData;
    const primaryColor = themeSettings?.primaryColor || '#059669';

    const sectionRef = useRef(null);
    const inView = useInView(sectionRef, { once: true, amount: 0.2 });

    // Animation variants
    const itemVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
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
    
    // Split stats for distinct visual treatment
    const ratingStat = stats?.find(s => s.label === 'Average Rating') || sampleData.stats[3];
    const coreStats = stats?.filter(s => s.label !== 'Average Rating');


    return (
        <section ref={sectionRef} className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* =========================================================
                    1. TRUST & STATS SECTION 
                    =========================================================
                */}
                <div className="py-20 lg:py-24 text-center">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        **Trusted by the Best.** Our Performance Speaks.
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Join thousands of successful businesses leveraging our platform daily.
                    </motion.p>

                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Rating Stat (Emphasis on Social Proof) */}
                        {ratingStat && (
                            <motion.div
                                key={ratingStat.label}
                                custom={0}
                                variants={itemVariants}
                                initial="hidden"
                                animate={inView ? "visible" : "hidden"}
                                className="md:col-span-2 lg:col-span-1 bg-yellow-50 border-4 border-yellow-400/50 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center transition-all duration-300 transform hover:shadow-2xl hover:scale-[1.02]"
                            >
                                <StarIcon className="w-12 h-12 text-yellow-500 mb-4 animate-pulse-slow" />
                                <h5 className="text-6xl font-extrabold text-gray-900 leading-tight">
                                    <CountUp end={parseFloat(ratingStat.value as string)} duration={1500} decimals={1} />
                                </h5>
                                <p className="mt-2 text-xl font-bold text-gray-700">{ratingStat.label}</p>
                            </motion.div>
                        )}
                        
                        {/* Core Stats (Primary Color Accent) */}
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
                                    className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                                >
                                    {IconComponent && (
                                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-white" style={{ backgroundColor: primaryColor }}>
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

                {/* --- Visual Divider --- */}
                <hr className="my-10 border-gray-200" />
                
                {/* =========================================================
                    2. PRICING SECTION
                    =========================================================
                */}
                <div className="py-20 lg:pb-32 text-center bg-white">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Clear Pricing, **Powerful Features**
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: -20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        Choose the plan that best scales with your business needs.
                    </motion.p>

                    {/* Pricing Toggle */}
                    <div className="mt-12 flex justify-center items-center space-x-4">
                        <span className={`text-lg font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Billed Monthly
                        </span>
                        
                        <div className="relative inline-block w-20 h-8 rounded-full cursor-pointer p-1 transition-all duration-300" 
                             style={{ backgroundColor: billingCycle === 'annually' ? primaryColor : '#E5E7EB' /* gray-200 */ }}
                             onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
                        >
                            <motion.div
                                className="absolute w-6 h-6 rounded-full bg-white shadow-md"
                                initial={false}
                                animate={{ x: billingCycle === 'annually' ? '4rem' : '0rem' }}
                                transition={{ type: "spring", stiffness: 700, damping: 50 }}
                            />
                            <span className="sr-only">Toggle billing cycle</span>
                        </div>

                        <span className={`text-lg font-semibold transition-colors ${billingCycle === 'annually' ? 'text-gray-900' : 'text-gray-500'}`}>
                            Billed Annually 
                            <span className="ml-2 px-3 py-0.5 text-sm font-bold rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                                Save 20%
                            </span>
                        </span>
                    </div>
                    {/* End Pricing Toggle */}
                    
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        {pricingTiers.map((tier, i) => {
                            // Dynamic Price Logic
                            const price = 1000;//billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
                            const priceDisplay = typeof price === 'number' ? price.toFixed(price % 1 !== 0 ? 2 : 0) : price;
                            const cycleLabel = typeof price === 'number' ? (billingCycle === 'monthly' ? '/mo' : '/yr') : '';
                            const isCustom = typeof price !== 'number';

                            return (
                                <motion.div
                                    key={tier.name}
                                    custom={i}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate={inView ? "visible" : "hidden"}
                                    
                                    // High Contrast Featured Card Styling
                                    className={`relative rounded-3xl p-8 lg:p-12 flex flex-col justify-between transition-all duration-500 transform ${
                                        tier.isFeatured 
                                            ? 'bg-gray-900 text-white shadow-2xl border-4 border-emerald-500/80 scale-[1.05] hover:shadow-emerald-500/50 z-20' 
                                            : 'bg-white text-gray-900 border border-gray-200 hover:shadow-xl hover:-translate-y-2'
                                    }`}
                                >
                                    {/* Featured Tag */}
                                    {tier.isFeatured && (
                                        <div className="absolute -top-4 right-1/2 translate-x-1/2">
                                            <span className="inline-block px-6 py-1 text-sm font-bold text-gray-900 uppercase tracking-wider rounded-full shadow-lg" style={{ backgroundColor: '#A7F3D0' }}>
                                                Best Value
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className="text-center">
                                        <h3 className={`text-3xl font-extrabold ${tier.isFeatured ? 'text-white mt-4' : 'text-gray-900'}`}>
                                            {tier.name}
                                        </h3>
                                        <p className={`mt-3 ${tier.isFeatured ? 'text-gray-300' : 'text-gray-500'}`}>{tier.description}</p>
                                        
                                        <motion.p 
                                            key={priceDisplay + cycleLabel} // Key ensures motion re-renders on price change
                                            className="mt-8 text-7xl font-extrabold leading-none"
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "tween", duration: 0.3 }}
                                        >
                                            {isCustom ? (
                                                <span className={`text-4xl font-extrabold ${tier.isFeatured ? 'text-emerald-400' : 'text-emerald-600'}`}>{priceDisplay}</span>
                                            ) : (
                                                <>
                                                    <span className={`text-3xl font-normal align-top mr-1 ${tier.isFeatured ? 'text-emerald-300' : 'text-gray-500'}`}>KES</span>
                                                    <span className={tier.isFeatured ? 'text-white' : 'text-gray-900'}>{priceDisplay}</span>
                                                    <span className={`text-xl font-normal ml-1 ${tier.isFeatured ? 'text-gray-400' : 'text-gray-500'}`}>{cycleLabel}</span>
                                                </>
                                            )}
                                        </motion.p>
                                        
                                        {/* Annual Billing Note */}
                                        {billingCycle === 'annually' && !isCustom && (
                                            <p className={`mt-2 text-sm italic ${tier.isFeatured ? 'text-emerald-300' : 'text-gray-500'}`}>
                                                Billed as KES {priceDisplay} per year
                                            </p>
                                        )}
                                    </div>

                                    {/* Refined Feature List with visual hierarchy */}
                                    <ul className="mt-10 space-y-4 text-left w-full border-t pt-8 border-gray-100 flex-grow">
                                        {tier.features.map((feature, idx) => {
                                            // Subtle styling for basic/inherited features in higher tiers
                                            const isBasicFeature = tier.name !== 'Basic' && idx < 2; // Assuming first 2 features are inherited basic functionality

                                            return (
                                                <motion.li 
                                                    key={idx} 
                                                    className={`flex items-start transition-colors duration-300 ${
                                                        tier.isFeatured 
                                                            ? (isBasicFeature ? 'text-gray-500 line-through opacity-70' : 'text-gray-300')
                                                            : (isBasicFeature ? 'text-gray-400' : 'text-gray-700')
                                                    }`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                                    transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                                                >
                                                    <CheckIcon className={`h-6 w-6 mr-2 flex-shrink-0 ${tier.isFeatured ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                    <span className="text-lg font-medium">{feature}</span>
                                                </motion.li>
                                            );
                                        })}
                                    </ul>

                                    <motion.button
                                        whileHover={{ scale: 1.03, boxShadow: '0 10px 20px rgba(5, 150, 105, 0.5)' }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`mt-10 w-full px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center transition-all duration-300 group ${
                                            tier.isFeatured 
                                                ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600' 
                                                : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {tier.isFeatured ? 'Start Your Free Trial' : 'Sign Up Now'}
                                        <ArrowLongRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
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