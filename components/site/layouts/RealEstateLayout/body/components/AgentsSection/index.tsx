"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneIcon, EnvelopeIcon, StarIcon, ArrowRightIcon, HomeModernIcon, BuildingOfficeIcon } from '@heroicons/react/24/solid'; // Added Stat Icons

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants (retained for consistency)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, 
      delayChildren: 0.2,   
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring", 
      stiffness: 100, 
      damping: 10,    
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
        <p className="text-xl">No expert agents available at the moment. Please check back later!</p>
      </section>
    );
  }

  return (
    <section id="agents" className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-20 sm:py-28 relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-color-amber-100)_0%,_transparent_70%)] opacity-30 dark:opacity-15 dark:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-color-amber-950)_0%,_transparent_70%)]"/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Meet Our <span className="text-amber-600 dark:text-amber-400">Expert Agents</span> 🤝
          <span className="block w-48 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" /> 
        </motion.h2>

        {/* Agents Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 lg:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {agents.map((agent:any) => (
            <Link key={agent.id} href={`/site/${slug}/agent/${agent.id}`} passHref>
              {/* Gradient Border Card Wrapper */}
              <motion.a
                className="block p-0.5 rounded-3xl shadow-xl transition-all duration-500 group
                           bg-white dark:bg-gray-850 hover:bg-gradient-to-br hover:from-emerald-400 hover:to-teal-500" 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} 
                whileTap={{ scale: 0.98 }}
                aria-label={`View profile for agent ${agent.user.name}`}
              >
                {/* Inner Content Card */}
                <div className="bg-white dark:bg-gray-900 rounded-[22px] h-full flex flex-col items-center p-6 sm:p-8 text-center transition-colors duration-500">
                  
                  {/* Agent Photo */}
                  <div className="mx-auto mb-4 relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-amber-500 dark:ring-amber-400 transform transition-all duration-500 group-hover:scale-105 group-hover:ring-emerald-600 dark:group-hover:ring-teal-400">
                    <Image
                      src={agent.photoUrl || `https://placehold.co/100x100/E0F2F7/0288D1?text=${agent.user.name.slice(0,1)}`}
                      alt={`Portrait of ${agent.user.name}`}
                      loader={customLoader}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-110"
                    />
                    {agent.isOnline && (
                      <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-900 shadow-md border-2 border-white dark:border-gray-900" title="Online" />
                    )}
                  </div>

                  {/* Name & Role */}
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                    {agent.user.name}
                  </h3>
                  <p className="text-emerald-600 dark:text-teal-400 font-semibold text-base sm:text-lg mb-4">
                    {agent.role || "Real Estate Agent"}
                  </p>

                  {/* Rating and Stats Bar (Enhanced Credibility) */}
                  <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5 shadow-inner">
                    
                    {/* Rating Row */}
                    {agent.rating && (
                      <div className="flex items-center justify-center mb-2 space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 transition-colors duration-300 ${
                              i < Math.round(agent.rating)
                                ? "text-amber-500"
                                : "text-gray-300 dark:text-gray-600"
                          }`}
                          />
                        ))}
                        <span className="text-gray-700 dark:text-gray-300 text-xs font-bold ml-1">
                          {agent.rating.toFixed(1)} Rating
                        </span>
                      </div>
                    )}
                    
                    {/* Stats Row (Placeholder data) */}
                    <div className="flex justify-around border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex flex-col items-center">
                        <HomeModernIcon className="w-5 h-5 text-emerald-500 dark:text-teal-400" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {agent.listingsCount || 12}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Listings</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <BuildingOfficeIcon className="w-5 h-5 text-amber-500 dark:text-orange-400" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {agent.salesCount || 8}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sales</span>
                      </div>
                    </div>
                  </div>


                  {/* Contact Buttons Bar (Compact and below stats) */}
                  <div className="flex space-x-3 w-full">
                    {agent.phone && (
                      <motion.a
                        href={`tel:${agent.phone}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium
                                    bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:bg-blue-300/10 dark:text-blue-300 dark:hover:bg-blue-300/20
                                    transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Call ${agent.user.name}`}
                      >
                        <PhoneIcon className="w-4 h-4" />
                      </motion.a>
                    )}
                    {agent.email && (
                      <motion.a
                        href={`mailto:${agent.email}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium
                                    bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:bg-emerald-300/10 dark:text-emerald-300 dark:hover:bg-emerald-300/20
                                    transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={`Email ${agent.user.name}`}
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </motion.a>
                    )}
                  </div>

                  {/* View Profile Button (Primary Action - Centered and full width) */}
                  <motion.button
                    type="button"
                    className="mt-6 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-white
                               bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700
                               dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800
                               shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400/70
                               transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={(e:any) => {
                      e.preventDefault(); 
                      e.stopPropagation(); 
                      window.location.href = `/site/${slug}/agent/${agent.id}`;
                    }}
                    aria-label={`View detailed profile for ${agent.user.name}`}
                  >
                    View Full Profile
                    <ArrowRightIcon className="ml-2 w-5 h-5" />
                  </motion.button>
                </div>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* View All Agents Button (Retained high contrast) */}
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
                className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-extrabold rounded-full shadow-xl
                           text-white bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600
                           dark:from-teal-700 dark:to-emerald-800 dark:hover:from-teal-800 dark:hover:to-emerald-900
                           focus:outline-none focus:ring-4 focus:ring-amber-400/70 transition duration-300 ease-in-out transform"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all agents"
              >
                Explore Our Full Team
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}