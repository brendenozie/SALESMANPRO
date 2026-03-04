"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CalendarDaysIcon, ClockIcon, ArrowRightIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx';

// --- Utility Functions ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function to format date from ISO string or Date
const formatDate = (input: string | Date) => {
  try {
    // Accept either a string or a Date instance
    const date = typeof input === 'string' ? new Date(input) : input;
    if (isNaN(date.getTime())) return "Date N/A";
    // Show Day, Month, Date (e.g., Thu, Nov 20)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch (error) {
    return "Date N/A";
  }
};

// Helper to extract Day and Month for the Badge (accepts string or Date)
const getDayAndMonth = (input: string | Date) => {
    try {
        const date = typeof input === 'string' ? new Date(input) : input;
        if (isNaN(date.getTime())) return { day: 'N/A', month: 'DATE' };
        return {
            day: date.toLocaleDateString('en-US', { day: 'numeric' }),
            month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        };
    } catch (error) {
        return { day: 'N/A', month: 'DATE' };
    }
};


// --- Fallback Data (Kept for component functionality) ---
const fallbackEvents = [
  {
    id: 'fb-event-1',
    title: "Future of AI in Education Summit",
    eventDate: "2024-11-15T10:00:00Z",
    eventTime: "10:00 AM EST",
    startDateTime: "2024-11-15T10:00:00Z",
    endDateTime: "2024-11-15T16:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    description: "A comprehensive summit exploring the transformative impact of artificial intelligence on modern education.",
    order: 1,
  },
  {
    id: 'fb-event-2',
    title: "Global Climate Change Conference",
    eventDate: "2024-12-01T09:00:00Z",
    eventTime: "09:00 AM GMT",
    startDateTime: "2024-11-15T10:00:00Z",
    endDateTime: "2024-11-15T16:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    description: "Bringing together experts and policymakers to discuss urgent climate action and sustainable solutions.",
    order: 2,
  },
  {
    id: 'fb-event-3',
    title: "Blockchain for Beginners Workshop",
    eventDate: "2025-01-10T15:00:00Z",
    eventTime: "03:00 PM EST",
    startDateTime: "2024-11-15T10:00:00Z",
    endDateTime: "2024-11-15T16:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1618044737194-09439600989f?q=80&w=2670&auto=format&fit=crop",
    link: "#",
    description: "An introductory workshop to understand the fundamentals and applications of blockchain technology.",
    order: 3,
  },
];


