'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import { useStoreContext as useActualStoreContext } from '@/contexts/StoreContext';

const useStoreContext = () => {
  try {
    const ctx = useActualStoreContext();
    if (ctx?.storeFormData) return ctx;
  } catch (e) {}
  return {
    storeFormData: {
      name: 'The Wellness Hub',
      testimonials: [],
      themeSettings: { primaryColor: '#059669' },
    }
  };
};

// Fallback static testimonials
const staticTestimonials = [
    {
        authorName: 'Sarah L.',
        quote: 'Booking my service through this platform is incredibly smooth and easy. The user interface is intuitive, and I always find exactly what I need. Highly recommend!',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734b319?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'James K.',
        quote: 'I was impressed by the quality of service providers and the seamless booking process. This platform truly sets a new standard for convenience and excellence.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1549040846-95ff88301f2f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'Amara N.',
        quote: 'The personalized experience I received was outstanding. Every detail was taken care of, making my well-being journey truly special. A fantastic discovery!',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'David R.',
        quote: 'Finally, a platform that understands what clients need. Quick, reliable, and with top-tier professionals. My go-to for all my wellness needs now.',
        rating: 4,
        avatarUrl: 'https://images.unsplash.com/photo-1557088924-d2e825a0b73c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'Fatuma A.',
        quote: 'The secure payment system gave me great peace of mind. Combined with the easy scheduling, it made the whole process stress-free from start to finish.',
        rating: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1596461404986-e88e404b4c73?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
];

// Helper to safely convert hex to rgba for glassmorphism styles
const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const TestimonialCard = ({ testimonial, primaryColor }: { testimonial: typeof staticTestimonials[0], primaryColor: string }) => (
    <motion.div 
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative h-full flex flex-col justify-between p-8 lg:p-10 rounded-3xl border border-white/40 bg-white/95 dark:bg-zinc-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden group"
    >
        {/* Decorative dynamic ambient glow inside card top-right */}
        <div 
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 group-hover:scale-150"
            style={{ backgroundColor: primaryColor }}
        />

        <div>
            {/* Elegant Large Quote Graphic */}
            <span 
                className="absolute top-4 right-6 font-serif text-8xl select-none pointer-events-none transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 opacity-10"
                style={{ color: primaryColor }}
            >
                ”
            </span>

            {/* Star Ratings Row */}
            <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, idx) => (
                    <StarIcon 
                        key={idx} 
                        className={`w-5 h-5 transition-all duration-300 ${idx < (testimonial.rating ?? 5) ? 'scale-100' : 'opacity-20 scale-90'}`}
                        style={{ color: idx < (testimonial.rating ?? 5) ? '#F59E0B' : '#9CA3AF' }}
                    />
                ))}
            </div>

            {/* Quote text */}
            <p className="text-gray-700 text-lg sm:text-xl font-normal leading-relaxed mb-8 relative z-10 antialiased">
                “{testimonial.quote}”
            </p>
        </div>

        {/* User Info Block */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100/80 relative z-10">
            <div className="relative">
                <div 
                    className="absolute inset-0 rounded-full blur-[4px] opacity-40 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: primaryColor }}
                />
                <img
                    src={testimonial.avatarUrl || 'https://placehold.co/64x64/d1d5db/059669?text=A'}
                    alt={testimonial.authorName}
                    className="w-14 h-14 rounded-full object-cover border-2 shadow-inner relative z-10"
                    style={{ borderColor: primaryColor }}
                />
            </div>
            <div className="text-left">
                <h4 className="text-lg font-bold text-gray-900 tracking-tight">{testimonial.authorName}</h4>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60" style={{ color: primaryColor }}>Verified Customer</p>
            </div>
        </div>
    </motion.div>
);

