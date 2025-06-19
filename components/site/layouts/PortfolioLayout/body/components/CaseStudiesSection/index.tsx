'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const CaseStudiesSection = () => {
  return (
    <section className="bg-white py-24 px-6 lg:px-20 overflow-hidden">
      {/* Section Heading */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.h2
          className="text-4xl font-bold text-gray-900"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Real <span className="text-teal-600">Results</span> with Real Clients
        </motion.h2>
        <motion.p
          className="mt-4 text-gray-600 text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Discover how coaching has transformed businesses, empowered leaders, and delivered measurable success.
        </motion.p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Image Card */}
        <motion.div
          className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group"
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src="/case1.jpg"
            alt="Planning Session"
            loader={loader}
            width={400}
            height={250}
            className="w-full h-64 object-cover"
          />
        </motion.div>

        {/* Text Card with CTA */}
        <motion.div
          className="bg-orange-50 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
              Find a Business <br />
              <span className="text-teal-600">Coach</span>
            </h3>
            <p className="text-gray-600 text-sm">
              Tap into expert insights and strategy to elevate your business with clarity and confidence.
            </p>
          </div>
          <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-5 py-2 rounded-xl w-fit transition">
            Schedule a Call
          </button>
        </motion.div>

        {/* Image Card */}
        <motion.div
          className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group"
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src="/case2.jpg"
            loader={loader}
            alt="Team Coaching"
            width={400}
            height={250}
            className="w-full h-64 object-cover"
          />
        </motion.div>

        {/* Image Card with Label */}
        <motion.div
          className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group"
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src="/case3.jpg"
            loader={loader}
            alt="Cleanio"
            width={400}
            height={250}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-teal-700 text-white text-sm px-4 py-1 rounded-full shadow">
            Cleanio Cleaning Case
          </div>
        </motion.div>

        {/* Image Card */}
        <motion.div
          className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition group"
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src="/case4.jpg"
            alt="Cleaner Coaching"
            loader={loader}
            width={400}
            height={250}
            className="w-full h-64 object-cover"
          />
        </motion.div>

        {/* Stat Card */}
        <motion.div
          className="bg-teal-800 text-white p-8 rounded-2xl text-center flex flex-col justify-center shadow-md hover:shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <p className="text-4xl font-bold mb-2">90%</p>
          <p className="text-sm">Client Success Rate</p>
          <svg
            className="w-12 h-12 mx-auto mt-4 opacity-20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6 4 4 6-6" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
