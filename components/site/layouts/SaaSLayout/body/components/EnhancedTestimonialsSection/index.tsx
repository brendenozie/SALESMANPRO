"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChatBubbleBottomCenterTextIcon, // New icon for quotes
  StarIcon, // For rating
  ArrowRightIcon, // For CTA
} from "@heroicons/react/24/solid";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each item animates with a slight delay
      delayChildren: 0.2, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring", // More natural bounce
      stiffness: 100, // Less stiff
      damping: 10, // More damping
    },
  },
};

// --- Dummy Data for Testimonials (Replace with your actual data) ---
const dummyTestimonials = [
  {
    quote: "Our productivity has skyrocketed since we started using this platform. The intuitive design makes it a joy to use!",
    author: "Jane Doe",
    role: "CEO",
    company: "Tech Solutions Inc.",
    avatarUrl: "/images/avatar-jane.jpg", // Replace with actual avatar URL
    rating: 5,
  },
  {
    quote: "The seamless collaboration features have transformed how our team works. It's truly a game-changer for project management.",
    author: "John Smith",
    role: "Lead Developer",
    company: "Innovate Labs",
    avatarUrl: "/images/avatar-john.jpg", // Replace with actual avatar URL
    rating: 5,
  },
  {
    quote: "Exceptional support and a robust set of features. This SaaS has become an indispensable tool in our daily operations.",
    author: "Emily White",
    role: "Marketing Director",
    company: "Creative Marketers",
    avatarUrl: "/images/avatar-emily.jpg", // Replace with actual avatar URL
    rating: 4,
  },
  {
    quote: "We chose this platform for its scalability, and it has exceeded all our expectations. Highly recommended for growing businesses.",
    author: "Michael Brown",
    role: "Operations Manager",
    company: "Global Logistics",
    avatarUrl: "/images/avatar-michael.jpg", // Replace with actual avatar URL
    rating: 5,
  },
  {
    quote: "The analytics dashboard provides insights we never had before. It's made data-driven decisions so much easier.",
    author: "Sarah Green",
    role: "Data Analyst",
    company: "Data Insights Co.",
    avatarUrl: "/images/avatar-sarah.jpg", // Replace with actual avatar URL
    rating: 5,
  },
  {
    quote: "Setting up was a breeze, and the integrations work perfectly. It fits seamlessly into our existing workflow.",
    author: "David Lee",
    role: "Product Manager",
    company: "Synergy Software",
    avatarUrl: "/images/avatar-david.jpg", // Replace with actual avatar URL
    rating: 4,
  },
];

//──────────────────────────────────────────────────────────────────────────────
// EnhancedTestimonialsSection
//──────────────────────────────────────────────────────────────────────────────
export default function EnhancedTestimonialsSection({ testimonials = [] }: { testimonials?: any[] }) {
  const displayTestimonials = testimonials.length > 0 ? testimonials : dummyTestimonials;

  // Select a prominent testimonial for the featured section (e.g., the first 5-star one)
  const featuredTestimonial = displayTestimonials.find(t => t.rating === 5) || displayTestimonials[0];
  const gridTestimonials = displayTestimonials.filter(t => t.author !== featuredTestimonial?.author); // Exclude featured from grid

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-indigo-700 dark:text-indigo-400 drop-shadow-sm"
            variants={itemVariants}
          >
            Trusted by Industry Leaders
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Hear directly from our satisfied customers about how our platform has transformed their businesses.
          </motion.p>
        </motion.div>

        {/* --- Featured Testimonial --- */}
        {featuredTestimonial && (
          <motion.div
            className="relative bg-gradient-to-br from-indigo-600 to-purple-700 p-8 md:p-12 rounded-3xl shadow-2xl mb-20 text-white flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 backdrop-filter backdrop-blur-lg border border-white/20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {/* Background Quote Icon */}
            <ChatBubbleBottomCenterTextIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 md:w-60 md:h-60 text-white/10 opacity-30 pointer-events-none z-0" />

            {/* Avatar */}
            {featuredTestimonial.avatarUrl && (
              <motion.div
                className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 z-10 ring-4 ring-indigo-300 dark:ring-indigo-200 shadow-lg"
                variants={itemVariants}
              >
                <Image
                  src={featuredTestimonial.avatarUrl}
                  alt={featuredTestimonial.author}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  loader={customLoader}
                  priority
                />
              </motion.div>
            )}

            {/* Quote and Author Info */}
            <motion.div className="text-center md:text-left flex-1 z-10" variants={itemVariants}>
              <p className="text-xl md:text-2xl font-semibold italic leading-relaxed mb-4">
                “{featuredTestimonial.quote}”
              </p>
              <div className="flex flex-col md:flex-row items-center md:justify-start gap-2">
                <span className="font-bold text-lg md:text-xl text-white">
                  {featuredTestimonial.author}
                </span>
                {featuredTestimonial.role && (
                  <span className="text-indigo-200">
                    {featuredTestimonial.role}
                    {featuredTestimonial.company && `, ${featuredTestimonial.company}`}
                  </span>
                )}
              </div>
              {featuredTestimonial.rating && (
                <div className="mt-3 flex justify-center md:justify-start space-x-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <StarIcon
                      key={idx}
                      className={`h-6 w-6 ${
                        idx < featuredTestimonial.rating ? "text-yellow-300" : "text-white/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* --- Testimonials Grid --- */}
        {gridTestimonials.length > 0 && (
          <motion.div
            className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {gridTestimonials.map((t, i) => (
              <motion.div
                key={i}
                className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border border-gray-200 dark:border-gray-700 group cursor-pointer"
                variants={itemVariants}
                whileHover={{ translateY: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                {/* Background Quote Icon for grid items */}
                <ChatBubbleBottomCenterTextIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 text-gray-100 dark:text-gray-700 opacity-70 pointer-events-none z-0" />

                {/* Avatar */}
                {t.avatarUrl && (
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 flex-shrink-0 z-10 ring-4 ring-indigo-400 dark:ring-indigo-300">
                    <Image
                      src={t.avatarUrl}
                      alt={t.author}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                      loader={customLoader}
                    />
                  </div>
                )}

                {/* Quote */}
                <p className="italic text-gray-700 dark:text-gray-200 mb-4 flex-1 z-10">
                  “{t.quote}”
                </p>

                {/* Author Info */}
                <div className="flex flex-col items-center mt-2 z-10">
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    — {t.author}
                  </span>
                  {t.role && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t.role}
                      {t.company && `, ${t.company}`}
                    </span>
                  )}
                </div>

                {/* Rating Stars */}
                {t.rating && (
                  <div className="mt-3 flex space-x-1 z-10">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <StarIcon
                        key={idx}
                        className={`h-5 w-5 ${
                          idx < t.rating
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          className="text-center mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h3
            className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            variants={itemVariants}
          >
            Ready to Experience the Difference?
          </motion.h3>
          <motion.p
            className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8"
            variants={itemVariants}
          >
            Join countless successful businesses who trust our platform.
          </motion.p>
          <Link href="/signup" passHref>
            <motion.button
              className="inline-flex items-center gap-3 bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowRightIcon className="h-5 w-5" />
              Get Started Today
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}