"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Utility function for combining Tailwind classes
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Reusable Star SVG Component
const StarIcon = ({ fill = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={fill ? "currentColor" : "none"}
    stroke="currentColor"
    className="h-5 w-5 transition-colors duration-200 text-yellow-400"
    strokeWidth="1.5"
  >
    <path
      fillRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.21 21.02a1.5 1.5 0 01-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005z"
      clipRule="evenodd"
    />
  </svg>
);

const ReviewProgress = ({ label, percentage }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.0, ease: "easeInOut" }}
      />
    </div>
    <div className="w-10 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">{percentage}%</div>
  </div>
);

const ReviewCard = ({ user, date, rating, comment }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} fill={i < rating} />
        ))}
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
    </div>
    <p className="text-gray-800 dark:text-gray-200 font-medium mb-2">{user}</p>
    <p className="text-gray-600 dark:text-gray-300 text-sm">{comment}</p>
  </motion.div>
);

const sampleData = {
  averageScore: 4.5,
  breakdown: {
    "5 stars": 70,
    "4 stars": 20,
    "3 stars": 5,
    "2 stars": 3,
    "1 star": 2,
  },
  reviews: [
    {
      user: "John D.",
      date: "2023-10-01",
      rating: 5,
      comment: "Amazing products and fast delivery!",
    },
    {
      user: "Sarah K.",
      date: "2023-09-28",
      rating: 4,
      comment: "Great selection, will shop again.",
    },
    {
      user: "Mike L.",
      date: "2023-09-20",
      rating: 3,
      comment: "Decent quality, but shipping took a while.",
    },
    {
      user: "Anna R.",
      date: "2023-09-15",
      rating: 5,
      comment: "Excellent service and high-quality items. Exceeded my expectations!",
    },
    {
      user: "Chris B.",
      date: "2023-09-10",
      rating: 4,
      comment: "The product was exactly as described. Happy with my purchase.",
    },
  ],
};

export default function ReviewsSection({ data = sampleData }) {
  const { averageScore, breakdown, reviews } = data;

  // Function to determine if a review should be displayed based on filters
  const getFilteredReviews = () => {
    // Add filtering logic here if you want to make the breakdown bars interactive
    return reviews;
  };

  const filteredReviews = getFilteredReviews();

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-gray-900 dark:text-gray-50"
        >
          Customer Reviews
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column: Overall Rating & Breakdown */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 text-center"
            >
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Overall Rating</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-6xl font-black text-gray-900 dark:text-gray-50">
                  {averageScore}
                </span>
                <span className="text-2xl text-gray-500 dark:text-gray-400">/ 5</span>
              </div>
              <div className="flex items-center justify-center mt-2 mb-8">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} fill={i < Math.floor(averageScore)} />
                ))}
              </div>

              <div className="space-y-4">
                {Object.entries(breakdown).map(([label, percentage]) => (
                  <ReviewProgress key={label} label={label} percentage={percentage} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Individual Reviews */}
          <motion.div
            className="md:col-span-2 space-y-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            <AnimatePresence>
              {filteredReviews.map((review, index) => (
                <ReviewCard key={index} {...review} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
