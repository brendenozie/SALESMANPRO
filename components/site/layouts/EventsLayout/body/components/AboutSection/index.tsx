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

export default function AboutSection({ description }: { description?: string }) {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <img
            src="/images/events-about.jpg"
            alt="About Us"
            className="w-full rounded-3xl shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            Who <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">We Are</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {description ||
              "We’re dedicated to bringing you the best events—music, art, tech, and wellness. Explore, connect, and celebrate with us."}
          </p>
          <ul className="space-y-3 text-gray-700 dark:text-gray-200">
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Curated
              experiences in every category
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> Trusted ticketing
              and secure payments
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-indigo-500">✔</span> 24/7 support and
              reminders
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
