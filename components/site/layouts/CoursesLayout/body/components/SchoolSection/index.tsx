import React from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image for optimized images
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  id?: string;
  name?: string; // For the main title/headline
  description?: string; // For the main description paragraph
  bannerUrl?: string; // Can be used for the main image
  features?: string[]; // New: Array of strings for bullet points/features
  ctaText?: string; // New: CTA button text
  ctaLink?: string; // New: CTA button link
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    id: '683581bba1bdf6ca3624b530',
    name: 'Academic Excellence Hub',
    description: 'Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.',
    bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // High-quality learning image
    features: [
      'Achieve your academic goals with tailored learning experiences.',
      'Gain profound understanding with intuitive and engaging content.',
      'Connect with expert tutors for personalized guidance and support.',
      'Simplify complex topics with easy-to-understand explanations.',
      'Real-time progress tracking and performance analytics.', // Added another dynamic feature
    ],
    ctaText: 'Enroll Now',
    ctaLink: '/enroll',
    themeSettings: { primaryColor: '#4CAF50', secondaryColor: '#FFC107' }, // Example: Green primary, Amber secondary
  } as StoreForm, // Cast to StoreForm for type safety in mock
});

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const SchoolSection = () => {
  const { storeFormData } = useStoreContext();

  // Dynamic content with fallbacks
  const headline = storeFormData?.name || "Smarter Way to go Through Your School";
  const mainDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.";
  const dynamicFeatures = storeFormData?.features;
  const imageUrl = storeFormData?.bannerUrl || "https://placehold.co/600x400/805AD5/FFFFFF?text=Student+Learning";
  const ctaText = storeFormData?.ctaText || "Learn More";
  const ctaLink = storeFormData?.ctaLink || "#";

  // Dynamic colors from theme settings
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#4CAF50'; // Default green
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; // Default amber

  // Static fallback features if dynamic data is not provided
  const fallbackFeatures = [
    'Achieve your academic goals with tailored learning experiences.',
    'Gain profound understanding with intuitive and engaging content.',
    'Connect with expert tutors for personalized guidance and support.',
    'Simplify complex topics with easy-to-understand explanations.',
  ];

  // Animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        when: "beforeChildren",
        staggerChildren: 0.2
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevents infinite loop if placeholder also fails
    e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/333333?text=Image+Error";
  };

  return (
    <motion.section
      className="relative text-black py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Abstract geometric background elements */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1440 700" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="1200" cy="150" r="250" fill="url(#paint0_radial)" />
          <circle cx="100" cy="550" r="300" fill="url(#paint1_radial)" />
          <defs>
            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1200 150) rotate(90) scale(250)">
              <stop stopColor={primaryColor} /> {/* Dynamic primary color */}
              <stop offset="1" stopColor="#6D28D9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 550) rotate(90) scale(300)">
              <stop stopColor={accentColor} /> {/* Dynamic accent color */}
              <stop offset="1" stopColor="#6D28D9" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        {/* Left Image Section */}
        <motion.div
          className="flex-shrink-0 w-full lg:w-5/12 perspective-1000"
          variants={itemVariants}
        >
          <motion.div
            className="w-full h-auto relative" // Use div with relative and Image fill
            style={{ paddingBottom: '66.66%' }} // Maintain 3:2 aspect ratio (400/600)
          >
            <Image
              src={imageUrl}
              alt="Student learning smarter way"
              fill
              className="rounded-2xl object-cover shadow-2xl transition-all duration-500
                         group-hover:rotate-x-3 group-hover:rotate-y-3 group-hover:scale-105"
              style={{ transformStyle: 'preserve-3d' }}
              loader={loader}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
            />
          </motion.div>
        </motion.div>

        {/* Right Content Section */}
        <div className="w-full lg:w-7/12 text-center lg:text-left">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900 dark:text-white"
            variants={itemVariants}
          >
            {headline}
          </motion.h2>

          <motion.p
            className="mb-6 text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
            variants={itemVariants}
          >
            {mainDescription}
          </motion.p>

          {/* Bullet Points */}
          <ul className="space-y-4 mb-8">
            {(dynamicFeatures && dynamicFeatures.length > 0 ? dynamicFeatures : fallbackFeatures).map((text, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-4 text-gray-800 dark:text-gray-200 font-medium"
                variants={itemVariants}
              >
                <CheckCircleIcon className={`flex-shrink-0 mt-1 w-6 h-6 animate-pulse-once`} style={{ color: accentColor }} />
                <span>{text}</span>
              </motion.li>
            ))}
          </ul>

          {/* Second Description Paragraph (static for now, can be made dynamic if another field is added) */}
          <motion.p
            className="mb-8 text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
            variants={itemVariants}
          >
            Our comprehensive resources are designed to seamlessly integrate with your existing curriculum, providing
            a supportive environment for growth and success. From interactive lessons to real-time progress tracking,
            we're here to make your educational path smoother and more rewarding.
          </motion.p>

          {/* Call to Action Button */}
          <motion.button
            className="inline-flex items-center text-white font-bold py-3 px-8 rounded-full shadow-lg
                       hover:shadow-xl transform hover:scale-105 transition-all duration-300 group focus:outline-none focus:ring-4 focus:ring-opacity-75"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': `${primaryColor} !important` as any,
            }}
            variants={itemVariants}
            onClick={() => window.location.href = ctaLink}
          >
            {ctaText}
            <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
      {/* Tailwind CSS keyframe animation for the pulse effect (if needed for CheckCircleIcon) */}
      <style jsx>{`
        @keyframes pulse-once {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse-once {
          animation: pulse-once 1.5s ease-in-out infinite;
        }
      `}</style>
    </motion.section>
  );
};

export default SchoolSection;
