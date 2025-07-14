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


const steps = [
  {
    icon: <MagnifyingGlassIcon className="w-8 h-8 text-purple-600" />,
    title: "Find Events",
    description:
      "Browse trending, upcoming, and local events tailored to your interests.",
  },
  {
    icon: <CalendarIcon className="w-8 h-8 text-purple-600" />,
    title: "Book or Create",
    description:
      "Easily book your spot or create your own event in minutes using our intuitive dashboard.",
  },
  {
    icon: <FaceSmileIcon className="w-8 h-8 text-purple-600" />,
    title: "Enjoy the Experience",
    description:
      "Attend, network, or host—our tools make every step of the event journey seamless and fun.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-gray-950 py-20 px-4 sm:px-10">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6"
        >
          How It Works
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Getting started is easy. Whether you're here to discover or organize,
          we’ve got you covered in three simple steps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
