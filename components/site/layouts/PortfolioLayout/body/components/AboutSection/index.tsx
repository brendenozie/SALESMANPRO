'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  return (
    <section className="relative bg-white py-24 px-6 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
        {/* Left Side - Text Content */}
        <motion.div
          className="max-w-xl text-center lg:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Meet Your <span className="text-orange-500">Business Coach</span>
          </h2>
          <h3 className="text-2xl font-semibold text-teal-700 mb-4">
            Brittany Jones
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Former entrepreneur, executive, and coach with a passion for empowering leaders. Brittany brings 16+ years of real-world experience to help you navigate challenges and unlock growth with clarity and confidence.
          </p>

          {/* Stats */}
          <div className="flex justify-center lg:justify-start gap-6 mb-8">
            {[
              { value: '12+', label: 'Expert Coaches' },
              { value: '16+', label: 'Years of Experience' },
              { value: '10+', label: 'Awards Won' },
            ].map(({ value, label }, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <button className="bg-orange-500 hover:bg-orange-600 transition text-white font-semibold px-6 py-3 rounded-xl shadow">
            Learn More About Me
          </button>
        </motion.div>

        {/* Right Side - Image */}
        <motion.div
          className="relative w-[320px] h-[420px] rounded-3xl overflow-hidden shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Image
            src="/coach.jpg"
            loader={loader}
            alt="Business Coach"
            fill
            className="object-cover"
            priority
          />

          {/* Floating Badge */}
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 bg-orange-500 p-3 rounded-full shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c1.657 0 3-1.567 3-3.5S13.657 1 12 1 9 2.567 9 4.5 10.343 8 12 8zm0 2c-2.667 0-8 1.333-8 4v2h16v-2c0-2.667-5.333-4-8-4z"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
