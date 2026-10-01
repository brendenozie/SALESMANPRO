// components/EventsSection.tsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useInView } from 'react-intersection-observer';
import { useStoreContext } from '@/contexts/StoreContext';
import { IEvent } from '@/types/typings';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function for date formatting
const formatEventDate = (dateObject: Date | string) => {
  try {
    const date = new Date(dateObject);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error) {
    return { month: 'N/A', day: 'N/A', year: 'N/A', time: 'N/A' };
  }
};

const mockRouterPush = (path: string) => {
  console.log(`Navigating to: ${path}`);
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function EventsSection() {
  const { storeFormData } = useStoreContext();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  // Do not use sample events. Rely only on the context store.
  const eventsToRender = storeFormData?.events && Array.isArray(storeFormData.events)
    ? storeFormData.events
    : [];

  // Hide the entire section if there are no events to show.
  if (eventsToRender.length === 0) {
    return null;
  }

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722';
  const organizationSlug = storeFormData?.slug || 'non-profit';

  return (
    <section
      id="events"
      // Emphasizing dark mode preference by using deep slate/gray colors for the dark theme
      className="py-20 md:py-32 bg-gray-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p
            className="text-sm uppercase tracking-widest font-bold mb-3"
            style={{ color: primaryColor }}
          >
            Get Involved
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
            Upcoming Events
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join our community at an upcoming event and help us make a difference.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {eventsToRender.slice(0, 3).map((evt: IEvent) => {
            const formattedDate = formatEventDate(evt.startDateTime);
            return (
              <motion.div
                key={evt.id}
                variants={itemVariants}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg dark:shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-slate-700 overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={evt.imageUrl || "https://placehold.co/800x600/1E293B/475569?text=Event"}
                    alt={evt.title || 'Event Image'}
                    loader={loader}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl p-3 flex flex-col items-center shadow-lg border border-gray-100 dark:border-slate-700 min-w-[4rem]">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">{formattedDate.month}</span>
                    <span className="text-2xl font-extrabold mt-0.5" style={{ color: primaryColor }}>{formattedDate.day}</span>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col h-[calc(100%-14rem)]">
                  <h3 className="font-bold text-xl md:text-2xl mb-3 text-gray-900 dark:text-white leading-snug transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base line-clamp-3 mb-6 flex-grow">
                    {evt.description}
                  </p>

                  <ul className="text-sm text-gray-500 dark:text-gray-300 space-y-3 mb-8">
                    <li className="flex items-center">
                      <ClockIcon className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                      <span className="font-medium">{formattedDate.time}</span>
                    </li>
                    {evt.location && (
                      <li className="flex items-start">
                        <MapPinIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                        <span className="font-medium line-clamp-2">{evt.location}</span>
                      </li>
                    )}
                  </ul>

                  <Link
                    href={`/${organizationSlug}/events/${evt.id}`}
                    onClick={(e) => { e.preventDefault(); mockRouterPush(evt.id); }}
                    className="mt-auto block w-full text-center px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-16 text-center">
          <Link
            href={`/${organizationSlug}/events`}
            className="inline-flex items-center px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
            style={{ backgroundColor: primaryColor }}
          >
            View All Events
            <ArrowRightIcon className="w-5 h-5 ml-2 stroke-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}