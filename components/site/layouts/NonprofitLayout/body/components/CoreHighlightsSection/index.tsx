"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HandRaisedIcon, HeartIcon, LightBulbIcon, ShieldCheckIcon, AcademicCapIcon, BoltIcon, GlobeAltIcon, SunIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import Link from 'next/link';

// Placeholder for useStoreContext
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     CoreValues: [
//       {
//         id: 'feat-1',
//         title: "Medical Aid",
//         description: "Providing essential healthcare and medical support to vulnerable children, ensuring they receive the care they need to thrive.",
//         icon: <HeartIcon className="text-white w-8 h-8 md:w-10 md:h-10" />,
//         color: '#F43F5E', // Rose-500
//         order: 1,
//       },
//       {
//         id: 'feat-2',
//         title: "Education Support",
//         description: "Ensuring access to quality education and learning resources for a brighter future, empowering young minds with knowledge.",
//         icon: <AcademicCapIcon className="text-white w-8 h-8 md:w-10 md:h-10" />,
//         color: '#F59E0B', // Amber-500
//         order: 2,
//       },
//       {
//         id: 'feat-3',
//         title: "Community Development",
//         description: "Investing in sustainable community projects that uplift families and children, building a foundation for long-term success.",
//         icon: <LightBulbIcon className="text-white w-8 h-8 md:w-10 md:h-10" />,
//         color: '#10B981', // Emerald-500
//         order: 3,
//       },
//       {
//         id: 'feat-4',
//         title: "Emergency Relief",
//         description: "Delivering urgent aid and support in times of crisis and natural disasters, acting as a lifeline when it's needed most.",
//         icon: <ShieldCheckIcon className="text-white w-8 h-8 md:w-10 md:h-10" />,
//         color: '#3B82F6', // Blue-500
//         order: 4,
//       },
//       {
//         id: 'feat-5',
//         title: "Clean Water Initiatives",
//         description: "Implementing projects to provide safe and accessible drinking water to communities, fostering health and sanitation.",
//         icon: <BoltIcon className="text-white w-8 h-8 md:w-10 md:h-10" />,
//         color: '#06B6D4', // Cyan-500
//         order: 5,
//       },
//       {
//         id: 'feat-6',
//         title: "Environmental Stewardship",
//         description: "Educating and engaging communities in sustainable practices to protect the environment for future generations.",
//         icon: <GlobeAltIcon className="text-white w-8 h-8 md:w-10 md:h-10" />,
//         color: '#65A30D', // Lime-700
//         order: 6,
//       },
//     ],
//     themeSettings: {
//       primaryColor: "#059669", // A fresh green
//     },
//   },
// });

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function CoreHighlightsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#059669';

  const featuresToRender = Array.isArray(storeFormData?.CoreValues) && storeFormData.CoreValues.length > 0
    ? storeFormData.CoreValues//.sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  const sectionTitle = storeFormData?.name ? `Our Core Mission at ${storeFormData.name}` : "Our Core Mission";

  return (
    <section id="services" className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Dynamic background with animated radial gradients */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <motion.div
          initial={{ scale: 0.5, rotate: 0 }}
          animate={{ scale: [0.5, 1, 0.7], rotate: [0, 45, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ backgroundColor: primaryColor }}
        ></motion.div>
        <motion.div
          initial={{ scale: 0.5, rotate: 0 }}
          animate={{ scale: [0.5, 1.2, 0.6], rotate: [0, -45, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          style={{ backgroundColor: '#A3E635' }} // A complementary color
        ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest font-semibold mb-2" style={{ color: primaryColor }}>
            Our Pillars of Impact
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We are dedicated to making a tangible difference in the lives of children. These core values guide every action we take and every life we touch.
          </p>
        </motion.div>

        {/* Dynamic Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
        >
          {featuresToRender.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              variants={itemVariants}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden group transition-all duration-300 transform hover:scale-105"
            >
              {/* Card background shape */}
              <div
                className="absolute inset-0 opacity-10 blur-xl transition-all duration-500 group-hover:opacity-20"
                style={{ backgroundColor: '#F43F5E' }}
              ></div>
              
              <div className="relative z-10 flex flex-col items-start text-left">
                {/* Icon with colored background and subtle animation */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 mb-6 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: '#F43F5E' }}
                >
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-gray-800 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Optional: Add a call to action at the bottom */}
        <div className="mt-16 text-center">
            <Link href="/about" className="inline-flex items-center px-8 py-3 rounded-full font-semibold text-white shadow-lg transition duration-300 transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
                Learn More About Our Mission
            </Link>
        </div>
      </div>
    </section>
  );
}