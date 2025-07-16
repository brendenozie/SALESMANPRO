"use client";

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import Image from 'next/image';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    StarIcon, // For rating
    HeartIcon, // For general positive sentiment
    SparklesIcon // For a touch of magic
} from '@heroicons/react/24/solid'; // Using solid icons for punch

// Loader function (keep as is)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for carousel transitions
const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8,
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
        },
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.8,
        transition: {
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
        },
    }),
};

// Placeholder for Testimonial Item structure
interface TestimonialItem {
    id: string;
    quote: string;
    name: string;
    avatar: string;
    title?: string; // Optional: member's title/profession
    program?: string; // Optional: program they joined
    rating: number; // Rating out of 5 stars
}

// Dummy data for demonstration
const dummyTestimonials: TestimonialItem[] = [
    {
        id: 'test1',
        quote: "Joining this community was the best decision for my fitness journey! The trainers are incredibly supportive, and the variety of classes keeps me motivated every day. I've seen amazing results!",
        name: 'Sarah Chen',
        avatar: '/images/avatar-sarah.jpg', // Ensure these images exist
        title: 'Marketing Specialist',
        program: 'Elite Fitness Program',
        rating: 5,
    },
    {
        id: 'test2',
        quote: "I never thought I'd enjoy working out, but the virtual classes here are a game-changer. The flexibility and expert guidance have helped me stay consistent and feel fantastic.",
        name: 'David Kim',
        avatar: '/images/avatar-david.jpg',
        title: 'Software Engineer',
        program: 'Virtual Yoga & Mindfulness',
        rating: 4,
    },
    {
        id: 'test3',
        quote: "The personalized nutrition advice I received was revolutionary. It wasn't just about weight loss, but about a holistic approach to wellness that truly changed my life for the better.",
        name: 'Maria Rodriguez',
        avatar: '/images/avatar-maria.jpg',
        title: 'Small Business Owner',
        program: 'Nutrition Coaching',
        rating: 5,
    },
    {
        id: 'test4',
        quote: "The community here is so welcoming and inspiring. It feels like a second family. Every session leaves me energized and ready to tackle anything!",
        name: 'Omar Hassan',
        avatar: '/images/avatar-omar.jpg',
        title: 'Graphic Designer',
        program: 'Group Strength Classes',
        rating: 5,
    },
];

// ----------------------------------------------------------------------------
// TestimonialsSection: Transformed into an intuitive, engaging, captivating, and beautiful design
// ----------------------------------------------------------------------------
export default function TestimonialsSection({ testimonials = dummyTestimonials }: { testimonials?: TestimonialItem[] }) {
    const [[page, direction], setPage] = useState([0, 0]); // [index, direction] for Framer Motion exit animation

    const paginate = (newDirection: number) => {
        setPage(([currentPage]) => [
            (currentPage + newDirection + testimonials.length) % testimonials.length,
            newDirection,
        ]);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            paginate(1); // Move to the next slide automatically
        }, 6000); // Auto-rotate every 6 seconds

        return () => clearInterval(timer);
    }, [testimonials.length]); // Dependency on length

    const currentTestimonial = testimonials[page];

    return (
        <section className="relative py-20 bg-gradient-to-br from-indigo-50 to-blue-50 overflow-hidden"> {/* Softer gradient background, overflow hidden */}
            {/* Decorative background shapes for visual appeal */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-light opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary-accent opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

            <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
                <motion.h2
                    className="mb-14 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Hear From Our <span className="text-primary-dark">Thriving Community</span> ✨
                </motion.h2>

                <div className="relative h-[400px] flex items-center justify-center"> {/* Fixed height for smooth transitions */}
                    <AnimatePresence initial={false} custom={direction}>
                        {currentTestimonial && (
                            <motion.div
                                key={page} // Key changes to trigger re-render and animation
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute w-full max-w-xl bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 flex flex-col items-center text-center gap-6" // Premium card styling
                            >
                                {/* Avatar */}
                                <div className="relative w-28 h-28">
                                    <Image
                                        src={currentTestimonial.avatar}
                                        alt={currentTestimonial.name}
                                        fill
                                        className="rounded-full object-cover ring-4 ring-primary-light ring-offset-4 ring-offset-white shadow-md" // Vibrant ring, subtle shadow
                                        loader={loader}
                                        sizes="112px"
                                    />
                                    {/* Rating Stars */}
                                    <div className="absolute -bottom-2 right-0 flex items-center justify-center bg-yellow-400 rounded-full p-1.5 shadow-lg">
                                        {[...Array(currentTestimonial.rating)].map((_, i) => (
                                            <StarIcon key={i} className="h-4 w-4 text-yellow-700" />
                                        ))}
                                    </div>
                                </div>

                                {/* Quote */}
                                <p className="text-xl md:text-2xl font-medium text-gray-800 italic leading-relaxed">
                                    &ldquo;{currentTestimonial.quote}&rdquo;
                                </p>

                                {/* Name & Details */}
                                <div className="flex flex-col items-center mt-2">
                                    <h3 className="text-2xl font-bold text-primary-dark">{currentTestimonial.name}</h3>
                                    {currentTestimonial.title && (
                                        <p className="text-md text-gray-600">{currentTestimonial.title}</p>
                                    )}
                                    {currentTestimonial.program && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Joined: <span className="font-medium">{currentTestimonial.program}</span>
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <motion.button
                        onClick={() => paginate(-1)}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-8 p-3 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 z-20 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Previous testimonial"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeftIcon className="h-6 w-6" />
                    </motion.button>
                    <motion.button
                        onClick={() => paginate(1)}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-8 p-3 bg-white text-gray-800 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 z-20 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="Next testimonial"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRightIcon className="h-6 w-6" />
                    </motion.button>
                </div>

                {/* Navigation Dots */}
                <div className="mt-16 flex justify-center space-x-3">
                    {testimonials.map((_, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => setPage([idx, idx > page ? 1 : -1])} // Correctly set direction for dot clicks
                            className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 ${idx === page ? "bg-primary-dark scale-125 shadow-md" : "bg-gray-300 hover:bg-gray-400"}`}
                            aria-label={`Go to testimonial ${idx + 1}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Remember to update your tailwind.config.js with these colors if you haven't already:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // A nice vibrant indigo
          light: '#818CF8',
          dark: '#4F46E5', // Slightly darker for accents/buttons
          hover: '#4338CA', // Even darker for hover states
          accent: '#A78BFA', // A brighter accent for highlights
        },
      },
    },
  },
  plugins: [],
}

// For the background blobs (optional, but adds a lot):
// Add this to your `tailwind.config.js` under `extend.keyframes` and `extend.animation`
// (You might need to install `tailwindcss-animate` if you haven't, or define these manually)

// In tailwind.config.js plugins array:
// require('tailwindcss-animate'),

// Keyframes:
// blob: {
//   '0%': { transform: 'translate(0px, 0px) scale(1)' },
//   '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
//   '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
//   '100%': { transform: 'translate(0px, 0px) scale(1)' },
// },

// Animation:
// animation: {
//   blob: 'blob 7s infinite cubic-bezier(0.6, 0.01, 0.4, 1)',
// },
*/