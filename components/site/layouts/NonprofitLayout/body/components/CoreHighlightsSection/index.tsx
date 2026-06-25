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
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

// --- TYPES ---
interface Feature {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  order: number;
}

// --- CONFIGURATION ---
const mockFeatures: Feature[] = [
  {
    id: 'feat-1',
    title: 'Medical Aid',
    description:
      'Providing essential healthcare and medical support to vulnerable children, ensuring they receive the care they need to thrive.',
    Icon: HeartIcon,
    order: 1,
  },
  {
    id: 'feat-2',
    title: 'Education Support',
    description:
      'Ensuring access to quality education and learning resources for a brighter future, empowering young minds with knowledge.',
    Icon: LightBulbIcon,
    order: 2,
  },
  {
    id: 'feat-3',
    title: 'Sustainable Development',
    description:
      'Investing in community projects that uplift families and children, building a foundation for long-term success.',
    Icon: LightBulbIcon,
    order: 3,
  },
  {
    id: 'feat-4',
    title: 'Crisis Relief',
    description:
      'Delivering urgent aid and support in times of crisis and natural disasters, acting as a lifeline when it’s needed most.',
    Icon: ShieldCheckIcon,
    order: 4,
  },
  {
    id: 'feat-5',
    title: 'Clean Energy Access',
    description:
      'Implementing projects to provide sustainable and accessible power and clean water to communities, fostering health.',
    Icon: BoltIcon,
    order: 5,
  },
  {
    id: 'feat-6',
    title: 'Environmental Stewardship',
    description:
      'Educating and engaging communities in sustainable practices to protect the environment for future generations.',
    Icon: GlobeAltIcon,
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
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

// --- FEATURE CARD ---
const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => {
  const IconComponent = feature.Icon;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between items-start text-left h-full group cursor-pointer"
    >
      <div className="w-full">
        {/* Minimalist Icon Housing */}
        <div className="w-12 h-12 mb-6 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 transition-colors duration-300 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900">
          <IconComponent className="w-5 h-5" strokeWidth={2} />
        </div>

        {/* Text Area */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          {feature.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Inline subtle interactive link */}
      <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-slate-900 opacity-0 transform translate-x-[-4px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
        <span>Learn more</span>
        <ArrowRightIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
      </div>
    </motion.div>
  );
};

// --- MAIN SECTION ---
export default function CoreHighlightsSection({storeFormData}: {storeFormData: any}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const featuresToRender = [...mockFeatures].sort((a, b) => a.order - b.order);

  return (
    <section
      id="mission"
      className="py-24 md:py-32 bg-slate-50 border-b border-slate-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Content Header Area */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest font-black text-slate-500 block mb-3">
            Our Strategy
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">
            {sectionTitle}
          </h2>
          <p className="text-base md:text-lg text-slate-600 leading-relaxed">
            Our mission is clear and impactful. These core values guide every
            action we take and define the future we are building at{' '}
            <span className="font-bold text-slate-900">
              {organizationName}
            </span>
            .
          </p>
        </div>

        {/* Feature Grid Systems */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {featuresToRender.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </motion.div>

        {/* Integrated Clean Call To Action Element */}
        <div className="mt-16 text-center">
          <a
            href="#strategy"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-98"
          >
            <span>Explore Comprehensive Strategy</span>
            <ArrowRightIcon className="w-4 h-4 text-slate-500" strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
}