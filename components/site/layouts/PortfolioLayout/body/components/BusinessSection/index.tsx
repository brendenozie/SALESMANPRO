'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const coachingSolutions = [
  {
    title: 'Business Coaching',
    desc: 'Enhance your business performance with expert coaching from professionals who’ve built and scaled successful ventures.',
  },
  {
    title: 'Executive Coaching',
    desc: 'Private, tailored sessions with elite executive coaches to elevate your leadership in high-stakes environments.',
  },
  {
    title: 'Leadership Coaching',
    desc: 'Sharpen your leadership edge, boost team dynamics, and drive results with strategic coaching for modern leaders.',
  },
  {
    title: 'Accountability Coaching',
    desc: 'Stay focused, set achievable goals, and track progress with our dedicated accountability experts.',
    button: true,
  },
  {
    title: 'Strategic Planning',
    desc: 'Define your vision, align your goals, and plan your growth with expert-guided strategic roadmaps.',
  },
  {
    title: 'Career Coaching',
    desc: 'Gain clarity, set milestones, and take control of your professional trajectory with personalized career coaching.',
  },
];

export default function BusinessSection() {
  return (
    <section className="bg-gradient-to-b from-teal-50 to-white py-24 px-6 lg:px-20">
      <div className="max-w-7xl mx-auto text-center">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Our Coaching <span className="text-teal-600">Solutions</span>
        </motion.h2>
        <motion.p
          className="text-gray-600 max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Discover the right coaching pathway to help you grow your career, leadership, or business — guided by experts.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {coachingSolutions.map(({ title, desc, button }, idx) => (
          <motion.div
            key={idx}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col transition transform hover:-translate-y-1 hover:shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            {/* Icon or Initial */}
            <div className="w-12 h-12 bg-teal-100 text-teal-700 font-bold text-lg rounded-xl flex items-center justify-center mb-4">
              {title[0]}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

            {/* Description */}
            <p className="text-sm text-gray-600 flex-grow">{desc}</p>

            {/* Optional Button */}
            {button && (
              <button className="mt-6 inline-flex items-center gap-2 self-start text-sm text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition">
                Learn More
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
