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
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden text-white"
        style={{ backgroundImage: `url(${bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${primary}cc, ${secondary}cc)` }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center max-w-6xl w-full px-6 py-24 gap-12">
          {/* Hero Text */}
          {/* Hero Text */}
                  <div className="w-full lg:w-1/2 text-center lg:text-left">
                    <motion.h1
                      className="text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight"
                      initial={{ y: -60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                      Welcome to <span className="underline decoration-4 decoration-yellow-400">{siteName}</span>
                    </motion.h1>
                    <motion.p
                      className="mt-6 text-gray-100 text-lg sm:text-xl max-w-lg mx-auto lg:mx-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 1 }}
                    >
                      {siteDescription ||
                        'Experience top-tier home cleaning with a modern touch—reliability, professionalism, and sparkling results every time.'}
                    </motion.p>
          
                    <motion.div
                      className="mt-10 flex justify-center lg:justify-start space-x-4"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                    >
                      <Link href={`/${slug}/start`}
                          className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:scale-105 transform transition"
                        >
                          Get Started
                      </Link>
          
                      <Link href={`/${slug}/learn-more`}
                          className="px-8 py-4 border-2 border-white text-white font-medium rounded-full hover:bg-white/20 transition"
                        >
                          Learn More
                      </Link>
                    </motion.div>
                  </div>
          
                  {/* Hero Illustration */}
                  <motion.div
                    className="w-full lg:w-1/2 relative flex justify-center lg:justify-end"
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <div className="relative">
                      <img
                        src={bannerUrl}
                        alt="Hero"
                        className="w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 object-cover rounded-3xl shadow-2xl"
                      />
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow">
                        <span className="text-gray-700 font-bold mr-2">9.5</span>
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1
                    1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54
                    1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.957a1
                    1 0 00-.364-1.118L2.963 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1
                    1 0 00.95-.69l1.286-3.957z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
        </div>
      </section>

      {/* Stats Section: positioned between hero and next content */}
      <motion.div
        className="relative z-20 -mt-12 mb-16 px-6 max-w-6xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Clients', value: '5250+', icon: '👥' },
            { label: 'Experts', value: '120+', icon: '🧑‍🔧' },
            { label: 'Projects', value: '182+', icon: '🏗️' },
            { label: 'Awards', value: '85+', icon: '🏆' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white backdrop-blur-sm bg-opacity-70 rounded-xl shadow-md py-6 flex flex-col items-center hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <span className="text-gray-900 font-extrabold text-2xl">{stat.value}</span>
              <span className="text-gray-600 font-medium mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
