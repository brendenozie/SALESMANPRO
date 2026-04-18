"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from "@/contexts/StoreContext";

const staticTestimonials = [
    {
        authorName: 'Sarah L.',
        role: 'Wellness Enthusiast',
        quote: 'The ritual here is unmatched. It’s not just a service; it’s the only hour of my week where the world actually stops.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734b319?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'James K.',
        role: 'Executive Director',
        quote: 'I demand a specific level of precision in my life. This platform is the only one that has consistently exceeded my internal benchmarks.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1549040846-95ff88301f2f?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'Amara N.',
        role: 'Lifestyle Curator',
        quote: 'From the digital interface to the physical experience, every touchpoint feels curated. A masterclass in modern luxury.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=200&auto=format&fit=crop',
    },
];

const TestimonialCard = ({ testimonial, isActive, primaryColor }: { testimonial: any, isActive: boolean, primaryColor: string }) => (
    <motion.div
        initial={false}
        animate={{
            scale: isActive ? 1 : 0.95,
            opacity: isActive ? 1 : 0.3,
            filter: isActive ? 'blur(0px)' : 'blur(2px)'
        }}
        className={`relative bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-16 border border-zinc-200 dark:border-white/5 transition-all duration-700 flex flex-col justify-between h-full min-h-[450px] shadow-xl dark:shadow-none`}
    >
        {/* Editorial Quote Mark */}
        <div className="absolute top-10 right-10 opacity-[0.05] dark:opacity-10">
            <ChatBubbleBottomCenterTextIcon className="w-20 h-20" style={{ color: primaryColor }} />
        </div>

        <div className="relative z-10">
            <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                    <StarIcon 
                        key={i} 
                        className={`w-4 h-4 transition-colors`} 
                        style={{ color: i < testimonial.rating ? primaryColor : 'var(--star-inactive)' }}
                    />
                ))}
                <style jsx>{`
                    :global(.dark) { --star-inactive: #27272a; }
                    :global(:not(.dark)) { --star-inactive: #e4e4e7; }
                `}</style>
            </div>
            
            <p className="text-zinc-800 dark:text-zinc-200 text-2xl md:text-4xl font-light leading-[1.3] tracking-tight mb-12">
                "{testimonial.quote}"
            </p>
        </div>

        <div className="flex items-center gap-6 pt-10 border-t border-zinc-200 dark:border-white/5">
            <div className="relative">
                <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.authorName}
                    className="w-20 h-20 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500 border-2"
                    style={{ borderColor: `${primaryColor}33` }} // 20% opacity hex
                />
                <div 
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full border-4 border-white dark:border-black"
                    style={{ backgroundColor: primaryColor }}
                >
                    <SparklesIcon className="w-3 h-3 text-white dark:text-black" />
                </div>
            </div>
            <div className="text-left">
                <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">{testimonial.authorName}</h4>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: primaryColor }}>{testimonial.role}</p>
            </div>
        </div>
    </motion.div>
);

export default function TestimonialsSection() {
    const { storeFormData } = useStoreContext();
    const primaryColor = storeFormData?.themeSettings?.primaryColor || '#C5A267';
    const [index, setIndex] = useState(0);

    const next = useCallback(() => setIndex((i) => (i + 1) % staticTestimonials.length), []);
    const prev = useCallback(() => setIndex((i) => (i - 1 + staticTestimonials.length) % staticTestimonials.length), []);

    return (
        <section className="relative py-24 lg:py-48 bg-white dark:bg-[#050505] transition-colors duration-500 overflow-hidden">
            {/* Artistic Background Elements */}
            <div 
                className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l pointer-events-none opacity-20 dark:opacity-100" 
                style={{ backgroundImage: `linear-gradient(to left, ${primaryColor}0D, transparent)` }} // 0D = 5% opacity
            />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12" style={{ backgroundColor: primaryColor }} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: primaryColor }}>The Collective</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
                            VOICES OF THE <br />
                            <span className="font-serif italic font-light text-zinc-300 dark:text-zinc-700">Exceptional.</span>
                        </h2>
                    </motion.div>

                    {/* Navigation */}
                    <div className="flex gap-4">
                        <button 
                            onClick={prev} 
                            className="w-20 h-20 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-white/5 transition-all active:scale-90"
                        >
                            <ChevronLeftIcon className="w-6 h-6 text-zinc-900 dark:text-white" />
                        </button>
                        <button 
                            onClick={next} 
                            className="w-20 h-20 rounded-full flex items-center justify-center text-white dark:text-black transition-all active:scale-90 hover:scale-105"
                            style={{ 
                                backgroundColor: primaryColor,
                                boxShadow: `0 0 30px ${primaryColor}4D` // 4D = 30% opacity
                            }}
                        >
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, filter: 'blur(10px)', x: 40 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                            exit={{ opacity: 0, filter: 'blur(10px)', x: -40 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center"
                        >
                            <div className="lg:col-span-3">
                                <TestimonialCard 
                                    testimonial={staticTestimonials[index]} 
                                    isActive={true} 
                                    primaryColor={primaryColor}
                                />
                            </div>

                            <div className="hidden lg:block lg:col-span-2">
                                <TestimonialCard 
                                    testimonial={staticTestimonials[(index + 1) % staticTestimonials.length]} 
                                    isActive={false} 
                                    primaryColor={primaryColor}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Timeline Indicator */}
                    <div className="mt-20 flex items-center justify-between">
                        <div className="flex gap-3">
                            {staticTestimonials.map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`h-1 transition-all duration-500 rounded-full`}
                                    style={{ 
                                        width: i === index ? '64px' : '16px',
                                        backgroundColor: i === index ? primaryColor : 'var(--indicator-bg)' 
                                    }}
                                />
                            ))}
                            <style jsx>{`
                                :global(.dark) { --indicator-bg: #27272a; }
                                :global(:not(.dark)) { --indicator-bg: #e4e4e7; }
                            `}</style>
                        </div>
                        
                        <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Authenticated</p>
                                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">March 2026 Batch</p>
                             </div>
                             <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-900" />
                             <span className="text-4xl font-serif italic text-zinc-300 dark:text-zinc-800 tabular-nums">
                                0{index + 1}
                             </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}