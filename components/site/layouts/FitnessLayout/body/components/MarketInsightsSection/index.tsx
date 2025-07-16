"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// New variants for the feature icons
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

 


 


// ----------------------------------------------------------------------------
// MarketInsights: grid of links to tools & blog posts
// ----------------------------------------------------------------------------
export default function  MarketInsights({ insights }:any) {
  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="mb-6 text-3xl font-bold text-center">Health Insights & Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((ins:any) => (
          <motion.a
            key={ins.id}
            href={ins.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{ins.title}</h3>
            <p className="text-gray-700 mb-4">{ins.description}</p>
            <span className="text-primary font-medium hover:underline">Learn More →</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}