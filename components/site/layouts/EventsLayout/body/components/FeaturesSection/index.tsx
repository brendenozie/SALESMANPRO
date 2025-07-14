"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    CalendarDaysIcon, 
    GlobeAltIcon, 
    ShieldCheckIcon, 
    BellAlertIcon 
} from '@heroicons/react/24/outline';

// Data for the feature cards
const features = [
  {
    icon: <CalendarDaysIcon className="w-8 h-8 text-purple-400" />,
    title: "Easy Event Booking",
    description: "Find and reserve your spot at exclusive events in just a few clicks with our intuitive interface.",
  },
  {
    icon: <GlobeAltIcon className="w-8 h-8 text-pink-400" />,
    title: "Local & Global Listings",
    description: "Browse events happening down the street or explore unique happenings around the world.",
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />,
    title: "Secure Digital Ticketing",
    description: "Your tickets are stored securely and are always accessible. Buy, store, and scan with confidence.",
  },
  {
    icon: <BellAlertIcon className="w-8 h-8 text-sky-400" />,
    title: "Real-Time Reminders",
    description: "Get timely notifications before your events start so you never miss a moment of the action.",
  },
];

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};


export default function WhyChooseUsSection() {
  return (
    <section className="relative bg-gray-900 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.5 }}
        >
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4">
                Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">You</span>
            </h2>
            <p className="text-lg text-gray-300 mb-16 max-w-3xl mx-auto">
                Whether you're an attendee looking for your next adventure or an organizer planning a hit event, our platform is built with powerful, intuitive tools to make it happen.
            </p>
        </motion.div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative h-full rounded-2xl p-8 bg-gray-800/40 border border-gray-700/50 transition-all duration-300 hover:border-purple-400/60 hover:-translate-y-2"
            >
                {/* Glow effect on hover */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-md"></div>
              
                <div className="relative">
                    <div className="inline-block p-4 rounded-xl bg-gray-900/80 border border-gray-700 mb-6">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                        {feature.title}
                    </h3>
                    <p className="text-gray-400">
                        {feature.description}
                    </p>
                </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
