// File: components/site/layouts/HealthcareLayout/body/components/CTASection/index.tsx

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

interface OpeningHours {
  mon: { open: string; close: string } | string;
  tue: { open: string; close: string } | string;
  wed: { open: string; close: string } | string;
  thu: { open: string; close: string } | string;
  fri: { open: string; close: string } | string;
  sat: { open: string; close: string } | string;
  sun: { open: string; close: string } | string;
}

interface ContactSectionProps {
  storeSlug: string;
  phoneNumber: string;
  email: string;
  address: string;
  openingHours: OpeningHours;
  mapLink?: string;
}

export default function ContactSection({ storeSlug, phoneNumber, email, address, openingHours, mapLink }: ContactSectionProps) {
  const router = useRouter();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      }
    }
  };

  const iconHover = {
    scale: 1.1,
    transition: { type: "spring", stiffness: 300 }
  };

  // Helper function to format the opening hours for display
  const formatOpeningHours = () => {
    // IMPORTANT: Add a null/undefined check here
    if (!openingHours || Object.keys(openingHours).length === 0) {
      return (
        <li className="text-gray-700 dark:text-gray-300 text-center">
          Hours not available.
        </li>
      );
    }

    // Array of days for consistent ordering
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    return days.map(dayKey => {
      const day = openingHours[dayKey as keyof OpeningHours];
      const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);

      if (typeof day === 'string' && day.length === 0) { // Check for empty string
        return (
          <li key={dayKey} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{dayName}:</span>
            <span className="text-red-500 font-medium">Closed</span>
          </li>
        );
      } else if (typeof day === 'object' && day.open && day.close) {
        return (
          <li key={dayKey} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{dayName}:</span>
            <span>{day.open} - {day.close}</span>
          </li>
        );
      }
      
      return null; // Return null for any other unexpected data
    });
  };

  return (
    <section className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 py-20 lg:py-28 relative overflow-hidden">
      {/* Background Shapes/Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <motion.div
          className="absolute w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 2, repeatType: "mirror" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block bg-blue-500/15 text-blue-700 dark:bg-blue-400/20 dark:text-blue-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            Reach Out
          </motion.span>
          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight drop-shadow-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Connect With Our <span className="text-teal-600 dark:text-teal-400">Caring Team</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-700 dark:text-gray-300 mt-4 max-w-3xl mx-auto leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.3 }}
          >
            We're here to provide the support and information you need.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {/* Phone Number Card */}
          <motion.a
            href={`tel:${phoneNumber}`}
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }}
          >
            <motion.div whileHover={iconHover}>
              <PhoneIcon className="w-16 h-16 text-blue-500 dark:text-blue-400 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
              {phoneNumber}
            </p>
          </motion.a>

          {/* Email Address Card */}
          <motion.a
            href={`mailto:${email}`}
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }}
          >
            <motion.div whileHover={iconHover}>
              <EnvelopeIcon className="w-16 h-16 text-green-500 dark:text-green-400 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors duration-300">
              {email}
            </p>
          </motion.a>

          {/* Clinic Address Card */}
          <motion.a
            href={mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 group"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }}
          >
            <motion.div whileHover={iconHover}>
              <MapPinIcon className="w-16 h-16 text-red-500 dark:text-red-400 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Visit Us</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-300 transition-colors duration-300">
              {address}
            </p>
          </motion.a>

          {/* Opening Hours Card */}
          {/* <motion.div
            className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }}
          >
            <motion.div whileHover={iconHover}>
              <ClockIcon className="w-16 h-16 text-purple-500 dark:text-purple-400 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Opening Hours</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
              {openingHours}
            </p>
          </motion.div> */}
           <motion.div
              className="flex flex-col items-center p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.15)" }}
            >
              <motion.div whileHover={iconHover}>
                <ClockIcon className="w-16 h-16 text-purple-500 dark:text-purple-400 mb-6" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Opening Hours</h3>
              {/* Render the formatted opening hours here */}
              <ul className="w-full text-lg">
                {formatOpeningHours()}
              </ul>
            </motion.div>

          {/* Dedicated Online Booking Card */}
          <motion.button
            onClick={() => router.push(`/${storeSlug}/book`)}
            className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-teal-500 to-blue-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 col-span-1 md:col-span-2 lg:col-span-1" // Span across 2 columns on tablet, 1 on desktop
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.25)" }}
          >
            <motion.div whileHover={iconHover}>
              <CalendarDaysIcon className="w-16 h-16 text-white mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Book an Appointment</h3>
            <p className="text-lg text-white/90 text-center">
              Schedule your visit at your convenience online.
            </p>
          </motion.button>

          {/* Dedicated Contact Form Card */}
          <motion.button
            onClick={() => router.push(`/${storeSlug}/contact-form`)} // Link to a specific contact form page
            className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 col-span-1 md:col-span-1 lg:col-span-1" // Span across 1 column always
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={cardVariants}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.25)" }}
          >
            <motion.div whileHover={iconHover}>
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-white mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-2">Send Us a Message</h3>
            <p className="text-lg text-white/90 text-center">
              Fill out our form for any inquiries.
            </p>
          </motion.button>
        </div>
      </div>
    </section>
  );
}