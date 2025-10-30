import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// NOTE: External dependencies like 'react-slick', 'next/image', and custom contexts
// are not available in this environment. We are implementing a custom slider and
// using standard <img> tags for maximum compatibility.

// Mock implementation for the custom hook and context data
// In a real application, replace this with your actual context logic.
const useStoreContext = () => ({
    storeFormData: {
        name: 'The Wellness Hub',
        testimonials: [], // Use this if provided
        themeSettings: { primaryColor: '#059669' }, // Emerald 600
    }
});

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

// --- Custom Slider Implementation using useReducer (simplified for single file) ---

const TestimonialCard = ({ testimonial, primaryColor }: { testimonial: typeof staticTestimonials[0], primaryColor: string }) => (
    <div className="h-full">
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl border border-gray-100 hover:shadow-3xl hover:shadow-emerald-200/50 transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden h-full flex flex-col justify-between group">
            
            {/* Large, styled Quote Icon */}
            <svg className="absolute top-0 right-0 w-20 h-20 text-emerald-100/50 -mt-2 -mr-2 transition-all duration-300 group-hover:text-emerald-200/80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9.25 6.75A.75.75 0 0110 7.5v3.5a.75.75 0 01-.75.75H6.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75h2.75zm5.75 0a.75.75 0 01.75.75v3.5a.75.75 0 01-.75.75h-3.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 01.75-.75h3.5z" />
            </svg>

            <p className="text-gray-800 text-lg sm:text-xl font-medium leading-relaxed mb-6 mt-4 relative z-10 italic">
                “{testimonial.quote}”
            </p>

            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100">
                <img
                    src={testimonial.avatarUrl || 'https://placehold.co/64x64/d1d5db/059669?text=A'}
                    alt={`Avatar of ${testimonial.authorName}`}
                    width={64}
                    height={64}
                    className="rounded-full object-cover border-4 shadow-lg transition-transform duration-300 group-hover:scale-105 w-16 h-16"
                    style={{ borderColor: primaryColor }}
                    onError={(e: any) => e.target.src = 'https://placehold.co/64x64/d1d5db/059669?text=A'} // Fallback for image loading error
                />
                <div className="text-left">
                    <p className="text-xl font-extrabold text-gray-900">{testimonial.authorName}</p>
                    <div className="flex text-amber-500 mt-1">
                        {Array.from({ length: testimonial.rating ?? 0 }).map((_, idx) => (
                            <StarIcon key={idx} className="w-5 h-5" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const CustomSlider = ({ items, primaryColor }: { items: typeof staticTestimonials, primaryColor: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const totalItems = items.length;
    
    // Determine screen size for responsive behavior
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Logic to calculate how many cards to show
    const visibleCards = isMobile ? 1 : Math.min(items.length, 2);

    // Navigation logic
    const next = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % totalItems);
    }, [totalItems]);

    const prev = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + totalItems) % totalItems);
    }, [totalItems]);

    // Autoplay effect
    useEffect(() => {
        const interval = setInterval(next, 6000);
        return () => clearInterval(interval);
    }, [next]);

    // Scroll effect to simulate sliding (smooth scrolling must be enabled via CSS)
    useEffect(() => {
        if (sliderRef.current) {
            const cardWidth = sliderRef.current.children[0]?.clientWidth || 0;
            // Calculate scroll position based on the current index and card width
            const scrollPosition = currentIndex * cardWidth;
            sliderRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
    }, [currentIndex]);
    
    // Custom Arrow Components (Theme-Aware)
    const ArrowButton = ({ direction, onClick }: { direction: 'prev' | 'next', onClick: () => void }) => (
        <motion.div
            className={`absolute z-20 top-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 rounded-full p-2 lg:p-3 bg-white shadow-xl hover:scale-105 hidden lg:block ${direction === 'prev' ? 'left-4 lg:-left-12' : 'right-4 lg:-right-12'}`}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            style={{ border: `1px solid ${primaryColor}30` }}
        >
            {direction === 'prev' ? (
                <ChevronLeftIcon className="w-8 h-8 lg:w-10 lg:h-10 transition-colors duration-300" style={{ color: primaryColor }} />
            ) : (
                <ChevronRightIcon className="w-8 h-8 lg:w-10 lg:h-10 transition-colors duration-300" style={{ color: primaryColor }} />
            )}
        </motion.div>
    );

    return (
        <div className="relative">
            {/* Slider Track */}
            <div 
                ref={sliderRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-x-hidden scrollbar-hide"
                style={{ scrollSnapType: isMobile ? 'x mandatory' : 'none' }} // Use snap only on mobile
            >
                {items.map((t, i) => (
                    <motion.div
                        key={i}
                        className={`p-2 lg:p-4 flex-shrink-0 snap-center`}
                        style={{ width: isMobile ? '100%' : `${100 / visibleCards}%` }} // Dynamic width
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        <TestimonialCard testimonial={t} primaryColor={primaryColor} />
                    </motion.div>
                ))}
            </div>

            {/* Arrows (Desktop Only) */}
            <ArrowButton direction="prev" onClick={prev} />
            <ArrowButton direction="next" onClick={next} />

            {/* Dots/Pagination (Mobile & Desktop) */}
            <div className="flex justify-center mt-10">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full mx-2 cursor-pointer transition-all duration-300 ${i === currentIndex ? 'scale-125' : 'scale-100'}`}
                        style={{ backgroundColor: i === currentIndex ? primaryColor : '#d1d5db' }}
                        onClick={() => setCurrentIndex(i)}
                    ></div>
                ))}
            </div>
        </div>
    );
};
// End Custom Slider Implementation

export default function TestimonialsSection() {
    // Mock Context Access
    const { storeFormData } = useStoreContext();
    const { name = 'Our Platform', testimonials = [], themeSettings } = storeFormData || {};
    const items = testimonials.length ? testimonials : staticTestimonials;

    // Use a slightly darker primary color for text/accents for better contrast
    const primaryColor = themeSettings?.primaryColor || '#059669'; // Emerald 600

    return (
        <section id="testimonials" className="relative bg-white py-24 lg:py-36 px-6 lg:px-12 text-gray-900 overflow-hidden">
            
            {/* 🎨 Background Grids & Shapes */}
            <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: `radial-gradient(circle, ${primaryColor}20 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
            }} />
            <div className="absolute inset-0 z-0 opacity-5 blur-3xl">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-10">
                <motion.span
                    className="inline-block bg-white text-emerald-700 text-sm font-bold px-5 py-2 rounded-full shadow-lg uppercase tracking-wider border-2 border-emerald-300"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    style={{ color: primaryColor }}
                >
                    Client Success Stories
                </motion.span>
                
                <motion.h2
                    className="text-4xl sm:text-6xl font-extrabold mt-6 text-gray-900 leading-tight max-w-4xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Hear From Our <span style={{ color: primaryColor }}>Happy Clients</span>
                </motion.h2>

                <motion.p
                    className="text-gray-600 max-w-3xl mx-auto mt-4 text-xl leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    Discover how **{name}** is delivering exceptional experiences, confirmed by the people who matter most—our users.
                </motion.p>
            </div>

            {/* Main Testimonials Container using the Custom Slider */}
            <div className="mt-20 max-w-7xl mx-auto relative px-4 lg:px-16">
                {/* NOTE: The old implementation was using <Slider /> from 'react-slick'.
                    We now use the custom <CustomSlider /> component which contains the testimonial cards.
                */}
                <CustomSlider items={items} primaryColor={primaryColor} />
            </div>
        </section>
    );
}
