'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

export default function BusinessSection() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    themeSettings = {},
    marketplaceListings = [],
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#3b82f6';
  const secondaryColor = themeSettings.secondaryColor || '#2563eb';

  // Prepare offerings
  type Offering = { title: string; desc: string; id?: string };
  const defaultCoachingSolutions: Offering[] = [
    {
      title: 'Business Coaching',
      desc: 'Enhance your business performance with expert coaching from professionals who’ve built and scaled successful ventures.',
    },
    {
      title: 'Executive Coaching',
      desc: 'Tailored sessions with elite executive coaches to elevate your leadership in high-stakes environments.',
    },
    {
      title: 'Leadership Coaching',
      desc: 'Sharpen your leadership edge, boost team dynamics, and drive results with strategic coaching for modern leaders.',
    },
    {
      title: 'Accountability Coaching',
      desc: 'Stay focused, set achievable goals, and track progress with our dedicated accountability experts.',
      id: '', // will render button
    },
    {
      title: 'Strategic Planning',
      desc: 'Define your vision, align your goals, and plan your growth with expert-guided strategic roadmaps.',
    },
    {
      title: 'Career Coaching',
      desc: 'Gain clarity, set milestones, and take control of your professional trajectory with personalized career coaching.',
    },
  ];

  const dynamicOfferings: Offering[] =
    Array.isArray(marketplaceListings) && marketplaceListings.length > 0
      ? marketplaceListings.map((item: any) => ({
          title: item.name || 'Service',
          desc: item.description || '',
          id: item.id,
        }))
      : defaultCoachingSolutions;

  return (
    <section
      className="py-24 px-6 lg:px-20"
      style={{
        background: `linear-gradient(to bottom, ${primaryColor}20, white)`,
      }}
    >
      <div className="max-w-7xl mx-auto text-center mb-12">
        <motion.h2
          className="text-4xl md:text-5xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ color: primaryColor }}
        >
          {name ? `Our ${name} Solutions` : 'Our Solutions'}
        </motion.h2>
        {description && (
          <motion.p
            className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {dynamicOfferings.map(({ title, desc, id }, idx) => (
          <motion.div
            key={idx}
            className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            {/* Decorative circle */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-30"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="p-6 flex flex-col h-full">
              {/* Icon / Initial in circle */}
              <div className="relative mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {title.charAt(0)}
                </div>
                {/* small accent dot */}
                <div
                  className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
                {title}
              </h3>
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
                {desc}
              </p>

              {/* Button */}
              <div className="mt-6">
                <Link href={id ? `/${slug}/product/${id}` : `/${slug}/contact`}
                    className="inline-flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-full shadow"
                    style={{ backgroundColor: primaryColor, color: '#fff' }}
                  >
                    Book Consultation
                    <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