// --- Main Component ---
export default function LatestEventsSection({ storeFormData }: any) {
  // const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  const eventsToRender = storeFormData?.events && Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events//.sort((a, b) => a.order - b.order) // Ensure events are sorted
    : fallbackEvents;

  const mainEvent  = eventsToRender[0];
  const sideEvents = eventsToRender.slice(1, 4); // Limit side events to 3 for clean layout

  // Normalize main event date/time to handle unioned event shapes:
  // - If the event object has an `eventDate` (string), prefer that.
  // - Otherwise fall back to `startDateTime` which may be a string or Date.
  const mainEventDate: string | Date | undefined = mainEvent
    ? ('eventDate' in mainEvent && mainEvent.eventDate) ? mainEvent.eventDate : (mainEvent.startDateTime as any)
    : undefined;

  // Some event shapes include an `eventTime` field; use a type guard to access it safely.
  const mainEventTime: string | undefined = mainEvent && 'eventTime' in mainEvent ? mainEvent.eventTime : undefined;

  // --- Animation Variants ---
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 10, duration: 0.6 } },
  };

  const mainCardVariants = {
    hidden: { opacity: 0, rotate: -2, scale: 0.95 },
    visible: { opacity: 1, rotate: 0, scale: 1, transition: { type: "spring", stiffness: 60, damping: 10, delay: 0.3 } },
  };

  const sideCardContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.5 } },
  };

  const sideCardItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/333333?text=Image+Error";
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={headerVariants}
          >
            Stay Updated with Our <span style={{ color: primaryColor }}>Upcoming Events</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={headerVariants}
          >
            Discover exclusive webinars, workshops, and gatherings designed to enrich your knowledge and connect you with industry leaders.
          </motion.p>
        </div>

        {/* --- Main Content Grid: 2/3rds Main Event, 1/3rd Side Events --- */}
        <div className="grid md:grid-cols-3 gap-10">
          
          {/* 1. Main Featured Event (Col Span 2) */}
          {mainEvent && (
            <motion.a
              href={mainEvent.id}
              className="md:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden group transition-all duration-500 transform border-b-8 hover:border-b-[12px]"
              style={{ borderColor: primaryColor }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={mainCardVariants}
              whileHover={{ y: -5, scale: 1.005 }}
              whileTap={{ scale: 1 }}
            >
                {/* Date Badge (Intuitive Visual Anchor) */}
                <div 
                    className="absolute  m-6 p-4 rounded-xl text-center shadow-lg transform group-hover:scale-105 transition-transform duration-300"
                    style={{ backgroundColor: accentColor, color: '#333' }}
                >
                    <div className="text-3xl font-extrabold leading-none">{getDayAndMonth(mainEventDate || '').day}</div>
                    <div className="text-sm font-semibold">{getDayAndMonth(mainEventDate || '').month}</div>
                </div>
                  
                {/* Date Badge (Intuitive Visual Anchor) */}
                <div 
                    className="absolute m-6 p-4 rounded-xl text-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 z-50"
                    style={{ backgroundColor: accentColor, color: '#333' }}
                >
                    <div className="text-3xl font-extrabold leading-none">{getDayAndMonth(mainEventDate || '').day}</div>
                    <div className="flex items-center text-base text-gray-300 gap-4 mb-4">
                        <span className={`flex items-center gap-2 font-medium`}>
                            <CalendarDaysIcon className='w-5 h-5' style={{ color: accentColor }} /> {formatDate(mainEventDate || '')}
                        </span>
                        {mainEventTime && (
                          <span className={`flex items-center gap-2 font-medium`}>
                              <ClockIcon className='w-5 h-5' style={{ color: accentColor }} /> {mainEventTime}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center text-base text-gray-300 gap-4 mb-4">
                        <span className={`flex items-center gap-2 font-medium`}>
                            <CalendarDaysIcon className='w-5 h-5' style={{ color: accentColor }} /> {formatDate(mainEventDate || '')}
                        </span>
                        {mainEventTime && (
                          <span className={`flex items-center gap-2 font-medium`}>
                              <ClockIcon className='w-5 h-5' style={{ color: accentColor }} /> {mainEventTime}
                          </span>
                        )}
                    </div>
                    <p className="text-gray-300 mb-6 max-w-lg">
                        {mainEvent.description}
                    </p>
                    {/* Read More link is now integrated into the hover effect */}
                    <span className="text-lg font-bold inline-flex items-center group-hover:underline" style={{ color: primaryColor }}>
                        View Event Details 
                        <ArrowRightIcon className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
              {/* Main Event Image */}
              <div className="relative w-full h-96">
                <Image
                  src={mainEvent.imageUrl || "https://images.unsplash.com/random?fit=crop&w=2670&q=80"}
                  alt={mainEvent.title}
                  fill
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={handleImageError}
                />
              </div>
            </motion.a>
          )}

          {/* 2. Side Events (Col Span 1) */}
          <motion.div
            className="space-y-6 flex flex-col"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sideCardContainerVariants}
          >
            {sideEvents.map((event: any) => (
              <motion.a
                key={event.id}
                href={`${event.id}`}
                className="flex bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg transition-all duration-300
                            hover:shadow-xl transform hover:-translate-y-0.5 group border border-gray-100 dark:border-gray-700"
                variants={sideCardItemVariants}
              >
                {/* Side Event Image */}
                <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-lg relative">
                  <Image
                    src={event.imageUrl || "https://images.unsplash.com/random?fit=crop&w=400&q=80"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    loader={loader}
                    sizes="100px"
                    onError={handleImageError}
                  />
                </div>
                
                {/* Side Event Text */}
                <div className="ml-4 flex-grow">
                  <p className={`text-xs font-semibold uppercase`} style={{ color: accentColor }}>
                    {formatDate(event.startDateTime)} 
                  </p>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-snug group-hover:text-gray-700 transition-colors">
                    {event.title}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5">
                    <ClockIcon className={`w-3 h-3`} style={{ color: primaryColor }} /> {mainEventTime || 'Time N/A'}
                  </p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-gray-400 self-center ml-2 group-hover:text-gray-700 transition-transform group-hover:translate-x-1" />
              </motion.a>
            ))}

            {/* View All Events Button */}
            <motion.a
              href="/events" // Assuming a main events page
              whileHover={{ scale: 1.02, boxShadow: `0 8px 20px ${primaryColor}40` }}
              whileTap={{ scale: 0.98 }}
              className={`w-full mt-6 flex items-center justify-center py-4 rounded-xl text-base font-bold text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75`}
              style={{ backgroundColor: primaryColor }}
              variants={sideCardItemVariants}
            >
              View All Events
              <ArrowRightIcon className="ml-2 w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}