const CustomSlider = ({ items, primaryColor }: { items: typeof staticTestimonials, primaryColor: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const visibleCards = isMobile ? 1 : 2;
    const maxIndex = Math.ceil(items.length / visibleCards) - 1;

    const next = useCallback(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, [maxIndex]);

    const prev = useCallback(() => {
        setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    }, [maxIndex]);

    // Autoplay configuration
    useEffect(() => {
        const interval = setInterval(next, 7000);
        return () => clearInterval(interval);
    }, [next]);

    // Group items into viewport frames dynamically
    const slideFrames = useMemo(() => {
        const chunks = [];
        for (let i = 0; i < items.length; i += visibleCards) {
            chunks.push(items.slice(i, i + visibleCards));
        }
        return chunks;
    }, [items, visibleCards]);

    return (
        <div className="relative w-full">
            {/* Viewport Window */}
            <div className="overflow-hidden min-h-[380px] sm:min-h-[320px] lg:min-h-[280px] px-2 py-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
                    >
                        {slideFrames[currentIndex]?.map((testimonial, index) => (
                            <TestimonialCard 
                                key={testimonial.authorName + index} 
                                testimonial={testimonial} 
                                primaryColor={primaryColor} 
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sleek Floating Control Layout (Desktop Only) */}
            <div className="hidden lg:block">
                <button
                    onClick={prev}
                    className="absolute left-[-5rem] top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 text-gray-700 hover:scale-110 active:scale-95 transition-all duration-200 group z-30"
                    aria-label="Previous testimonials"
                >
                    <ChevronLeftIcon className="w-6 h-6 transition-colors duration-200" style={{ '--hover-color': primaryColor } as React.CSSProperties} />
                </button>
                <button
                    onClick={next}
                    className="absolute right-[-5rem] top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-100 text-gray-700 hover:scale-110 active:scale-95 transition-all duration-200 group z-30"
                    aria-label="Next testimonials"
                >
                    <ChevronRightIcon className="w-6 h-6 transition-colors duration-200" style={{ '--hover-color': primaryColor } as React.CSSProperties} />
                </button>
            </div>

            {/* Smart Expansive Pagination Pills */}
            <div className="flex justify-center items-center gap-2 mt-12">
                {slideFrames.map((_, i) => {
                    const isActive = i === currentIndex;
                    return (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className="h-2.5 rounded-full transition-all duration-500 relative overflow-hidden focus:outline-none"
                            style={{ 
                                width: isActive ? '32px' : '10px',
                                backgroundColor: isActive ? primaryColor : hexToRgba(primaryColor, 0.2)
                            }}
                            aria-label={`Go to slide frame ${i + 1}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

interface TestimonialsSectionProps {
    name?: string | null;
    testimonials?: typeof staticTestimonials;
    themeSettings?: {
        primaryColor?: string;
    } | null;
}

const calculateAverageRating = (items: typeof staticTestimonials) => {
    if (!items || items.length === 0) return 0;
    return (items.reduce((sum, item) => sum + (item.rating || 0), 0) / items.length).toFixed(1);
};

export default function TestimonialsSection({ name = 'Our Platform', testimonials = [], themeSettings }: TestimonialsSectionProps) {
    const items = testimonials.length ? testimonials : staticTestimonials;
    const primaryColor = themeSettings?.primaryColor || '#059669';
    const averageRating = calculateAverageRating(items);

    return (
        <section id="testimonials" className="relative bg-slate-50 py-28 lg:py-40 px-6 lg:px-8 text-gray-900 overflow-hidden">
            
            {/* 🪐 Ambient Premium Lighting Layers */}
            <div 
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.06] pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div 
                className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            
            {/* Elegant Geometry Net */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `radial-gradient(circle, ${primaryColor} 1.5px, transparent 1.5px)`,
                backgroundSize: '40px 40px',
            }} />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    
                    {/* Badge Pill */}
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 bg-white/80 border px-4 py-2 rounded-full shadow-sm mb-6"
                        style={{ borderColor: hexToRgba(primaryColor, 0.15) }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Client Success Stories</span>
                    </motion.div>
                    
                    {/* Captivating Heading */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]"
                    >
                        Hear From Our <span className="relative inline-block">
                            <span className="relative z-10" style={{ color: primaryColor }}>Happy Clients</span>
                            <span className="absolute bottom-2 left-0 w-full h-3 -rotate-1 opacity-20 -z-10" style={{ backgroundColor: primaryColor }} />
                        </span>
                    </motion.h2>

                    {/* Highly intuitive descriptive subtext */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed font-normal"
                    >
                        Stop guessing. See real impact. Discover why 
                        <strong className="font-bold mx-1 text-gray-900">{name || 'Our Platform'}</strong> 
                        is consistently rated 5 stars by the people who matter most—our beautiful community.
                    </motion.p>

                    {/* Integrated Trust / Credibility Score */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 mt-8 px-5 py-2.5 bg-white rounded-2xl shadow-sm border border-gray-100"
                    >
                        <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, idx) => (
                                <StarIcon key={idx} className="w-5 h-5" />
                            ))}
                        </div>
                        <div className="h-4 w-[1px] bg-gray-200" />
                        <p className="text-sm font-semibold text-gray-700">
                            <span className="font-extrabold text-gray-900 text-base">{averageRating}</span> / 5.0 Rating ({items.length} reviews)
                        </p>
                    </motion.div>
                </div>

                {/* Main Dynamic Slider Wrapper */}
                <div className="max-w-6xl mx-auto relative px-0 sm:px-4 lg:px-8">
                    <CustomSlider items={items} primaryColor={primaryColor} />
                </div>
            </div>
        </section>
    );
}