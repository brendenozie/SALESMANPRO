"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Updated icons for date/time

// Mocking the image loader for standard <img> tags
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function LatestEventsSection() {
  const events = [
    {
      id: 1,
      title: "Future of AI in Education Summit",
      date: "15 Nov 2023",
      time: "10:00 AM PST",
      image: "https://placehold.co/400x250/36454F/FFFFFF?text=AI+Edu+Summit", // Charcoal color
      link: "#",
    },
    {
      id: 2,
      title: "Global Climate Change Conference",
      date: "01 Dec 2023",
      time: "09:00 AM GMT",
      image: "https://placehold.co/400x250/191970/FFFFFF?text=Climate+Conf", // Midnight Blue
      link: "#",
    },
    {
      id: 3,
      title: "Blockchain for Beginners Workshop",
      date: "10 Jan 2024",
      time: "03:00 PM EST",
      image: "https://placehold.co/400x250/004080/FFFFFF?text=Blockchain+WS", // Dark Blue
      link: "#",
    },
    {
      id: 4,
      title: "Innovations in Healthcare Tech",
      date: "25 Jan 2024",
      time: "11:00 AM PST",
      image: "https://placehold.co/400x250/2E8B57/FFFFFF?text=HealthTech+Innov", // Sea Green
      link: "#",
    },
  ];

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
    <section className="bg-gradient-to-br from-gray-900 to-slate-950 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-white"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={textVariants}
          >
            Stay Updated with Our <span className="text-orange-500">Latest Events</span>
          </motion.h2>
          <motion.p
            className="mt-4 text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed"
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
          <motion.div
            className="md:col-span-2 bg-slate-800 rounded-3xl shadow-xl overflow-hidden group relative" // Softer background, more rounded, shadow, group for hover
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={mainCardVariants}
          >
            <div className="relative w-full h-72 sm:h-80 overflow-hidden">
              <img
                src={customLoader({ src: "https://placehold.co/1200x600/2C3E50/FFFFFF?text=Featured+Event", width: 1200 })}
                alt="Main Event"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" // Zoom on hover
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/1200x600/36454F/FFFFFF?text=Featured+Event+Image";
                }}
              />
              {/* Overlay for text and subtle effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            </div>
            <div className="p-6 sm:p-8 relative z-10"> {/* Increased padding */}
              <div className="flex items-center text-sm text-gray-300 gap-4 mb-3">
                <span className="flex items-center gap-1.5 font-medium text-orange-300">
                  <CalendarDaysIcon className='w-5 h-5' /> 20 Oct 2021
                </span>
                <span className="flex items-center gap-1.5 font-medium text-orange-300">
                  <ClockIcon className='w-5 h-5' /> 2:00 pm
                </span>
              </div>
              <h3 className="text-3xl font-bold mt-2 mb-4 leading-tight text-white">
                Sport Management Information Webinar
              </h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Join our comprehensive webinar to explore career opportunities and cutting-edge trends in sports management, designed for aspiring professionals and industry enthusiasts.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(249, 115, 22, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white
                           px-7 py-3 rounded-full text-base font-bold shadow-lg transition-all duration-300
                           hover:from-orange-600 hover:to-yellow-600 focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-75"
                onClick={() => console.log('Read More for Main Event')}
              >
                Read More
                <ArrowRightIcon className="ml-2 w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>

          {/* Side Events */}
          <motion.div
            className="space-y-6" // Increased space
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sideCardContainerVariants}
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                className="flex items-center bg-slate-800 rounded-2xl p-4 shadow-md transition-all duration-300
                           hover:bg-slate-700 hover:shadow-lg transform hover:-translate-y-1 group" // Hover effects
                variants={sideCardItemVariants}
                onClick={() => console.log(`View event: ${event.title}`)} // Added click handler
              >
                <div className="flex-shrink-0 w-28 h-20 overflow-hidden rounded-lg relative"> {/* Larger image container */}
                  <img
                    src={customLoader({ src: event.image, width: 400 })}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/200x120/4A4A4A/FFFFFF?text=Event+Image";
                    }}
                  />
                  {/* Small overlay on image for visual depth */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                </div>
                <div className="ml-4 flex-grow"> {/* Adjusted margin */}
                  <h4 className="text-base font-semibold text-white mb-1 leading-tight"> {/* Larger title */}
                    {event.title}
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-2"> {/* Smaller date/time text */}
                    <CalendarDaysIcon className="w-4 h-4 text-orange-400" /> {event.date}
                    <span className="text-gray-600">|</span>
                    <ClockIcon className="w-4 h-4 text-orange-400" /> {event.time}
                  </p>
                  <a
                    href={event.link}
                    className="text-orange-400 text-sm mt-2 inline-flex items-center hover:underline group"
                    onClick={(e) => { e.preventDefault(); console.log(`Read More for ${event.title}`); }}
                  >
                    Details <ArrowRightIcon className="ml-1 w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </motion.div>
            ))}
            {/* View All Events Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(249, 115, 22, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-6 flex items-center justify-center bg-transparent border border-orange-500 text-orange-500
                         py-3 rounded-full text-base font-bold hover:bg-orange-500 hover:text-white transition-all duration-300
                         focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-75"
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
