"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline'; // Importing specific icons
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function TestimonialsSection({
  testimonials,
}: {
  testimonials: Array<{ quote: string; author: string }>;
}) {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          What People Are Saying
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-xl mx-auto">
          Real stories from attendees and organizers who’ve used our platform to create memorable experiences.
        </p>

        <div className="grid gap-10 md:grid-cols-2 text-left">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-md transition"
            >
              <TagIcon className="text-purple-600 w-6 h-6 mb-4" />
              <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                “{testimonial.quote}”
              </p>
              <footer className="mt-4 text-right font-semibold text-gray-900 dark:text-white">
                — {testimonial.author}
              </footer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}