"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
     // New icon for download emphasis
    CalendarDaysIcon, // For scheduling/tracking
    VideoCameraIcon, // For live classes
    ChartBarSquareIcon, // For progress tracking
    SparklesIcon // For general appeal
} from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants
const textVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 1.0, // Slower for grander entrance
            ease: "easeOut",
            staggerChildren: 0.2, // Stagger children for text
        },
    },
};

const imageVariants = {
    hidden: { opacity: 0, x: 100, rotate: 5 }, // Slight rotation on entry
    visible: {
        opacity: 1,
        x: 0,
        rotate: 0,
        transition: {
            duration: 1.0, // Slower for grander entrance
            ease: "easeOut",
        },
    },
};

const featureItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
        },
    },
};


// ----------------------------------------------------------------------------
// AppPromotion: Encourages user to download the mobile app
// ----------------------------------------------------------------------------
export default function AppPromotion() {
    return (
        <section className="relative py-24 bg-gradient-to-br from-purple-50 to-blue-100 overflow-hidden"> {/* Dynamic gradient background */}
            {/* Abstract Background Blobs - adds visual depth and movement */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-200 opacity-15 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-16"> {/* Increased gap */}

                {/* Text Content - Left Side */}
                <motion.div
                    className="flex-1 text-center lg:text-left relative z-10" // Ensure text is above blobs
                    variants={textVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
                        variants={featureItemVariants} // Apply child variant for stagger
                    >
                        Your <span className="text-primary-dark">Fitness Journey</span>, Right in Your Pocket!
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-700 mb-8 max-w-lg lg:max-w-none mx-auto"
                        variants={featureItemVariants} // Apply child variant
                    >
                        Download our intuitive mobile app to seamlessly manage your workouts, join live classes, track your progress, and stay motivated—anytime, anywhere.
                        Your personalized wellness hub awaits!
                    </motion.p>

                    {/* Key Features (Visually appealing list) */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
                        variants={featureItemVariants} // Apply child variant
                    >
                        <div className="flex items-center text-gray-800 text-lg">
                            <CalendarDaysIcon className="h-6 w-6 text-primary-dark mr-3" /> Schedule & Track Workouts
                        </div>
                        <div className="flex items-center text-gray-800 text-lg">
                            <VideoCameraIcon className="h-6 w-6 text-primary-dark mr-3" /> Access Live & On-Demand Classes
                        </div>
                        <div className="flex items-center text-gray-800 text-lg">
                            <ChartBarSquareIcon className="h-6 w-6 text-primary-dark mr-3" /> Monitor Progress Visually
                        </div>
                        <div className="flex items-center text-gray-800 text-lg">
                            <SparklesIcon className="h-6 w-6 text-primary-dark mr-3" /> Personalized Programs & More!
                        </div>
                    </motion.div>

                    {/* Download Badges */}
                    <motion.div
                        className="flex justify-center lg:justify-start space-x-4 mt-6"
                        variants={featureItemVariants} // Apply child variant
                    >
                        <a href="#" aria-label="Download on the App Store" className="transform transition-transform duration-300 hover:scale-105 shadow-lg rounded-xl overflow-hidden">
                            <Image
                                src="/images/app-store-badge.svg"
                                alt="Download on the App Store"
                                width={160} // Slightly larger badges
                                height={50}
                                loader={loader}
                            />
                        </a>
                        <a href="#" aria-label="Get it on Google Play" className="transform transition-transform duration-300 hover:scale-105 shadow-lg rounded-xl overflow-hidden">
                            <Image
                                src="/images/play-store-badge.svg"
                                alt="Get it on Google Play"
                                width={160}
                                height={50}
                                loader={loader}
                            />
                        </a>
                    </motion.div>
                </motion.div>

                {/* Mockup Images - Right Side */}
                <motion.div
                    className="flex-1 flex justify-center lg:justify-end relative"
                    variants={imageVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <div className="relative w-64 h-[450px] md:w-80 md:h-[550px] transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-out z-10"> {/* Larger phone, slight rotation, hover effect */}
                        <Image
                            src="/images/app-mockup-main.png" // Single main mockup for impact
                            alt="Main App Mockup"
                            fill
                            className="object-contain drop-shadow-2xl" // Stronger shadow
                            loader={loader}
                            sizes="(max-width: 768px) 60vw, (max-width: 1200px) 40vw, 30vw"
                            priority // Prioritize loading this image
                        />
                    </div>
                    {/* Optional: Add a second, smaller, layered mockup if you have distinct screens */}
                    {/* <div className="absolute w-40 h-72 md:w-52 md:h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 translate-x-32 -translate-y-24 hidden lg:block z-0">
                        <Image
                            src="/images/app-mockup-secondary.png" // Second mockup
                            alt="Secondary App Mockup"
                            layout="fill"
                            objectFit="contain"
                            className="drop-shadow-xl opacity-80"
                            loader={loader}
                        />
                    </div> */}
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