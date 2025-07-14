"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { AcademicCapIcon, BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline'; // Importing specific icons
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroComponent({
  name,
  bannerUrl,
}: {
  name: string;
  bannerUrl: string;
}) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20 px-4 sm:px-10 min-h-screen flex items-center justify-center before:absolute before:inset-0 before:bg-gradient-to-br before:from-indigo-600/20 before:to-purple-700/20 before:blur-3xl before:z-0"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Welcome to <span className="text-yellow-300">{name}</span>
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-white/90">
            Discover the most exciting events around you. Browse, book, and
            enjoy!
          </p>
          <div className="flex gap-4 flex-wrap">
            <button className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300">
              Browse Events
            </button>
            <button
              className="border-white text-white hover:bg-white hover:text-indigo-700 font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300"
              onClick={() =>
                window.open("https://example.com/learn-more", "_blank")
              }
            >
              Learn More <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9 }}
          className="relative"
        >
          <Image
            priority
            src={bannerUrl}
            loader={loader}
            width={600}
            height={400}
            alt="Hero"
            className="w-full max-w-md mx-auto md:mx-0 drop-shadow-xl"
          />
        </motion.div>
      </div>

      {/* Decorative Blurs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-pink-500/20 rounded-full filter blur-3xl z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-yellow-400/10 rounded-full filter blur-2xl z-0"></div>
    </section>
  );
}
