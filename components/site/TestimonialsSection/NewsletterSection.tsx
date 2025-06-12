'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Testimonial {
  quote: string;
  author: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  if (!testimonials || testimonials.length === 0) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (idx: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: idx * 0.2, duration: 0.6, ease: 'easeOut' },
    }),
  };

  return (
    <Section title="What Our Customers Say">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Top Gradient Accent */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                }}
              />

              <div className="p-6 flex flex-col h-full">
                {/* Quote Icon */}
                <div className="flex items-center mb-4 text-primary">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" style={{ color: primary }} />
                </div>

                {/* Quote Text */}
                <p className="flex-grow text-lg italic text-gray-700 dark:text-gray-200 h-12 overflow-clip">
                  “{t.quote}”
                </p>

                {/* Author */}
                <p className="mt-6 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">
                  — {t.author}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
