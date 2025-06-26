"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

import bannerFallback from "../../../../../assets/homebanner.png";

export default function HeroSection() {
  // Retrieve store data from context
  const { storeFormData } = useStoreContext();
  
    if (!storeFormData) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading...</p>
        </div>
      );
    }
  
    const {
      slug,
      bannerUrl,
      name,
      description,
      storeCategories,      // array of { id, name, icon, items, sortOrder, visible }
      marketplaceListings,     // assume you added this field to Prisma/StoreForm
      testimonials,
      faqs,
      stats,
      themeSettings,
    } = storeFormData;
  
    const primaryColor = themeSettings?.primaryColor ?? "#4f46e5";
    const secondaryColor = themeSettings?.secondaryColor ?? "#ec4899";

      // Animation variants for a more staggered, impactful reveal
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.4 } },
  };
    

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: primaryColor }} // Use primary color as base
      >
        {/* Abstract Background Shapes/Gradients */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            background: `radial-gradient(circle at top left, ${secondaryColor} 0%, transparent 50%),
                         radial-gradient(circle at bottom right, ${secondaryColor} 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 z-0 bg-pattern-light opacity-10" /> {/* Subtle pattern or texture */}

        <div className="relative z-10 max-w-7xl mx-auto w-full px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left: Dynamic Image with Overlay */}
          <motion.div
            className="relative order-2 lg:order-1 flex justify-center lg:justify-end"
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
          >
            <div className="relative group rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out hover:scale-105"
                 style={{ aspectRatio: '4/3', width: 'clamp(20rem, 70vw, 35rem)' }}>
              <img
                src={bannerUrl}
                alt={`${name} Banner`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Image Overlay - adds depth and integrates with brand */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/30 group-hover:to-black/50 transition-all duration-500"
              />

              {/* Rating Badge - Modernized and integrated into the image's context */}
              {stats[0] && (
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-full flex items-center shadow-lg transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-300">
                  <span className="text-gray-900 text-xl font-bold mr-2">{stats[0].value}</span>
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.963 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            className="order-1 lg:order-2 flex flex-col justify-center text-center lg:text-left text-white"
            initial="hidden"
            animate="visible"
            variants={slideInRight}
          >
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter"
              variants={fadeIn}
            >
              Welcome to{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${secondaryColor}, #fff)` }}>
                {name}
              </span>
            </motion.h1>

            <motion.p
              className="mt-6 text-xl sm:text-2xl max-w-xl mx-auto lg:mx-0 text-gray-200 leading-relaxed"
              variants={fadeIn}
            >
              {description || 'Experience cutting-edge solutions with a focus on innovation and user satisfaction.'}
            </motion.p>

            <motion.div
              className="mt-12 flex flex-wrap justify-center lg:justify-start gap-5"
              variants={fadeIn}
            >
              <Link
                href={`/${slug}/start`}
                className="px-8 py-4 bg-white text-gray-900 font-bold rounded-full shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 text-lg"
              >
                Explore Now
              </Link>
              <Link
                href={`/${slug}/learn-more`}
                className="px-8 py-4 border-2 border-white text-white rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50 text-lg"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Glassy Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 backdrop-blur-md"
          style={{
            background: `linear-gradient(180deg, ${primaryColor}cc 0%, ${secondaryColor}cc 100%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl w-full px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Text */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-[25rem] p-8 text-center lg:text-left justify-center "
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              Welcome to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
                {name}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-200 max-w-xl mx-auto lg:mx-0">
              {description ||
                'Experience top-tier service with modern professionalism.'}
            </p>

            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                href={`/${slug}/start`}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Get Started
              </Link>
              <Link
                href={`/${slug}/learn-more`}
                className="px-6 py-3 border border-white text-white rounded-full hover:bg-white/10 transition"
              >
                Learn More
              </Link>
            </div>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              <img
                src={bannerUrl}
                alt={`${name} Banner`}
                className="w-80 h-80 sm:w-96 sm:h-96 object-cover rounded-3xl shadow-2xl"
              />
              {/* Rating Badge: use static or derive from store.metrics.rating if available */}
              {/** Example rating from stats[0]?.value **/}
              {stats[0] && (
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center shadow-md">
                  <span className="text-gray-800 font-bold mr-2">{stats[0].value}</span>
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.963 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section: loop through stats from context */}
      <motion.div
        className="relative z-20 -mt-16 mb-20 max-w-6xl mx-auto px-6"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat:any) => (
            <div
              key={stat.label}
              className="bg-white/80 backdrop-blur-md border border-white/20 text-black rounded-xl shadow-md py-6 flex flex-col items-center hover:shadow-xl transition"
            >
              <img
                src={stat.iconUrl}
                alt={`${name} Banner`}
                className="w-20 h-20 sm:w-36 sm:h-36 object-cover rounded-3xl shadow-2xl mb-2"
              />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  )};
