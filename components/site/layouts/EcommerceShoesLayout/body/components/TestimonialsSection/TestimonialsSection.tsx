'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';
import Image from 'next/image';
import Section from '@/components/site/Section/Section';

const sampleTestimonials: Testimonial[] = [
    {
        authorName: 'Johnathon',
        quote: 'The bounce and support on these sneakers are next level. I hit a new PB on my 5k the first week wearing them!',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    {
        authorName: 'Alina',
        quote: 'Finally, a brand that balances aesthetics with actual arch support. These look great in the office and feel better on the street.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    {
        authorName: 'Mikey',
        quote: 'Customer service was lightning fast when I needed a size swap. The leather quality is buttery soft. 10/10.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
];

interface TestimonialsSectionProps {
    testimonials?: Testimonial[] | null;
}

export default function TestimonialsSection({ testimonials = sampleTestimonials }: TestimonialsSectionProps) {
    const store = useStore();
    const primaryColor = store?.storeFormData?.themeSettings?.primaryColor || '#f97316';

    const list = testimonials || sampleTestimonials;

    return (
        <Section 
            title="Trusted by Pros, Loved by All" 
            // subtitle="Join thousands of happy runners and trendsetters."
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Decorative Background Element */}
                <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none"
                    style={{ color: primaryColor }}
                >
                    <span className="text-[20rem] font-black whitespace-nowrap select-none">TRUSTED BY PROS</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {list.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="flex flex-col bg-white dark:bg-zinc-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Star Rating & Quote Icon */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <StarIcon key={i} className="w-5 h-5" style={{ color: primaryColor }} />
                                    ))}
                                </div>
                                <div className="opacity-10 group-hover:opacity-30 transition-opacity">
                                    <svg width="35" height="25" viewBox="0 0 35 25" fill="currentColor">
                                        <path d="M11.25 0L15 3.75C11.25 7.5 9.375 11.25 9.375 15H15V25H0V15C0 7.5 3.75 2.5 11.25 0ZM31.25 0L35 3.75C31.25 7.5 29.375 11.25 29.375 15H35V25H20V15C20 7.5 23.75 2.5 31.25 0Z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Quote Text */}
                            <p className="flex-grow text-lg font-medium leading-relaxed text-gray-800 dark:text-zinc-200">
                                {t.quote}
                            </p>

                            {/* Author Profile */}
                            <div className="mt-8 flex items-center gap-4">
                                <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 p-0.5" style={{ borderColor: primaryColor }}>
                                    <img
                                        src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}`}
                                        alt={t.authorName || 'Anonymous'}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight">
                                        {t.authorName}
                                    </h4>
                                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-500 font-semibold">
                                        Verified Buyer
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Section>
    );
}