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

import Image from "next/image"; // For optimized images

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

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

// --- Dummy Data for FAQs (Replace with your actual data) ---
const dummyFaqs = [
  {
    question: "What exactly is your platform and who is it for?",
    answer: "Our platform is a comprehensive SaaS solution designed to streamline [mention your core function, e.g., project management, customer relations, data analytics] for businesses of all sizes, from startups to large enterprises. It helps teams collaborate, automate workflows, and gain valuable insights.",
  },
  {
    question: "How difficult is it to set up and integrate with existing tools?",
    answer: "We've designed our platform for ease of use. Most users can get started within minutes. We offer robust integration options with popular tools through our API and pre-built connectors. Our support team is also available to assist with complex setups.",
  },
  {
    question: "What kind of support can I expect?",
    answer: "We offer multi-channel support including comprehensive documentation, email support, and live chat. Priority support and dedicated account management are available with our higher-tier plans. Our goal is to ensure your success.",
  },
  {
    question: "Is my data secure with your platform?",
    answer: "Absolutely. Data security is our top priority. We employ industry-leading encryption, regular security audits, and adhere to strict data protection regulations (e.g., GDPR, SOC 2 Type II compliant). Your data is always safe with us.",
  },
  {
    question: "Can I try the platform before committing to a plan?",
    answer: "Yes, we offer a [mention duration, e.g., 14-day free trial] that gives you full access to most features, allowing you to explore the platform's capabilities and see how it fits your needs without any commitment. No credit card required to start!",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, including Visa, MasterCard, American Express, and Discover. For annual subscriptions or enterprise plans, we also offer invoicing and bank transfers.",
  },
];

//──────────────────────────────────────────────────────────────────────────────
// EnhancedFAQsSection
//──────────────────────────────────────────────────────────────────────────────


export default  function AppPromoSection() {
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
            Get the App & Never Miss a Deal
          </h2>
          <p className="text-lg">
            Browse listings, save favorites, and get instant notifications
            wherever you go.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              aria-label="Download on the App Store"
              className="flex items-center bg-white text-blue-600 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              App Store
            </a>
            <a
              href="#"
              aria-label="Get it on Google Play"
              className="flex items-center bg-white text-blue-600 px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl transition"
            >
              <PlayIcon className="w-6 h-6 mr-2" />
              Google Play
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
              <Image
                src={src}
                alt={`App screenshot ${idx + 1}`}
                layout="fill"
                objectFit="cover"
                loader={customLoader}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
