"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Assuming Link from next/link is available
import { ArrowRightIcon } from '@heroicons/react/24/solid'; // Importing ArrowRightIcon

export default function CallToActionSection({
  slug,
}: {
  slug: string;
}) {
  return (
    <section className="relative bg-gray-900 py-24 sm:py-32 px-4 sm:px-10 overflow-hidden text-center">
      {/* Decorative Background Elements - consistent with other sections */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6"
        >
          Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Host With Us?</span>
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-xl text-gray-300 mb-12 max-w-xl mx-auto leading-relaxed"
        >
          Bring your vision to life and connect with your audience. We'll help you make every event extraordinary.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <Link
            href={`/${slug}/host`}
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-semibold bg-indigo-600 text-white rounded-full
                       hover:bg-indigo-700 transition-colors duration-300 shadow-lg hover:shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Get Started Now
            <ArrowRightIcon className="ml-3 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}