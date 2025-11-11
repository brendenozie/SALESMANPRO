'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  BoltIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// --- TYPES ---
interface Feature {
  id: string;
  title: string;
  description: string;
  Icon:
    | React.ComponentType<React.SVGProps<SVGSVGElement>>
    | React.ForwardRefExoticComponent<
        React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
      >;
  color: string;
  order: number;
}

// --- CONFIGURATION ---
const primaryColor = '#10B981'; // Emerald green

const mockFeatures: Feature[] = [
  {
    id: 'feat-1',
    title: 'Medical Aid',
    description:
      'Providing essential healthcare and medical support to vulnerable children, ensuring they receive the care they need to thrive.',
    Icon: HeartIcon,
    color: '#EF4444', // Red for urgency/care
    order: 1,
  },
  {
    id: 'feat-2',
    title: 'Education Support',
    description:
      'Ensuring access to quality education and learning resources for a brighter future, empowering young minds with knowledge.',
    Icon: LightBulbIcon, // ✅ Fixed key casing
    color: '#F97316', // Orange for energy/learning
    order: 2,
  },
  {
    id: 'feat-3',
    title: 'Sustainable Development',
    description:
      'Investing in community projects that uplift families and children, building a foundation for long-term success.',
    Icon: LightBulbIcon,
    color: '#06B6D4', // Cyan for clarity/future
    order: 3,
  },
  {
    id: 'feat-4',
    title: 'Crisis Relief',
    description:
      'Delivering urgent aid and support in times of crisis and natural disasters, acting as a lifeline when it’s needed most.',
    Icon: ShieldCheckIcon,
    color: '#3B82F6', // Blue for protection
    order: 4,
  },
  {
    id: 'feat-5',
    title: 'Clean Energy Access',
    description:
      'Implementing projects to provide sustainable and accessible power and clean water to communities, fostering health.',
    Icon: BoltIcon,
    color: '#FBBF24', // Amber for power/energy
    order: 5,
  },
  {
    id: 'feat-6',
    title: 'Environmental Stewardship',
    description:
      'Educating and engaging communities in sustainable practices to protect the environment for future generations.',
    Icon: GlobeAltIcon,
    color: '#10B981', // Emerald for environment
    order: 6,
  },
];

const sectionTitle = 'Our Core Pillars of Impact';
const organizationName = 'Global Change Collective';

// --- FRAMER MOTION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, rotateX: 15, transformPerspective: 500 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

// --- FEATURE CARD ---
const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  const IconComponent = feature.Icon;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white p-8 rounded-3xl shadow-2xl border-t-8 relative overflow-hidden group transition-all duration-500 transform hover:shadow-4xl hover:-translate-y-1 cursor-pointer flex flex-col items-start text-left h-full"
      style={{ borderColor: feature.color }}
    >
      {/* Background Accent */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 transition-all duration-500 group-hover:w-60 group-hover:h-60"
        style={{ backgroundColor: feature.color }}
      ></div>

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-16 h-16 mb-6 flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-105"
          style={{ backgroundColor: feature.color }}
        >
          <IconComponent className="text-white w-8 h-8" />
        </div>

        {/* Text */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-gray-600 text-lg">{feature.description}</p>
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION ---
export default function CoreHighlightsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const featuresToRender = mockFeatures.sort((a, b) => a.order - b.order);

  return (
    <section
      id="mission"
      className="py-20 md:py-32 bg-gray-50 relative overflow-hidden font-sans"
    >
      {/* Geometric Background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div
          className="absolute w-64 h-64 border-8 rounded-full border-dashed animate-spin-slow"
          style={{ top: '10%', left: '5%', borderColor: primaryColor }}
        ></div>
        <div
          className="absolute w-96 h-96 border-4 rounded-xl rotate-45 animate-pulse"
          style={{ bottom: '15%', right: '5%', borderColor: primaryColor }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p
            className="text-sm uppercase tracking-widest font-bold mb-2"
            style={{ color: primaryColor }}
          >
            Our Pillars of Impact
          </p>
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our mission is clear and impactful. These core values guide every
            action we take and define the future we are building at{' '}
            <span
              className="font-semibold"
              style={{ color: primaryColor }}
            >
              {organizationName}
            </span>
            .
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12"
        >
          {featuresToRender.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <a
            href="#"
            className="inline-flex items-center px-10 py-4 rounded-full font-bold text-white text-lg shadow-xl transition duration-300 transform hover:scale-[1.02] hover:shadow-2xl active:scale-95"
            style={{ backgroundColor: primaryColor }}
          >
            Explore Our Comprehensive Strategy
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-3 w-5 h-5"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Slow Spin Animation */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
