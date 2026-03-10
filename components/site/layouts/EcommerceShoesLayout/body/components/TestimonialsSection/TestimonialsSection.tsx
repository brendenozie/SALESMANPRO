'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { Testimonial } from '@/types/typings';
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

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#f97316';
    const list = testimonials && testimonials.length > 0 ? testimonials : sampleTestimonials;

    // Parallax effect for the background text
    const { scrollYProgress } = useScroll();
    const xMove = useTransform(scrollYProgress, [0, 1], [-100, 100]);

    return (
        <Section className="relative overflow-hidden bg-white dark:bg-black py-24">
            {/* Kinetic Background Layer */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden whitespace-nowrap">
                <motion.span 
                    style={{ x: xMove }}
                    className="text-[25vw] font-black uppercase tracking-tighter inline-block"
                >
                    Real Results Real Results
                </motion.span>
            </div>

            <div className="relative max-w-7xl mx-auto px-6 z-10">
                {/* Trust Score Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                             <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                                ))}
                             </div>
                             <span className="text-sm font-bold uppercase tracking-widest text-gray-400">4.9/5 Rating</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase leading-[0.85] italic tracking-tighter">
                            Trusted <br /> By <span className="text-transparent" style={{ WebkitTextStroke: `1px ${primaryColor}` }}>The Pros.</span>
                        </h2>
                    </div>
                    <div className="hidden lg:block max-w-xs text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            Join 50,000+ athletes who switched to elite performance footwear this year.
                        </p>
                    </div>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {list.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: idx * 0.1 }}
                            className="relative flex flex-col bg-gray-50 dark:bg-zinc-900/40 p-10 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 transition-all duration-500 hover:-translate-y-2 group"
                        >
                            {/* Decorative Quote Icon */}
                            <div className="absolute top-10 right-10 opacity-[0.05] dark:opacity-[0.1] group-hover:scale-110 transition-transform duration-500">
                                <svg width="45" height="35" viewBox="0 0 35 25" fill="currentColor">
                                    <path d="M11.25 0L15 3.75C11.25 7.5 9.375 11.25 9.375 15H15V25H0V15C0 7.5 3.75 2.5 11.25 0ZM31.25 0L35 3.75C31.25 7.5 29.375 11.25 29.375 15H35V25H20V15C20 7.5 23.75 2.5 31.25 0Z" />
                                </svg>
                            </div>

                            {/* Quote Content */}
                            <div className="flex-grow mb-10">
                                <p className="text-xl font-bold leading-tight text-gray-900 dark:text-white italic">
                                    "{t.quote}"
                                </p>
                            </div>

                            {/* Author Info */}
                            <div className="flex items-center gap-4 pt-8 border-t border-gray-200/50 dark:border-zinc-800/50">
                                <div className="relative w-14 h-14">
                                    <img
                                        src={t.avatarUrl || `https://ui-avatars.com/api/?name=${t.authorName}&background=random`}
                                        alt={t.authorName}
                                        className="w-full h-full rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 shadow-lg"
                                    />
                                    {/* Verified Badge */}
                                    <div 
                                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shadow-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        ✓
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-sm tracking-tighter text-gray-900 dark:text-white leading-none mb-1">
                                        {t.authorName}
                                    </h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        Verified Athlete
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