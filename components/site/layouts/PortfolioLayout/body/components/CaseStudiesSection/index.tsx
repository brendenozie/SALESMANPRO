'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

interface CaseStudy {
  imageUrl: string;
  title?: string;
  description?: string;
  link?: string;
  label?: string;
  isTextCard?: boolean;
}

export default function CaseStudiesSection() {
  const { storeFormData } = useStoreContext();

  interface Metric {
    label: string;
    value: string | number;
  }

  let dynamicCaseStudies: CaseStudy[] = [];

  const {
    themeSettings = {},
    metrics = [],
    name,
    slug,
    bannerUrl,
  } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#10b981'; // default emerald
  const accentBg = `${primaryColor}20`; // ~12% opacity

  // Determine case studies: expect array of { imageUrl, title, description?, link? }
  const caseStudiesData: Array<{
    imageUrl: string;
    title?: string;
    description?: string;
    link?: string;
    label?: string;
    isTextCard?: boolean;
  }> =
    Array.isArray(dynamicCaseStudies) && dynamicCaseStudies.length > 0
      ? dynamicCaseStudies.map((cs: any) => ({
          imageUrl: cs.imageUrl || cs.src || '',
          title: cs.title || '',
          description: cs.description || '',
          link: cs.link || '',
          label: cs.label || '',
        }))
      : [
          {
            imageUrl: '/case1.jpg',
            title: 'Planning Session',
            description: '',
            link: '',
          },
          {
            imageUrl: '', // will be used in text card
            title: 'Find a Business Coach',
            description:
              'Tap into expert insights and strategy to elevate your business with clarity and confidence.',
            link: slug ? `/${slug}/contact` : '#contact',
            label: '', // for overlay if needed
            isTextCard: true,
          },
          {
            imageUrl: '/case2.jpg',
            title: 'Team Coaching',
            description: '',
          },
          {
            imageUrl: '/case3.jpg',
            title: 'Cleanio Cleaning Case',
            description: '',
            label: 'Cleanio Cleaning Case',
          },
          {
            imageUrl: '/case4.jpg',
            title: 'Cleaner Coaching',
            description: '',
          },
        ];

  // Determine metrics for stat cards: if metrics exist, map each; else fallback one
  const metricsData: Array<{ label: string; value: string | number }> =
    Array.isArray(metrics) && metrics.length > 0
      ? metrics.map((m: any) => ({
          label: m.label || '',
          value: m.value ?? '',
        }))
      : [{ label: 'Client Success Rate', value: '90%' }];

  return (
    <section className="relative py-24 px-6 lg:px-20 overflow-hidden bg-white dark:bg-gray-900">
      {/* Optional faint background from bannerUrl */}
      {bannerUrl && (
        <div className="absolute inset-0 -z-10">
          <Image
            src={bannerUrl}
            alt={`${name || 'Background'} case studies`}
            fill
            className="object-cover opacity-10"
            loader={loader}
            priority={false}
          />
          <div className="absolute inset-0 bg-white dark:bg-gray-900" />
        </div>
      )}

      {/* Section Heading */}
      <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
        <motion.h2
          className="text-4xl font-bold text-gray-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Real{' '}
          <span style={{ color: primaryColor }}>
            Results
          </span>{' '}
          with Real Clients
        </motion.h2>
        <motion.p
          className="mt-4 text-gray-600 dark:text-gray-300 text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Discover how coaching has transformed businesses, empowered leaders, and delivered measurable success.
        </motion.p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {caseStudiesData.map((item, idx) => {
          // If it's a text card (no imageUrl but has title/description)
          if (item.isTextCard || (!item.imageUrl && item.title && item.description)) {
            return (
              <motion.div
                key={`text-card-${idx}`}
                className="bg-[color:var(--accent-bg)] p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                    {item.title}{' '}
                    {item.label && (
                      <span style={{ color: primaryColor }}>
                        {item.label}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {item.description}
                  </p>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    className="mt-6 bg-[color:var(--primary)] hover:opacity-90 text-white font-semibold text-sm px-5 py-2 rounded-xl w-fit transition"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {item.link.includes('contact') ? 'Schedule a Call' : 'Learn More'}
                  </a>
                )}
              </motion.div>
            );
          }

          // Otherwise image card
          return (
            <motion.div
              key={`img-card-${idx}`}
              className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group"
              whileHover={{ scale: 1.02 }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title || `Case ${idx + 1}`}
                  loader={loader}
                  width={400}
                  height={250}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700" />
              )}
              {item.label && (
                <div
                  className="absolute bottom-4 left-4 bg-[color:var(--primary)] text-white text-sm px-4 py-1 rounded-full shadow"
                  style={{ backgroundColor: primaryColor }}
                >
                  {item.label}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Stat Cards from metrics */}
        {metricsData.map((m, idx) => (
          <motion.div
            key={`stat-card-${idx}`}
            className="bg-[color:var(--primary)] text-white p-8 rounded-2xl text-center flex flex-col justify-center shadow-md hover:shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.2 }}
            style={{ backgroundColor: primaryColor }}
          >
            <p className="text-4xl font-bold mb-2">{m.value}</p>
            <p className="text-sm">{m.label}</p>
            <svg
              className="w-12 h-12 mx-auto mt-4 opacity-20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6 4 4 6-6" />
            </svg>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
