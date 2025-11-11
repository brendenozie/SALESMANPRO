import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// Using Lucide Icons for clean, modern symbols, replacing Heroicons for aesthetic

import { CurrencyDollarIcon, GlobeAltIcon, HeartIcon, UsersIcon } from '@heroicons/react/24/outline';

// --- MOCK DATA & CONFIGURATION (Replaces external context) ---
const primaryColor = '#06b6d4'; // Deep Cyan/Teal (from original)
const sectionTitle = "Our Community Impact";
const organizationName = "Global Change Collective"; 

const mockMetrics = [
  { id: 'fb-metric-1', value: "1,500+", label: "Lives Impacted", order: 1, Icon: UsersIcon,  },
  { id: 'fb-metric-2', value: "80+", label: "Projects Completed", order: 2, Icon: HeartIcon },
  { id: 'fb-metric-3', value: "$500K+", label: "Funds Raised", order: 3, Icon: CurrencyDollarIcon },
  { id: 'fb-metric-4', value: "20+", label: "Communities Served", order: 4, Icon: GlobeAltIcon },
];

// --- FRAMER MOTION VARIANTS ---

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15, // Stagger the cards reveal
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 70, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 18,
    },
  },
};

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 12,
            delay: 0.4,
        }
    }
}

// --- STAT CARD COMPONENT ---

const StatCard = ({ stat, primaryColor }: { stat: typeof mockMetrics[0]; primaryColor: string }) => {
  const IconComponent = stat.Icon;

  return (
    <motion.div
      variants={cardVariants}
      className="relative p-6 md:p-8 rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl flex flex-col items-center text-center overflow-hidden cursor-pointer"
      // Use inline style for background and border for a stronger visual tie to the theme color
      style={{ 
        backgroundColor: '#FFFFFF', 
        border: `1px solid ${primaryColor}20`, // Light border accent
        boxShadow: `0 10px 20px -5px ${primaryColor}40`, // Spotlight shadow effect
      }}
    >
      {/* Dynamic Color Accent Border (Subtle Glow) */}
      <div 
        className="absolute inset-x-0 top-0 h-1" 
        style={{ backgroundColor: primaryColor }}
      />
      
      {/* Icon Area */}
      <motion.div
        variants={iconVariants}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white shadow-xl"
        style={{ backgroundColor: primaryColor }}
      >
        <IconComponent className="w-8 h-8"/>
      </motion.div>

      {/* Value */}
      <h3
        className="text-5xl md:text-6xl font-black mb-1"
        style={{ color: primaryColor }}
      >
        {stat.value}
      </h3>
      
      {/* Label */}
      <p className="mt-2 text-lg text-gray-800 font-semibold leading-snug">
        {stat.label}
      </p>
    </motion.div>
  );
};

// --- MAIN SECTION COMPONENT ---

export default function App() {
  const [ref, inView] = useInView({ 
    triggerOnce: true, 
    threshold: 0.3 
  });

  const metricsToRender = mockMetrics.sort((a, b) => a.order - b.order);

  return (
    <section className="py-20 md:py-32 bg-gray-50 font-sans relative overflow-hidden flex items-center">
      
      {/* Background Accent (Simplified Blob) */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-10" 
        style={{ 
          background: `radial-gradient(circle at 10% 20%, ${primaryColor} 0%, transparent 60%)`, 
          pointerEvents: 'none' 
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-sm uppercase tracking-widest font-bold mb-2" style={{ color: primaryColor }}>
            Our Proven Track Record
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            These metrics reflect the tangible, lasting change we've driven together, fueled by the dedication of our supporters and the work of **{organizationName}**.
          </p>
        </motion.div>

        {/* Stats Grid - Triggering Motion */}
        <motion.div 
          ref={ref} 
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10"
        >
          {metricsToRender.map((stat) => (
            <StatCard key={stat.id} stat={stat} primaryColor={primaryColor} />
          ))}
        </motion.div>
        
        {/* Simple CTA for continuity */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-16"
        >
            <a 
                href="#report" // Mock link to a detailed impact report or donate page
                className="inline-flex items-center font-bold py-3 px-8 rounded-full text-white transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                style={{ backgroundColor: primaryColor }}
            >
                Read Our Full Impact Report
            </a>
        </motion.div>

      </div>
    </section>
  );
}