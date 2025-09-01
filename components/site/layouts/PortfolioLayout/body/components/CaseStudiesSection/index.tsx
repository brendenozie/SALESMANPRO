'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';


// --- Start of Self-Contained Mock Data and Component Logic ---

// Fallback data for a standalone preview. This mimics the data that would
// typically come from a larger application context.
const storeData = {
  themeSettings: {
    primaryColor: '#00A880',
    secondaryColor: '#10B981',
  },
  name: 'Our Team',
  slug: 'our-team',
  metrics: [
    { label: 'Client Success Rate', value: '95%', icon: RocketLaunchIcon },
    { label: 'Projects Completed', value: '300+', icon: BriefcaseIcon },
    { label: 'Avg. Client ROI', value: '3.5x', icon: ChartBarIcon },
  ],
  caseStudies: [
    {
      imageUrl: 'https://placehold.co/800x600/00A880/ffffff?text=Strategic+Growth+Initiative',
      title: 'Strategic Growth Initiative',
      description: 'Helped a startup scale from 5 to 50 employees in 18 months, securing series B funding.',
      link: '#',
      label: 'Startup Success',
      featured: true,
    },
    {
      imageUrl: 'https://placehold.co/800x600/10B981/ffffff?text=Leadership+Development',
      title: 'Leadership Development Program',
      description: 'Designed and implemented a leadership training program, boosting team productivity by 25%.',
      link: '#',
      label: 'Team Empowerment',
    },
    {
      imageUrl: 'https://placehold.co/800x600/00A880/ffffff?text=Digital+Transformation',
      title: 'Digital Transformation Journey',
      description: 'Guided a traditional business through its digital pivot, expanding market reach significantly.',
      link: '#',
      label: 'Business Modernization',
    },
    {
      imageUrl: '',
      title: 'Ready to Transform Your Business?',
      description: 'Connect with me to explore how tailored coaching can unlock your potential and drive measurable results.',
      link: '#',
      isTextCard: true,
    },
    {
      imageUrl: 'https://placehold.co/800x600/10B981/ffffff?text=Brand+Story',
      title: 'Brand Story & Market Positioning',
      description: 'Crafted a compelling brand narrative that resonated with target audiences, leading to increased brand loyalty.',
      link: '#',
      label: 'Brand Strategy',
    },
    {
      imageUrl: 'https://placehold.co/800x600/00A880/ffffff?text=Operational+Efficiency',
      title: 'Operational Efficiency Overhaul',
      description: 'Streamlined internal processes, reducing operational costs by 15% within a year.',
      link: '#',
      label: 'Process Optimization',
    },
  ],
};

// Framer Motion variants for animations
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function CaseStudiesSection() {
  
  const { storeFormData } = useStoreContext() as { storeFormData: StoreData };

  const {
    themeSettings = {},
    metrics = [],
    name,
    caseStudies = [],
  } = storeFormData || storeData;

  const primaryColor = themeSettings.primaryColor || '#00A880';
  const secondaryColor = themeSettings.secondaryColor || '#10B981';
  const accentBg = `${primaryColor}20`;

  const caseStudiesToRender = caseStudies.length > 0 ? caseStudies : [];
  const metricsData = metrics.length > 0 ? metrics : [];

  return (
    <section id="case-studies" className="relative py-24 md:py-32 px-6 lg:px-16 overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background gradients for visual interest */}
      <div
        className="absolute top-0 left-0 w-full h-1/2 opacity-5 dark:opacity-10"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${primaryColor}, transparent 50%)`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-full h-1/2 opacity-5 dark:opacity-10"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${secondaryColor}, transparent 50%)`,
        }}
      />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight drop-shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Real <span style={{ color: primaryColor }}>Impact</span>. Real <span style={{ color: secondaryColor }}>Results</span>.
          </motion.h2>
          <motion.p
            className="mt-4 text-gray-600 dark:text-gray-300 text-lg md:text-xl"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Explore how strategic coaching has empowered clients to achieve extraordinary outcomes.
          </motion.p>
        </div>

        {/* Metrics/Stat Cards */}
        {metricsData.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {metricsData.map((m, idx) => {
              const IconComponent = m.icon;
              return (
                <motion.div
                  key={`metric-${idx}`}
                  className="p-8 rounded-3xl text-center shadow-lg border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
                  style={{ backgroundColor: idx % 2 === 0 ? primaryColor : secondaryColor, color: '#fff' }}
                  variants={cardVariants}
                >
                  {IconComponent && <IconComponent className="w-10 h-10 mb-4 opacity-70" />}
                  <p className="text-5xl font-extrabold mb-2">{m.value}</p>
                  <p className="text-lg font-medium opacity-90">{m.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Dynamic Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {caseStudiesToRender.map((item, idx) => {
            const isFeatured = item.featured && !item.isTextCard;
            const CardComponent = 'a';

            return (
              <motion.div
                key={`case-study-${idx}`}
                className={`${isFeatured ? 'md:col-span-2 lg:col-span-2' : ''} 
                  relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl group`}
                variants={cardVariants}
              >
                <CardComponent
                  href={item.link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col h-full"
                >
                  {item.isTextCard ? (
                    // Text Card specific design
                    <div
                      className="p-8 h-full flex flex-col justify-between"
                      style={{ backgroundColor: accentBg }}
                    >
                      <SparklesIcon className="w-12 h-12 text-gray-800 dark:text-gray-200 mb-6 opacity-60" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 font-semibold text-white px-5 py-2 rounded-full transition-colors w-fit"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {item.link?.includes('contact') ? 'Schedule a Call' : 'Discover More'}
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  ) : (
                    // Image Card specific design
                    <div className="relative w-full h-64 md:h-72 lg:h-80 xl:h-96">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title || `Case Study ${idx + 1}`}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                        {item.label && (
                          <span
                            className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium mb-2 w-fit"
                          >
                            {item.label}
                          </span>
                        )}
                        <h3 className="text-xl font-bold text-white leading-snug">
                          {item.title || `Case Study ${idx + 1}`}
                        </h3>
                        {item.description && (
                          <p className="text-gray-200 text-sm mt-1 opacity-90">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardComponent>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
