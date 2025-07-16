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
// HeroSection: 
// ----------------------------------------------------------------------------
export default function HeroSection({ bannerUrl, gymName }:any) {
  const [program, setProgram] = useState(programTypes[0]);
  const [location, setLocation] = useState(bannerLocations[0]);
  const [goal, setGoal] = useState(goals[0]);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // e.g. router.push(`/search?program=${program}&location=${location}&goal=${goal}`)
    console.log({ program, location, goal });
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background video or fallback image */}
      {bannerUrl.endsWith(".mp4") ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={bannerUrl}
          autoPlay
          muted
          loop
        />
      ) : (
        <Image
          src={bannerUrl}
          alt={`${gymName} banner`}
          fill
          className="object-cover"
          loader={loader}
        />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="mb-6 text-4xl md:text-6xl font-bold">{gymName}</h1>
        <p className="mb-8 text-lg md:text-2xl">
          Find the perfect fitness & wellness program near you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 w-full max-w-3xl"
        >
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="w-full md:w-1/3 p-3 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Program Type"
          >
            {programTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full md:w-1/3 p-3 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Location"
          >
            {bannerLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full md:w-1/3 p-3 rounded-2xl bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Goal"
          >
            {goals.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-primary rounded-2xl font-semibold hover:bg-primary-dark transition"
          >
            Discover Programs
          </button>
        </form>

        <div className="flex space-x-4">
          <button className="px-5 py-2 bg-white bg-opacity-20 rounded-2xl hover:bg-opacity-30 transition">
            Browse Free Trials
          </button>
          <button className="px-5 py-2 bg-white bg-opacity-20 rounded-2xl hover:bg-opacity-30 transition">
            View Virtual Classes
          </button>
        </div>
      </motion.div>
    </section>
  );
}