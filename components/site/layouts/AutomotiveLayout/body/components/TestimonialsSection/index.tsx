// components/Testimonials.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/solid"; // Filled star icon
import { Link } from "react-router-dom";

// Dummy Data
const testimonials = [
  {
    id: 1,
    quote:
      "Finding my dream car was so easy with this platform! The filters are amazing, and I found exactly what I was looking for in days. Highly recommend!",
    author: "Jane M.",
    location: "Nairobi",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Renting a car for my road trip was a breeze. Seamless process, clear pricing, and a great selection. I'll definitely be using them again.",
    author: "David K.",
    location: "Mombasa",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "Selling my old car used to be a headache. With this site, it was listed quickly, I got a fair price, and the support team was fantastic.",
    author: "Sarah L.",
    location: "Kisumu",
    rating: 4,
  },
  {
    id: 4,
    quote:
      "A truly intuitive platform. From Browse to final purchase, everything felt secure and straightforward. This is the future of car buying!",
    author: "Peter W.",
    location: "Eldoret",
    rating: 5,
  },
];

const testimonialCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 drop-shadow-sm"
        >
          What Our Happy Customers Say
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto"
        >
          Hear directly from users who have found their perfect ride or successfully sold their vehicles with us.
        </motion.p>

        {/* Testimonials Grid (Consider a Swiper.js or similar carousel for mobile/smaller screens if many reviews) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              variants={testimonialCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center text-center border border-gray-200"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-6 w-6 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 italic mb-6 text-lg">"{testimonial.quote}"</p>
              <p className="font-semibold text-gray-900 text-lg">
                {testimonial.author}
                <span className="block text-gray-500 text-sm font-normal">
                  {testimonial.location}
                </span>
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Link
            href="/reviews"
            className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-bold rounded-full shadow-lg text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Read All Reviews
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}