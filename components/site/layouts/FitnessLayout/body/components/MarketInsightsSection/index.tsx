"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
    BookOpenIcon, // For articles/guides
    ChartBarIcon, // For data/insights
    BeakerIcon, // For tools/resources
    SparklesIcon, // For general appeal
    ArrowRightIcon // For CTA
} from '@heroicons/react/24/solid'; // Using solid icons for punch and clarity

// Loader function (keep as is)
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants (adjusted for this section's context)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Faster stagger for content cards
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 }, // Fade in, scale up, and slight lift
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.7, // Smoother transition
            ease: "easeOut",
        },
    },
};

// Placeholder for Insight Item structure
interface InsightItem {
    id: string;
    title: string;
    description: string;
    link: string;
    type: 'article' | 'tool' | 'guide' | 'report'; // Categorize insights
    imageUrl?: string; // Optional image for each insight
}

// Dummy data for demonstration
const dummyInsights: InsightItem[] = [
    {
        id: 'ins1',
        title: 'The Power of Mindful Eating',
        description: 'Discover how conscious eating can transform your relationship with food and improve digestion.',
        link: '/blog/mindful-eating',
        type: 'article',
        imageUrl: '/images/insight-mindful-eating.jpg', // Ensure images exist
    },
    {
        id: 'ins2',
        title: 'Interactive Calorie Calculator',
        description: 'Estimate your daily calorie needs for weight management or muscle gain with our easy-to-use tool.',
        link: '/tools/calorie-calculator',
        type: 'tool',
        imageUrl: '/images/insight-calorie-calculator.jpg',
    },
    {
        id: 'ins3',
        title: 'Guide to Home Workouts',
        description: 'A comprehensive guide to effective exercises you can do without leaving your living room.',
        link: '/guides/home-workouts',
        type: 'guide',
        imageUrl: '/images/insight-home-workouts.jpg',
    },
    {
        id: 'ins4',
        title: 'Sleep Optimization Techniques',
        description: 'Unlocking the secrets to better sleep for enhanced recovery and daily performance.',
        link: '/blog/sleep-optimization',
        type: 'article',
        imageUrl: '/images/insight-sleep-optimization.jpg',
    },
    {
        id: 'ins5',
        title: 'Beginner\'s Guide to Meditation',
        description: 'Start your journey to mental clarity and stress reduction with this simple meditation guide.',
        link: '/guides/meditation-guide',
        type: 'guide',
        imageUrl: '/images/insight-meditation-guide.jpg',
    },
    {
        id: 'ins6',
        title: 'Fitness Progress Tracker',
        description: 'Log your workouts, track your progress, and visualize your gains with our intuitive online tracker.',
        link: '/tools/progress-tracker',
        type: 'tool',
        imageUrl: '/images/insight-progress-tracker.jpg',
    },
];

// ----------------------------------------------------------------------------
// WellnessHubSection: Transformed for engaging, captivating, beautiful, and visually appealing design
// ----------------------------------------------------------------------------
export default function WellnessHubSection({ insights = dummyInsights }: { insights?: InsightItem[] }) {
    const getIconForType = (type: string) => {
        switch (type) {
            case 'article':
                return <BookOpenIcon className="h-6 w-6 text-primary" />;
            case 'tool':
                return <BeakerIcon className="h-6 w-6 text-green-500" />; // Different color for tools
            case 'guide':
                return <ChartBarIcon className="h-6 w-6 text-purple-500" />; // Different color for guides
            case 'report':
                return <ChartBarIcon className="h-6 w-6 text-blue-500" />;
            default:
                return <SparklesIcon className="h-6 w-6 text-gray-500" />;
        }
    };

    return (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden"> {/* Softer, more vibrant gradient */}
            {/* Background elements for visual interest */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <motion.h2
                    className="mb-16 text-4xl md:text-5xl font-extrabold text-center text-gray-900 leading-tight"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    Unlock Your Potential with <span className="text-primary-dark">Health Insights & Smart Tools</span> ✨
                </motion.h2>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" // Increased gap
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    {insights.map((ins) => (
                        <motion.a
                            key={ins.id}
                            href={ins.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100 relative overflow-hidden" // Enhanced styling, border
                            whileHover={{ scale: 1.02 }}
                            variants={itemVariants} // Apply individual item animation
                        >
                            {ins.imageUrl && (
                                <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                                    <Image
                                        src={ins.imageUrl}
                                        alt="" // Decorative image, alt can be empty
                                        fill
                                        className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 blur-sm" // Subtle blur and zoom
                                        loader={loader}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/50 to-white/0" /> {/* White gradient overlay */}
                                </div>
                            )}

                            <div className="relative z-10 flex flex-col h-full"> {/* Ensures content is above background image */}
                                <div className="flex items-center mb-4">
                                    {getIconForType(ins.type)}
                                    <span className="ml-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">{ins.type}</span>
                                </div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-primary-dark transition-colors duration-200">{ins.title}</h3>
                                <p className="text-gray-700 mb-6 line-clamp-3 flex-grow">{ins.description}</p> {/* flex-grow to push CTA to bottom */}

                                <span className="mt-auto inline-flex items-center text-primary-dark font-semibold hover:underline group-hover:translate-x-1 transition-transform duration-200">
                                    Explore Now <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </span>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>

                {/* Call to action for more resources */}
                <motion.div
                    className="text-center mt-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <a
                        href="/resources" // Link to your main resources/blog page
                        className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        View All Resources
                        <ArrowRightIcon className="h-5 w-5 ml-3" />
                    </a>
                </motion.div>
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