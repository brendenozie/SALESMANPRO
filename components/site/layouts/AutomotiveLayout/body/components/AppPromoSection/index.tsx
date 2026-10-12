"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PlusIcon,
  MinusIcon, // Using MinusIcon for the 'X' to look more like a collapse
  QuestionMarkCircleIcon, // New icon for FAQ section
  EnvelopeIcon,
  PlayIcon, // For contact us
} from "@heroicons/react/24/outline";
import Link from "next/link"; // For the CTA link

import clsx from "clsx";
import Image from "next/image"; // For optimized images
import { EditableElement } from "@/contexts/EditableContentContext";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Default fallback screenshots
const screenshots = [
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
];

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger for clarity
      delayChildren: 0.1, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120, // Slightly more stiff
      damping: 12, // More damping
    },
  },
};

export default function AppPromoSection() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Text & Buttons */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            <EditableElement
              targetId="home.app-promo.title"
              label="Promo Title"
              inline
            >
              <span>Get the App & Never Miss a Deal</span>
            </EditableElement>
          </h2>
          <p className="text-lg">
            <EditableElement
              targetId="home.app-promo.description"
              label="Promo Description"
              type="textarea"
              inline
            >
              <span>Browse listings, save favorites, and get instant notifications wherever you go.</span>
            </EditableElement>
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Download on the App Store"
              className="flex items-center bg-white text-blue-600 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              <EditableElement
                targetId="home.app-promo.appStoreText"
                label="App Store Button"
                inline
              >
                <span>App Store</span>
              </EditableElement>
            </a>
            <a
              href="#"
              aria-label="Get it on Google Play"
              className="flex items-center bg-white text-blue-600 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              <EditableElement
                targetId="home.app-promo.googlePlayText"
                label="Google Play Button"
                inline
              >
                <span>Google Play</span>
              </EditableElement>
            </a>
          </div>
        </motion.div>

        {/* Device Mockup Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center"
        >
          {/* Stacked phone mockups */}
          {screenshots.map((src, idx) => (
            <div
              key={idx}
              className={clsx(
                "absolute w-40 h-80 rounded-3xl overflow-hidden shadow-2xl transform transition",
                idx === 1
                  ? "translate-x-12 -translate-y-4 scale-90 z-10"
                  : idx === 2
                  ? "translate-x-24 -translate-y-8 scale-75 z-0"
                  : "z-20"
              )}
            >
              <Image decoding="async"
                src={src}
                alt={`App screenshot ${idx + 1}`}
                layout="fill"
                objectFit="cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
