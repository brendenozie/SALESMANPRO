"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, StarIcon } from '@heroicons/react/24/solid'; // New icons for contact and rating

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each item animates with a slight delay
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring", // More natural bounce
      stiffness: 100, // Less stiff
      damping: 10,    // More damping
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// AgentsSection
//──────────────────────────────────────────────────────────────────────────────
export default function AgentsSection({ agents, slug }: any) {
  // Handle empty agents array gracefully
  if (!agents || agents.length === 0) {
    return (
      <section className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No agents available at the moment. Please check back later!</p>
      </section>
    );
  }

  return (
    <section id="agents" className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Meet Our <span className="text-amber-500 dark:text-amber-400">Expert Agents</span>
          <span className="block w-32 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Agents Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {agents.map((agent:any) => (
            <Link key={agent.id} href={`/site/${slug}/agent/${agent.id}`} passHref>
              <motion.a
                className="block bg-white dark:bg-gray-850 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 group
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900
                           flex flex-col items-center p-8 text-center"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }} // Lift and slightly scale on hover
                whileTap={{ scale: 0.98 }} // Satisfying tap effect
                aria-label={`View profile for agent ${agent.name}`}
              >
                {/* Agent Photo */}
                <div className="mx-auto mb-6 relative w-36 h-36 rounded-full overflow-hidden ring-4 ring-amber-500 dark:ring-amber-400 transform transition-transform duration-300 group-hover:scale-105 group-hover:ring-emerald-500 dark:group-hover:ring-teal-400">
                  <Image
                    src={agent.photoUrl || `https://placehold.co/100x100/E0F2F7/0288D1?text=CH}`}
                    alt={`Portrait of ${agent.name}`}
                    loader={customLoader}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Optional: Online/Active indicator */}
                  {agent.isOnline && (
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-850" title="Online" />
                  )}
                </div>

                {/* Agent Info */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
                  {agent.user.name}
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-lg mb-3">
                  {agent.role || "Real Estate Agent"}
                </p>

                {/* Rating Display */}
                {agent.rating && (
                  <div className="flex items-center justify-center mb-4 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(agent.rating)
                            ? "text-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">
                      ({agent.rating.toFixed(1)})
                    </span>
                  </div>
                )}

                {/* Contact Buttons (visible on hover or always) */}
                <div className="flex flex-col space-y-3 mt-4 w-full">
                  {agent.phone && (
                    <motion.a
                      href={`tel:${agent.phone}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium
                                 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:bg-blue-300/10 dark:text-blue-300 dark:hover:bg-blue-300/20
                                 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Call ${agent.name}`}
                    >
                      <PhoneIcon className="w-4 h-4 mr-2" /> Call Agent
                    </motion.a>
                  )}
                  {agent.email && (
                    <motion.a
                      href={`mailto:${agent.email}`}
                      className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl text-sm font-medium
                                 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-300/10 dark:text-emerald-300 dark:hover:bg-emerald-300/20
                                 transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={`Email ${agent.name}`}
                    >
                      <EnvelopeIcon className="w-4 h-4 mr-2" /> Email Agent
                    </motion.a>
                  )}
                </div>

                {/* View Profile Button */}
                <motion.button
                  type="button"
                  className="mt-6 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white
                             bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700
                             dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800
                             shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-400/70
                             transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={(e:any) => {
                    e.preventDefault(); // Prevent Link's default action if button is clicked
                    e.stopPropagation(); // Stop event bubbling to parent Link
                    window.location.href = `/site/${slug}/agent/${agent.id}`;
                  }}
                  aria-label={`View detailed profile for ${agent.name}`}
                >
                  View Profile
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                </motion.button>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* Optional: View All Agents Button */}
        {agents.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <Link href={`/site/${slug}/agents`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                           text-white bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600
                           dark:from-teal-700 dark:to-emerald-800 dark:hover:from-teal-800 dark:hover:to-emerald-900
                           focus:outline-none focus:ring-4 focus:ring-amber-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all agents"
              >
                View All Agents
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}