'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type HeroSectionProps = {
  slug: string;
  bannerUrl: string;
  siteName: string;
  siteDescription?: string;
  primary: string;
  secondary: string;
};

export default function HeroSection({
  slug,
  bannerUrl,
  siteName,
  siteDescription,
  primary,
  secondary,
}: HeroSectionProps) {
  const stats = [
    { label: 'Clients', value: '5,250+', icon: '👥' },
    { label: 'Experts', value: '120+', icon: '🧑‍🔧' },
    { label: 'Projects', value: '182+', icon: '🏗️' },
    { label: 'Awards', value: '85+', icon: '🏆' },
  ];

  return (
    <>
      {/* Hero Section */}
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
            background: `linear-gradient(180deg, ${primary}cc 0%, ${secondary}cc 100%)`,
          }}
        />

        <div className="relative z-10 max-w-7xl w-full px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero Text */}
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 text-center lg:text-left border border-white/20"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
              Welcome to{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-500">
                {siteName}
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-200 max-w-xl mx-auto lg:mx-0">
              {siteDescription ||
                'Experience top-tier home cleaning with a modern touch—reliability, professionalism, and sparkling results every time.'}
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
                alt={`${siteName} Banner`}
                className="w-80 h-80 sm:w-96 sm:h-96 object-cover rounded-3xl shadow-2xl"
              />
              {/* Rating Badge */}
              <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full flex items-center shadow-md">
                <span className="text-gray-800 font-bold mr-2">9.5</span>
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.963 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.div
        className="relative z-20 -mt-16 mb-20 max-w-6xl mx-auto px-6"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 backdrop-blur-md border border-white/20 text-black rounded-xl shadow-md py-6 flex flex-col items-center hover:shadow-xl transition"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
