"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon } from '@heroicons/react/24/solid'; // Solid PlayCircleIcon for prominence
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function AboutSection() {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  // For this specific issue, I'm using a mock to ensure consistent defaults and data structure.
  const useMockStoreContext = () => ({
    storeFormData: {
      id: '683581bba1bdf6ca3624b530',
      name: 'Educational & Online Courses',
      slug: 'educational-online-courses',
      tagline: 'Unlock Your Potential',
      description: 'Our platform provides a smarter way to learn, offering innovative tools and personalized learning paths. We help you master complex subjects, ace exams, and unlock your full potential with ease and efficiency. Our comprehensive resources are designed to seamlessly integrate with your existing curriculum, providing a supportive environment for growth and success. From interactive lessons to real-time progress tracking, we\'re here to make your educational path smoother and more rewarding.',
      contactEmail: 'info@edulern.com',
      contactPhone: '+1 (800) 555-0123',
      heroSlides: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1546410531-bb45ce9b6867?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example image for About section
          videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Example video link
        },
      ],
      stats: [
        { label: "Students Enrolled", value: "5000+" },
        { label: "Courses Offered", value: "150+" },
        { label: "Expert Tutors", value: "50+" },
        { label: "Countrywide Awards", value: "60+" },
      ],
      themeSettings: {
        primaryColor: "#fd2121", // Red from your sample
        secondaryColor: "#ffffff", // White from your sample
      },
    },
  });

  const { storeFormData } = useMockStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights

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

  // Extract data from storeFormData
  const aboutHeadline = storeFormData?.name ? `The Smarter Way to Learn with ${storeFormData.name}` : "The Smarter Way to Learn";
  const aboutDescription = storeFormData?.description || "It the of about everything was at anyone out report first at hired sublime ability what infinity, or your rational and magazine it.";
  const aboutVideoThumbnail = storeFormData?.heroSlides?.[0]?.imageUrl || "https://placehold.co/600x400/D1D5DB/4B5563?text=Video+Thumbnail"; // Lighter placeholder
  const aboutVideoLink = storeFormData?.heroSlides?.[0]?.videoLink || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const aboutStats = storeFormData?.stats || [
    { label: "Student Campuses", value: "120+" },
    { label: "Students Enrolled", value: "5000+" },
    { label: "Certified Teachers", value: "100+" },
    { label: "Countrywide Awards", value: "60+" },
  ];
  const aboutTagline = storeFormData?.tagline || "Unlock Your Potential";

  return (
    <motion.section
      className="bg-white py-20 px-4 sm:px-6 lg:px-8" // Main section background is white
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl px-8 py-12 border border-gray-100"> {/* Subtle border */}
        <div className="grid md:grid-cols-2 gap-12 items-center"> {/* Increased gap */}
          {/* Left Text Content */}
          <div className="text-center md:text-left">
            <motion.p
              className={`text-sm font-semibold uppercase tracking-wider text-[${accentColor}] mb-3`} // Dynamic accent color
              variants={itemVariants}
            >
              {aboutTagline}
            </motion.p>
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
              variants={itemVariants}
            >
              {aboutHeadline.split(' ').map((word, index) => (
                <span key={index}>
                  {word === "Smarter" || word === "Learn" ? (
                    <span style={{ color: primaryColor }}>{word} </span>
                  ) : (
                    `${word} `
                  )}
                </span>
              ))}
            </motion.h2>
            <motion.p
              className="text-gray-700 text-lg leading-relaxed mb-6" // Darker text for readability
              variants={itemVariants}
            >
              {aboutDescription}
            </motion.p>
          </div>

          {/* Right Image with Play Icon */}
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl group"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }} // Subtle scale on hover
          >
            <img
              src={customLoader({ src: aboutVideoThumbnail, width: 600 })}
              alt="Video thumbnail for school introduction"
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/600x400/D1D5DB/4B5563?text=Video+Thumbnail";
              }}
            />
            <motion.button
              className="absolute inset-0 flex items-center justify-center"
              onClick={() => window.open(aboutVideoLink, '_blank')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className={`bg-[${primaryColor}] hover:bg-[${primaryColor}D0] transition-colors duration-300 rounded-full p-5 shadow-xl`}> {/* Dynamic primary color */}
                <PlayCircleIcon className="w-12 h-12 text-white" /> {/* Heroicon PlayCircleIcon */}
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-16 text-center"> {/* Increased gap and top margin */}
          {aboutStats.map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h3 className={`text-3xl font-extrabold text-[${primaryColor}] mb-1`}>{stat.value}</h3> {/* Dynamic primary color, larger font */}
              <p className="text-base text-gray-600">{stat.label}</p> {/* Adjusted font size */}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
