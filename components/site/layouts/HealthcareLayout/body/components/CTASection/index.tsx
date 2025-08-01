// File: components/site/layouts/HealthcareLayout/components/CTASection.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

interface CTASectionProps {
  storeSlug: string;
}

export default function CTASection({ storeSlug }: CTASectionProps) {
  const router = useRouter();

  // Animation variants for a staggered, captivating effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time between each child animation
        delayChildren: 0.3,    // Delay for the first child
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
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white py-20 lg:py-28 relative overflow-hidden">
      {/* Background Shapes for Visual Interest */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-screen filter blur-3xl transform translate-x-1/2 translate-y-1/2 animate-blob animation-delay-2000" />
      </div>

      <motion.div
        className="max-w-4xl mx-auto px-6 text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-lg"
          variants={itemVariants}
        >
          Ready to Prioritize Your Health?
        </motion.h2>
        <motion.p
          className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto drop-shadow"
          variants={itemVariants}
        >
          Schedule your first appointment with our compassionate team today. We're here to help you on your journey to better wellness.
        </motion.p>
        <motion.div
          className="mt-10 inline-block"
          variants={itemVariants}
        >
          <button
            onClick={() => router.push(`/${storeSlug}/book`)}
            className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-900 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-100 hover:scale-105 transform-gpu"
          >
            Book an Appointment
            <ArrowRightIcon className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}