"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const laundryTestimonials = [
    {
        authorName: 'Sarah L.',
        role: 'Fashion Designer',
        quote: 'My vintage silk collection is my life. Pristine is the only place I trust to handle these pieces—the fiber restoration is pure magic.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734b319?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'James K.',
        role: 'Hotelier',
        quote: 'The crispness of their Egyptian cotton service is unmatched. It has fundamentally changed the way I appreciate my morning ritual.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1549040846-95ff88301f2f?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'Amara N.',
        role: 'Interior Curator',
        quote: 'From the eco-friendly scent to the artisanal folding, every delivery feels like unboxing a luxury gift. Exceptional attention to detail.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=200&auto=format&fit=crop',
    },
];

const TestimonialCard = ({ testimonial, isActive }: { testimonial: any, isActive: boolean }) => (
    <motion.div
        initial={false}
        animate={{
            scale: isActive ? 1 : 0.9,
            opacity: isActive ? 1 : 0.4,
            filter: isActive ? 'blur(0px)' : 'blur(4px)',
            y: isActive ? 0 : 20
        }}
        className={`relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[4rem] p-12 lg:p-20 border border-white/60 dark:border-white/5 shadow-2xl shadow-teal-900/5 transition-all duration-1000 flex flex-col justify-between h-full min-h-[500px]`}
    >
        {/* Abstract "Clean" Element */}
        <div className="absolute top-12 right-12 opacity-5 dark:opacity-10">
            <ChatBubbleLeftRightIcon className="w-24 h-24 text-teal-600" />
        </div>

        <div className="relative z-10">
            <div className="flex gap-1.5 mb-10">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-teal-500' : 'text-slate-200 dark:text-slate-800'}`} />
                ))}
            </div>
            
            <p className="text-slate-800 dark:text-slate-100 text-2xl md:text-5xl font-medium leading-[1.2] tracking-tight mb-12">
                “{testimonial.quote}”
            </p>
        </div>

        <div className="flex items-center gap-8 pt-12 border-t border-slate-100 dark:border-white/5">
            <div className="relative">
                <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                    <img
                        src={testimonial.avatarUrl}
                        alt={testimonial.authorName}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-teal-600 p-2.5 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
                    <SparklesIcon className="w-4 h-4 text-white" />
                </div>
            </div>
            <div className="text-left">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter">{testimonial.authorName}</h4>
                <p className="text-[11px] font-black text-teal-600 uppercase tracking-[0.4em] mt-1">{testimonial.role}</p>
            </div>
        </div>
    </motion.div>
);

export default function TestimonialsSection() {
    const [index, setIndex] = useState(0);

    const next = useCallback(() => setIndex((i) => (i + 1) % laundryTestimonials.length), []);
    const prev = useCallback(() => setIndex((i) => (i - 1 + laundryTestimonials.length) % laundryTestimonials.length), []);

    return (
        <section className="relative py-24 lg:py-48 bg-slate-50 dark:bg-[#080a0c] overflow-hidden">
            {/* Background Texture - Clean Gradient */}
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[60%] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-32">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px w-16 bg-teal-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">The Guest Registry</span>
                        </div>
                        <h2 className="text-6xl md:text-9xl font-bold text-slate-900 dark:text-white leading-[0.8] tracking-tighter uppercase">
                            NOTES ON <br />
                            <span className="font-serif italic font-light text-slate-300 dark:text-slate-700">Pristine Care.</span>
                        </h2>
                    </motion.div>

                    {/* Architectural Navigation */}
                    <div className="flex gap-6">
                        <button onClick={prev} className="w-24 h-24 rounded-[2rem] border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm hover:shadow-xl active:scale-95 group">
                            <ChevronLeftIcon className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
                        </button>
                        <button onClick={next} className="w-24 h-24 rounded-[2rem] bg-teal-600 flex items-center justify-center text-white shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all active:scale-95">
                            <ChevronRightIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 1.05, x: -50 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center"
                        >
                            {/* Primary Featured Card */}
                            <div className="lg:col-span-3">
                                <TestimonialCard 
                                    testimonial={laundryTestimonials[index]} 
                                    isActive={true} 
                                />
                            </div>

                            {/* Secondary Peek Card */}
                            <div className="hidden lg:block lg:col-span-2 transform translate-y-12">
                                <TestimonialCard 
                                    testimonial={laundryTestimonials[(index + 1) % laundryTestimonials.length]} 
                                    isActive={false} 
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Clean Progress Indicator */}
                    <div className="mt-32 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-12">
                        <div className="flex gap-4">
                            {laundryTestimonials.map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setIndex(i)}
                                    className={`h-1.5 transition-all duration-700 rounded-full ${i === index ? 'w-24 bg-teal-600' : 'w-6 bg-slate-200 dark:bg-slate-800'}`}
                                />
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-12">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Batch Verified</p>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">2026 Spring Collection</p>
                             </div>
                             <div className="h-16 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                             <div className="flex flex-col items-end">
                                <span className="text-5xl font-serif italic text-slate-200 dark:text-slate-800 tabular-nums leading-none">
                                    0{index + 1}
                                </span>
                                <span className="text-[10px] font-black text-teal-600 uppercase tracking-tighter mt-1">Order Ref</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}