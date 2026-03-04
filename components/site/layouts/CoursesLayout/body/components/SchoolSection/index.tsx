// **********************************************
// NOTE: This assumes the required imports are present:
// React, CheckCircleIcon, ArrowRightIcon, AcademicCapIcon, UserGroupIcon, LightBulbIcon (from @heroicons/react/24/outline)
// motion (from framer-motion), Image (from next/image), clsx, useStoreContext
// **********************************************
import React from 'react';
import { CheckCircleIcon, ArrowRightIcon, AcademicCapIcon, UserGroupIcon, LightBulbIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';
import clsx from 'clsx';
// import { useStoreContext } from '@/contexts/StoreContext'; // Keep this for context

// Placeholder for context/loader/handler functions if needed for runnable code
const useStoreContext = () => ({
  storeFormData: {
    id: '683581bba1bdf6ca3624b530',
    name: 'Academic Excellence Hub',
    description: 'Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.',
    bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop',
    CoreValues: [
      { title: 'Tailored learning experiences.', icon: 'AcademicCapIcon' },
      { title: 'Intuitive and engaging content.', icon: 'LightBulbIcon' },
      { title: 'Expert personalized guidance.', icon: 'UserGroupIcon' },
      { title: 'Real-time performance analytics.', icon: 'CheckCircleIcon' },
    ],
    ctaText: 'Enroll Now',
    ctaLink: '/enroll',
    themeSettings: { primaryColor: '#06B6D4', secondaryColor: '#FBBF24' }, // Tailwind Cyan & Amber
  } as any,
});

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
};
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/333333?text=Image+Error";
};
// --- Utility function to map string icon names to components ---
const IconMap = {
    CheckCircleIcon,
    AcademicCapIcon,
    UserGroupIcon,
    LightBulbIcon,
    // Add other necessary icons here
};


// --- Main Section Component (Diagonal Focus) ---
const SchoolSection = ({ storeFormData }: any) => {
  // const { storeFormData } = useStoreContext();

  const headline = storeFormData?.name || "Unlock Your Academic Excellence";
  const mainDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.";

  const CoreValuesFallback = [
    { id: '1', title: 'Tailored learning experiences.', icon: 'AcademicCapIcon' },
    { id: '2', title: 'Intuitive and engaging content.', icon: 'LightBulbIcon' },
    { id: '3', 'title': 'Expert personalized guidance.', icon: 'UserGroupIcon' },
    { id: '4', 'title': 'Real-time performance analytics.', icon: 'CheckCircleIcon' },
  ];

  // Map values to a maximum of 4 features
  const coreValues = (storeFormData?.CoreValues?.length ? storeFormData.CoreValues : CoreValuesFallback).slice(0, 4);
  const imageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop";
  const ctaText = storeFormData?.ctaText || "Start Learning Today"; 
  const ctaLink = storeFormData?.ctaLink || "#";

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#06B6D4'; // Default Cyan
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FBBF24'; // Default Amber
  
  // Testimonial/Quote Block Content
  const quote = "This platform transformed my study habits and boosted my grades by over 20%. Highly recommended for focused learning!";
  const quoteAuthor = "Sarah J., Top Student";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  const featureIconVariants = {
    hidden: { opacity: 0, scale: 0.7, rotate: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 150, damping: 10 },
    },
  };

  return (
    <motion.section
      className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Outer Container (The Card-in-Card Base) */}
        <div 
            className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden p-6 lg:p-0"
            style={{ boxShadow: `0 25px 50px -12px ${primaryColor}40` }} // Custom shadow with primary color
        >
            <div className="flex flex-col lg:flex-row relative">
                
                {/* Diagonal Separator (Visual Trick) */}
                <div 
                    className="absolute inset-y-0 right-0 hidden lg:block w-full h-full"
                    style={{ 
                        clipPath: 'polygon(70% 0, 100% 0, 100% 100%, 30% 100%)', 
                        backgroundColor: primaryColor,
                        opacity: 0.05
                    }}
                />

                {/* Left Content Area (The floating card) */}
                <div className="w-full lg:w-3/5 p-4 sm:p-10 lg:p-16 relative z-10">
                    <motion.h2
                      className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight tracking-tight text-gray-900 dark:text-white"
                      variants={textItemVariants}
                    >
                      {/* Highlight key part of the headline using primary color */}
                      <span style={{ color: primaryColor }}>{headline.split(' ').slice(0, 2).join(' ')}</span>{' '}
                      {headline.split(' ').slice(2).join(' ')}
                    </motion.h2>

                    <motion.p
                      className="mb-8 leading-relaxed text-lg text-gray-700 dark:text-gray-300"
                      variants={textItemVariants}
                    >
                      {mainDescription}
                    </motion.p>
                    
                    {/* Embedded Quote Block */}
                    <motion.blockquote 
                        className="p-6 mb-10 border-l-4 rounded-r-lg italic bg-gray-50 dark:bg-gray-700/50"
                        style={{ borderColor: accentColor }}
                        variants={textItemVariants}
                    >
                        <p className="text-gray-800 dark:text-gray-200">"{quote}"</p>
                        <footer className="mt-2 text-sm font-semibold" style={{ color: accentColor }}>— {quoteAuthor}</footer>
                    </motion.blockquote>

                    {/* CTA Button */}
                    <motion.a
                      href={ctaLink}
                      className="inline-flex items-center text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform group focus:outline-none focus:ring-4 focus:ring-opacity-75"
                      style={{
                        backgroundColor: primaryColor,
                        '--tw-ring-color': `${primaryColor} !important` as any,
                      }}
                      whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${primaryColor}40` }}
                      whileTap={{ scale: 0.95 }}
                      variants={textItemVariants}
                    >
                      {ctaText}
                      <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.a>
                </div>

                {/* Right Image Area (The Layered Background) */}
                <div className="w-full lg:w-2/5 relative min-h-[300px] lg:min-h-0">
                    <Image
                        src={imageUrl}
                        alt="Academic success background"
                        fill
                        className="object-cover object-center lg:rounded-r-3xl"
                        loader={loader}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        onError={handleImageError}
                    />
                    
                    {/* Image Overlay for Contrast/Depth */}
                    <div className="absolute inset-0 bg-black/30 lg:bg-black/40"></div>
                    
                    {/* Floating Feature Icons (Overlaying the image) */}
                    <motion.div 
                        className="absolute inset-0 flex flex-wrap content-center justify-center p-8 gap-4 lg:gap-6"
                        variants={containerVariants} // Use container to stagger the children
                    >
                        {coreValues.map((item: any, index: number) => {
                            const IconComponent = IconMap[item.icon as keyof typeof IconMap] || CheckCircleIcon;
                            return (
                                <motion.div
                                    key={index}
                                    className="flex flex-col items-center justify-center w-28 h-28 p-3 rounded-xl shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm cursor-help"
                                    variants={featureIconVariants}
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                >
                                    <IconComponent className="w-8 h-8 mb-2" style={{ color: primaryColor }} />
                                    <span className="text-xs font-semibold text-center text-gray-800 dark:text-gray-200 leading-tight">{item.title}</span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

            </div>
        </div>
      </div>
    </motion.section>
  );
};

export default SchoolSection;