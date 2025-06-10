"use client";

import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function TestimonialSection() {
  return (
    <section className="py-16 bg-white text-center px-4">
      <motion.h2 
        className="text-3xl md:text-4xl font-bold text-gray-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        What Student Says
      </motion.h2>

      <p className="mt-2 text-gray-500 max-w-xl mx-auto text-sm md:text-base">
        It the of about everything was at anyone out report first at hired sublime
        ability what infinity, or your rational andmagazine it
      </p>

      <div className="flex justify-center mt-6 space-x-1">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">★</span>
        ))}
      </div>

      <motion.blockquote 
        className="mt-6 text-lg font-medium text-gray-700 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        “First he the as of and appointed the on the early of heard live shortcuts where point there relays skyline proposal and in avoided you for a repeat entered continued.”
      </motion.blockquote>

      <div className="mt-4">
        <p className="text-black font-semibold">Kevin Jhonson</p>
        <p className="text-sm text-gray-500">Student</p>
      </div>

      <div className="mt-8 flex justify-center space-x-4">
        <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
          <ArrowLeftIcon className="h-5 w-5 text-black" />
        </button>
        <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition">
          <ArrowRightIcon className="h-5 w-5 text-orange-500" />
        </button>
      </div>
    </section>
  );
}
