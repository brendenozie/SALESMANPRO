"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, UserGroupIcon, TrophyIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline'; // More icons
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx';
import { Stat } from '@/types/typings';



// --- Utility Functions ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/1200x800/CCCCCC/333333?text=Image+Error";
};
const getStatIcon = (label: string) => {
    const normalizedLabel = label.toLowerCase();
    if (normalizedLabel.includes("student") || normalizedLabel.includes("enrolled")) return UserGroupIcon;
    if (normalizedLabel.includes("course") || normalizedLabel.includes("offered")) return BookOpenIcon;
    if (normalizedLabel.includes("tutor") || normalizedLabel.includes("expert")) return AcademicCapIcon;
    if (normalizedLabel.includes("award") || normalizedLabel.includes("countrywide")) return TrophyIcon;
    return SparklesIcon; // Default
};


// --- Custom Stat Component (Floating Badge) ---
const StatBadge = ({ stat, primaryColor, variants, delay }: { stat: Stat, primaryColor: string, variants: any, delay: number }) => {
    const Icon = getStatIcon(stat.label);
    
    // Apply a unique animation to each stat for a "floating" feel
    const badgeVariants = {
        hidden: { opacity: 0, scale: 0.5, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: delay
            },
        },
    };

    return (
        <motion.div 
            className="flex items-center p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 border-2"
            style={{ borderColor: primaryColor }}
            variants={badgeVariants}
            whileHover={{ y: -5, scale: 1.05, boxShadow: `0 10px 20px ${primaryColor}40` }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <div className="p-2 rounded-full mr-3" style={{ backgroundColor: `${primaryColor}1A` }}>
                <Icon className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
                <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">{stat.label}</p>
            </div>
        </motion.div>
    );
};


// --- Main Component ---
export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // --- Framer Motion Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { when: "beforeChildren", staggerChildren: 0.1 }
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };

  const aboutHeadline = storeFormData?.name ? `The Smarter Way to Learn with ${storeFormData.name}` : "The Smarter Way to Learn";
  const aboutDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency. Our comprehensive resources are designed to seamlessly integrate with your existing curriculum, providing a supportive environment for growth and success.";
  const aboutVideoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"; // New image for a different feel
  const aboutVideoLink = storeFormData?.heroSlides?.[0]?.videoLink || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const aboutStats = storeFormData?.stats || [
    { label: "Students Enrolled", value: "5000+" },
    { label: "Courses Offered", value: "150+" },
    { label: "Expert Tutors", value: "50+" },
    { label: "Countrywide Awards", value: "60+" },
  ];
  const aboutTagline = storeFormData?.tagline || "Unlock Your Potential";

  return (
    <motion.section
      className="bg-white dark:bg-gray-950 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
        {/* Decorative Background Swirl/Blob (uses theme color) */}
        <div 
            className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl opacity-10 hidden lg:block"
            style={{ backgroundColor: primaryColor }}
        />

        {/* --- Main Content Layout --- */}
      <div className="max-w-7xl mx-auto relative grid lg:grid-cols-12 gap-16 items-start">
            
            {/* 1. Video & Stats Block (3/4th width on desktop) */}
            <div className="lg:col-span-7 relative order-1">
                
                {/* --- The Framed Video Window --- */}
                <motion.div 
                    className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group border-8"
                    style={{ borderColor: accentColor }}
                    initial={{ opacity: 0, rotate: 1, scale: 0.9 }}
                    animate="visible"
                    variants={{ visible: { opacity: 1, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 50, damping: 10 }}}}
                >
                    <Image
                        src={aboutVideoThumbnail}
                        alt="Video thumbnail for school introduction"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loader={loader}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        onError={handleImageError}
                    />

                    {/* Play Button */}
                    <motion.button
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-10 transition-colors duration-300"
                        onClick={() => window.open(aboutVideoLink, '_blank')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div
                            className={`rounded-full p-6 shadow-xl transition-all duration-300 animate-pulse`}
                            style={{ backgroundColor: primaryColor }}
                        >
                            <PlayCircleIcon className="w-16 h-16 text-white" />
                        </div>
                    </motion.button>
                </motion.div>

                {/* --- Floating Stats Badges (Positioned absolutely for a 'sticking' effect) --- */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full pt-8 lg:pt-0">
                    <div className="flex justify-center flex-wrap gap-4">
                        {aboutStats.map((stat, idx) => (
                            <StatBadge 
                                key={idx} 
                                stat={stat} 
                                primaryColor={primaryColor} 
                                variants={containerVariants}
                                delay={0.6 + idx * 0.15} // Staggered delay after image loads
                            />
                        ))}
                    </div>
                </div>

            </div>
            
            {/* 2. Text Content Block (5/12th width on desktop) */}
            <div className="lg:col-span-5 order-2 pt-20 lg:pt-0">
                <motion.p
                    className={`text-base font-extrabold uppercase tracking-widest mb-3`}
                    style={{ color: accentColor }}
                    variants={textItemVariants}
                >
                    {aboutTagline}
                </motion.p>
                <motion.h2
                    className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight"
                    variants={textItemVariants}
                >
                    {aboutHeadline.split(' ').map((word, index) => (
                        <span key={index}>
                            {word === "Smarter" || word === "Learn" || word === (storeFormData?.name || '').split(' ')[0] ? (
                                <span style={{ color: primaryColor }}>{word} </span>
                            ) : (
                                `${word} `
                            )}
                        </span>
                    ))}
                </motion.h2>
                <motion.p
                    className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 h-24 overflow-hidden"
                    variants={textItemVariants}
                >
                    {aboutDescription}
                </motion.p>
                <motion.a
                    href="/about"
                    className={`inline-flex items-center text-lg font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl`}
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                    variants={textItemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Discover Our Mission
                </motion.a>
            </div>
            
      </div>
        {/* Spacer to account for the absolutely positioned stats block */}
        <div className="h-40 lg:h-20" /> 
    </motion.section>
  );
}