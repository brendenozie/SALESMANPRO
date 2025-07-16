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
// VirtualTours: lightbox‐enabled on‐demand videos
// ----------------------------------------------------------------------------
export default function   VirtualTours({ videos }:any) {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <h2 className="mb-6 text-3xl font-bold text-center">Virtual Classes & On-Demand Videos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((vid:any) => (
          <motion.div
            key={vid.id}
            className="relative cursor-pointer overflow-hidden rounded-2xl shadow-md group"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedVideo(vid)}
          >
            <div className="relative h-48 w-full">
              <Image
                src={vid.thumbnail}
                alt={vid.title}
                layout="fill"
                objectFit="cover"
                className="group-hover:brightness-75 transition"
                loader={loader}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="p-4 bg-white bg-opacity-80 rounded-full"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-6.386-3.692A1 1 0 007 8.345v7.31a1 1 0 001.366.932l6.386-3.692a1 1 0 000-1.798z"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-md font-medium text-gray-900">{vid.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href="#/videos" className="text-primary font-semibold hover:underline">
          See All Classes
        </a>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-11/12 max-w-3xl bg-white rounded-2xl overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-700 hover:text-gray-900"
                onClick={() => setSelectedVideo(null)}
                aria-label="Close video"
              >
                &times;
              </button>
              <video
                src={selectedVideo.src}
                controls
                autoPlay
                className="w-full h-auto rounded-b-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
