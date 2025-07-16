"use client";

import React, { useState } from 'react'; // Import useState
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

// Placeholder data - you'll replace this with your actual data
const programTypes = ["Yoga", "Pilates", "CrossFit", "Weightlifting", "Cardio", "Nutrition Coaching"];
const bannerLocations = ["New York", "Los Angeles", "Chicago", "Miami", "Online"];
const goals = ["Weight Loss", "Muscle Gain", "Flexibility", "Stress Reduction", "Overall Wellness"];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
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

// New variants for the feature icons
const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "backOut",
        },
    },
};

// ----------------------------------------------------------------------------
// HeroSection: Updated for enhanced UI/UX
// ----------------------------------------------------------------------------
export default function HeroSection({ bannerUrl = "/hero-video.mp4", gymName = "FitLife Central" }: { bannerUrl?: string; gymName?: string }) { // Add default props for demonstration
    const [program, setProgram] = useState(programTypes[0]);
    const [location, setLocation] = useState(bannerLocations[0]);
    const [goal, setGoal] = useState(goals[0]);

    const handleSubmit = (e: React.FormEvent) => { // Use React.FormEvent for type safety
        e.preventDefault();
        // In a real application, you'd navigate here, e.g., router.push(`/search?program=${program}&location=${location}&goal=${goal}`)
        console.log("Searching for:", { program, location, goal });
        alert(`Searching for: ${program} in ${location} for ${goal} goals!`); // Simple alert for demo
    };

    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center"> {/* Added flex centering */}
            {/* Background video or fallback image */}
            {bannerUrl.endsWith(".mp4") ? (
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={bannerUrl}
                    autoPlay
                    muted
                    loop
                    playsInline // Added for better mobile compatibility
                />
            ) : (
                <Image
                    src={bannerUrl}
                    alt={`${gymName} banner`}
                    fill
                    className="object-cover"
                    loader={loader}
                    priority // Prioritize loading for the hero image
                />
            )}

            {/* Dark overlay with enhanced gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white max-w-5xl mx-auto" // Increased max-width
                initial={{ opacity: 0, y: 30 }} // Slightly more pronounced initial animation
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }} // Slower, smoother transition
            >
                <motion.h1
                    className="mb-6 text-4xl md:text-7xl font-extrabold tracking-tight" // Larger, bolder font, tighter tracking
                    variants={itemVariants} // Apply itemVariants for animation
                >
                    Unlock Your Potential at <span className="text-primary-accent">{gymName}</span> 💪 {/* Highlighted gym name, added emoji */}
                </motion.h1>
                <motion.p
                    className="mb-10 text-lg md:text-2xl max-w-2xl leading-relaxed" // Increased bottom margin, max-width, line height
                    variants={itemVariants}
                >
                    Discover personalized fitness & wellness programs designed to help you achieve your goals, right here, right now.
                </motion.p>

                <motion.form
                    onSubmit={handleSubmit}
                    className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl" // Using CSS Grid for better responsiveness and spacing
                    variants={containerVariants} // Animate the form container
                    initial="hidden"
                    animate="visible"
                >
                    <motion.select
                        value={program}
                        onChange={(e) => setProgram(e.target.value)}
                        className="w-full p-4 rounded-full bg-white text-gray-800 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-light focus:border-transparent transition-all duration-300 shadow-lg" // Rounded, larger padding, custom appearance, enhanced focus
                        aria-label="Select Program Type"
                        variants={itemVariants}
                    >
                        <option value="" disabled hidden>Select Program Type</option> {/* Placeholder option */}
                        {programTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </motion.select>

                    <motion.select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-4 rounded-full bg-white text-gray-800 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-light focus:border-transparent transition-all duration-300 shadow-lg"
                        aria-label="Select Location"
                        variants={itemVariants}
                    >
                        <option value="" disabled hidden>Select Location</option>
                        {bannerLocations.map((loc) => (
                            <option key={loc} value={loc}>
                                {loc}
                            </option>
                        ))}
                    </motion.select>

                    <motion.select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full p-4 rounded-full bg-white text-gray-800 appearance-none focus:outline-none focus:ring-4 focus:ring-primary-light focus:border-transparent transition-all duration-300 shadow-lg"
                        aria-label="Select Goal"
                        variants={itemVariants}
                    >
                        <option value="" disabled hidden>Select Your Goal</option>
                        {goals.map((g) => (
                            <option key={g} value={g}>
                                {g}
                            </option>
                        ))}
                    </motion.select>

                    <motion.button
                        type="submit"
                        className="w-full px-6 py-4 bg-primary-dark text-white rounded-full font-bold text-lg hover:bg-primary-hover transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105" // Larger, bolder, more prominent button with hover effect
                        variants={itemVariants}
                    >
                        <span>Discover Programs</span>
                        <ArrowRightIcon className="h-5 w-5 ml-2" />
                    </motion.button>
                </motion.form>

                <motion.div
                    className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mt-4" // Better spacing and responsiveness for buttons
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.button
                        className="px-8 py-3 bg-white bg-opacity-25 rounded-full font-semibold hover:bg-opacity-40 transition-all duration-300 backdrop-blur-sm" // Rounded, larger padding, backdrop blur
                        variants={itemVariants}
                    >
                        Browse Free Trials 🤩
                    </motion.button>
                    <motion.button
                        className="px-8 py-3 bg-white bg-opacity-25 rounded-full font-semibold hover:bg-opacity-40 transition-all duration-300 backdrop-blur-sm"
                        variants={itemVariants}
                    >
                        View Virtual Classes 🌐
                    </motion.button>
                </motion.div>
            </motion.div>
        </section>
    );
}

// Add these to your main CSS or a global stylesheet for Tailwind CSS configuration
// You'd typically extend your tailwind.config.js for these colors.
// Example tailwind.config.js entry:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // A nice vibrant indigo
          light: '#818CF8',
          dark: '#4F46E5',
          hover: '#4338CA',
          accent: '#A78BFA', // A brighter accent for highlights
        },
      },
    },
  },
  plugins: [],
}
*/