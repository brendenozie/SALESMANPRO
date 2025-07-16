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
// ExpertsSection: grid of trainers/experts
// ----------------------------------------------------------------------------
export default function  ExpertsSection({ experts }:any) {
  return (
    <section className="py-12 px-4 md:px-8">
      <h2 className="mb-6 text-3xl font-bold text-center">Meet the Coaches & Experts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((exp:any) => (
          <motion.div
            key={exp.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col items-center text-center p-6"
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={exp.photo}
                alt={exp.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
                loader={loader}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{exp.name}</h3>
            <p className="text-sm text-gray-600">{exp.specialty}</p>
            <p className="text-sm text-gray-600">{exp.experience} years experience</p>
            <button className="mt-4 px-5 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition">
              Schedule a Call
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
