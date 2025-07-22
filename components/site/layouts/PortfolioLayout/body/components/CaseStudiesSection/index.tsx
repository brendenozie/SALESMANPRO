'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Use Link for internal navigation
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon, ChartBarIcon, BriefcaseIcon, AcademicCapIcon, RocketLaunchIcon } from '@heroicons/react/24/outline'; // Importing additional icons
import { useStoreContext } from '@/contexts/StoreContext';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface CaseStudyItem {
  imageUrl?: string; // Optional for text cards
  title?: string;
  description?: string;
  link?: string;
  label?: string; // For a tag/category
  isTextCard?: boolean;
  featured?: boolean; // New prop to mark a card as featured
}

interface Metric {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>; // Optional icon for metrics
}

interface StoreFormData {
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string; // Assuming secondary color exists for accent
  };
  metrics?: Metric[];
  name?: string;
  slug?: string;
  bannerUrl?: string;
  // Assuming case studies data can come from storeFormData
  caseStudies?: CaseStudyItem[];
}

export default function CaseStudiesSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  const {
    themeSettings = {},
    metrics = [],
    name,
    slug,
    bannerUrl,
    caseStudies: dynamicCaseStudies = [], // Use a default empty array
  } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#10b981'; // default emerald
  const secondaryColor = themeSettings.secondaryColor || '#3b82f6'; // default blue
  const accentBg = `${primaryColor}20`; // ~12% opacity (can be adjusted for dark mode)

  // Default case studies with richer data and one marked as featured
  const defaultCaseStudiesData: CaseStudyItem[] = [
    {
      imageUrl: '/placeholder-case-1.jpg',
      title: 'Strategic Growth Initiative',
      description: 'Helped a startup scale from 5 to 50 employees in 18 months, securing series B funding.',
      link: '/portfolio/strategic-growth',
      label: 'Startup Success',
      featured: true, // This will be the larger, featured card
    },
    {
      imageUrl: '/placeholder-case-2.jpg',
      title: 'Leadership Development Program',
      description: 'Designed and implemented a leadership training program, boosting team productivity by 25%.',
      link: '/portfolio/leadership-development',
      label: 'Team Empowerment',
    },
    {
      imageUrl: '/placeholder-case-3.jpg',
      title: 'Digital Transformation Journey',
      description: 'Guided a traditional business through its digital pivot, expanding market reach significantly.',
      link: '/portfolio/digital-transformation',
      label: 'Business Modernization',
    },
    {
      imageUrl: '', // This will be used as a text-only CTA card
      title: 'Ready to Transform Your Business?',
      description: 'Connect with me to explore how tailored coaching can unlock your potential and drive measurable results.',
      link: slug ? `/${slug}/contact` : '/contact',
      isTextCard: true,
    },
    {
      imageUrl: '/placeholder-case-4.jpg',
      title: 'Brand Story & Market Positioning',
      description: 'Crafted a compelling brand narrative that resonated with target audiences, leading to increased brand loyalty.',
      link: '/portfolio/brand-story',
      label: 'Brand Strategy',
    },
    {
      imageUrl: '/placeholder-case-5.jpg',
      title: 'Operational Efficiency Overhaul',
      description: 'Streamlined internal processes, reducing operational costs by 15% within a year.',
      link: '/portfolio/operational-efficiency',
      label: 'Process Optimization',
    },
  ];

  // Combine dynamic and default, prioritizing dynamic
  const caseStudiesToRender =
    Array.isArray(dynamicCaseStudies) && dynamicCaseStudies.length > 0
      ? dynamicCaseStudies.map(cs => ({
          ...cs,
          imageUrl: cs.imageUrl || '', // Ensure imageUrl is string
          isTextCard: cs.isTextCard || (!cs.imageUrl && cs.title && cs.description),
        }))
      : defaultCaseStudiesData;

  // Determine metrics for stat cards: if metrics exist, map each; else fallback one
  const defaultMetricsData: Metric[] = [
    { label: 'Client Success Rate', value: '95%', icon: RocketLaunchIcon },
    { label: 'Projects Completed', value: '300+', icon: BriefcaseIcon },
    { label: 'Avg. Client ROI', value: '3.5x', icon: ChartBarIcon },
  ];
  const metricsData: Metric[] = Array.isArray(metrics) && metrics.length > 0
    ? metrics.map(m => ({
        label: m.label || '',
        value: m.value ?? '',
        icon: m.icon, // Assume icon can be passed in dynamic data
      }))
    : defaultMetricsData;

  // Framer Motion variants
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

  return (
    <section id="case-studies" className="relative py-24 md:py-32 px-6 lg:px-16 overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background elements for visual interest */}
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
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: 'url("/assets/diagonal-lines-light.svg")', backgroundSize: '30px 30px' }}></div>


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

        {/* Dynamic Grid Layout */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {caseStudiesToRender.map((item, idx) => {
            const isFeatured = item.featured && !item.isTextCard; // Featured applies only to image cards
            const CardComponent = item.link ? Link : 'div'; // Use Link if link exists, otherwise div

            return (
              <motion.div
                key={`case-study-${idx}`}
                className={`${
                  isFeatured ? 'md:col-span-2 lg:col-span-2' : '' // Make featured card span 2 columns on medium/large screens
                } relative rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl group`}
                variants={cardVariants}
              >
                {/* Conditionally render Link or div wrapper */}
                <CardComponent
                  {...(item.link && { href: item.link, target: item.link.startsWith('/') ? '_self' : '_blank', rel: item.link.startsWith('/') ? '' : 'noopener noreferrer' })}
                  className="flex flex-col h-full"
                >
                  {item.isTextCard ? (
                    // Text Card specific design
                    <div
                      className="p-8 h-full flex flex-col justify-between"
                      style={{ background: accentBg }}
                    >
                      <SparklesIcon className="w-12 h-12 text-gray-800 dark:text-gray-200 mb-6 opacity-60" /> {/* Larger icon */}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-6">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 font-semibold text-white px-5 py-2 rounded-full transition-colors"
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
                        <Image
                          src={item.imageUrl}
                          loader={imageLoader}
                          alt={item.title || `Case Study ${idx + 1}`}
                          fill
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

          {/* Metrics / Stat Cards - Grouped or integrated differently */}
          {metricsData.length > 0 && (
            <motion.div
              className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" // New grid for metrics below case studies
              variants={sectionVariants} // Reuse section variants for overall animation
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
                    style={{ backgroundColor: idx % 2 === 0 ? primaryColor : secondaryColor, color: '#fff' }} // Alternate primary/secondary background
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
        </motion.div>
      </div>
    </section>
  );
}