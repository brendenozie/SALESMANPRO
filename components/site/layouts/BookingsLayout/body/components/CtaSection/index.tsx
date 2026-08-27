'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftRightIcon, ShieldCheckIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline';

// Mock implementation for the custom hook and context data
const useStoreContext = () => ({
    storeFormData: {
        name: 'The Wellness Hub',
        testimonials: [],
        themeSettings: { primaryColor: '#059669' }, // Emerald 600
    }
});

// Fallback enhanced static testimonials with categorical metadata tags for filtering
const staticTestimonials = [
    {
        authorName: 'Sarah L.',
        quote: 'Booking my service through this platform is incredibly smooth and easy. The user interface is intuitive, and I always find exactly what I need. Highly recommend!',
        rating: 5,
        category: 'Experience',
        tagline: 'Flawless Experience',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734b319?q=80&w=2669&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'James K.',
        quote: 'I was impressed by the quality of service providers and the seamless booking process. This platform truly sets a new standard for convenience and excellence.',
        rating: 5,
        category: 'Quality',
        tagline: 'Next-Level Quality',
        avatarUrl: 'https://images.unsplash.com/photo-1549040846-95ff88301f2f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'Amara N.',
        quote: 'The personalized experience I received was outstanding. Every detail was taken care of, making my well-being journey truly special. A fantastic discovery!',
        rating: 5,
        category: 'Service',
        tagline: 'Highly Personalized',
        avatarUrl: 'https://images.unsplash.com/photo-1542345513-8a9d18b6e632?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'David R.',
        quote: 'Finally, a platform that understands what clients need. Quick, reliable, and with top-tier professionals. My go-to for all my wellness needs now.',
        rating: 4,
        category: 'Quality',
        tagline: 'Reliable & Prompt',
        avatarUrl: 'https://images.unsplash.com/photo-1557088924-d2e825a0b73c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
        authorName: 'Fatuma A.',
        quote: 'The secure payment system gave me great peace of mind. Combined with the easy scheduling, it made the whole process stress-free from start to finish.',
        rating: 5,
        category: 'Security',
        tagline: 'Safe & Stress-Free',
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

interface TestimonialsSectionProps {
    name?: string | null;
    testimonials?: typeof staticTestimonials;
    themeSettings?: {
        primaryColor?: string;
    } | null;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://127.0.0.1:3000/api';

export default function PremiumBentoTestimonials({ name = 'Our Platform', testimonials = [], themeSettings }: TestimonialsSectionProps) {
    const { storeFormData } = useStoreContext();    
    const items = testimonials.length ? testimonials : staticTestimonials;
    const primaryColor = themeSettings?.primaryColor || '#059669';
    
    const [activeFilter, setActiveFilter] = useState('All');
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Unique Categories Extract
    const categories = useMemo(() => {
        const list = new Set(items.map(i => i.category || 'General'));
        return ['All', ...Array.from(list)];
    }, [items]);

    // Filter Logic
    const filteredItems = useMemo(() => {
        if (activeFilter === 'All') return items;
        return items.filter(item => item.category === activeFilter);
    }, [items, activeFilter]);

    // Icon Mapping based on categories
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Experience': return <SparklesIcon className="w-4 h-4" />;
            case 'Quality': return <TrophyIcon className="w-4 h-4" />;
            case 'Security': return <ShieldCheckIcon className="w-4 h-4" />;
            default: return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
        }
    };


       const handleSubmit = async (e: React.FormEvent) => {
              e.preventDefault();
              setIsSubmitting(true);
              const formattedContent = `NEW INQUIRY\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`;
      
              try {
                  const res = await fetch(`${apiBaseUrl}/conversations/send-to-admin`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ companyId: storeFormData?.id, content: formattedContent }),
                  });
                  if (!res.ok) throw new Error("API Error");
                  setSubmitStatus('success');
                  setFormData({ name: '', email: '', message: '' });
              } catch (error) {
                  setSubmitStatus('error');
              } finally {
                  setIsSubmitting(false);
              }
          };

    return (
        <section id="testimonials" className="relative bg-[#0b1329] py-28 lg:py-40 px-6 lg:px-8 text-white overflow-hidden">
            
            {/* 🌌 High-End Cosmic Backdrop Lighting Effects */}
            <div 
                className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.12] pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div 
                className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.1] pointer-events-none"
                style={{ backgroundColor: primaryColor }}
            />
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* Header Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-20">
                    <div className="lg:col-span-7 space-y-4">
                        <div 
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-sm"
                        >
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Wall of Proof</span>
                        </div>
                        
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none">
                            Validated by <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200" style={{ WebkitTextFillColor: 'transparent', backgroundImage: `linear-gradient(to right, #ffffff, ${primaryColor})` }}>industry leaders</span>
                        </h2>
                        
                        <p className="text-lg text-gray-400 max-w-2xl font-light">
                            Discover how <strong className="text-white font-semibold">{name || 'Our Platform'}</strong> transforms standard operations into frictionless user experiences, verified completely by our dynamic client network.
                        </p>
                    </div>

                    {/* Dynamic Filters Pills Layout */}
                    <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-2">
                        {categories.map((category) => {
                            const isSelected = activeFilter === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setActiveFilter(category)}
                                    className="px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 border"
                                    style={{
                                        backgroundColor: isSelected ? primaryColor : 'rgba(255, 255, 255, 0.03)',
                                        borderColor: isSelected ? primaryColor : 'rgba(255, 255, 255, 0.08)',
                                        color: isSelected ? '#ffffff' : '#9ca3af',
                                        boxShadow: isSelected ? `0 10px 25px -5px ${hexToRgba(primaryColor, 0.4)}` : 'none'
                                    }}
                                >
                                    {category !== 'All' && getCategoryIcon(category)}
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 🍱 Bento Masonry Grid Implementation */}
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[240px]"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((testimonial, idx) => {
                            // Rule definitions to balance sizing constraints beautifully across the Bento presentation layers
                            const isFeatured = idx === 0 && activeFilter === 'All';
                            const gridClasses = isFeatured 
                                ? 'md:col-span-2 md:row-span-2 row-span-2' 
                                : 'col-span-1 row-span-1 md:row-span-1';

                            return (
                                <motion.div
                                    layout
                                    key={testimonial.authorName}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                                    className={`relative rounded-3xl p-6 lg:p-8 overflow-hidden border border-white/10 flex flex-col justify-between group cursor-default ${gridClasses}`}
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                        backdropFilter: 'blur(20px)'
                                    }}
                                    whileHover={{ 
                                        borderColor: hexToRgba(primaryColor, 0.4),
                                        boxShadow: `0 30px 60px -15px rgba(0,0,0,0.3), inset 0 1px 0 0 ${hexToRgba(primaryColor, 0.2)}`
                                    }}
                                >
                                    {/* Ambient subtle spotlight inside hover interactions */}
                                    <div 
                                        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                                        style={{ backgroundColor: primaryColor }}
                                    />

                                    <div>
                                        {/* Upper Meta Flag */}
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <span 
                                                className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border border-white/5 bg-white/5"
                                                style={{ color: isFeatured ? '#ffffff' : hexToRgba(primaryColor, 1) }}
                                            >
                                                {testimonial.tagline || testimonial.category}
                                            </span>
                                            <div className="flex gap-0.5 text-amber-500">
                                                {Array.from({ length: testimonial.rating ?? 5 }).map((_, i) => (
                                                    <StarIcon key={i} className="w-4 h-4" />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Core Quote Statement */}
                                        <p className={`text-gray-300 leading-relaxed font-light ${isFeatured ? 'text-xl sm:text-2xl mt-4 max-w-xl font-normal' : 'text-sm line-clamp-4 lg:line-clamp-5'}`}>
                                            “{testimonial.quote}”
                                        </p>
                                    </div>

                                    {/* User Signature Row */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={testimonial.avatarUrl}
                                                alt={testimonial.authorName}
                                                className="w-10 h-10 rounded-full object-cover ring-2"
                                                style={{ ringColor: hexToRgba(primaryColor, 0.5) }}
                                            />
                                            <div className="text-left">
                                                <h4 className="text-sm font-bold text-white tracking-tight">{testimonial.authorName}</h4>
                                                <div className="flex items-center gap-1 opacity-50">
                                                    <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Verified Client</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Background Structural Watermark Accent */}
                                        <span className="font-serif text-5xl select-none pointer-events-none opacity-5 text-white group-hover:scale-110 transition-transform duration-300">”</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}