"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonialsData } from "../data/testimonialsData";
import Image from "next/image"; // Use Next.js Image component for optimization

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- SVG Icons ---
const leftArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path fillRule="evenodd" d="M11.03 9.72a.75.75 0 010 1.06L7.81 14.25a.75.75 0 01-1.06-1.06l1.22-1.22H3a.75.75 0 010-1.5h5.97l-1.22-1.22a.75.75 0 011.06-1.06l3.22 3.22zM19.5 14.25a.75.75 0 01-1.5 0v-4.5a.75.75 0 011.5 0v4.5z" clipRule="evenodd" />
  </svg>
);
const rightArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path fillRule="evenodd" d="M12.97 9.72a.75.75 0 010 1.06L16.19 14.25a.75.75 0 01-1.06 1.06l-3.22-3.22a.75.75 0 010-1.06l3.22-3.22a.75.75 0 011.06 0zm-5.97 4.5a.75.75 0 01-1.5 0v-4.5a.75.75 0 011.5 0v4.5z" clipRule="evenodd" />
  </svg>
);

const Testimonials = () => {
  const [selected, setSelected] = useState(0);
  const tLength = testimonialsData.length;
  const transition = { type: "spring", duration: 1, damping: 10, stiffness: 100 };

  const handlePrevious = () => {
    setSelected(selected === 0 ? tLength - 1 : selected - 1);
  };

  const handleNext = () => {
    setSelected(selected === tLength - 1 ? 0 : selected + 1);
  };

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden">
      {/* Background Shape */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-indigo-50 to-pink-50 rounded-full blur-3xl -top-1/4 -left-1/4"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 text-center">
        {/* Section Heading */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-base font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500 tracking-widest">
            What Our Customers Say
          </h2>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Hear It From <br className="hidden md:inline" />The People Who Know
          </h1>
        </motion.div>

        {/* Testimonial Card */}
        <div className="relative mx-auto max-w-2xl">
          <motion.div
            key={selected}
            className="relative p-8 md:p-12 rounded-2xl bg-white shadow-xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={transition}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Testimonial Image */}
              <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="w-28 h-28 flex-shrink-0 rounded-full overflow-hidden shadow-lg border-2 border-indigo-500"
              >
                <Image
                  src={testimonialsData[selected].image?.src}
                  alt={testimonialsData[selected].name}
                  width={112}
                  height={112}
                  loader={customLoader}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* Review and Details */}
              <div className="text-center md:text-left">
                <p className="text-lg md:text-xl text-gray-800 italic leading-relaxed">
                  "{testimonialsData[selected].review}"
                </p>
                <p className="mt-4 text-sm md:text-base text-gray-500">
                  <span className="font-bold text-gray-900">{testimonialsData[selected].name}</span>
                  <span className="ml-1 text-gray-600">- {testimonialsData[selected].status}</span>
                </p>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex justify-center md:justify-end gap-6 mt-8 md:mt-0 md:absolute md:bottom-8 md:right-8">
              <button
                onClick={handlePrevious}
                aria-label="Previous Testimonial"
                className="p-3 rounded-full bg-white text-indigo-600 shadow-md hover:bg-gray-100 transition-colors"
              >
                {leftArrow}
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Testimonial"
                className="p-3 rounded-full bg-white text-indigo-600 shadow-md hover:bg-gray-100 transition-colors"
              >
                {rightArrow}
              </button>
            </div>
          </motion.div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonialsData.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  index === selected ? "bg-indigo-500 w-8" : "bg-gray-300 w-2"
                }`}
                onClick={() => setSelected(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;