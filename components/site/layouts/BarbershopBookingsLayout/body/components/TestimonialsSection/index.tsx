"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

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

const TestimonialCard = ({ testimonial, isActive }: { testimonial: any, isActive: boolean }) => (
    <motion.div
        initial={false}
        animate={{
            scale: isActive ? 1 : 0.95,
            opacity: isActive ? 1 : 0.3,
            filter: isActive ? 'blur(0px)' : 'blur(2px)'
        }}
        className={`relative bg-zinc-900/50 backdrop-blur-3xl rounded-[3rem] p-10 lg:p-16 border border-white/5 transition-all duration-700 flex flex-col justify-between h-full min-h-[450px]`}
    >
        {/* Editorial Quote Mark */}
        <div className="absolute top-10 right-10 opacity-10">
            <ChatBubbleBottomCenterTextIcon className="w-20 h-20 text-[#C5A267]" />
        </div>

        <div className="relative z-10">
            <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-[#C5A267]' : 'text-zinc-800'}`} />
                ))}
            </div>
            
            <p className="text-zinc-200 text-2xl md:text-4xl font-light leading-[1.3] tracking-tight mb-12">
                "{testimonial.quote}"
            </p>
        </div>

        <div className="flex items-center gap-6 pt-10 border-t border-white/5">
            <div className="relative">
                <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.authorName}
                    className="w-20 h-20 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-500 border-2 border-[#C5A267]/20"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#C5A267] p-1.5 rounded-full border-4 border-black">
                    <SparklesIcon className="w-3 h-3 text-black" />
                </div>
            </div>
            <div className="text-left">
                <h4 className="text-xl font-black text-white tracking-tighter">{testimonial.authorName}</h4>
                <p className="text-[10px] font-bold text-[#C5A267] uppercase tracking-[0.3em]">{testimonial.role}</p>
            </div>
        </div>
    </motion.div>
);

export default function TestimonialsSection() {
    const [index, setIndex] = useState(0);
    const gold = '#C5A267';

    const next = useCallback(() => setIndex((i) => (i + 1) % staticTestimonials.length), []);
    const prev = useCallback(() => setIndex((i) => (i - 1 + staticTestimonials.length) % staticTestimonials.length), []);

    return (
        <section className="relative py-24 lg:py-48 bg-[#050505] overflow-hidden">
            {/* Artistic Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#C5A267]/5 to-transparent pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-12 bg-[#C5A267]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C5A267]">The Collective</span>
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter">
                            VOICES OF THE <br />
                            <span className="font-serif italic font-light text-zinc-700">Exceptional.</span>
                        </h2>
                    </motion.div>

                    {/* Minimalist Navigation */}
                    <div className="flex gap-4">
                        <button onClick={prev} className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all active:scale-90">
                            <ChevronLeftIcon className="w-6 h-6 text-white" />
                        </button>
                        <button onClick={next} className="w-20 h-20 rounded-full bg-[#C5A267] flex items-center justify-center text-black shadow-[0_0_30px_rgba(197,162,103,0.3)] hover:scale-105 transition-all active:scale-90">
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
                            {/* Primary Featured Card */}
                            <div className="lg:col-span-3">
                                <TestimonialCard 
                                    testimonial={staticTestimonials[index]} 
                                    isActive={true} 
                                />
                            </div>

                            {/* Secondary Peek Card */}
                            <div className="hidden lg:block lg:col-span-2">
                                <TestimonialCard 
                                    testimonial={staticTestimonials[(index + 1) % staticTestimonials.length]} 
                                    isActive={false} 
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Custom Timeline Indicator */}
                    <div className="mt-20 flex items-center justify-between">
                        <div className="flex gap-3">
                            {staticTestimonials.map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`h-1 transition-all duration-500 rounded-full ${i === index ? 'w-16 bg-[#C5A267]' : 'w-4 bg-zinc-800'}`}
                                />
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-8">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Authenticated</p>
                                <p className="text-xs font-bold text-zinc-400">March 2026 Batch</p>
                             </div>
                             <div className="h-12 w-px bg-zinc-900" />
                             <span className="text-4xl font-serif italic text-zinc-800 tabular-nums">
                                0{index + 1}
                             </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}