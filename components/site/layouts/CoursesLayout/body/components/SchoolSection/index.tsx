import React from 'react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

// Placeholder for useStoreContext to make the component runnable independently
// You would use the real import in your actual app
// const useStoreContext = () => ({
//   storeFormData: {
//     id: '683581bba1bdf6ca3624b530',
//     name: 'Academic Excellence Hub',
//     description: 'Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.',
//     bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//     CoreValues: [
//       { title: 'Achieve your academic goals with tailored learning experiences.', icon: 'CheckCircleIcon' },
//       { title: 'Gain profound understanding with intuitive and engaging content.', icon: 'CheckCircleIcon' },
//       { title: 'Connect with expert tutors for personalized guidance and support.', icon: 'CheckCircleIcon' },
//       { title: 'Simplify complex topics with easy-to-understand explanations.', icon: 'CheckCircleIcon' },
//       { title: 'Real-time progress tracking and performance analytics.', icon: 'CheckCircleIcon' },
//     ],
//     ctaText: 'Enroll Now',
//     ctaLink: '/enroll',
//     themeSettings: { primaryColor: '#4CAF50', secondaryColor: '#FFC107' },
//   } as StoreForm,
// });

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const SchoolSection = () => {
  const { storeFormData } = useStoreContext();

  const headline = storeFormData?.name || "Smarter Way to go Through Your School";
  const mainDescription = storeFormData?.description || "Empower your academic journey with innovative tools and personalized learning paths. Our platform helps you master complex subjects, ace exams, and unlock your full potential with ease and efficiency.";

  const CoreValues = [
    { id: '1', title: 'Achieve your academic goals with tailored learning experiences.', icon: 'ShieldCheckIcon' },
    { id: '2', title: 'Gain profound understanding with intuitive and engaging content.', icon: 'PhoneIcon' },
    { id: '3', title: 'Connect with expert tutors for personalized guidance and support.', icon: 'TruckIcon' },
    { id: '4', title: 'Simplify complex topics with easy-to-understand explanations.', icon: 'TruckIcon' },
  ];

  const coreValues = storeFormData?.CoreValues?.length ? storeFormData.CoreValues : CoreValues;
  const imageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2670&auto=format&fit=crop";
  const ctaText = "Learn More"; // storeFormData?.ctaText || 
  const ctaLink =  "#"; // storeFormData?.ctaLink ||

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#4CAF50';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

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
        staggerChildren: 0.15
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

  const checkItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/333333?text=Image+Error";
  };

  return (
    <motion.section
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      {/* Dynamic, more abstract SVG background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0C240 100 480 300 720 300C960 300 1200 100 1440 0V800H0V0Z" fill={`url(#paint-gradient-top)`} />
          <path d="M0 800C240 700 480 500 720 500C960 500 1200 700 1440 800V0H0V800Z" fill={`url(#paint-gradient-bottom)`} />
          <defs>
            <linearGradient id="paint-gradient-top" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor={primaryColor} stopOpacity="0.15" />
              <stop offset="1" stopColor={accentColor} stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="paint-gradient-bottom" x1="0" y1="800" x2="1440" y2="800" gradientUnits="userSpaceOnUse">
              <stop stopColor={primaryColor} stopOpacity="0.15" />
              <stop offset="1" stopColor={accentColor} stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
        {/* Left Image Section */}
        <motion.div
          className="flex-shrink-0 w-full lg:w-5/12 perspective-1000 group"
          variants={itemVariants}
        >
          <motion.div
            className="w-full h-auto relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ paddingBottom: '66.66%' }}
            whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Image
              src={imageUrl}
              alt="Student learning smarter way"
              fill
              className="object-cover object-center transition-all duration-500"
              loader={loader}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={handleImageError}
            />
          </motion.div>
        </motion.div>

        {/* Right Content Section */}
        <div className="w-full lg:w-7/12 text-center lg:text-left">
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight"
            variants={itemVariants}
          >
            {headline}
          </motion.h2>

          <motion.p
            className="mb-6 leading-relaxed text-lg text-gray-700 dark:text-gray-300"
            variants={itemVariants}
          >
            {mainDescription}
          </motion.p>

          {/* Bullet Points */}
          <motion.ul className="space-y-4 mb-8">
            {(coreValues && coreValues.length > 0 ? coreValues : CoreValues).map((item, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-4 font-medium text-gray-800 dark:text-gray-200"
                variants={checkItemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircleIcon className="flex-shrink-0 mt-1 w-6 h-6" style={{ color: primaryColor }} />
                <span>{item.title}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Call to Action Button */}
          <motion.button
            className="inline-flex items-center text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform group focus:outline-none focus:ring-4 focus:ring-opacity-75"
            style={{
              backgroundColor: primaryColor,
              '--tw-ring-color': `${primaryColor} !important` as any,
            }}
            whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${primaryColor}40` }}
            whileTap={{ scale: 0.95 }}
            variants={itemVariants}
            onClick={() => window.location.href = ctaLink}
          >
            {ctaText}
            <ArrowRightIcon className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
};

export default SchoolSection;