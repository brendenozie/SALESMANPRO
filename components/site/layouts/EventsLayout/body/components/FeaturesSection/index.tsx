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


const features = [
  {
    icon: <CalendarIcon className="w-8 h-8 text-indigo-600" />,
    title: "Easy Event Booking",
    description:
      "Find and reserve your spot at events in just a few clicks.",
  },
  {
    icon: <MapPinIcon className="w-8 h-8 text-indigo-600" />,
    title: "Local & Global Listings",
    description:
      "Browse events near you or explore happenings around the world instantly.",
  },
  {
    icon: <TicketIcon className="w-8 h-8 text-indigo-600" />,
    title: "Secure Ticketing",
    description:
      "Buy, store, and scan your tickets with confidence on our secure platform.",
  },
  {
    icon: <BellIcon className="w-8 h-8 text-indigo-600" />,
    title: "Real-Time Reminders",
    description:
      "Get notified before events start so you never miss out on the action.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-4"
        >
          Why Choose Our Platform?
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Whether you're an attendee or an organizer, we’ve built tools to make
          your events smooth, exciting, and unforgettable.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}