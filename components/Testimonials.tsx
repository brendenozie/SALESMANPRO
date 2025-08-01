"use client";
import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { testimonialsData } from "../data/testimonialsData";

// Using SVG icons instead of raster images for better quality and styling
const leftArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 transition-transform transform hover:scale-110"
    fill="currentColor"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const rightArrow = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 transition-transform transform hover:scale-110"
    fill="currentColor"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
    <section className="relative w-full py-24 bg-gray-50 overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-pink-300 via-red-200 to-yellow-400 rounded-full blur-3xl opacity-30 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-l from-yellow-200 to-orange-100 rounded-full blur-3xl opacity-20 bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row gap-12 sm:gap-16 items-center justify-between">
        {/* Left Section: Text Content */}
        <Motion.div
          className="flex-1 flex flex-col gap-6 text-center lg:text-left"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-base font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 tracking-widest">
            Testimonials
          </h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Sales That <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400">
              Speak Success
            </span>
          </h1>

          {/* Testimonial Review */}
          <Motion.p
            key={selected}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={transition}
            className="text-lg md:text-xl text-gray-700 italic leading-relaxed"
          >
            "{testimonialsData[selected].review}"
          </Motion.p>

          <div className="text-gray-500 text-sm md:text-base mt-2">
            <Motion.span
              key={testimonialsData[selected].name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-bold text-gray-900"
            >
              {testimonialsData[selected].name}
            </Motion.span>{" "}
            -{" "}
            <Motion.span
              key={testimonialsData[selected].name + 'status'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-600"
            >
              {testimonialsData[selected].status}
            </Motion.span>
          </div>
        </Motion.div>

        {/* Right Section: Image & Arrows */}
        <Motion.div
          className="flex-1 relative flex justify-center items-center h-[450px]"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Background Gradient & Border Elements */}
          <Motion.div
            className="absolute w-72 h-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl border-4 border-red-600 z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          ></Motion.div>
          <Motion.div
            className="absolute w-72 h-80 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 z-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          ></Motion.div>

          {/* Testimonial Image */}
          <Motion.img
            key={selected}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={transition}
            src={testimonialsData[selected].image?.src}
            alt={testimonialsData[selected].name}
            className="relative w-64 h-72 object-cover rounded-2xl shadow-2xl z-20"
          />

          {/* Arrow Controls */}
          <div className="absolute flex gap-6 bottom-4 md:bottom-auto md:top-1/2 md:right-0 transform md:-translate-y-1/2 translate-y-1/2">
            <button
              onClick={handlePrevious}
              aria-label="Previous Testimonial"
              className="p-2 rounded-full bg-white text-red-600 shadow-md hover:bg-gray-100 transition-colors"
            >
              {leftArrow}
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Testimonial"
              className="p-2 rounded-full bg-white text-red-600 shadow-md hover:bg-gray-100 transition-colors"
            >
              {rightArrow}
            </button>
          </div>
        </Motion.div>
      </div>
    </section>
  );
};

export default Testimonials;