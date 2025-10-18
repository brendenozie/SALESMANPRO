"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image for optimized images
import { CalendarDaysIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type Event = {
  id: string;
  title: string;
  description?: string;
  eventDate: string; // Changed from 'date' to 'eventDate' for clarity, should be ISO string or similar
  eventTime?: string; // Changed from 'time' to 'eventTime'
  imageUrl: string;
  link: string; // Link to event details
  order: number; // For sorting events
};

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

export type StoreForm = {
  events?: Event[]; // Array of Event objects
  themeSettings?: ThemeSettings;
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     themeSettings: {
//       primaryColor: "#fd2121", // Red from your sample
//       secondaryColor: "#FFC107", // Amber/Yellow for accent
//     },
//     events: [
//       {
//         id: 'event-1',
//         title: "Future of AI in Education Summit",
//         eventDate: "2023-11-15T10:00:00Z", // ISO string for date
//         eventTime: "10:00 AM PST",
//         imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // More realistic image
//         link: "#ai-summit",
//         description: "A comprehensive summit exploring the transformative impact of artificial intelligence on modern education.",
//         order: 1,
//       },
//       {
//         id: 'event-2',
//         title: "Global Climate Change Conference",
//         eventDate: "2023-12-01T09:00:00Z",
//         eventTime: "09:00 AM GMT",
//         imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         link: "#climate-conf",
//         description: "Bringing together experts and policymakers to discuss urgent climate action and sustainable solutions.",
//         order: 2,
//       },
//       {
//         id: 'event-3',
//         title: "Blockchain for Beginners Workshop",
//         eventDate: "2024-01-10T15:00:00Z",
//         eventTime: "03:00 PM EST",
//         imageUrl: "https://images.unsplash.com/photo-1618044737194-09439600989f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         link: "#blockchain-workshop",
//         description: "An introductory workshop to understand the fundamentals and applications of blockchain technology.",
//         order: 3,
//       },
//       {
//         id: 'event-4',
//         title: "Innovations in Healthcare Tech",
//         eventDate: "2024-01-25T11:00:00Z",
//         eventTime: "11:00 AM PST",
//         imageUrl: "https://images.unsplash.com/photo-1576091160550-fd428758785e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
//         link: "#healthtech-innov",
//         description: "Showcasing the latest advancements and disruptive technologies shaping the future of healthcare.",
//         order: 4,
//       },
//     ],
//   } as StoreForm,
// });

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Helper function to format date from ISO string
const formatDate = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date N/A";
  }
};


// Static fallback data
const fallbackEvents = [
  {
    id: 'fb-event-1',
    title: "AI in Education Summit (Fallback)",
    eventDate: "2024-08-15T10:00:00Z",
    eventTime: "10:00 AM EST",
    imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=AI+Edu+Summit",
    link: "#",
    description: "Discover the future of learning with artificial intelligence.",
  },
  {
    id: 'fb-event-2',
    title: "Web Development Workshop (Fallback)",
    eventDate: "2024-09-01T14:00:00Z",
    eventTime: "02:00 PM GMT",
    imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=Web+Dev+Workshop",
    link: "#",
    description: "Hands-on workshop for aspiring web developers.",
  },
  {
    id: 'fb-event-3',
    title: "Creative Writing Seminar (Fallback)",
    eventDate: "2024-09-20T18:00:00Z",
    eventTime: "06:00 PM PST",
    imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=Writing+Seminar",
    link: "#",
    description: "Unlock your storytelling potential in this interactive seminar.",
  },
  {
    id: 'fb-event-4',
    title: "Data Science Bootcamp Info Session (Fallback)",
    eventDate: "2024-10-05T09:00:00Z",
    eventTime: "09:00 AM EST",
    imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=Data+Science+Info",
    link: "#",
    description: "Learn about our intensive data science bootcamp.",
  },
];

export default function LatestEventsSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107'; // A vibrant amber/yellow for highlights

  // Determine which events to render: dynamic or fallback
  const eventsToRender = storeFormData?.events && Array.isArray(storeFormData?.events) && storeFormData.events.length > 0
    ? storeFormData.events//.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : fallbackEvents;

  const mainEvent :any = eventsToRender[0]; // Assuming the first event is the main one
  const sideEvents : any = eventsToRender.slice(1); // Remaining events are side events

  // Animation variants for section title and subtitle
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 10,
        duration: 0.6,
      },
    },
  };

  // Animation variants for main event card
  const mainCardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 10,
        delay: 0.3,
      },
    },
  };

  // Animation variants for side event cards (staggered)
  const sideCardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.5,
      },
    },
  };

  const sideCardItemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/333333?text=Image+Error";
  };

  return (
    <section className="bg-white text-gray-900 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
          >
            Stay Updated with Our <span style={{ color: primaryColor }}>Latest Events</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-gray-700 max-w-2xl mx-auto text-lg leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={textVariants}
          >
            Discover upcoming webinars, workshops, and exclusive gatherings designed to enrich your knowledge and connect you with experts.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Main Event */}
          {mainEvent && (
            <motion.div
              className="md:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 group relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={mainCardVariants}
            >
              <div className="relative w-full h-72 sm:h-80 overflow-hidden">
                <Image
                  src={mainEvent.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                  alt={mainEvent.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loader={loader}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  // onError={handleImageError}
                />
                {/* Overlay for text and subtle effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white z-10">
                    <div className="flex items-center text-sm text-gray-300 gap-4 mb-3">
                        <span className={`flex items-center gap-1.5 font-medium`} style={{ color: accentColor }}>
                            <CalendarDaysIcon className='w-5 h-5' /> {formatDate(mainEvent.eventDate)}
                        </span>
                        {mainEvent.eventTime && (
                          <span className={`flex items-center gap-1.5 font-medium`} style={{ color: accentColor }}>
                              <ClockIcon className='w-5 h-5' /> {mainEvent.eventTime}
                          </span>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold mt-2 mb-4 leading-tight text-white">
                        {mainEvent.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                        {mainEvent.description}
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: `0 8px 20px ${primaryColor}40` }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex items-center text-white
                                     px-7 py-3 rounded-md text-base font-bold shadow-lg transition-all duration-300
                                     focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                        style={{
                            background: `${primaryColor}`
                            // `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                            // '--tw-ring-color': `${accentColor} !important` as any
                        }}
                        onClick={() => window.location.href = mainEvent.link}
                    >
                        Read More
                        <ArrowRightIcon className="ml-2 w-4 h-4" />
                    </motion.button>
                </div>
                </div>
            </motion.div>
          )}

          {/* Side Events */}
          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sideCardContainerVariants}
          >
            {sideEvents.map((event :any) => (
              <motion.div
                key={event.id}
                className="flex items-center bg-white rounded-2xl p-4 shadow-md transition-all duration-300
                            hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-1 group border border-gray-100"
                variants={sideCardItemVariants}
                onClick={() => window.location.href = event.link}
              >
                <div className="flex-shrink-0 w-28 h-20 overflow-hidden rounded-lg relative">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loader={loader}
                    sizes="120px" // Fixed size for small images
                    // onError={handleImageError}
                  />
                  {/* Small overlay on image for visual depth */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
                    {event.title}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <CalendarDaysIcon className={`w-4 h-4`} style={{ color: accentColor }} /> {formatDate(event.eventDate)}
                    {event.eventTime && (
                      <>
                        <span className="text-gray-400">|</span>
                        <ClockIcon className={`w-4 h-4`} style={{ color: accentColor }} /> {event.eventTime}
                      </>
                    )}
                  </p>
                  <a
                    href={event.link}
                    className={`text-sm mt-2 inline-flex items-center hover:underline group`}
                    style={{ color: accentColor }}
                    onClick={(e) => { e.preventDefault(); window.location.href = event.link; }}
                  >
                    Details <ArrowRightIcon className="ml-1 w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
            {/* View All Events Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 5px 15px ${primaryColor}40` }}
              whileTap={{ scale: 0.97 }}
              className={`w-full mt-6 flex items-center justify-center bg-transparent border py-3 rounded-md text-base font-bold hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75`}
              style={{
                borderColor: primaryColor,
                color: primaryColor,
                '--tw-hover-bg': primaryColor,
              } as React.CSSProperties}
              onClick={() => console.log('View All Events clicked!')}
              variants={sideCardItemVariants}
            >
              View All Events
              <ArrowRightIcon className="ml-2 w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
