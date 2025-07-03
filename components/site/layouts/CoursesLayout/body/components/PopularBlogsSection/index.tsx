"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Updated icons for date/time
import { useStoreContext } from '@/contexts/StoreContext'; // Import useStoreContext

// Mocking the image loader for standard <img> tags
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function LatestEventsSection() {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  // For this specific issue, I'm using a mock to ensure consistent defaults and data structure.
  const useMockStoreContext = () => ({
    storeFormData: {
      themeSettings: {
        primaryColor: "#fd2121", // Red from your sample
        secondaryColor: "#ffffff", // White from your sample
      },
      events: [
        {
          id: 1,
          title: "Future of AI in Education Summit",
          date: "15 Nov 2023",
          time: "10:00 AM PST",
          imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=AI+Edu+Summit", // Lighter placeholder
          link: "#",
          description: "A comprehensive summit exploring the transformative impact of artificial intelligence on modern education.",
        },
        {
          id: 2,
          title: "Global Climate Change Conference",
          date: "01 Dec 2023",
          time: "09:00 AM GMT",
          imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=Climate+Conf", // Lighter placeholder
          link: "#",
          description: "Bringing together experts and policymakers to discuss urgent climate action and sustainable solutions.",
        },
        {
          id: 3,
          title: "Blockchain for Beginners Workshop",
          date: "10 Jan 2024",
          time: "03:00 PM EST",
          imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=Blockchain+WS", // Lighter placeholder
          link: "#",
          description: "An introductory workshop to understand the fundamentals and applications of blockchain technology.",
        },
        {
          id: 4,
          title: "Innovations in Healthcare Tech",
          date: "25 Jan 2024",
          time: "11:00 AM PST",
          imageUrl: "https://placehold.co/400x250/D1D5DB/4B5563?text=HealthTech+Innov", // Lighter placeholder
          link: "#",
          description: "Showcasing the latest advancements and disruptive technologies shaping the future of healthcare.",
        },
      ],
    },
  });

  const { storeFormData } = useMockStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights

  const events = storeFormData?.events || [];
  const mainEvent = events[0]; // Assuming the first event is the main one
  const sideEvents = events.slice(1); // Remaining events are side events

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

  return (
    <section className="bg-white text-gray-900 py-20 px-4 sm:px-6 lg:px-8"> {/* Light background */}
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
            Stay Updated with Our <span style={{ color: primaryColor }}>Latest Events</span> {/* Dynamic primary color */}
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

        <div className="grid md:grid-cols-3 gap-10"> {/* Increased gap */}
          {/* Main Event */}
          {mainEvent && (
            <motion.div
              className="md:col-span-2 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 group relative" // Light background, more rounded, shadow, border
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={mainCardVariants}
            >
              <div className="relative w-full h-72 sm:h-80 overflow-hidden">
                <img
                  src={customLoader({ src: mainEvent.imageUrl, width: 1200 })}
                  alt={mainEvent.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" // Zoom on hover
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/1200x600/D1D5DB/4B5563?text=Featured+Event+Image";
                  }}
                />
                {/* Overlay for text and subtle effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent"></div> {/* Darker overlay for text contrast */}
                <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white z-10">
                    <div className="flex items-center text-sm text-gray-300 gap-4 mb-3">
                        <span className={`flex items-center gap-1.5 font-medium text-[${accentColor}]`}>
                            <CalendarDaysIcon className='w-5 h-5' /> {mainEvent.date}
                        </span>
                        <span className={`flex items-center gap-1.5 font-medium text-[${accentColor}]`}>
                            <ClockIcon className='w-5 h-5' /> {mainEvent.time}
                        </span>
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
                            background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`, // Primary to Accent gradient
                            '--tw-ring-color': `${accentColor} !important`
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
            className="space-y-6" // Increased space
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sideCardContainerVariants}
          >
            {sideEvents.map((event) => (
              <motion.div
                key={event.id}
                className="flex items-center bg-white rounded-2xl p-4 shadow-md transition-all duration-300
                            hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-1 group border border-gray-100" // Light background, hover effects, border
                variants={sideCardItemVariants}
                onClick={() => console.log(`View event: ${event.title}`)} // Added click handler
              >
                <div className="flex-shrink-0 w-28 h-20 overflow-hidden rounded-lg relative">
                  <img
                    src={customLoader({ src: event.imageUrl, width: 400 })}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/200x120/D1D5DB/4B5563?text=Event+Image";
                    }}
                  />
                  {/* Small overlay on image for visual depth */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                </div>
                <div className="ml-4 flex-grow">
                  <h4 className="text-base font-semibold text-gray-900 mb-1 leading-tight">
                    {event.title}
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <CalendarDaysIcon className={`w-4 h-4 text-[${accentColor}]`} /> {event.date}
                    <span className="text-gray-400">|</span>
                    <ClockIcon className={`w-4 h-4 text-[${accentColor}]`} /> {event.time}
                  </p>
                  <a
                    href={event.link}
                    className={`text-[${accentColor}] text-sm mt-2 inline-flex items-center hover:underline group`}
                    onClick={(e) => { e.preventDefault(); console.log(`Read More for ${event.title}`); }}
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
              className={`w-full mt-6 flex items-center justify-center bg-transparent border border-[${primaryColor}] text-[${primaryColor}]
                          py-3 rounded-md text-base font-bold hover:bg-[${primaryColor}] hover:text-white transition-all duration-300
                          focus:outline-none focus:ring-4 focus:ring-opacity-75`}
              onClick={() => console.log('View All Events clicked!')}
              variants={sideCardItemVariants} // Animate this button with side cards
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
