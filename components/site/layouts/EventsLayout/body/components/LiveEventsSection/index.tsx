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

export default function LiveEventsSection({
  upcoming,
  slug,
}: {
  upcoming: Array<{
    id: string;
    title?: string;
    name?: string;
    date?: string;
    location?: string;
    image?: string;
    subtitle?: string;
  }>;
  slug: string;
}) {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-center text-gray-800 dark:text-white mb-10"
        >
          Featured Live Events
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {upcoming.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <img
                src={event.image || "/images/placeholder-event.jpg"}
                alt={event.name || event.title}
                className="h-52 w-full object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {event.name || event.title}
                </h3>
                {event.date && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <CalendarIcon className="inline w-4 h-4 mr-1" />
                    {event.date}
                  </p>
                )}
                {event.location && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <MapPinIcon className="inline w-4 h-4 mr-1" />
                    {event.location}
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {event.subtitle}
                </p>
                <a
                  href={`/${slug}/event/${event.id}`}
                  className="inline-block mt-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  View Event
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
