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
// AppPromotion: encourages user to download the mobile app
// ----------------------------------------------------------------------------
export default function  AppPromotion() {
  return (
    <section className="py-12 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-8">
        {/* Text Content */}
        <motion.div
          className="flex-1 text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Manage Your Workouts On The Go</h2>
          <p className="text-gray-700 mb-6">
            Download our mobile app to track your programs, join live classes, and
            stay motivated wherever you are.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <a href="#" aria-label="Download on the App Store">
              <Image
                src="/images/app-store-badge.svg"
                alt="App Store Badge"
                width={150}
                height={50}
                loader={loader}
              />
            </a>
            <a href="#" aria-label="Get it on Google Play">
              <Image
                src="/images/play-store-badge.svg"
                alt="Google Play Badge"
                width={150}
                height={50}
                loader={loader}
              />
            </a>
          </div>
        </motion.div>

        {/* Mockup Images */}
        <motion.div
          className="flex-1 flex justify-center lg:justify-end space-x-4"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-40 h-80">
            <Image
              src="/images/app-mockup1.png"
              alt="App Mockup 1"
              layout="fill"
              objectFit="contain"
              loader={loader}
            />
          </div>
          <div className="relative w-40 h-80 hidden md:block">
            <Image
              src="/images/app-mockup2.png"
              alt="App Mockup 2"
              layout="fill"
              objectFit="contain"
              loader={loader}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}