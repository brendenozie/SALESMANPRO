'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon,  } from '@heroicons/react/24/outline';

// Mock/Fallback Data
const staticTestimonials = [
    {
        authorName: 'Sarah L.',
        role: 'Wellness Enthusiast',
        quote: 'Booking my service through this platform is incredibly smooth and easy. The user interface is intuitive, and I always find exactly what I need. Highly recommend!',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734b319?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'James K.',
        role: 'Executive Director',
        quote: 'I was impressed by the quality of service providers and the seamless booking process. This platform truly sets a new standard for convenience and excellence.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1549040846-95ff88301f2f?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'Amara N.',
        role: 'Lifestyle Blogger',
        quote: 'The personalized experience I received was outstanding. Every detail was taken care of, making my well-being journey truly special. A fantastic discovery!',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=200&auto=format&fit=crop',
    },
    {
        authorName: 'David R.',
        role: 'Tech Lead',
        quote: 'Finally, a platform that understands what clients need. Quick, reliable, and with top-tier professionals. My go-to for all my wellness needs now.',
        rating: 4,
        avatarUrl: 'https://images.unsplash.com/photo-1557088924-d2e825a0b73c?q=80&w=200&auto=format&fit=crop',
    },
];

const TestimonialCard = ({ testimonial, primaryColor, isActive }: { testimonial: any, primaryColor: string, isActive: boolean }) => (
    <motion.div
        initial={false}
        animate={{
            scale: isActive ? 1 : 0.9,
            opacity: isActive ? 1 : 0.5,
            z: isActive ? 10 : 0
        }}
        className={`relative bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 lg:p-12 border border-white shadow-2xl transition-all duration-500 flex flex-col justify-between h-full group`}
        style={{
            boxShadow: isActive ? `0 40px 80px -20px ${primaryColor}30` : '0 10px 30px -10px rgba(0,0,0,0.1)'
        }}
    >
        {/* Floating Quote Icon */}
        <div 
            className="absolute -top-6 -left-6 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500"
            style={{ backgroundColor: primaryColor }}
        >
            <ChatBubbleLeftRightIcon className="w-7 h-7 text-white" />
        </div>

        <div className="relative z-10">
            <div className="flex text-amber-400 mb-6">
                {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-slate-200'}`} />
                ))}
            </div>
            
            <p className="text-slate-800 text-xl md:text-2xl font-semibold leading-snug italic mb-10">
                "{testimonial.quote}"
            </p>
        </div>

        <div className="flex items-center gap-5 pt-8 border-t border-slate-100">
            <div className="relative">
                <img
                    src={testimonial.avatarUrl}
                    alt={testimonial.authorName}
                    className="w-16 h-16 rounded-2xl object-cover shadow-md ring-4 ring-white"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                    <SparklesIcon className="w-3 h-3 text-white" />
                </div>
            </div>
            <div className="text-left">
                <h4 className="text-lg font-black text-slate-900">{testimonial.authorName}</h4>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{testimonial.role || 'Verified User'}</p>
            </div>
        </div>
    </motion.div>
);

export default function TestimonialsSection({ name = 'SwiftServe', themeSettings }: any) {
    const primaryColor = themeSettings?.primaryColor || '#059669';
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const next = useCallback(() => setIndex((i) => (i + 1) % staticTestimonials.length), []);
    const prev = useCallback(() => setIndex((i) => (i - 1 + staticTestimonials.length) % staticTestimonials.length), []);

    return (
        <section className="relative py-24 lg:py-40 bg-slate-50 overflow-hidden">
            {/* Design Elements: Blurry blobs and grid */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 pointer-events-none bg-indigo-400" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="max-w-2xl text-left"
                    >
                        <span className="text-sm font-black uppercase tracking-[0.3em] mb-4 block" style={{ color: primaryColor }}>
                            Wall of Love
                        </span>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                            Trusted by those who <br />
                            <span className="italic font-serif font-light text-slate-400">demand excellence.</span>
                        </h2>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-4 mb-2">
                        <button onClick={prev} className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center hover:bg-white hover:border-white hover:shadow-xl transition-all group">
                            <ChevronLeftIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                        </button>
                        <button onClick={next} className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: primaryColor }}>
                            <ChevronRightIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Slider Component */}
                <div className="relative min-h-[500px]">
                    <div className="flex gap-8 overflow-visible">
                        <AnimatePresence mode="popLayout">
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full"
                            >
                                {/* We show two cards at once on desktop, with the first being active */}
                                <div className="w-full">
                                    <TestimonialCard 
                                        testimonial={staticTestimonials[index]} 
                                        primaryColor={primaryColor} 
                                        isActive={true} 
                                    />
                                </div>
                                <div className="hidden lg:block w-full">
                                    <TestimonialCard 
                                        testimonial={staticTestimonials[(index + 1) % staticTestimonials.length]} 
                                        primaryColor={primaryColor} 
                                        isActive={false} 
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Custom Progress Bar */}
                    <div className="mt-16 flex items-center gap-6">
                        <div className="flex-1 h-[2px] bg-slate-200 relative overflow-hidden">
                            <motion.div 
                                className="absolute inset-0 h-full origin-left"
                                style={{ backgroundColor: primaryColor }}
                                animate={{ scaleX: (index + 1) / staticTestimonials.length }}
                            />
                        </div>
                        <span className="text-sm font-black text-slate-400 tabular-nums">
                            0{index + 1} / 0{staticTestimonials.length}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}