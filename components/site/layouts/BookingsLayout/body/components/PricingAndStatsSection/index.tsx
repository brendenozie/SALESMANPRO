'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { CheckIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// CountUp component, refactored for clarity and better animation
const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;

        const startTimestamp = performance.now();
        const step = (timestamp: number) => {
            const progress = Math.min(1, (timestamp - startTimestamp) / duration);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);

    }, [end, duration, isInView]);

    return <span ref={ref}>{count.toLocaleString()}</span>;
};

// --- START: Main Component ---
export default function PricingAndStatsSection() {
    const { storeFormData } = useStoreContext();

    // Sample Data to demonstrate the design
    const sampleData = {
        name: "Your Brand Name",
        stats: [
            { label: "Bookings Completed", value: 150000, iconUrl: "https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
            { label: "Verified Professionals", value: 12500, iconUrl: "https://images.unsplash.com/photo-1581094042850-25e40733d31b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
            { label: "Happy Customers", value: 98000, iconUrl: "https://images.unsplash.com/photo-1587569145888-0f1e8e8f8c7e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
            { label: "Average Rating", value: 4.9, iconUrl: "https://images.unsplash.com/photo-1555548680-77a28e3a2b3b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
        ],
        pricingTiers: [
            {
                name: "Basic",
                price: 0,
                description: "Perfect for getting started with basic booking features.",
                features: ["5 bookings per month", "Standard support", "Customer ratings", "Basic analytics"],
                isFeatured: false,
            },
            {
                name: "Pro",
                price: 29,
                description: "Unlock advanced features and expand your business with ease.",
                features: ["Unlimited bookings", "Priority support", "Customer ratings & reviews", "Advanced analytics", "Custom branding"],
                isFeatured: true,
            },
            {
                name: "Enterprise",
                price: 99,
                description: "Custom solutions for large businesses and agencies.",
                features: ["Dedicated account manager", "24/7 Premium support", "API access", "Integration with CRM", "Team management"],
                isFeatured: false,
            },
        ],
        themeSettings: {
            primaryColor: '#00A880',
        },
    };

    const { stats = [], pricingTiers = [], themeSettings } = storeFormData || sampleData;
    const primaryColor = themeSettings?.primaryColor || '#00A880';

    // Grouping stats and metrics for a single map operation
    const combinedStats = stats || [];
    // useMemo(() => {
    //     // Here we'd ideally merge `stats` and `metrics` from the actual data.
    //     // For this example, we'll just use the `stats` array.
    //     return stats?.filter(s => (s.value !== undefined && s.value !== null)) || [];
    // }, [stats]);

    return (
        <section className="bg-gray-50 py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

                {/* Trust & Stats Section */}
                <div className="text-center">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        Join Thousands of Happy Users
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-xl text-gray-600"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        Our numbers speak for themselves.
                    </motion.p>

                    <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {combinedStats?.map((item, i) => {
                            const numericValue =
                                typeof item.value === 'string'
                                    ? parseFloat(item.value) || 0
                                    : typeof item.value === 'number'
                                    ? item.value
                                    : 0;
                            return (
                                <motion.div
                                    key={item.label}
                                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    {item.iconUrl && (
                                        <Image
                                            src={item.iconUrl}
                                            loader={loader}
                                            alt={item.label}
                                            width={80}
                                            height={80}
                                            className="mb-4 rounded-full object-cover"
                                        />
                                    )}
                                    <h5 className="text-5xl lg:text-6xl font-extrabold text-emerald-600 leading-tight">
                                        <CountUp end={numericValue} />
                                        {typeof item.value === 'string' && item.value.includes('+') && '+'}
                                    </h5>
                                    <p className="mt-2 text-lg font-medium text-gray-700">{item.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Pricing Section --- */}
                <div className="text-center">
                    <motion.h2
                        className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        Simple, Transparent Pricing
                    </motion.h2>
                    <motion.p
                        className="mt-4 text-xl text-gray-600"
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        Choose the plan that's right for you.
                    </motion.p>
                    
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        {pricingTiers.map((tier, i) => (
                            <motion.div
                                key={tier.name}
                                className={`bg-white rounded-3xl p-10 flex flex-col items-center justify-between transition-all duration-300 transform hover:-translate-y-2 ${tier.isFeatured ? 'shadow-2xl ring-4 ring-emerald-500' : 'shadow-lg border border-gray-200'}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true, amount: 0.5 }}
                            >
                                <div className="text-center">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        {tier.name}
                                    </h3>
                                    <p className="mt-4 text-gray-500">{tier.description}</p>
                                    <p className="mt-6 text-6xl font-extrabold text-gray-900 leading-none">
                                        <span className="text-3xl font-normal align-top mr-1">KES</span>
                                        {tier.price}
                                    </p>
                                </div>

                                <ul className="mt-8 space-y-4 text-left w-full">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-gray-700">
                                            <CheckIcon className="h-6 w-6 text-emerald-500 mr-2 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`mt-10 w-full px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${tier.isFeatured ? 'bg-emerald-600 text-white shadow-xl hover:bg-emerald-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                                >
                                    Choose Plan
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}